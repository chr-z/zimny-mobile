/**
 * PodcastHeroCard — Card em destaque do último episódio.
 *
 * Layout minimalista: thumbnail 16:9 com gradiente sutil,
 * botão play centralizado e badge "ÚLTIMO EPISÓDIO" discreto no canto inferior.
 */
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { radius, spacing, spring } from "@/src/constants/designTokens";
import type { ZimnyPlayVideo } from "@/src/services/zimnyPlay";
import { getSafeHttpsUrl } from "@/src/utils/security";

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  video: ZimnyPlayVideo;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function PodcastHeroCard({ video }: Props) {
  const { width: screenW } = useWindowDimensions();
  const pressed = useSharedValue(false);
  const height = Math.floor(screenW * 0.5625); // 16:9

  const liftStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(pressed.value ? 0.98 : 1, spring.snappy) }],
    };
  });

  const handlePressIn = useCallback(() => { pressed.value = true; }, [pressed]);
  const handlePressOut = useCallback(() => { pressed.value = false; }, [pressed]);
  const handlePress = useCallback(async () => {
    const safeUrl = getSafeHttpsUrl(video.video_url);
    if (safeUrl) {
      try {
        await WebBrowser.openBrowserAsync(safeUrl);
      } catch (e) {
        console.warn("[Podcast] Failed to open video:", e);
      }
    }
  }, [video.video_url]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.wrapper}
    >
      <Animated.View style={[styles.container, { height }, liftStyle]}>
        {/* Background thumbnail */}
        <Image
          source={{ uri: video.thumbnail_url }}
          style={[styles.thumbnail, { height }]}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={280}
        />

        {/* Gradient overlay — escurece nas bordas, clareia no centro */}
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.6)"]}
          locations={[0, 0.5, 1]}
          style={[styles.gradient, { height }]}
        />

        {/* Content */}
        <View style={styles.content}>
          {/* Play button — grande, centralizado */}
          <View style={styles.playButton}>
            <View style={styles.playIcon} />
          </View>
        </View>

        {/* Badge discreto no canto inferior */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ÚLTIMO EPISÓDIO</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  container: {
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  thumbnail: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.92)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderTopWidth: 14,
    borderBottomWidth: 14,
    borderLeftColor: "#0A0A0A",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    marginLeft: 5,
  },
  badge: {
    position: "absolute",
    bottom: spacing.md,
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "700",
  },
});
