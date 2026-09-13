/**
 * AnuncieCardsSection — "Anuncie Conosco" cards with 4 visual variants.
 *
 * Variant 1 ("Anuncie na Revista") is HARDCODED in this file (trilingual via
 * i18n) and no longer depends on the WordPress plugin. Variants 2–4 are still
 * fetched from the WordPress REST API and rendered based on the admin config.
 *
 * Variants:
 *   1 — Anuncie na Revista: brand side, white card, green CTA (hardcoded)
 *   2 — Bordered Premium: double border, circular image, arrow CTA
 *   3 — Split Content: side-by-side, accent bar, filled button CTA
 *   4 — Full Bleed Bold: full-bleed image, gradient overlay, glow CTA
 */
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { AnimatedExpoImage } from "@/src/components/common/AnimatedExpoImage";
import { color, spring } from "@/src/constants/designTokens";
import { useTranslation } from "@/src/i18n";
import { fetchAnuncieCards, type AnuncieCard } from "@/src/services/zimnyPlay";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_MARGIN = 16;
const CARD_WIDTH = SCREEN_W - CARD_MARGIN * 2;
const CARD_WIDTH_NARROW = SCREEN_W * 0.8;

/**
 * Capa da edição 03 — imagem fixa do card "Anuncie na Revista" (Variante 1).
 * Mantida aqui para que o ad continue independente do plugin/WordPress.
 */
const ANUNCIE_REVISTA_COVER =
  "https://zimnymagazine.com/wp-content/uploads/2026/07/01-CAPA-US.webp";

// ─── Variant-specific component ─────────────────────────────────────────────

function Variant1Minimal({
  card,
  onPress,
}: {
  card: AnuncieCard;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const floatY = useSharedValue(0);
  const ctaGlow = useSharedValue(0);

  const onPressIn = () => {
    scale.value = withSpring(0.98, spring.gentle);
  };
  const onPressOut = () => {
    scale.value = withSpring(1, spring.gentle);
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.15 + ctaGlow.value * 0.2,
    shadowRadius: 4 + ctaGlow.value * 6,
  }));

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1800 }),
        withTiming(4, { duration: 1800 })
      ),
      -1,
      true
    );
    ctaGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  // Capa da edição 03 (const compartilhada com o card hardcoded)
  const editionCover = ANUNCIE_REVISTA_COVER;

  return (
    <Animated.View style={[styles.v1Card, cardStyle]}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={styles.v1Pressable}
      >
        {/* Capa da edição 03 */}
        <Animated.View style={[styles.v1BrandSide, floatStyle]}>
          <AnimatedExpoImage
            source={{ uri: editionCover }}
            style={styles.v1CoverImage}
            contentFit="cover"
            transition={300}
          />
        </Animated.View>

        {/* Content side */}
        <View style={styles.v1Content}>
          <Text style={styles.v1Title} numberOfLines={1}>
            {card.title}
          </Text>
          {card.description ? (
            <Text style={styles.v1Desc}>
              {card.description}
            </Text>
          ) : null}
          <Animated.View style={[styles.v1CtaWrap, ctaStyle]}>
            <Text style={styles.v1Cta}>{card.cta_text} ›</Text>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Variant2Bordered({
  card,
  onPress,
}: {
  card: AnuncieCard;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const borderAnim = useSharedValue(0);
  const arrowOffset = useSharedValue(0);

  const onPressIn = () => {
    scale.value = withSpring(0.97, spring.gentle);
    arrowOffset.value = withSpring(4, spring.snappy);
  };
  const onPressOut = () => {
    scale.value = withSpring(1, spring.gentle);
    arrowOffset.value = withSpring(0, spring.snappy);
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    borderColor:
      borderAnim.value === 0
        ? "#0A0A0A"
        : "#555555",
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowOffset.value }],
  }));

  useEffect(() => {
    borderAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  return (
    <Animated.View style={[styles.v2Card, cardStyle, borderStyle]}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={styles.v2Pressable}
      >
        {card.image_url ? (
          <AnimatedExpoImage
            source={{ uri: card.image_url }}
            style={styles.v2Image}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={[styles.v2Image, styles.v2Placeholder]}>
            <Text style={styles.v1PlaceholderText}>◇</Text>
          </View>
        )}
        <View style={styles.v2Content}>
          <Text style={styles.v2Title} numberOfLines={1}>
            {card.title}
          </Text>
          {card.description ? (
            <Text style={styles.v2Desc} numberOfLines={2}>
              {card.description}
            </Text>
          ) : null}
          <View style={styles.v2CtaRow}>
            <Text style={styles.v2Cta}>{card.cta_text}</Text>
            <Animated.Text style={[styles.v2Arrow, arrowStyle]}>
              {" "}→
            </Animated.Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Variant3Split({
  card,
  onPress,
}: {
  card: AnuncieCard;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const barHeight = useSharedValue(70);
  const shine = useSharedValue(-1);

  const onPressIn = () => {
    scale.value = withSpring(0.97, spring.gentle);
  };
  const onPressOut = () => {
    scale.value = withSpring(1, spring.gentle);
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    height: `${barHeight.value}%` as unknown as number,
  }));

  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shine.value * 200 }],
  }));

  useEffect(() => {
    shine.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(-1, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  return (
    <Animated.View style={[styles.v3Card, cardStyle]}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={styles.v3Pressable}
      >
        <View style={styles.v3ImageWrap}>
          {card.image_url ? (
            <AnimatedExpoImage
              source={{ uri: card.image_url }}
              style={styles.v3Image}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={[styles.v3Image, styles.v3Placeholder]}>
              <Text style={styles.v1PlaceholderText}>◈</Text>
            </View>
          )}
        </View>
        <View style={styles.v3Content}>
          <View style={styles.v3AccentBar} />
          <Text style={styles.v3Title} numberOfLines={2}>
            {card.title}
          </Text>
          <View style={styles.v3DecoLine} />
          {card.description ? (
            <Text style={styles.v3Desc} numberOfLines={2}>
              {card.description}
            </Text>
          ) : null}
          <View style={styles.v3CtaWrap}>
            <Text style={styles.v3Cta}>{card.cta_text}</Text>
            <Animated.View style={[styles.v3Shine, shineStyle]} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Variant4FullBleed({
  card,
  onPress,
}: {
  card: AnuncieCard;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const overlay = useSharedValue(0.4);

  const onPressIn = () => {
    scale.value = withSpring(0.97, spring.gentle);
    overlay.value = withTiming(0.5, { duration: 200 });
  };
  const onPressOut = () => {
    scale.value = withSpring(1, spring.gentle);
    overlay.value = withTiming(0.4, { duration: 200 });
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.3 + glow.value * 0.3,
    shadowRadius: 8 + glow.value * 12,
  }));

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  return (
    <Animated.View style={[styles.v4Card, cardStyle]}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={styles.v4Pressable}
      >
        {card.image_url ? (
          <AnimatedExpoImage
            source={{ uri: card.image_url }}
            style={styles.v4Bg}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={[styles.v4Bg, styles.v4Placeholder]}>
            <Text style={[styles.v1PlaceholderText, { color: "#fff" }]}>
              ⬟
            </Text>
          </View>
        )}
        <LinearGradient
          colors={["rgba(0,0,0,0.85)", "rgba(0,0,0,0.35)"]}
          locations={[0.3, 1]}
          style={styles.v4Overlay}
        />
        <View style={styles.v4Content}>
          <Text style={styles.v4Title} numberOfLines={2}>
            {card.title}
          </Text>
          {card.description ? (
            <Text style={styles.v4Desc} numberOfLines={2}>
              {card.description}
            </Text>
          ) : null}
          <Animated.View style={[styles.v4CtaWrap, glowStyle]}>
            <Text style={styles.v4Cta}>{card.cta_text}</Text>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

type AnuncieCardsSectionProps = {
  /** Which variant to filter (1-4). 0 = show all */
  variant?: number;
};

export function AnuncieCardsSection({ variant = 0 }: AnuncieCardsSectionProps) {
  const [cards, setCards] = useState<AnuncieCard[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useTranslation();

  // Toque nos cards "Anuncie Conosco" → página de contato com todos os canais.
  const handlePress = useCallback(() => {
    router.push("/contato");
  }, [router]);

  // Variante 1 ("Anuncie na Revista") agora é 100% hardcoded no app — o texto
  // é trilíngue via i18n e não depende mais do plugin/WordPress.
  const isHardcodedV1 = variant === 1;

  useEffect(() => {
    // Card hardcoded: nenhuma chamada ao plugin/API é necessária.
    if (isHardcodedV1) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchAnuncieCards();
        if (cancelled) return;
        // Filter by variant if specified
        const filtered = variant > 0
          ? data.filter((c) => c.variant === variant)
          : data;
        setCards(filtered);
      } catch (e) {
        if (!cancelled) console.warn("[AnuncieCards] Failed to load:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isHardcodedV1, variant]);

  // Card fixo "Anuncie na Revista" (Variante 1) — reconstruído a cada render
  // para refletir o idioma atualmente selecionado no app.
  const hardcodedV1Card: AnuncieCard = {
    id: "anuncie-na-revista",
    image_url: ANUNCIE_REVISTA_COVER,
    image_id: 0,
    variant: 1,
    variant_label: "Anuncie na Revista",
    title: t("home.anuncie_revista_title"),
    description: t("home.anuncie_revista_desc"),
    cta_text: t("home.anuncie_revista_cta"),
    cta_link: "/contato",
  };

  const effectiveCards = isHardcodedV1 ? [hardcodedV1Card] : cards;

  if (loading || effectiveCards.length === 0) return null;

  return (
    <View style={styles.container}>
      {effectiveCards.map((card) => {
        switch (card.variant) {
          case 1:
            return <Variant1Minimal key={card.id} card={card} onPress={handlePress} />;
          case 2:
            return <Variant2Bordered key={card.id} card={card} onPress={handlePress} />;
          case 3:
            return <Variant3Split key={card.id} card={card} onPress={handlePress} />;
          case 4:
            return <Variant4FullBleed key={card.id} card={card} onPress={handlePress} />;
          default:
            return <Variant1Minimal key={card.id} card={card} onPress={handlePress} />;
        }
      })}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: 16,
    alignItems: "center",
  },

  // ── Variant 1: Anuncie na Revista ──
  v1PlaceholderText: {
    fontSize: 28,
    color: color.dark.textTertiary,
  },
  v1Card: {
    width: CARD_WIDTH_NARROW,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  v1Pressable: {
    flexDirection: "row",
    padding: 16,
    gap: 14,
    alignItems: "center",
  },
  v1BrandSide: {
    width: 100,
    height: 130,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#0A0A0A",
  },
  v1CoverImage: {
    width: 100,
    height: 130,
  },
  v1Content: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  v1Title: {
    fontFamily: "Georgia",
    fontSize: 13,
    fontWeight: "700",
    color: "#0A0A0A",
    lineHeight: 18,
  },
  v1Desc: {
    fontSize: 11,
    color: "#555557",
    lineHeight: 15,
    marginTop: 2,
  },
  v1CtaWrap: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#38D080",
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 6,
    shadowColor: "#38D080",
    shadowOffset: { width: 0, height: 0 },
  },
  v1Cta: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#FFFFFF",
  },

  // ── Variant 2: Bordered Premium ──
  v2Card: {
    backgroundColor: color.dark.surfaceAlt,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: color.dark.borderStrong,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  v2Pressable: {
    flexDirection: "row",
    padding: 16,
    gap: 14,
    alignItems: "center",
  },
  v2Image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: color.dark.borderStrong,
    backgroundColor: color.dark.surfaceElevated,
  },
  v2Placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  v2Content: {
    flex: 1,
  },
  v2Title: {
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: color.dark.text,
  },
  v2Desc: {
    fontSize: 12,
    color: color.dark.textSecondary,
    lineHeight: 16,
    marginTop: 4,
  },
  v2CtaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  v2Cta: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: color.dark.text,
  },
  v2Arrow: {
    fontSize: 14,
    color: color.dark.text,
    fontWeight: "700",
  },

  // ── Variant 3: Split Content ──
  v3Card: {
    backgroundColor: color.dark.surfaceAlt,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  v3Pressable: {
    flexDirection: "row",
    minHeight: 140,
  },
  v3ImageWrap: {
    width: 140,
    overflow: "hidden",
  },
  v3Image: {
    flex: 1,
    backgroundColor: color.dark.surfaceElevated,
  },
  v3Placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  v3Content: {
    flex: 1,
    padding: 16,
    paddingLeft: 20,
    justifyContent: "center",
    position: "relative",
  },
  v3AccentBar: {
    position: "absolute",
    left: 0,
    top: "12%",
    bottom: "12%",
    width: 3,
    backgroundColor: color.dark.textSecondary,
    borderRadius: 1.5,
  },
  v3Title: {
    fontFamily: "Georgia",
    fontSize: 16,
    fontWeight: "700",
    color: color.dark.text,
    lineHeight: 20,
  },
  v3DecoLine: {
    width: 32,
    height: 2,
    backgroundColor: color.dark.textSecondary,
    marginTop: 6,
    marginBottom: 8,
    borderRadius: 1,
  },
  v3Desc: {
    fontSize: 11,
    color: color.dark.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  v3CtaWrap: {
    alignSelf: "flex-start",
    backgroundColor: color.dark.text,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 4,
    overflow: "hidden",
  },
  v3Cta: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: color.dark.surface,
  },
  v3Shine: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 20,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.15)",
    transform: [{ translateX: -20 }],
  },

  // ── Variant 4: Full Bleed Bold ──
  v4Card: {
    borderRadius: 12,
    overflow: "hidden",
    height: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  v4Pressable: {
    flex: 1,
    position: "relative",
  },
  v4Bg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#1C1C1E",
  },
  v4Placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  v4Overlay: {
    ...StyleSheet.absoluteFill,
  },
  v4Content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    alignItems: "center",
  },
  v4Title: {
    fontFamily: "Georgia",
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 26,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  v4Desc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 17,
    textAlign: "center",
    marginTop: 6,
  },
  v4CtaWrap: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 6,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  v4Cta: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#0A0A0A",
  },
});