/**
 * NativeVideo — wrapper declarativo sobre expo-video (SDK 57).
 *
 * Substitui o componente <Video> do expo-av (que não existe mais no SDK 57)
 * preservando o comportamento usado pelo app:
 *   - autoPlay (equivalente a shouldPlay)
 *   - loop / muted / nativeControls / contentFit
 *   - startAtMillis (equivalente a positionMillis — seek inicial)
 *   - onReady (primeiro status readyToPlay, ≈ onReadyForDisplay)
 *   - onEnd (equivalente a didJustFinish)
 *   - onError
 *   - onProgress ~1x/s quando progressInterval > 0 (relógio ao vivo)
 *
 * Troca de source: use a prop `key` no componente (remount cria player novo),
 * igual ao padrão key={...} que o app já usava com o expo-av.
 */
import { useEventListener } from "expo";
import {
  useVideoPlayer,
  VideoView,
  type VideoSource,
} from "expo-video";
import { useEffect, useRef } from "react";
import type { StyleProp, ViewStyle } from "react-native";

type Props = {
  source: VideoSource | null;
  style?: StyleProp<ViewStyle>;
  contentFit?: "contain" | "cover" | "fill";
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  nativeControls?: boolean;
  /** Seek inicial (ms), equivalente ao positionMillis do expo-av. */
  startAtMillis?: number;
  /** Intervalo (s) do relógio de progresso; >0 liga o onProgress. */
  progressInterval?: number;
  onReady?: () => void;
  onEnd?: () => void;
  onError?: (message?: string) => void;
  onProgress?: (positionSeconds: number) => void;
};

export function NativeVideo({
  source,
  style,
  contentFit = "contain",
  autoPlay = false,
  loop = false,
  muted = false,
  nativeControls = false,
  startAtMillis,
  progressInterval = 0,
  onReady,
  onEnd,
  onError,
  onProgress,
}: Props) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = loop;
    p.muted = muted;
    p.timeUpdateEventInterval = progressInterval > 0 ? progressInterval : 0;
    if (startAtMillis && startAtMillis > 0) {
      p.currentTime = startAtMillis / 1000;
    }
    if (autoPlay) p.play();
  });

  // Ready: primeiro status readyToPlay (mídia carregada e pronta p/ exibir).
  const prevStatusRef = useRef<string | null>(null);
  useEventListener(player, "statusChange", (payload) => {
    const status = payload.status;
    if (status === "readyToPlay" && prevStatusRef.current !== "readyToPlay") {
      onReady?.();
    }
    if (status === "error") {
      onError?.(payload.error?.message);
    }
    prevStatusRef.current = status;
  });

  useEventListener(player, "playToEnd", () => {
    onEnd?.();
  });

  useEventListener(
    player,
    "timeUpdate",
    (payload) => {
      onProgress?.(payload.currentTime);
    },
  );

  // Mudanças declarativas de estado.
  const prevAutoPlayRef = useRef(autoPlay);
  useEffect(() => {
    if (autoPlay && !prevAutoPlayRef.current) player.play();
    else if (!autoPlay && prevAutoPlayRef.current) player.pause();
    prevAutoPlayRef.current = autoPlay;
  }, [player, autoPlay]);

  useEffect(() => {
    player.loop = loop;
  }, [player, loop]);

  useEffect(() => {
    player.muted = muted;
  }, [player, muted]);

  return <VideoView player={player} style={style} contentFit={contentFit} nativeControls={nativeControls} />;
}
