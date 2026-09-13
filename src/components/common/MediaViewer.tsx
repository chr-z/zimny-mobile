/**
 * MediaViewer — Visualizador em tela cheia para fotos e vídeos.
 *
 * - Fotos: full-screen, tap para fechar
 * - Vídeos: começa do 0 com áudio, tap para pausar/retomar
 * - Swipe para baixo para fechar
 * - Botão de fechar no canto superior esquerdo (longe dos botões de sistema)
 * - Tap no vídeo: alterna entre pausado/tocando
 */
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { NativeVideo } from "@/src/components/common/NativeVideo";
import type { EventMediaItem } from "@/src/services/zimnyEvents";

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
  media: EventMediaItem | null;
  onClose: () => void;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function MediaViewer({ visible, media, onClose }: Props) {
  const [paused, setPaused] = useState(false);
  const { width: screenW, height: screenH } = Dimensions.get("window");

  // Reset state when media changes
  useEffect(() => {
    setPaused(false);
  }, [media?.id]);

  // Swipe down to close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return gesture.dy > 30; // Only respond to significant downward swipe
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 80) {
          onClose();
        }
      },
    })
  ).current;

  const handleTap = useCallback(() => {
    if (media?.type === "video") {
      setPaused((prev) => !prev);
    } else {
      onClose();
    }
  }, [media, onClose]);

  if (!media) return null;

  const isVideo = media.type === "video";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop} {...panResponder.panHandlers}>
        <Pressable
          onPress={handleTap}
          style={styles.content}
        >
          {isVideo ? (
            <NativeVideo
              key={media.id}
              source={{ uri: media.url }}
              style={{ width: screenW, height: screenH * 0.9 }}
              contentFit="contain"
              autoPlay={!paused}
              loop
              muted={false}
              nativeControls
            />
          ) : (
            <Image
              source={{ uri: media.url }}
              style={{ width: screenW, height: screenH }}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={200}
            />
          )}
        </Pressable>

        {/* Close button — canto superior esquerdo, longe dos botões de sistema */}
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <View style={styles.closeX}>
            <View style={styles.closeLine1} />
            <View style={styles.closeLine2} />
          </View>
        </Pressable>

        {/* Swipe hint */}
        <View style={styles.swipeHint}>
          <View style={styles.swipeBar} />
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  closeBtn: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeX: {
    width: 18,
    height: 18,
    position: "relative",
  },
  closeLine1: {
    position: "absolute",
    top: 8,
    left: 0,
    width: 18,
    height: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
    transform: [{ rotate: "45deg" }],
  },
  closeLine2: {
    position: "absolute",
    top: 8,
    left: 0,
    width: 18,
    height: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
    transform: [{ rotate: "-45deg" }],
  },
  swipeHint: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    zIndex: 10,
  },
  swipeBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
});