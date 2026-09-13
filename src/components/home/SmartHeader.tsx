/**
 * SmartHeader — Cabeçalho global com dois modos.
 *
 * HOME (showBrand=true):
 *   SPLASH: Ocupa 100% da tela. Glassmorphism sobre o conteúdo carregando atrás.
 *   COMPACTO: Encolhe com withSpring para insetTop + HEADER_COMPACT_H.
 *     [☰]  ZIMNY MEDIA CORPORATION + slogan  [search]
 *     [tab icons]
 *     Ao scrollar, o brand some e os tab icons sobem para a linha superior.
 *
 * GLOBAL (showBrand=false):
 *   Sempre compacto: [☰]  tab icons  [search]
 *   Usado em todas as outras telas (Notícias, Revista, Podcast, etc.)
 *
 * Tab Icons:
 *   Cada aba tem sua própria cor (mesmo esquema do menu lateral).
 *   Abas inativas: fundo branco, ícone na cor da aba e texto preto.
 *   A aba ativa ganha fundo na cor do ícone, com ícone e texto em branco.
 */
import { GlassView } from "@/src/components/common/GlassView";
import { Feather } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import Animated, {
  useAnimatedStyle,
  type SharedValue
} from "react-native-reanimated";

import { LiquidIconButton } from "@/src/components/common/LiquidIconButton";
import { LanguageSwitcherButton } from "@/src/components/home/LanguageSwitcherButton";
import { useTranslation } from "@/src/i18n";

// ─── Constants ───────────────────────────────────────────────────────────────

export const HEADER_ROW_H    = 56;
export const HEADER_TAB_H    = 60;
export const SLOGAN_ROW_H    = 30;
export const HEADER_BRAND_H  = 36;
/** Full header height: brand row + slogan row + tab row + bottom padding */
export const HEADER_COMPACT_H = HEADER_ROW_H + SLOGAN_ROW_H + HEADER_TAB_H + 8;

const SPRING = { damping: 28, stiffness: 200, mass: 0.85 } as const;
const SCROLL_THRESHOLD = 24;

const MONTH_PT = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];

// ─── Tab navigation items (Feather icons, same order as drawer) ─────────────
// Labels are resolved via useTranslation() at render time using translationKey.

const TAB_NAV_ITEMS = [
  { key: "noticias",          icon: "file-text"  as const, translationKey: "nav.noticias"  as const, route: "/(drawer)/(tabs)/noticias" },
  { key: "magazine",          icon: "book-open"  as const, translationKey: "nav.revista"   as const, route: "/(drawer)/(tabs)/magazine" },
  { key: "podcast",           icon: "headphones" as const, translationKey: "nav.podcast"   as const, route: "/(drawer)/(tabs)/podcast" },
  { key: "tv",                icon: "tv"         as const, translationKey: "nav.tv"        as const, route: "/(drawer)/(tabs)/tv" },
  { key: "cobertura-eventos", icon: "video"      as const, translationKey: "nav.cobertura" as const, route: "/(drawer)/(tabs)/cobertura-eventos" },
  { key: "events",            icon: "calendar"   as const, translationKey: "nav.eventos"   as const, route: "/(drawer)/(tabs)/events" },
  { key: "marketing-digital", icon: "trending-up"as const, translationKey: "nav.marketing" as const, route: "/(drawer)/(tabs)/marketing-digital" },
];

// ─── Tab colors vibrantes (compartilhadas com MenuDrawerContent e SectionTitle) ─

export const TAB_VIBRANT_COLORS: Record<string, string> = {
  noticias:          "#2AA8A0",
  magazine:          "#4A90D9",
  podcast:           "#38D080",
  tv:                "#D04040",
  "cobertura-eventos": "#D4508C",
  events:            "#D0A838",
  marketing:         "#8C5CD0",
  "marketing-digital": "#8C5CD0",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────


function editorialDate(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")} ${MONTH_PT[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  onOpenDrawer: () => void;
  onSearchPress?: () => void;
  isContentLoaded: boolean;
  insetTop: number;
  animHeight: SharedValue<number>;
  scrollY: SharedValue<number>;
  /** Quando true, exibe o nome ZIMNY MEDIA CORPORATION + slogan (apenas na Home).
   *  Quando false, mostra apenas a navegação compacta. */
  showBrand?: boolean;
};

// ─── TabNav ──────────────────────────────────────────────────────────────────
// Barra de tabs com ícones e labels em pills brancas, distribuídos uniformemente.

function TabNav({
  currentRoute,
  onNavigate,
}: {
  currentRoute: string;
  onNavigate: (route: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.tabNavContent}>
      {TAB_NAV_ITEMS.map((item) => {
        const isActive = item.key === currentRoute;
        const tabColor = TAB_VIBRANT_COLORS[item.key] || "#FFFFFF";
        const pillBg = isActive ? tabColor : "#FFFFFF";
        const iconColor = isActive ? "#FFFFFF" : tabColor;
        const labelColor = isActive ? "#FFFFFF" : "#000000";

        return (
          <Pressable
            key={item.key}
            onPress={() => onNavigate(item.route)}
            style={styles.tabNavItem}
            hitSlop={8}
          >
            <View style={[styles.tabNavPill, { backgroundColor: pillBg }]}>
              <Feather name={item.icon} size={16} color={iconColor} />
              <Text style={[styles.tabNavLabel, { color: labelColor }]}>
                {t(item.translationKey)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SmartHeader({
  onOpenDrawer,
  onSearchPress,
  isContentLoaded,
  insetTop,
  animHeight,
  scrollY: _scrollY,
  showBrand: _showBrand,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const segments = useSegments();
  // Resolve the active tab key from the current route segments.
  const lastSegment = segments[segments.length - 1];
  const currentRoute = lastSegment === "(tabs)" ? "index" : (lastSegment || "index");
  const headerH = insetTop + HEADER_COMPACT_H;

  // Ensure animHeight matches the fixed header height
  useEffect(() => {
    animHeight.value = headerH;
  }, [headerH, animHeight]);

  // ── Fixed container height ─────────────────────────────────────────────────
  const containerStyle = useAnimatedStyle(() => ({
    height: animHeight.value,
  }));

  const navTo = (route: string) => {
    router.push(route as any);
  };

  return (
    <Animated.View style={[styles.root, containerStyle]}>
      {/* ── Glassmorphism fill ─────────────────────────────────────────────── */}
      <GlassView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

      {/* ── HEADER FIXO (sempre com brand + tabs) ──────────────────────────── */}
      <View
        style={[
          styles.compact,
          { paddingTop: insetTop },
        ]}
      >
        {/* Row 1: hamburger + brand + spacer (para centralizar) */}
        <View style={styles.topRow}>
          <LiquidIconButton
            icon="bars"
            size={36}
            iconSize={15}
            iconColor="#FFFFFF"
            tint="dark"
            intensity={70}
            onPress={onOpenDrawer}
            accessibilityLabel={t("common.voltar")}
          />

          {/* Brand centralizado — clicável → Home */}
          <View style={styles.centerWrapper}>
            <Pressable onPress={() => router.push("/(drawer)/(tabs)" as any)} style={styles.brandCenter}>
              <Text style={styles.compactLogoZimny}>ZIMNY</Text>
              <Text style={styles.compactLogoMedia}>MEDIA CORPORATION</Text>
            </Pressable>
          </View>

          {/* Botão de idioma (bandeira) à direita — equilibra o hamburger */}
          <LanguageSwitcherButton />
        </View>

        {/* Row 2: slogan pill com lupa no final — clicável → pesquisa */}
        <View style={styles.sloganRow}>
          <Pressable
            onPress={onSearchPress}
            style={styles.sloganPill}
            hitSlop={6}
          >
            <Text
              style={styles.sloganText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
            >
              {t("header.slogan")}
            </Text>
            <Feather name="search" size={12} color="#000000" />
          </Pressable>
        </View>

        {/* Row 3: tab icons — sempre visível */}
        <View style={styles.bottomTabRow}>
          <TabNav currentRoute={currentRoute} onNavigate={navTo} />
        </View>
      </View>

      {/* ── Bottom hairline ────────────────────────────────────────────────── */}
      <View style={styles.hairline} />
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 60,
    overflow: "hidden",
  },
  // Splash
  splash: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 32,
  },
  splashWordmark: {
    fontFamily: "PlayfairDisplay",
    fontSize: 48,
    letterSpacing: 5,
    color: "#FFFFFF",
    lineHeight: 56,
  },
  splashMag: {
    fontSize: 16,
    letterSpacing: 6,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.35)",
    marginTop: 4,
  },
  splashDivider: {
    width: 40,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 22,
  },
  splashGreet: {
    fontFamily: "Georgia",
    fontSize: 15,
    letterSpacing: 4,
    color: "#8E8E93",
    marginBottom: 8,
  },
  splashDate: {
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
  },
  splashSpinner: {
    marginTop: 24,
  },
  // Compact
  compact: {
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    height: HEADER_ROW_H,
  },
  centerWrapper: {
    flex: 1,
    marginHorizontal: 4,
    height: HEADER_ROW_H,
    justifyContent: "center",
  },
  brandCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  compactLogoZimny: {
    fontFamily: "PlayfairDisplay",
    fontSize: 37,
    letterSpacing: 2.5,
    color: "#FFFFFF",
    lineHeight: 36,
    textAlign: "center",
  },
  compactLogoMedia: {
    fontSize: 14,
    letterSpacing: 3,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 15,
    textAlign: "center",
    textTransform: "uppercase",
    marginTop: 0,
  },
  sloganRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    gap: 8,
    marginTop: 2,
  },
  sloganPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    flex: 1,
  },
  sloganText: {
    fontSize: 9,
    letterSpacing: 1,
    color: "#000000",
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  tabNavWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 8,
  },
  tabNavContent: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  tabNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  tabNavPill: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: 44,
  },
  tabNavLabel: {
    fontSize: 5,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.2,
    marginTop: 1,
  },
  bottomTabRow: {
    height: HEADER_TAB_H,
    alignItems: "center",
    justifyContent: "center",
  },
  hairline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});
