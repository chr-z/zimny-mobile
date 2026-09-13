/**
 * EventMediaCard — Card adaptável para foto ou vídeo na galeria de eventos.
 *
 * Altura calculada dinamicamente com base na orientação da mídia.
 * Exibe badge de vídeo quando aplicável.
 */
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { radius, spring } from "@/src/constants/designTokens";
import type { EventMedia } from "@/src/constants/eventsData";
import { getSafeHttpsUrl } from "@/src/utils/security";

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  item: EventMedia;
  /** Card width */
  width: number;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function EventMediaCard({ item, width }: Props) {
  const pressed = useSharedValue(false);

  // Dynamic height: portrait = 1.5x width, landscape = 1x width
  const height =
    item.orientation === "portrait"
      ? Math.floor(width * 1.5)
      : Math.floor(width * 0.75);

  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? 0.96 : 1, spring.snappy) }],
  }));

  const handlePressIn = useCallback(() => { pressed.value = true; }, [pressed]);
  const handlePressOut = useCallback(() => { pressed.value = false; }, [pressed]);

  const handlePress = useCallback(async () => {
    const safeUrl = getSafeHttpsUrl(item.url);
    if (item.type === "video" && safeUrl) {
      try {
        await WebBrowser.openBrowserAsync(safeUrl);
      } catch (e) {
        console.warn("[Events] Failed to open video:", e);
      }
    }
    // For photos, we could open a lightbox in the future
  }, [item]);

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
        <Image
          source={{ uri: item.url }}
          style={{ width, height }}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={240}
        />

        {/* Video badge */}
        {item.type === "video" && (
          <View style={styles.videoBadge}>
            <View style={styles.playIcon} />
            <Text style={styles.videoLabel}>VÍDEO</Text>
          </View>
        )}

        {/* Bottom gradient & title */}
        <View style={styles.infoOverlay}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  pressable: {
    marginBottom: 8,
  },
  card: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  videoBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: "#FFFFFF",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  videoLabel: {
    color: "#FFFFFF",
    fontSize: 8,
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Georgia",
    letterSpacing: 0.3,
    lineHeight: 15,
  },
});
