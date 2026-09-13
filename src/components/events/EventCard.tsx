/**
 * EventCard — Card adaptável para evento na listagem.
 *
 * - Altura dinâmica baseada na proporção real da imagem
 * - Suporte a transparência total (PNG, WebP, etc.) — sem background próprio
 * - Sem badges ou sobreposições — apenas a arte da capa
 * - Fallback: Image.getSize() para dimensões reais se a API não fornecer
 * - Imagem centralizada vertical e horizontalmente
 */
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Image as RNImage, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { radius, spring } from "@/src/constants/designTokens";
import type { ZimnyEvent } from "@/src/services/zimnyEvents";

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  event: ZimnyEvent;
  /** Card width */
  width: number;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function EventCard({ event, width }: Props) {
  const router = useRouter();
  const pressed = useSharedValue(false);

  const [imgWidth, setImgWidth] = useState(event.thumbnail_width);
  const [imgHeight, setImgHeight] = useState(event.thumbnail_height);

  useEffect(() => {
    if (event.thumbnail_width > 0 && event.thumbnail_height > 0) {
      setImgWidth(event.thumbnail_width);
      setImgHeight(event.thumbnail_height);
      return;
    }

    if (event.thumbnail_url) {
      RNImage.getSize(
        event.thumbnail_url,
        (w, h) => {
          setImgWidth(w);
          setImgHeight(h);
        },
        () => {
          setImgWidth(1);
          setImgHeight(1);
        }
      );
    }
  }, [event.thumbnail_url, event.thumbnail_width, event.thumbnail_height]);

  const aspectRatio = imgWidth > 0 && imgHeight > 0 ? imgWidth / imgHeight : 1;
  const height = Math.floor(width / aspectRatio);

  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? 0.97 : 1, spring.snappy) }],
  }));

  const handlePressIn = useCallback(() => { pressed.value = true; }, [pressed]);
  const handlePressOut = useCallback(() => { pressed.value = false; }, [pressed]);

  const handlePress = useCallback(() => {
    (router as any).push(`/event/${event.id}`);
  }, [router, event.id]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.pressable, { width }]}
    >
      <Animated.View
        style={[styles.card, { width, height }, liftStyle]}
      >
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: event.thumbnail_url }}
            style={{ width, height }}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={240}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  pressable: {
    marginBottom: 16,
    alignItems: "center",
  },
  card: {
    borderRadius: radius.md,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  imageWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});