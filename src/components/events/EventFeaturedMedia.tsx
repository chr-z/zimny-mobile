/**
 * EventFeaturedMedia — Mídia em destaque no topo da galeria do evento.
 *
 * - Vídeo: toca automaticamente COM áudio, sem botões ou texto na tela
 * - Tap no vídeo: pausa/retoma (mostra indicador de pause)
 * - Tap longo: abre MediaViewer em tela cheia
 * - Foto: imagem grande, tap para abrir MediaViewer
 */
import { setAudioModeAsync } from "expo-audio";
import { Image } from "expo-image";
import { useCallback, useState } from "react";
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { NativeVideo } from "@/src/components/common/NativeVideo";
import { MediaViewer } from "@/src/components/common/MediaViewer";
import type { EventMediaItem } from "@/src/services/zimnyEvents";

// Configure audio session for playback
setAudioModeAsync({
  playsInSilentMode: true,
  shouldPlayInBackground: false,
  interruptionMode: "duckOthers",
}).catch(() => {});

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  media: EventMediaItem;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function EventFeaturedMedia({ media }: Props) {
  const { width: screenW } = useWindowDimensions();
  const [showViewer, setShowViewer] = useState(false);
  const [paused, setPaused] = useState(false);
  const isVideo = media.type === "video";

  const height = isVideo
    ? Math.floor(screenW * 0.5625)
    : Math.min(Math.floor(screenW * 1.2), 400);

  const handleTap = useCallback(() => {
    if (isVideo) {
      setPaused((prev) => !prev);
    } else {
      setShowViewer(true);
    }
  }, [isVideo]);

  const handleLongPress = useCallback(() => {
    setShowViewer(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowViewer(false);
  }, []);

  return (
    <>
      <Pressable
        onPress={handleTap}
        onLongPress={handleLongPress}
        style={styles.wrapper}
      >
        <View style={[styles.container, { width: screenW, height }]}>
          {isVideo ? (
            <NativeVideo
              key={media.id}
              source={{ uri: media.url }}
              style={{ width: screenW, height }}
              contentFit="contain"
              autoPlay={!paused}
              loop
              muted={false}
              nativeControls={false}
            />
          ) : (
            <Image
              source={{ uri: media.url }}
              style={{ width: screenW, height }}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={200}
            />
          )}

          {isVideo && paused && (
            <View style={styles.pauseIndicator}>
              <View style={styles.pauseBars}>
                <View style={styles.pauseBar} />
                <View style={styles.pauseBar} />
              </View>
            </View>
          )}
        </View>
      </Pressable>

      <MediaViewer
        visible={showViewer}
        media={media}
        onClose={handleClose}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", marginBottom: 16 },
  container: { position: "relative", overflow: "hidden", backgroundColor: "#000000" },
  pauseIndicator: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  pauseBars: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  pauseBar: { width: 4, height: 18, borderRadius: 2, backgroundColor: "#FFFFFF" },
});
