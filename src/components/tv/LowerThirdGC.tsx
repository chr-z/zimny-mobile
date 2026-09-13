/**
 * LowerThirdGC — Overlay animado sobre o player de vídeo.
 *
 * Exibe:
 * - Badge no topo: ● TRANSMISSÃO ZIMNY
 * - Lower third (GC): tarja escura com categoria e título do episódio
 *
 * Animações (react-native-reanimated):
 * - Entrada: spring slide da esquerda
 * - Auto-dismiss: desliza para fora após 8 segundos
 * - Re-trigger: quando now_playing muda
 */
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from "react-native-reanimated";

import { font, spacing } from "@/src/constants/designTokens";

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  category: string;
  title: string;
};

// ─── Constants ─────────────────────────────────────────────────────────────

const SPRING_CONFIG = { damping: 20, stiffness: 180, mass: 0.8 };
const DISPLAY_DURATION_MS = 8_000; // 8 segundos visível
const SLIDE_DISTANCE = 120; // px

// ─── Component ─────────────────────────────────────────────────────────────

export function LowerThirdGC({ category, title }: Props) {
  const slideOffset = useSharedValue(-SLIDE_DISTANCE);
  const opacity = useSharedValue(0);

  // ── Trigger animation on data change ────────────────────────────────────

  useEffect(() => {
    // Reset
    slideOffset.value = -SLIDE_DISTANCE;
    opacity.value = 0;

    // Slide in
    slideOffset.value = withSpring(0, SPRING_CONFIG);
    opacity.value = withSpring(1, SPRING_CONFIG);

    // Auto-dismiss after 8s
    const dismissTimer = setTimeout(() => {
      slideOffset.value = withTiming(-SLIDE_DISTANCE, { duration: 400 });
      opacity.value = withTiming(0, { duration: 300 });
    }, DISPLAY_DURATION_MS);

    return () => clearTimeout(dismissTimer);
  }, [category, title, slideOffset, opacity]);

  // ── Animated styles ─────────────────────────────────────────────────────

  const gcStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideOffset.value }],
    opacity: opacity.value,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: withDelay(200, opacity.value),
  }));

  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* ── Top badge ──────────────────────────────────────────────────── */}
      <Animated.View style={[styles.badge, badgeStyle]}>
        <View style={styles.liveDot} />
        <Text style={styles.badgeText}>TRANSMISSÃO ZIMNY</Text>
      </Animated.View>

      {/* ── Lower third GC ─────────────────────────────────────────────── */}
      <Animated.View style={[styles.lowerThird, gcStyle]}>
        <Text style={styles.category} numberOfLines={1}>
          {category}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </Animated.View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "space-between",
    paddingBottom: spacing.lg,
  },

  // ── Badge ───────────────────────────────────────────────────────────────
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(10, 10, 10, 0.75)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginTop: spacing.md,
    marginLeft: spacing.md,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    marginRight: spacing.sm,
  },
  badgeText: {
    fontFamily: font.serif,
    fontSize: font.size.kicker,
    letterSpacing: font.tracking.kicker as unknown as number,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },

  // ── Lower Third ─────────────────────────────────────────────────────────
  lowerThird: {
    backgroundColor: "#0A0A0A",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderLeftWidth: 0,
    borderRightWidth: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    maxWidth: "85%",
  },
  category: {
    fontFamily: font.serif,
    fontSize: font.size.caption,
    letterSpacing: font.tracking.wider as unknown as number,
    color: "#8E8E93",
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: font.serif,
    fontSize: font.size.body,
    letterSpacing: font.tracking.normal as unknown as number,
    color: "#FFFFFF",
    lineHeight: font.size.body * font.leading.tight,
  },
});