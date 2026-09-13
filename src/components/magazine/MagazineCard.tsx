/**
 * MagazineCard — Card individual de edição para a estante.
 *
 * Proporção 2:3, imagem de capa com overlay sutil do número da edição.
 * Efeito de escala ao pressionar (spring).
 */
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import { radius, spring } from "@/src/constants/designTokens";
import type { MagazineEdition } from "@/src/services/api";

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  edition: MagazineEdition;
  /** Card width (height auto-calculated as 1.5 × width) */
  width: number;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function MagazineCard({ edition, width }: Props) {
  const router = useRouter();
  const pressed = useSharedValue(false);

  const height = width * 1.5; // 2:3 proportion

  const liftStyle = useAnimatedStyle(() => {
    const p = pressed.value;
    return {
      transform: [{ scale: withSpring(p ? 0.96 : 1, spring.snappy) }],
      shadowOpacity: withSpring(p ? 0.35 : 0.25, spring.snappy),
    };
  });

  const handlePressIn = useCallback(() => {
    pressed.value = true;
  }, [pressed]);

  const handlePressOut = useCallback(() => {
    pressed.value = false;
  }, [pressed]);

  const handlePress = useCallback(() => {
    router.push({
      pathname: "/magazine/[id]",
      params: { id: edition.id },
    });
  }, [router, edition.id]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.pressable, { width }]}
    >
      <Animated.View
        style={[
          styles.card,
          { width, height },
          liftStyle,
        ]}
      >
        {/* Cover image */}
        <Image
          source={{ uri: edition.coverImage }}
          style={[styles.cover, { width, height }]}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={280}
        />

        {/* Bottom gradient overlay */}
        <View style={styles.gradient} />

        {/* Edition number badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>EDIÇÃO {edition.number}</Text>
        </View>

        {/* Title at bottom */}
        <View style={styles.titleWrap}>
          <Text style={styles.titleText} numberOfLines={2}>
            {edition.title}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  pressable: {
    marginBottom: 12,
  },
  card: {
    borderRadius: radius.sm,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  cover: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "transparent",
    // Simulated gradient via linear fading using two layered views
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
  },
  badgeText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 8,
    letterSpacing: 1.8,
    fontWeight: "600",
  },
  titleWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Georgia",
    letterSpacing: 0.5,
    lineHeight: 18,
  },
});