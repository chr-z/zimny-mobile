/**
 * ZimnyTvPlayer — Player de vídeo para transmissão linear 24/7.
 *
 * Usa o player nativo do sistema (expo-video, SDK 57) para vídeos hospedados
 * no WordPress. Isso mantém apenas um decoder ativo e evita que o processo
 * do WebView seja encerrado por falta de memória em aparelhos Android mais
 * modestos.
 *
 * Quando a grade ainda fornece apenas um video_id, mantém o fallback do
 * YouTube. Os controles e o layout permanecem os mesmos.
 *
 * Migração expo-av → expo-video preserva o comportamento:
 *  - seek no relógio do servidor (currentTime = alvo ao vivo)
 *  - re-sync sem recriar decoder (player.replace ao trocar de programa)
 *  - relógio "ao vivo" atualizado 1x/s (timeUpdateEventInterval = 1)
 */
import { Feather } from "@expo/vector-icons";
import { useEventListener } from "expo";
import { useVideoPlayer, VideoView, type VideoPlayer } from "expo-video";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

import { useTranslation } from "@/src/i18n";
import type { TvProgram } from "@/src/services/zimnyTv";
import { getSafeHttpsUrl } from "@/src/utils/security";

/** Formata a posição "ao vivo" como HH:MM:SS (ex: 00:00:05). */
function formatLiveTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

// CSS defensivo usado somente no fallback do YouTube.
const KILL_SCRIPT = `
(function() {
  function kill() {
    var all = document.querySelectorAll(
      '.ytp-caption-window-container,.caption-window,.ytp-caption-segment,' +
      '.ytp-chrome-top,.ytp-chrome-bottom,.ytp-watermark,' +
      '.ytp-gradient-top,.ytp-gradient-bottom,.ytp-pause-overlay,' +
      '.ytp-show-cards-title,.ytp-ce-element,.ytp-spinner,' +
      '.ytp-title,.ytp-title-text,.ytp-title-link,' +
      '.ytp-large-play-button,.ytp-youtube-button,' +
      '[class*="caption"],[class*="subtitle"]'
    );
    for (var i = 0; i < all.length; i++) all[i].remove();
  }
  kill();
  setInterval(kill, 500);
})();
true;
`;

type Props = {
  videoUrl?: string;
  /** Mantida no contrato para compatibilidade com a grade atual. */
  upcoming?: TvProgram[];
  videoId: string;
  seekToSeconds: number;
  serverTimestamp: number;
  duration?: number;
  isPlaying: boolean;
  muted?: boolean;
  onPlayPress: () => void;
  onPausePress: () => void;
  onLivePress: () => void;
  onVideoEnded: () => void;
};

export function ZimnyTvPlayer({
  videoUrl,
  upcoming: _upcoming,
  videoId,
  seekToSeconds,
  serverTimestamp,
  duration,
  isPlaying,
  muted = false,
  onPlayPress,
  onPausePress,
  onLivePress: _onLivePress,
  onVideoEnded,
}: Props) {
  const { t } = useTranslation();
  const youtubeRef = useRef<typeof YoutubePlayer>(null);
  const wasPausedRef = useRef(false);
  const finishedRef = useRef(false);
  const previousIsPlayingRef = useRef(isPlaying);
  const nativeReadyRef = useRef(false);
  const [readyForPlay, setReadyForPlay] = useState(false);
  const [nativeError, setNativeError] = useState<string | null>(null);
  const [liveTime, setLiveTime] = useState(0);

  const safeVideoUrl = getSafeHttpsUrl(videoUrl);
  const hasNativeVideo = !!safeVideoUrl;

  // Mudo por escolha do usuário (independente do mute automático de aba/background).
  const [userMuted, setUserMuted] = useState(false);
  const effectiveMuted = muted || userMuted;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const liveRef = useRef({ seekToSeconds, serverTimestamp, duration });
  liveRef.current = { seekToSeconds, serverTimestamp, duration };
  const urlRef = useRef(safeVideoUrl);
  urlRef.current = safeVideoUrl;

  // ── Player nativo (expo-video) ──────────────────────────────────────────
  const nativeSource = useMemo(
    () => (safeVideoUrl ? { uri: safeVideoUrl } : null),
    [safeVideoUrl],
  );
  const player: VideoPlayer | null = useVideoPlayer(nativeSource, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 1;
    p.muted = muted;
  });

  // ── Controles: auto-hide (fade out com inatividade, fade in com interação) ─
  const [controlsHidden, setControlsHidden] = useState(false);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideControls = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setControlsHidden(true);
    });
  }, [controlsOpacity]);

  const showControls = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setControlsHidden(false);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    hideTimerRef.current = setTimeout(hideControls, 3500);
  }, [controlsOpacity, hideControls]);

  useEffect(() => {
    showControls();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [showControls]);

  /** Calcula a posição da grade no instante atual e limita ao vídeo corrente. */
  const computeTargetMillis = useCallback(() => {
    const current = liveRef.current;
    const elapsed = Math.max(
      0,
      Math.floor(Date.now() / 1000) - current.serverTimestamp,
    );
    let targetSeconds = Math.max(0, current.seekToSeconds + elapsed);

    // Um endpoint brevemente defasado na virada não deve gerar seek inválido.
    if (current.duration && current.duration > 0) {
      targetSeconds = Math.min(
        targetSeconds,
        Math.max(0, current.duration - 0.5),
      );
    }

    return Math.floor(targetSeconds * 1000);
  }, []);

  /** Reposiciona o player nativo no ponto ao vivo sem recriar o decoder. */
  const resyncNativeToLive = useCallback(() => {
    // Só reposiciona depois que o vídeo novo realmente montou (readyToPlay);
    // antes disso o player pode ainda estar carregando a mídia.
    if (!nativeReadyRef.current) return;
    if (!player) return;
    if (!urlRef.current) return;

    try {
      const targetSec = computeTargetMillis() / 1000;
      player.currentTime = targetSec;
      console.log(
        `[ZimnyTV] resync -> seek ${targetSec.toFixed(1)}s play=${isPlayingRef.current}`,
      );
      if (isPlayingRef.current) player.play();
      else player.pause();
    } catch (error) {
      // Pode acontecer durante a janela curta entre replace/load; o handler
      // de readyToPlay executa a mesma sincronização quando estiver pronto.
      console.warn("[ZimnyTV] sincronização aguardando o player", error);
    }
  }, [player, computeTargetMillis]);

  const handleNativeReady = useCallback(() => {
    finishedRef.current = false;
    nativeReadyRef.current = true;
    setNativeError(null);
    setLiveTime(0);
    resyncNativeToLive();
  }, [resyncNativeToLive]);

  const handleNativeError = useCallback(
    (message?: string) => {
      console.warn(`[ZimnyTV] player nativo: ${message}`);
      setNativeError(message || "video-load-error");
      onPausePress();
      showControls();
    },
    [onPausePress, showControls],
  );

  // Eventos do player nativo.
  const prevStatusRef = useRef<string | null>(null);
  useEventListener(player, "statusChange", (payload) => {
    const status = payload.status;
    if (status === "readyToPlay" && prevStatusRef.current !== "readyToPlay") {
      handleNativeReady();
    }
    if (status === "error") {
      handleNativeError(payload.error?.message);
    }
    prevStatusRef.current = status;
  });

  useEventListener(player, "playToEnd", () => {
    if (!finishedRef.current) {
      finishedRef.current = true;
      onVideoEnded();
    }
  });

  useEventListener(player, "timeUpdate", (payload) => {
    setLiveTime(payload.currentTime);
  });

  // Reinicia o marcador de fim e carrega o vídeo novo ao trocar de programa.
  useEffect(() => {
    finishedRef.current = false;
    nativeReadyRef.current = false;
    setNativeError(null);
    setLiveTime(0);
    if (player && safeVideoUrl) {
      player.replaceAsync({ uri: safeVideoUrl }).catch(() => {});
    }
  }, [safeVideoUrl, player]);

  // A grade é atualizada periodicamente; reposiciona sem remontar o player.
  useEffect(() => {
    if (!hasNativeVideo) return;
    resyncNativeToLive();
  }, [seekToSeconds, serverTimestamp, hasNativeVideo, resyncNativeToLive]);

  // Play/pause nativo. Ao retomar, volta ao ponto ao vivo.
  useEffect(() => {
    if (!hasNativeVideo) return;
    if (isPlaying && !previousIsPlayingRef.current) {
      resyncNativeToLive();
    } else if (!isPlaying && previousIsPlayingRef.current) {
      player?.pause();
    }
    previousIsPlayingRef.current = isPlaying;
  }, [hasNativeVideo, isPlaying, resyncNativeToLive, player]);

  // O mute muda sem recarregar a mídia.
  useEffect(() => {
    if (!hasNativeVideo || !player) return;
    player.muted = effectiveMuted;
  }, [effectiveMuted, hasNativeVideo, player]);

  // ── YouTube fallback: seek com delay + readyForPlay ─────────────────────
  useEffect(() => {
    if (hasNativeVideo || !videoId) return;
    wasPausedRef.current = false;
    setReadyForPlay(false);

    const elapsed = Math.floor(Date.now() / 1000 - serverTimestamp);
    const targetSeek = Math.max(0, seekToSeconds + elapsed);
    const timer = setTimeout(() => {
      youtubeRef.current?.seekTo(targetSeek, true);
      setReadyForPlay(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [videoId, seekToSeconds, serverTimestamp, hasNativeVideo]);

  useEffect(() => {
    if (hasNativeVideo) return;
    if (isPlaying && wasPausedRef.current) {
      const elapsed = Math.floor(Date.now() / 1000 - serverTimestamp);
      youtubeRef.current?.seekTo(Math.max(0, seekToSeconds + elapsed), true);
      wasPausedRef.current = false;
    }
  }, [isPlaying, seekToSeconds, serverTimestamp, hasNativeVideo]);

  const onYoutubeStateChange = useCallback(
    (state: string) => {
      if (state === "playing") onPlayPress();
      else if (state === "paused") {
        wasPausedRef.current = true;
        onPausePress();
      } else if (state === "ended") onVideoEnded();
    },
    [onPlayPress, onPausePress, onVideoEnded],
  );

  const handleTogglePlay = useCallback(() => {
    showControls();
    if (isPlaying) {
      onPausePress();
      return;
    }

    if (hasNativeVideo) {
      if (nativeError) {
        // Recarrega a mesma mídia após erro (retry).
        setNativeError(null);
        nativeReadyRef.current = false;
        if (player && safeVideoUrl) {
          player.replaceAsync({ uri: safeVideoUrl }).catch(() => {});
        }
      } else {
        resyncNativeToLive();
      }
    } else {
      const elapsed = Math.floor(Date.now() / 1000 - serverTimestamp);
      youtubeRef.current?.seekTo(Math.max(0, seekToSeconds + elapsed), true);
      setReadyForPlay(true);
    }
    onPlayPress();
  }, [
    hasNativeVideo,
    isPlaying,
    nativeError,
    onPausePress,
    onPlayPress,
    player,
    resyncNativeToLive,
    safeVideoUrl,
    seekToSeconds,
    serverTimestamp,
    showControls,
  ]);

  const handleToggleMute = useCallback(() => {
    showControls();
    setUserMuted((previous) => !previous);
  }, [showControls]);

  const handleRevealPress = useCallback(() => {
    if (controlsHidden) showControls();
    else hideControls();
  }, [controlsHidden, showControls, hideControls]);

  const renderPlayer = () => {
    if (hasNativeVideo && player) {
      return (
        <>
          <VideoView
            player={player}
            style={styles.nativeVideo}
            contentFit="contain"
            nativeControls={false}
          />
          {nativeError && (
            <View style={styles.errorLayer} pointerEvents="none">
              <Text style={styles.errorText}>{t("tv.indisponivel_msg")}</Text>
            </View>
          )}
        </>
      );
    }

    return (
      <View style={styles.youtubeWrapper} pointerEvents="none">
        <YoutubePlayer
          ref={youtubeRef}
          height={300}
          width={400}
          videoId={videoId}
          play={isPlaying && readyForPlay}
          onChangeState={onYoutubeStateChange}
          webViewProps={{
            injectedJavaScript: KILL_SCRIPT,
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
          initialPlayerParams={{
            controls: false,
            rel: false,
            modestbranding: true,
            cc_load_policy: 0,
            iv_load_policy: 3,
            loop: false,
            showinfo: 0,
            fs: 0,
            playsinline: 1,
            color: "white",
            hl: "en",
            disablekb: 1,
            autohide: 1,
          }}
          webViewStyle={styles.webview}
        />
      </View>
    );
  };

  const renderControls = () => (
    <Animated.View
      style={[styles.controlsLayer, { opacity: controlsOpacity }]}
      pointerEvents={controlsHidden ? "none" : "box-none"}
    >
      {isPlaying && (
        <View style={styles.livePill} pointerEvents="none">
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{t("tv.ao_vivo_tag")}</Text>
          <Text style={styles.liveTimeText}>{formatLiveTime(liveTime)}</Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.centerControl,
          pressed && styles.controlPressed,
          !isPlaying && styles.centerControlPaused,
        ]}
        onPress={handleTogglePlay}
        hitSlop={10}
        android_ripple={{ color: "rgba(255,255,255,0.12)", borderless: true }}
      >
        <Feather
          name={isPlaying ? "pause" : "play"}
          size={isPlaying ? 22 : 34}
          color="#FFFFFF"
          style={!isPlaying ? styles.playGlyph : undefined}
        />
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.muteControl,
          pressed && styles.controlPressed,
          effectiveMuted && styles.cornerControlActive,
        ]}
        onPress={handleToggleMute}
        hitSlop={10}
        android_ripple={{ color: "rgba(255,255,255,0.12)", borderless: true }}
      >
        <Feather
          name={effectiveMuted ? "volume-x" : "volume-2"}
          size={18}
          color="#FFFFFF"
        />
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {renderPlayer()}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleRevealPress}
        accessibilityLabel="Controles do player"
      />
      {renderControls()}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  nativeVideo: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000",
  },
  youtubeWrapper: {
    ...StyleSheet.absoluteFill,
  },
  webview: {
    backgroundColor: "#000",
    opacity: 0.99,
  },
  errorLayer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#000",
  },
  errorText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    textAlign: "center",
  },
  controlsLayer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 10,
  },
  livePill: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,59,48,0.55)",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
  },
  liveText: {
    color: "#FF3B30",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  liveTimeText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 10,
    fontVariant: ["tabular-nums"],
    letterSpacing: 1,
  },
  centerControl: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  centerControlPaused: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderColor: "rgba(255,255,255,0.3)",
  },
  playGlyph: {
    marginLeft: 3,
  },
  muteControl: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    transform: [{ translateX: 46 }, { translateY: -20 }],
  },
  cornerControlActive: {
    backgroundColor: "rgba(255,59,48,0.5)",
    borderColor: "rgba(255,59,48,0.7)",
  },
  controlPressed: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
});
