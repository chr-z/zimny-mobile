/**
 * Contato — Página de contato comercial da Zimny Magazine.
 *
 * Redesign "Quiet Luxury": preto & branco, tipografia editorial (Georgia)
 * apenas em títulos, valores em sans-serif limpa, glassmorphism e
 * micro-interações com haptics.
 *
 *  - Top bar própria (sem header nativo do Expo) com botão voltar
 *  - Hero editorial com gradiente sutil + ornamento
 *  - WhatsApp + Ligar lado a lado (ações primárias)
 *  - E-mail em card de largura total, sempre em uma linha
 *  - Nota de resposta rápida em pill
 *  - Redes sociais em cápsulas de vidro + site oficial
 *  - Rodapé de marca (ZIMNY · MEDIA CORP)
 *
 * Acessível em `/contato`. É o destino único das CTAs "Anuncie Conosco"
 * (Home, Podcast, ZyTV, media kit, etc.).
 */
import { Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassView } from "@/src/components/common/GlassView";
import { PressableScale } from "@/src/components/common/PressableScale";
import {
  mailtoUrl,
  telUrl,
  whatsappUrl,
  ZIMNY_CONTACT,
  ZIMNY_SOCIAL_LINKS,
} from "@/src/constants/contact";
import { font, radius, shadow, spacing } from "@/src/constants/designTokens";
import { useTheme } from "@/src/hooks/useTheme";
import { useTranslation } from "@/src/i18n";

// ─── Cores de canal ───────────────────────────────────────────────────────────
const WHATSAPP_GREEN = "#25D366";
const PHONE_BLUE = "#5AC8FA";
const EMAIL_GRAY = "#8E8E93";

type IconName = React.ComponentProps<typeof FontAwesome>["name"];
type IconName5 = React.ComponentProps<typeof FontAwesome5>["name"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContatoScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Grid de ações primárias: 2 colunas lado a lado em telas ≥ 360px
  const isGrid = width >= 360;

  // ── Ações de contato ────────────────────────────────────────────────────────
  const handleWhatsApp = useCallback(() => {
    Linking.openURL(whatsappUrl()).catch(() => {});
  }, []);

  const handlePhone = useCallback(() => {
    Linking.openURL(telUrl()).catch(() => {});
  }, []);

  const handleEmail = useCallback(() => {
    Linking.openURL(mailtoUrl()).catch(() => {});
  }, []);

  const openExternal = useCallback((url: string) => {
    if (!url) return;
    if (url.startsWith("http")) {
      WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        toolbarColor: "#0A0A0A",
        controlsColor: "#FFFFFF",
      }).catch(() => {});
    } else {
      Linking.openURL(url).catch(() => {});
    }
  }, []);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(drawer)/(tabs)");
    }
  }, [router]);

  // ── Dados ───────────────────────────────────────────────────────────────────
  const primaryChannels = [
    {
      key: "whatsapp",
      icon: "whatsapp" as IconName,
      label: t("contact.whatsapp"),
      value: ZIMNY_CONTACT.phoneDisplay,
      color: WHATSAPP_GREEN,
      onPress: handleWhatsApp,
    },
    {
      key: "phone",
      icon: "phone" as IconName,
      label: t("contact.telefone"),
      value: ZIMNY_CONTACT.phoneDisplay,
      color: PHONE_BLUE,
      onPress: handlePhone,
    },
  ];

  const socialItems = [
    {
      key: "instagram",
      icon: "instagram" as IconName,
      url: ZIMNY_SOCIAL_LINKS.instagram,
    },
    {
      key: "facebook",
      icon: "facebook" as IconName,
      url: ZIMNY_SOCIAL_LINKS.facebook,
    },
    { key: "tiktok", icon5: "tiktok" as IconName5, url: ZIMNY_SOCIAL_LINKS.tiktok },
    {
      key: "youtube",
      icon: "youtube-play" as IconName,
      url: ZIMNY_SOCIAL_LINKS.youtube,
    },
    { key: "site", icon: "globe" as IconName, url: ZIMNY_SOCIAL_LINKS.site },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.shell, { backgroundColor: colors.surface }]}>
      {/* ── Top bar própria ─────────────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <PressableScale
          scaleTo={0.88}
          haptics
          onPress={handleBack}
        >
          <GlassView tint="dark" intensity={70} style={styles.backButton}>
            <Feather name="arrow-left" size={18} color="#FFFFFF" />
          </GlassView>
        </PressableScale>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 24) + 48 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Hero editorial ─────────────────────────────────────────────── */}
        <View style={styles.hero}>
          <LinearGradient
            colors={[colors.surfaceAlt, colors.surface]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.heroGradient}
          />
          <Text style={[styles.kicker, { color: colors.textSecondary }]}>
            ZIMNY MAGAZINE
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("contact.title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("contact.subtitle")}
          </Text>

          {/* Ornamento editorial: linha · losango · linha */}
          <View style={styles.ornament}>
            <View
              style={[styles.ornamentLine, { backgroundColor: colors.borderStrong }]}
            />
            <View
              style={[styles.ornamentDiamond, { backgroundColor: colors.textSecondary }]}
            />
            <View
              style={[styles.ornamentLine, { backgroundColor: colors.borderStrong }]}
            />
          </View>
        </View>

        {/* ── Ações primárias: WhatsApp + Ligar ──────────────────────────── */}
        <View style={[styles.grid, isGrid ? styles.gridRow : styles.gridStack]}>
          {primaryChannels.map((item) => (
            <PressableScale
              key={item.key}
              scaleTo={0.96}
              haptics
              onPress={item.onPress}
              containerStyle={styles.gridItem}
            >
              <View
                style={[
                  styles.primaryCard,
                  {
                    backgroundColor: `${item.color}12`,
                    borderColor: `${item.color}40`,
                  },
                  shadow.md,
                ]}
              >
                <View
                  style={[styles.primaryIcon, { backgroundColor: item.color }]}
                >
                  <FontAwesome name={item.icon} size={22} color="#FFFFFF" />
                </View>
                <Text style={[styles.primaryKicker, { color: item.color }]}>
                  {item.label}
                </Text>
                <Text
                  style={[styles.primaryValue, { color: colors.text }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {item.value}
                </Text>
              </View>
            </PressableScale>
          ))}
        </View>

        {/* ── E-mail (largura total, uma linha) ──────────────────────────── */}
        <PressableScale scaleTo={0.97} haptics onPress={handleEmail} containerStyle={styles.emailWrap}>
          <GlassView tint="dark" intensity={60} style={styles.emailGlass}>
            <View
              style={[
                styles.emailIcon,
                {
                  backgroundColor: `${EMAIL_GRAY}1A`,
                  borderColor: `${EMAIL_GRAY}33`,
                },
              ]}
            >
              <FontAwesome name="envelope" size={18} color={EMAIL_GRAY} />
            </View>
            <View style={styles.emailBody}>
              <Text style={[styles.emailLabel, { color: colors.textSecondary }]}>
                {t("contact.email")}
              </Text>
              <Text
                style={[styles.emailValue, { color: colors.text }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {ZIMNY_CONTACT.email}
              </Text>
            </View>
            <View style={styles.emailArrow}>
              <Feather name="arrow-up-right" size={15} color={colors.textSecondary} />
            </View>
          </GlassView>
        </PressableScale>

        {/* ── Nota de resposta rápida ────────────────────────────────────── */}
        <View style={[styles.note, { borderColor: colors.borderStrong }]}>
          <FontAwesome name="clock-o" size={12} color={colors.textSecondary} />
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            {t("contact.resposta_rapida")}
          </Text>
        </View>

        {/* ── Redes sociais ──────────────────────────────────────────────── */}
        <View style={styles.socialBlock}>
          <Text style={[styles.socialKicker, { color: colors.textSecondary }]}>
            {t("contact.siga_nos")}
          </Text>

          <View style={styles.socialRow}>
            {socialItems.map((s) => (
              <PressableScale
                key={s.key}
                scaleTo={0.88}
                haptics
                onPress={() => openExternal(s.url)}
              >
                <GlassView tint="dark" intensity={70} style={styles.socialGlass}>
                  {s.icon5 ? (
                    <FontAwesome5 name={s.icon5} size={16} color="#FFFFFF" />
                  ) : (
                    <FontAwesome name={s.icon!} size={18} color="#FFFFFF" />
                  )}
                </GlassView>
              </PressableScale>
            ))}
          </View>

          <PressableScale
            scaleTo={0.97}
            haptics
            onPress={() => openExternal(ZIMNY_SOCIAL_LINKS.site)}
          >
            <Text style={[styles.siteLink, { color: colors.textSecondary }]}>
              {t("contact.visite_site")} — zimnymagazine.com
            </Text>
          </PressableScale>
        </View>

        {/* ── Rodapé de marca ────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <View
            style={[styles.footerLine, { backgroundColor: colors.borderStrong }]}
          />
          <Text style={[styles.footerBrand, { color: colors.text }]}>ZIMNY</Text>
          <Text style={[styles.footerTag, { color: colors.textSecondary }]}>
            MEDIA CORP
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },

  // ── Top bar ─────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },

  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
  },

  // ── Hero ────────────────────────────────────────────────────────────────
  hero: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
    borderRadius: radius["2xl"],
    overflow: "hidden",
    paddingTop: spacing["3xl"],
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  heroGradient: {
    ...StyleSheet.absoluteFill,
  },
  kicker: {
    fontSize: font.size.kicker,
    fontWeight: "700",
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: font.serif,
    fontSize: font.size.hero,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: font.size.body,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 340,
    letterSpacing: 0.2,
  },
  ornament: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing["2xl"],
  },
  ornamentLine: {
    width: 40,
    height: StyleSheet.hairlineWidth,
  },
  ornamentDiamond: {
    width: 6,
    height: 6,
    transform: [{ rotate: "45deg" }],
  },

  // ── Ações primárias (WhatsApp + Ligar) ──────────────────────────────────
  grid: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  gridRow: {
    flexDirection: "row",
  },
  gridStack: {
    flexDirection: "column",
  },
  gridItem: {
    flex: 1,
  },
  primaryCard: {
    borderRadius: radius["2xl"],
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  primaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  primaryKicker: {
    fontSize: font.size.caption,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textAlign: "center",
  },
  primaryValue: {
    fontSize: font.size.small,
    fontWeight: "600",
    letterSpacing: 0.2,
    textAlign: "center",
    maxWidth: "100%",
  },

  // ── E-mail ──────────────────────────────────────────────────────────────
  emailWrap: {
    marginBottom: spacing.md,
  },
  emailGlass: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
    padding: spacing.lg,
    overflow: "hidden",
  },
  emailIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  emailBody: {
    flex: 1,
    gap: 2,
  },
  emailLabel: {
    fontSize: font.size.caption,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  emailValue: {
    fontSize: font.size.body,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  emailArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },

  // ── Nota ────────────────────────────────────────────────────────────────
  note: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing["3xl"],
  },
  noteText: {
    fontSize: font.size.small,
    letterSpacing: 0.2,
  },

  // ── Redes sociais ───────────────────────────────────────────────────────
  socialBlock: {
    alignItems: "center",
    gap: spacing.xl,
    marginBottom: spacing["3xl"],
  },
  socialKicker: {
    fontSize: font.size.kicker,
    fontWeight: "700",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  socialRow: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  socialGlass: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  siteLink: {
    fontSize: font.size.small,
    letterSpacing: 0.3,
    textDecorationLine: "underline",
  },

  // ── Rodapé ──────────────────────────────────────────────────────────────
  footer: {
    alignItems: "center",
    gap: spacing.xs,
  },
  footerLine: {
    width: 48,
    height: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
  },
  footerBrand: {
    fontFamily: font.serif,
    fontSize: font.size.title,
    fontWeight: "700",
    letterSpacing: 4,
  },
  footerTag: {
    fontSize: font.size.kicker,
    fontWeight: "700",
    letterSpacing: 4,
  },
});
