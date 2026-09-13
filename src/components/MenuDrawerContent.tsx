/**
 * MenuDrawerContent — High-Ticket Ultra Luxury Editorial Drawer.
 * Clean, typographic, high contrast P&B without generic heavy icons.
 */
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "expo-router/build/react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { LanguageSwitcher } from "@/src/components/LanguageSwitcher";
import { PressableScale } from "@/src/components/common/PressableScale";
import { TAB_VIBRANT_COLORS } from "@/src/components/home/SmartHeader";
import { ZIMNY_LINKS } from "@/src/constants/social";
import { useExternalData } from "@/src/hooks/useExternalData";
import { useTranslation } from "@/src/i18n";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#080808" },
  scroll: { backgroundColor: "transparent" },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  brandName: { fontFamily: "PlayfairDisplay", fontSize: 26, fontWeight: "700", letterSpacing: 3, color: "#FFFFFF" },
  brandTagline: { marginTop: 6, fontSize: 9, fontWeight: "600", textTransform: "uppercase", letterSpacing: 4, color: "#8E8E93" },
  dataLabel: { fontSize: 9, letterSpacing: 1.8, color: "#8E8E93", fontWeight: "700", textTransform: "uppercase" },
  dataValue: { fontSize: 9, letterSpacing: 1.2, color: "rgba(255,255,255,0.65)", fontWeight: "700" },
  sectionLabel: { marginBottom: 12, fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 3.5, color: "#545458" },
  navLabel: { fontFamily: "Georgia", fontSize: 17, fontWeight: "400", letterSpacing: 0.5, color: "#FFFFFF" },
  navSub: { marginTop: 3, fontSize: 11, fontWeight: "400", color: "#8E8E93" },
  tabCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabCardNeutral: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.09)",
  },
  tabIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconCircleNeutral: {
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  badgeText: { fontSize: 8, fontWeight: "800", textTransform: "uppercase", letterSpacing: 2, color: "#FFFFFF" },
  closeBar: { height: 2, width: 24, borderRadius: 1, alignSelf: "center", backgroundColor: "#333333" },
  closeText: { marginTop: 8, fontSize: 8, fontWeight: "700", textTransform: "uppercase", letterSpacing: 3.5, color: "#666666" },
  adCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },
  adBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  adBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0A0A0A",
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  adHeadline: {
    fontFamily: "Georgia",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 30,
    color: "#0A0A0A",
  },
  adWord: {
    fontFamily: "Georgia",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 30,
    color: "#0A0A0A",
  },
  adSubline: {
    marginTop: 10,
    marginBottom: 16,
    fontSize: 11,
    lineHeight: 16,
    color: "#666666",
    textAlign: "center",
  },
  adCtaGlow: {
    borderRadius: 9999,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  adCtaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#16A34A",
    borderRadius: 9999,
    paddingVertical: 12,
    overflow: "hidden",
  },
  adCtaText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#FFFFFF",
  },
  adCtaArrow: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginLeft: 2,
  },
  adCtaShine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 110,
  },
  adGlassEdge: {
    position: "absolute",
    top: 0,
    left: "10%",
    right: "10%",
    height: 1.5,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
});

// ── Item de Navegação Nobre (Sem ícones bregas) ─────────────
function NavRow({
  label,
  subtitle,
  onPress,
}: {
  label: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <PressableScale scaleTo={0.98} onPress={onPress} haptics>
      <View className="flex-row items-center justify-between border-b border-white/[0.08] py-4">
        <View className="flex-1 pr-4">
          <Text style={styles.navLabel}>{label}</Text>
          {subtitle && <Text style={styles.navSub}>{subtitle}</Text>}
        </View>
        <Feather name="chevron-right" size={16} color="#545458" />
      </View>
    </PressableScale>
  );
}

// ── Item de Aba com Ícone e Cor Sutil ────────────────────────
// Cores CHEIAS de cada seção = TAB_VIBRANT_COLORS (mesmas do header do app),
// aplicadas em cards arredondados modernos. Home fica neutra (sem tabKey).

/** Converte #RRGGBB em rgba com alpha. */
function hexA(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function TabRow({
  label,
  subtitle,
  icon,
  tabKey,
  onPress,
}: {
  label: string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  tabKey?: string;
  onPress: () => void;
}) {
  const accent = tabKey ? TAB_VIBRANT_COLORS[tabKey] : null;

  return (
    <PressableScale scaleTo={0.97} onPress={onPress} haptics>
      <View
        style={[
          styles.tabCard,
          accent
            ? {
                backgroundColor: hexA(accent, 0.13),
                borderColor: hexA(accent, 0.32),
              }
            : styles.tabCardNeutral,
        ]}
      >
        <View
          style={[
            styles.tabIconCircle,
            accent ? { backgroundColor: accent } : styles.tabIconCircleNeutral,
          ]}
        >
          <Feather name={icon} size={18} color="#FFFFFF" />
        </View>
        <View className="flex-1 pr-2">
          <Text style={styles.navLabel} numberOfLines={1}>
            {label}
          </Text>
          {subtitle && (
            <Text style={styles.navSub} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.35)" />
      </View>
    </PressableScale>
  );
}

// ── Botão Social Vetorial Limpo ──────────────────────────────
function SocialIconButton({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <PressableScale scaleTo={0.88} onPress={onPress} haptics>
      <View className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        {children}
      </View>
    </PressableScale>
  );
}

// ── Card "Anuncie Conosco" — Fundo Branco, CTA Animatdo ───────
// Identidade Quiet Luxury preto & branco + headline dinâmica que alterna
// palavras-chave (leitura dinâmica, menos texto) e botão com brilho
// deslizante, glow pulsante e seta animada. Leva para a aba de contato.
function AnuncieCta({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();

  const words = useMemo(
    () => [
      t("drawer.dyn_word_1"),
      t("drawer.dyn_word_2"),
      t("drawer.dyn_word_3"),
      t("drawer.dyn_word_4"),
    ],
    [t]
  );
  const [wordIdx, setWordIdx] = useState(0);

  // ── Headline dinâmica: crossfade entre palavras-chave ───────
  const wordProgress = useSharedValue(1);
  const advanceWord = useCallback(() => {
    setWordIdx((i) => (i + 1) % words.length);
  }, [words.length]);
  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordProgress.value,
  }));

  // ── Animações do CTA: shine, glow e seta ────────────────────
  const shine = useSharedValue(-1);
  const glow = useSharedValue(0);
  const arrow = useSharedValue(0);

  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shine.value * 170 }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.25 + glow.value * 0.25,
    shadowRadius: 8 + glow.value * 12,
  }));
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrow.value }],
  }));

  useEffect(() => {
    shine.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400 }),
        withTiming(-1, { duration: 1400 })
      ),
      -1,
      true
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100 }),
        withTiming(0, { duration: 1100 })
      ),
      -1,
      true
    );
    arrow.value = withRepeat(
      withSequence(
        withTiming(4, { duration: 900 }),
        withTiming(0, { duration: 900 })
      ),
      -1,
      true
    );
  }, []);

  // Rotação da palavra-chave com crossfade (fade out → troca → fade in)
  useEffect(() => {
    const id = setInterval(() => {
      wordProgress.value = withTiming(0, { duration: 220 }, (finished) => {
        if (finished) {
          runOnJS(advanceWord)();
          wordProgress.value = withTiming(1, { duration: 320 });
        }
      });
    }, 2600);
    return () => clearInterval(id);
  }, [advanceWord, wordProgress]);

  return (
    <PressableScale scaleTo={0.97} onPress={onPress} haptics>
      <View style={styles.adCard}>
        {/* Tag Superior */}
        <View style={styles.adBadgeRow}>
          <View style={styles.adBadge}>
            <Feather name="zap" size={9} color="#FFFFFF" />
            <Text style={styles.badgeText}>{t("drawer.publicidade_exclusiva")}</Text>
          </View>
          <Feather name="trending-up" size={14} color="#0A0A0A" />
        </View>

        {/* Headline Dinâmica: prefixo + palavra-chave em crossfade (alinhados à esquerda) */}
        <Text style={styles.adHeadline}>{t("drawer.dyn_prefix")}</Text>
        <Animated.Text key={wordIdx} style={[styles.adWord, wordStyle]}>
          {words[wordIdx]}
        </Animated.Text>

        {/* Sub-linha mínima */}
        <Text style={styles.adSubline}>{t("drawer.dyn_subline")}</Text>

        {/* CTA Verde com Brilho Metálico/Glass → Aba de Contato */}
        <Animated.View style={[styles.adCtaGlow, glowStyle]}>
          <View style={styles.adCtaButton}>
            <View style={styles.adGlassEdge} />
            <Text style={styles.adCtaText}>{t("drawer.anuncie_agora")}</Text>
            <Animated.Text style={[styles.adCtaArrow, arrowStyle]}>→</Animated.Text>
            <Animated.View style={[styles.adCtaShine, shineStyle]}>
              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(255,255,255,0.55)",
                  "rgba(255,255,255,0.2)",
                  "transparent",
                ]}
                start={{ x: 0, y: 0.15 }}
                end={{ x: 1, y: 0.85 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </PressableScale>
  );
}

// ── Componente Principal do Drawer ───────────────────────────
export function MenuDrawerContent(props: DrawerContentComponentProps) {
  const { t } = useTranslation();
  const open = (url: string) => {
    props.navigation.closeDrawer();
    Linking.openURL(url).catch(() => {});
  };

  const navTo = (path: string) => {
    props.navigation.closeDrawer();
    router.push(path as any);
  };

  const { data: ext } = useExternalData();
  const usd = ext?.usdFormatted ?? "--";
  const bos = ext?.bostonF != null && !isNaN(ext.bostonF) ? `${ext.bostonF}°F` : "--°F";

  return (
    <View style={styles.root}>
      <DrawerContentScrollView
        {...props}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Brand Header ────────────────────────────────── */}
        <View className="px-6 pb-6 pt-2" style={{ alignItems: "center" }}>
          {/* Top row: Language on left, USD/BOS stacked on right */}
          <View className="mb-5 w-full flex-row items-start justify-between">
            <LanguageSwitcher />

            {/* USD / Boston — stacked vertically on the right */}
            <View className="items-end">
              <View className="flex-row items-center">
                <Text style={styles.dataLabel}>USD</Text>
                <Text style={styles.dataValue}> R$ {usd}</Text>
              </View>
              <View className="flex-row items-center">
                <Text style={styles.dataLabel}>BOS</Text>
                <Text style={styles.dataValue}> {bos}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.brandName}>ZIMNY</Text>
          <Text style={styles.brandTagline}>MEDIA CORP</Text>

          {/* Redes sociais logo abaixo da marca */}
          <View className="mt-5 w-full flex-row justify-between">
            <SocialIconButton onPress={() => open(ZIMNY_LINKS.instagram)}>
              <FontAwesome name="instagram" size={18} color="#FFFFFF" />
            </SocialIconButton>
            <SocialIconButton onPress={() => open(ZIMNY_LINKS.facebook)}>
              <FontAwesome name="facebook" size={18} color="#FFFFFF" />
            </SocialIconButton>
            <SocialIconButton onPress={() => open(ZIMNY_LINKS.tiktok)}>
              <FontAwesome5 name="tiktok" size={15} color="#FFFFFF" />
            </SocialIconButton>
            <SocialIconButton onPress={() => open(ZIMNY_LINKS.youtube)}>
              <FontAwesome name="youtube-play" size={16} color="#FFFFFF" />
            </SocialIconButton>
          </View>

          <View className="mt-5 h-[1px] w-full bg-white/10" />
        </View>

        {/* ── Abas do App (cards arredondados com a cor de cada seção) ── */}
        <View className="mb-6 px-4" style={{ gap: 10 }}>
          <TabRow
            label={t("drawer.home")}
            subtitle={t("drawer.ultimas_noticias")}
            icon="home"
            onPress={() => navTo("/(drawer)/(tabs)")}
          />
          <TabRow
            label={t("nav.noticias")}
            subtitle={t("drawer.artigos_reportagens")}
            icon="file-text"
            tabKey="noticias"
            onPress={() => navTo("/(drawer)/(tabs)/noticias")}
          />
          <TabRow
            label={t("nav.revista")}
            subtitle={t("drawer.edicoes_impressas")}
            icon="book-open"
            tabKey="magazine"
            onPress={() => navTo("/(drawer)/(tabs)/magazine")}
          />
          <TabRow
            label={t("nav.podcast")}
            subtitle={t("drawer.episodios_series")}
            icon="headphones"
            tabKey="podcast"
            onPress={() => navTo("/(drawer)/(tabs)/podcast")}
          />
          <TabRow
            label={t("drawer.cobertura_eventos")}
            subtitle={t("drawer.cobertura_subtitle")}
            icon="video"
            tabKey="cobertura-eventos"
            onPress={() => navTo("/(drawer)/(tabs)/cobertura-eventos")}
          />
          <TabRow
            label={t("drawer.ao_vivo")}
            subtitle={t("drawer.tv_subtitle")}
            icon="tv"
            tabKey="tv"
            onPress={() => navTo("/(drawer)/(tabs)/tv")}
          />
          <TabRow
            label={t("nav.eventos")}
            subtitle={t("drawer.producao_zimny")}
            icon="calendar"
            tabKey="events"
            onPress={() => navTo("/(drawer)/(tabs)/events")}
          />
          <TabRow
            label={t("nav.marketing")}
            subtitle={t("drawer.marketing_subtitle")}
            icon="trending-up"
            tabKey="marketing-digital"
            onPress={() => navTo("/(drawer)/(tabs)/marketing-digital")}
          />
        </View>

        {/* ── Card Anuncie Conosco ────────────────────────── */}
        <View className="mb-6 px-6">
          <AnuncieCta onPress={() => navTo("/contato")} />
        </View>

        {/* ── Secundário ───────────────────────────────────── */}
        <View className="mb-6 px-6">
          <NavRow
            label={t("contact.title")}
            subtitle={t("drawer.contato_subtitle")}
            onPress={() => navTo("/contato")}
          />
          <NavRow
            label={t("drawer.sobre_zimny")}
            subtitle={t("drawer.sobre_subtitle")}
            onPress={() => navTo("/about")}
          />
          <NavRow
            label={t("drawer.configuracoes")}
            subtitle={t("drawer.subtitle_config")}
            onPress={() => navTo("/settings")}
          />
        </View>

        {/* ── Fechar Menu ─────────────────────────────────── */}
        <View className="items-center px-6 pt-2">
          <Pressable onPress={() => props.navigation.closeDrawer()}>
            <View style={styles.closeBar} />
            <Text style={styles.closeText}>{t("drawer.fechar_menu")}</Text>
          </Pressable>
        </View>
      </DrawerContentScrollView>
    </View>
  );
}