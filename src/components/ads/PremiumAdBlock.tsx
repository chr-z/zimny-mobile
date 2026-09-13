/**
 * PremiumAdBlock — Card de publicidade premium.
 *
 * Design moderno com imagem 16:9 full-width, texto sobreposto com
 * degradê, botão CTA integrado e logo do anunciante.
 *
 * Inspirado no estilo visual do Anuncie Conosco.
 *
 * Suporta:
 * - Imagem de apoio 16:9 com gradiente para legibilidade do texto
 * - Logo do anunciante grande sobre a imagem
 * - Título, descrição e CTA sobrepostos
 * - Modo compacto para artigos (sem imagem)
 * - Tracking de impressão e clique
 * - Tipo image_banner: renderiza como ImageBanner (imagem clicável horizontal)
 */
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useRef } from "react";
import {
  type LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ImageBanner } from "@/src/components/ads/ImageBanner";
import { spring } from "@/src/constants/designTokens";
import type { AdItem } from "@/src/hooks/useAds";
import { getSafeHttpsUrl } from "@/src/utils/security";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PremiumAdBlockProps = {
  /** Dados completos do anúncio vindo da API */
  ad: AdItem;
  /** Modo compacto — sem imagem, para uso em artigos */
  compact?: boolean;
  /** Callback disparado quando o anúncio é exibido (impressão) */
  onImpression?: () => void;
  /** Callback disparado quando o anúncio é clicado */
  onClick?: () => void;
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const LOGO_SIZE = 52;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PremiumAdBlock — despacha o card conforme o tipo do anúncio.
 *
 * Todos os formatos (image_banner, banner, sponsored, custom) são renderizados
 * dentro de um slot fixo 16:9. Assim, a rotação automática (7s) entre um
 * anúncio e outro nunca altera a altura do bloco — a tela não "pula" quando o
 * tipo muda.
 *
 * A troca é animada com crossfade: o Animated.View abaixo é keyed por `ad.id`,
 * então a cada rotação o anúncio anterior desvanece (exiting) enquanto o novo
 * entra suavemente (entering) — sem corte brusco.
 *
 * IMPORTANTE: este componente não usa hooks, então a troca de tipo durante a
 * rotação automática (7s) não viola as regras de hooks.
 */
export function PremiumAdBlock({
  ad,
  compact = false,
  onImpression,
  onClick,
}: PremiumAdBlockProps) {
  return (
    <View style={styles.slot}>
      <Animated.View
        key={ad.id}
        entering={FadeIn.duration(320)}
        exiting={FadeOut.duration(240)}
        style={StyleSheet.absoluteFill}
      >
        {ad.type === "image_banner" ? (
          <ImageBanner
            banner={{
              id: ad.id,
              image_url: ad.image_url,
              image_id: ad.image_id,
              link: ad.link,
            }}
            onImpression={onImpression}
            onClick={onClick}
          />
        ) : (
          <PremiumAdCard
            ad={ad}
            compact={compact}
            onImpression={onImpression}
            onClick={onClick}
          />
        )}
      </Animated.View>
    </View>
  );
}

/**
 * PremiumAdCard — card premium (imagem 16:9, texto, CTA e logo).
 *
 * Todos os hooks são chamados incondicionalmente (sem early return) para
 * manter a contagem estável durante a rotação de anúncios.
 */
function PremiumAdCard({
  ad,
  compact = false,
  onImpression,
  onClick,
}: PremiumAdBlockProps) {
  const impressionFired = useRef(false);

  // ── Animations ──────────────────────────────────────────────────────────────
  const scale = useSharedValue(1);

  const onPressIn = () => {
    scale.value = withSpring(0.97, spring.gentle);
  };
  const onPressOut = () => {
    scale.value = withSpring(1, spring.gentle);
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // ── Track impression on mount / layout ──────────────────────────────────────
  const handleLayout = useCallback(
    (_e: LayoutChangeEvent) => {
      if (impressionFired.current) return;
      impressionFired.current = true;
      onImpression?.();
    },
    [onImpression]
  );

  // Fallback: also fire impression after a short delay if layout doesn't fire
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!impressionFired.current) {
        impressionFired.current = true;
        onImpression?.();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [onImpression]);

  // ── Handle press ────────────────────────────────────────────────────────────
  const handlePress = useCallback(async () => {
    const safeLink = getSafeHttpsUrl(ad.link);
    if (!safeLink) return;
    onClick?.();
    await WebBrowser.openBrowserAsync(safeLink, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      toolbarColor:      "#0A0A0A",
      controlsColor:     "#FFFFFF",
    });
  }, [ad.link, onClick]);

  // Always show the full design with image — no compact mode
  const hasImage = !!ad.image_url;

  return (
    <Animated.View style={[styles.wrapper, cardStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.92}
        accessibilityRole="link"
        accessibilityLabel={`Anúncio: ${ad.title} — ${ad.description}`}
        onLayout={handleLayout}
        style={styles.card}
      >
        <View style={styles.imageContainer}>
          {hasImage && (
            <Image
              source={{ uri: ad.image_url }}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={300}
            />
          )}

          {/* Gradient overlay: transparente no topo → escuro na base (atrás do texto) */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.85)"]}
            locations={[0, 0.6, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {/* "PATROCINADO" badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PATROCINADO</Text>
          </View>

          {/* Big logo */}
          {ad.logo_url ? (
            <View style={styles.logoOverlay}>
              <Image
                source={{ uri: ad.logo_url }}
                style={styles.logoImage}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </View>
          ) : null}

          {/* Text content overlaid on image */}
          <View style={styles.overlayContent}>
            {/* Client name */}
            <Text style={styles.clientNameOverlay} numberOfLines={1}>
              {ad.title.toUpperCase()}
            </Text>

            {/* Headline */}
            <Text style={styles.headlineOverlay} numberOfLines={2}>
              {ad.description || ad.title}
            </Text>

            {/* CTA Button */}
            <View style={styles.ctaWrap}>
              <Text style={styles.ctaText}>
                {ad.cta_text || "Saiba mais"} ›
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Slot fixo 16:9: todos os formatos de anúncio ocupam exatamente o mesmo
  // espaço, evitando que a troca entre ad/banner desloque o layout.
  slot: {
    width: "100%",
    aspectRatio: 16 / 9,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "#0A0A0A",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },

  wrapper: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
  },

  // ── Image container (preenche o slot fixo 16:9) ──────────────────────────
  imageContainer: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
    backgroundColor: "#0A0A0A",
    justifyContent: "flex-end",
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },

  // ── Badge ─────────────────────────────────────────────────────────────────
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: "#FFFFFF",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  // ── Big logo overlay ──────────────────────────────────────────────────────
  logoOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  logoImage: {
    width: LOGO_SIZE - 12,
    height: LOGO_SIZE - 12,
    borderRadius: 6,
  },

  // ── Overlay content (text on image) ───────────────────────────────────────
  overlayContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 40, // space for gradient transition
    gap: 2,
  },

  // ── Client name on overlay ────────────────────────────────────────────────
  clientNameOverlay: {
    fontSize: 9,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "700",
    textTransform: "uppercase",
  },

  // ── Headline on overlay ───────────────────────────────────────────────────
  headlineOverlay: {
    fontFamily: "Georgia",
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 20,
    marginBottom: 2,
  },

  // ── CTA Button ────────────────────────────────────────────────────────────
  ctaWrap: {
    alignSelf: "flex-start",
    backgroundColor: "#38D080",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  ctaText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0A0A0A",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

});
