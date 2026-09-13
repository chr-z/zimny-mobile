/**
 * SplashPlayer — Player de vídeo widescreen para o topo da Home.
 *
 * Exibe os vídeos selecionados no WordPress em um banner widescreen 16:9.
 * Detecta automaticamente se o vídeo é vertical (9:16) ou widescreen (16:9):
 * - Vídeo 16:9 → ocupa 100% do banner com object-fit: cover
 * - Vídeo 9:16 → centralizado verticalmente com backdrop blur do próprio vídeo
 *
 * Endpoint: GET /wp-json/zimny/v1/splash-videos
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import { fetchSplashVideos, type SplashVideo } from "@/src/services/zimnyPlay";
import { escapeHtmlAttribute, getSafeHttpsUrl } from "@/src/utils/security";

// ─── Constants ─────────────────────────────────────────────────────────────

const SCREEN_W = Dimensions.get("window").width;
const BANNER_H = SCREEN_W * 9 / 16; // 16:9 widescreen

/**
 * Fisher-Yates shuffle — embaralha o array in-place e retorna.
 */
function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── HTML Template ─────────────────────────────────────────────────────────

/**
 * Gera o HTML5 com detecção inteligente de orientação do vídeo.
 *
 * Lógica:
 * 1. Carrega o vídeo em memória para detectar videoWidth/videoHeight
 * 2. Se proporção > 1 (widescreen) → preenche toda a área com object-fit: cover
 * 3. Se proporção < 1 (vertical) → backdrop blur + vídeo centralizado sem zoom
 */
function buildVideoHtml(videoUrl: string): string {
  const safeVideoUrl = escapeHtmlAttribute(getSafeHttpsUrl(videoUrl));
  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 100%; height: 100%;
    overflow: hidden;
    background: #000;
  }
  #backdrop {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 0;
    display: none;
  }
  #backdrop video {
    width: 100%; height: 100%;
    object-fit: cover;
    filter: blur(40px);
    transform: scale(1.2);
    opacity: 0.7;
  }
  #player-wrap {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #player {
    max-width: 100%;
    max-height: 100%;
  }
  #player.landscape {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  #player.portrait {
    height: 100%;
    width: auto;
    object-fit: contain;
  }
</style>
</head>
<body>
  <div id="backdrop">
    <video id="backdrop-video" src="${safeVideoUrl}" muted autoplay playsinline
           webkit-playsinline loop>
    </video>
  </div>
  <div id="player-wrap">
    <video id="player" src="${safeVideoUrl}" muted autoplay playsinline
           webkit-playsinline>
    </video>
  </div>
  <script>
    (function() {
      var player = document.getElementById('player');
      var backdrop = document.getElementById('backdrop');
      var backdropVideo = document.getElementById('backdrop-video');

      // Detecta orientação quando os metadados carregam
      function detectOrientation() {
        var w = player.videoWidth;
        var h = player.videoHeight;
        if (!w || !h) {
          setTimeout(detectOrientation, 200);
          return;
        }
        var ratio = w / h;
        if (ratio >= 1.3) {
          player.className = 'landscape';
          backdrop.style.display = 'none';
        } else {
          player.className = 'portrait';
          backdrop.style.display = 'block';
          backdropVideo.currentTime = player.currentTime;
          player.addEventListener('seeked', function syncBackdrop() {
            backdropVideo.currentTime = player.currentTime;
          });
        }
      }

      if (player.readyState >= 1) {
        detectOrientation();
      } else {
        player.addEventListener('loadedmetadata', detectOrientation);
      }

      player.onended = function() {
        window.ReactNativeWebView.postMessage('ended');
      };
      player.onerror = function() {
        window.ReactNativeWebView.postMessage('ended');
      };
    })();
  </script>
</body>
</html>`;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function SplashPlayer() {
  const [videos, setVideos] = useState<SplashVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [visible, setVisible] = useState(false);
  const playlistRef = useRef<SplashVideo[]>([]);
  const webViewRef = useRef<WebView>(null);

  // Load and shuffle videos on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchSplashVideos();
        const safeVideos = data.filter((video) => getSafeHttpsUrl(video.video_url));
        if (!cancelled && safeVideos.length > 0) {
          const shuffled = shuffleArray([...safeVideos]);
          playlistRef.current = shuffled;
          setVideos(shuffled);
          setCurrentIndex(0);
          setVisible(true);
        }
      } catch (e) {
        console.warn("[SplashPlayer] Failed to load videos:", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Handle video ended — avança para o próximo
  const handleVideoEnded = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= videos.length) {
        const reshuffled = shuffleArray([...playlistRef.current]);
        playlistRef.current = reshuffled;
        setVideos(reshuffled);
        return 0;
      }
      return next;
    });
  }, [videos.length]);

  // Toggle mute/unmute via injectedJavaScript — sem recarregar o WebView
  // Apenas o player principal (foreground) tem o áudio controlado.
  // O vídeo de fundo (backdrop blur) permanece SEMPRE mutado.
  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      const muteVal = next ? 'true' : 'false';
      webViewRef.current?.injectJavaScript(`
        (function() {
          var p = document.getElementById('player');
          if (p) p.muted = ${muteVal};
        })();
        true;
      `);
      return next;
    });
  }, []);

  if (!visible || videos.length === 0) return null;

  const currentVideo = videos[currentIndex];
  if (!currentVideo) return null;

  // HTML é construído SEM a flag muted — o controle é via injectJavaScript
  const videoHtml = buildVideoHtml(currentVideo.video_url);

  return (
    <View style={styles.container}>
      {/* Volume toggle */}
      <TouchableOpacity style={styles.volumeBtn} onPress={toggleMute}>
        <Text style={styles.volumeIcon}>
          {muted ? "🔇" : "🔊"}
        </Text>
      </TouchableOpacity>

      {/* Video player */}
      <WebView
        ref={webViewRef}
        source={{ html: videoHtml }}
        style={styles.video}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        webviewDebuggingEnabled={false}
        originWhitelist={["about:blank", "https://*"]}
        mixedContentMode="never"
        allowFileAccess={false}
        allowUniversalAccessFromFileURLs={false}
        onMessage={(e) => {
          if (e.nativeEvent.data === "ended") handleVideoEnded();
        }}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: SCREEN_W,
    height: BANNER_H,
    backgroundColor: "#0A0A0A",
    position: "relative",
    overflow: "hidden",
  },
  video: {
    width: SCREEN_W,
    height: BANNER_H,
    backgroundColor: "#000",
  },
  volumeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  volumeIcon: {
    fontSize: 16,
  },
});
