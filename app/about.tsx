/**
 * About Screen — "Quem Somos"
 *
 * Redesign "Quiet Luxury": preto & branco, tipografia editorial (Georgia)
 * apenas em títulos, body em sans-serif, glassmorphism e seções numeradas
 * para leitura elegante e moderna — consistente com o resto do app.
 *
 *  - Top bar própria (sem header nativo do Expo) com botão voltar
 *  - Hero editorial com gradiente + ornamento + imagem do time (tocável)
 *  - Seções numeradas (01–06) com cards de vidro
 *  - "O que entregamos" com ícones Feather
 *  - Ecossistema em grade de chips
 *  - Seção trilíngue com bandeiras vetoriais (FlagIcon)
 *  - Distribuição regional com pinos
 *  - Rodapé de marca com a mensagem central da ZIMNY
 */
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FlagIcon } from "@/src/components/common/FlagIcon";
import { GlassView } from "@/src/components/common/GlassView";
import { MediaViewer } from "@/src/components/common/MediaViewer";
import { PressableScale } from "@/src/components/common/PressableScale";
import { font, radius, shadow, spacing } from "@/src/constants/designTokens";
import {
  mailtoUrl,
  telUrl,
  whatsappUrl,
  ZIMNY_CONTACT,
} from "@/src/constants/contact";
import { useTheme } from "@/src/hooks/useTheme";
import { useTranslation } from "@/src/i18n";
import type { EventMediaItem } from "@/src/services/zimnyEvents";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

/** Placeholder enquanto a imagem do time carrega. */
const IMAGE_PLACEHOLDER = "#1C1C1E";

/** URL oficial da imagem do time (WordPress). */
const TEAM_IMAGE_URL =
  "https://zimnymagazine.com/wp-content/uploads/2026/08/about-us-atualizado.png";

/** Item de mídia usado pelo MediaViewer em tela cheia. */
const TEAM_MEDIA: EventMediaItem = {
  id: "about-team",
  type: "photo",
  url: TEAM_IMAGE_URL,
  thumbnail: TEAM_IMAGE_URL,
  title: "Equipe Zimny",
  orientation: "landscape",
  is_featured: true,
  width: 1600,
  height: 900,
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SectionHeading({
  index,
  title,
  colors,
}: {
  index: string;
  title: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionIndex, { color: colors.textSecondary }]}>
        {index}
      </Text>
      <View style={[styles.sectionRule, { backgroundColor: colors.borderStrong }]} />
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

function Paragraphs({
  lines,
  colors,
}: {
  lines: string[];
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={styles.paragraphs}>
      {lines.map((line, i) => (
        <Text key={i} style={[styles.paragraph, { color: colors.text }]}>
          {line}
        </Text>
      ))}
    </View>
  );
}

function FeatureRow({
  icon,
  title,
  desc,
  colors,
}: {
  icon: FeatherName;
  title: string;
  desc: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={styles.featureRow}>
      <View style={[styles.featureIcon, { backgroundColor: colors.surfaceElevated }]}>
        <Feather name={icon} size={18} color="#FFFFFF" />
      </View>
      <View style={styles.featureBody}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{desc}</Text>
      </View>
    </View>
  );
}

function BulletList({
  items,
  colors,
}: {
  items: string[];
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={styles.bulletList}>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={[styles.bulletDot, { backgroundColor: colors.textSecondary }]} />
          <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Component principal ──────────────────────────────────────────────────────

export default function AboutScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Grade de idiomas / regiões: lado a lado em telas ≥ 420px
  const isRow = width >= 420;

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(drawer)/(tabs)");
    }
  }, [router]);

  // ── Visualizador em tela cheia (imagem do time) ──────────────────────────
  const [viewerVisible, setViewerVisible] = useState(false);

  // ── Dados estruturados ─────────────────────────────────────────────────────
  const features = [
    { icon: "heart" as FeatherName, title: t("about.entregamos_1_titulo"), desc: t("about.entregamos_1_desc") },
    { icon: "flag" as FeatherName, title: t("about.entregamos_2_titulo"), desc: t("about.entregamos_2_desc") },
    { icon: "trending-up" as FeatherName, title: t("about.entregamos_3_titulo"), desc: t("about.entregamos_3_desc") },
    { icon: "book-open" as FeatherName, title: t("about.entregamos_4_titulo"), desc: t("about.entregamos_4_desc") },
    { icon: "award" as FeatherName, title: t("about.entregamos_5_titulo"), desc: t("about.entregamos_5_desc") },
  ];

  const ecosystem = [
    t("about.ecossistema_item_1"),
    t("about.ecossistema_item_2"),
    t("about.ecossistema_item_3"),
    t("about.ecossistema_item_4"),
    t("about.ecossistema_item_5"),
    t("about.ecossistema_item_6"),
    t("about.ecossistema_item_7"),
    t("about.ecossistema_item_8"),
  ];

  const languages = [
    { code: "pt" as const, label: t("about.trilingue_item_1") },
    { code: "en" as const, label: t("about.trilingue_item_2") },
    { code: "es" as const, label: t("about.trilingue_item_3") },
  ];

  const regions = [
    { title: t("about.distribuicao_ma_titulo"), desc: t("about.distribuicao_ma_desc") },
    { title: t("about.distribuicao_ri_titulo"), desc: t("about.distribuicao_ri_desc") },
    { title: t("about.distribuicao_nh_titulo"), desc: t("about.distribuicao_nh_desc") },
    { title: t("about.distribuicao_me_titulo"), desc: t("about.distribuicao_me_desc") },
  ];

  const footerCtas = [
    t("about.footer_cta_1"),
    t("about.footer_cta_2"),
    t("about.footer_cta_3"),
    t("about.footer_cta_4"),
    t("about.footer_cta_5"),
  ];

  return (
    <View style={[styles.shell, { backgroundColor: colors.surface }]}>
      {/* ── Top bar própria ─────────────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <PressableScale scaleTo={0.88} haptics onPress={handleBack}>
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
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {t("about.titulo")}
          </Text>

          {/* Ornamento editorial: linha · losango · linha */}
          <View style={styles.ornament}>
            <View style={[styles.ornamentLine, { backgroundColor: colors.borderStrong }]} />
            <View style={[styles.ornamentDiamond, { backgroundColor: colors.textSecondary }]} />
            <View style={[styles.ornamentLine, { backgroundColor: colors.borderStrong }]} />
          </View>

          {/* Imagem do time (tocável → tela cheia) */}
          <PressableScale
            scaleTo={0.98}
            haptics
            onPress={() => setViewerVisible(true)}
            containerStyle={styles.teamImageFrame}
          >
            <Image
              source={TEAM_IMAGE_URL}
              style={styles.teamImage}
              contentFit="cover"
              transition={300}
            />
            {/* Badge expandir */}
            <View style={styles.expandBadge}>
              <Feather name="maximize" size={14} color="#FFFFFF" />
            </View>
          </PressableScale>
        </View>

        {/* ── Introdução ──────────────────────────────────────────────────── */}
        <GlassView tint="dark" intensity={55} style={styles.glassCard}>
          <Paragraphs
            colors={colors}
            lines={[t("about.paragrafo_1"), t("about.paragrafo_2"), t("about.paragrafo_3")]}
          />
        </GlassView>

        {/* ── 01 · Nossa Essência ─────────────────────────────────────────── */}
        <SectionHeading index="01" title={t("about.essencia_titulo")} colors={colors} />
        <GlassView tint="dark" intensity={55} style={styles.glassCard}>
          <Paragraphs
            colors={colors}
            lines={[
              t("about.essencia_p1"),
              t("about.essencia_p2"),
              t("about.essencia_p3"),
              t("about.essencia_p4"),
            ]}
          />
        </GlassView>

        {/* ── 02 · O que entregamos ───────────────────────────────────────── */}
        <SectionHeading index="02" title={t("about.entregamos_titulo")} colors={colors} />
        <GlassView tint="dark" intensity={55} style={styles.glassCard}>
          <Text style={[styles.sectionIntro, { color: colors.textSecondary }]}>
            {t("about.entregamos_intro")}
          </Text>
          <View style={styles.featureList}>
            {features.map((f, i) => (
              <View key={f.title}>
                {i > 0 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
                <FeatureRow icon={f.icon} title={f.title} desc={f.desc} colors={colors} />
              </View>
            ))}
          </View>
        </GlassView>

        {/* ── 03 · Ecossistema ────────────────────────────────────────────── */}
        <SectionHeading index="03" title={t("about.ecossistema_titulo")} colors={colors} />
        <GlassView tint="dark" intensity={55} style={styles.glassCard}>
          <Text style={[styles.sectionIntro, { color: colors.textSecondary }]}>
            {t("about.ecossistema_intro")}
          </Text>
          <View style={styles.chipGrid}>
            {ecosystem.map((item, i) => (
              <View key={i} style={[styles.chip, { backgroundColor: colors.surfaceAlt }]}>
                <View style={[styles.chipDot, { backgroundColor: colors.textSecondary }]} />
                <Text style={[styles.chipText, { color: colors.text }]}>{item}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.outro, { color: colors.text }]}>
            {t("about.ecossistema_outro")}
          </Text>
        </GlassView>

        {/* ── 04 · Trilíngue ──────────────────────────────────────────────── */}
        <SectionHeading index="04" title={t("about.trilingue_titulo")} colors={colors} />
        <GlassView tint="dark" intensity={55} style={styles.glassCard}>
          <Text style={[styles.sectionIntro, { color: colors.textSecondary }]}>
            {t("about.trilingue_intro")}
          </Text>
          <View style={[styles.langRow, !isRow && styles.langColumn]}>
            {languages.map((lang) => (
              <View key={lang.code} style={[styles.langCard, { backgroundColor: colors.surfaceAlt }]}>
                <FlagIcon code={lang.code} width={36} borderRadius={4} />
                <Text style={[styles.langLabel, { color: colors.text }]}>{lang.label}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.outro, { color: colors.text }]}>
            {t("about.trilingue_outro")}
          </Text>
        </GlassView>

        {/* ── 05 · Edição impressa ────────────────────────────────────────── */}
        <SectionHeading index="05" title={t("about.impressa_titulo")} colors={colors} />
        <GlassView tint="dark" intensity={55} style={styles.glassCard}>
          <Text style={[styles.sectionIntro, { color: colors.textSecondary }]}>
            {t("about.impressa_intro")}
          </Text>

          <View style={[styles.printBlock, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.printTitle, { color: colors.text }]}>
              {t("about.impressa_en_titulo")}
            </Text>
            <BulletList
              colors={colors}
              items={[
                t("about.impressa_en_item_1"),
                t("about.impressa_en_item_2"),
                t("about.impressa_en_item_3"),
              ]}
            />
          </View>

          <View style={[styles.printBlock, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.printTitle, { color: colors.text }]}>
              {t("about.impressa_pt_titulo")}
            </Text>
            <BulletList
              colors={colors}
              items={[
                t("about.impressa_pt_item_1"),
                t("about.impressa_pt_item_2"),
                t("about.impressa_pt_item_3"),
              ]}
            />
          </View>
        </GlassView>

        {/* ── 06 · Distribuição ───────────────────────────────────────────── */}
        <SectionHeading index="06" title={t("about.distribuicao_titulo")} colors={colors} />
        <GlassView tint="dark" intensity={55} style={styles.glassCard}>
          <Text style={[styles.sectionIntro, { color: colors.textSecondary }]}>
            {t("about.distribuicao_intro")}
          </Text>
          <View style={styles.regionList}>
            {regions.map((r, i) => (
              <View key={r.title}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={styles.regionRow}>
                  <View style={[styles.regionIcon, { backgroundColor: colors.surfaceElevated }]}>
                    <Feather name="map-pin" size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.regionBody}>
                    <Text style={[styles.regionTitle, { color: colors.text }]}>{r.title}</Text>
                    <Text style={[styles.regionDesc, { color: colors.textSecondary }]}>{r.desc}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </GlassView>

        {/* ── Fale Conosco (contato editorial — exigência News Policy) ──────── */}
        <SectionHeading index="07" title={t("contact.title")} colors={colors} />
        <GlassView tint="dark" intensity={55} style={styles.glassCard}>
          <Text style={[styles.sectionIntro, { color: colors.textSecondary }]}>
            {t("about.contato_intro")}
          </Text>
          <View style={styles.contactRows}>
            <PressableScale
              style={styles.contactRow}
              onPress={() =>
                Linking.openURL(whatsappUrl()).catch(() => {})
              }
            >
              <View style={[styles.contactIcon, { backgroundColor: colors.surfaceElevated }]}>
                <Feather name="message-circle" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.contactBody}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                  {t("contact.whatsapp")}
                </Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>
                  {ZIMNY_CONTACT.phoneDisplay}
                </Text>
              </View>
            </PressableScale>
            <View style={[styles.contactDivider, { backgroundColor: colors.border }]} />
            <PressableScale
              style={styles.contactRow}
              onPress={() => Linking.openURL(telUrl()).catch(() => {})}
            >
              <View style={[styles.contactIcon, { backgroundColor: colors.surfaceElevated }]}>
                <Feather name="phone" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.contactBody}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                  {t("contact.telefone")}
                </Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>
                  {ZIMNY_CONTACT.phoneDisplay}
                </Text>
              </View>
            </PressableScale>
            <View style={[styles.contactDivider, { backgroundColor: colors.border }]} />
            <PressableScale
              style={styles.contactRow}
              onPress={() => Linking.openURL(mailtoUrl()).catch(() => {})}
            >
              <View style={[styles.contactIcon, { backgroundColor: colors.surfaceElevated }]}>
                <Feather name="mail" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.contactBody}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                  {t("contact.email")}
                </Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>
                  {ZIMNY_CONTACT.email}
                </Text>
              </View>
            </PressableScale>
            <View style={[styles.contactDivider, { backgroundColor: colors.border }]} />
            <PressableScale
              style={styles.contactRow}
              onPress={() =>
                Linking.openURL("https://zimnymagazine.com/contato/").catch(() => {})
              }
            >
              <View style={[styles.contactIcon, { backgroundColor: colors.surfaceElevated }]}>
                <Feather name="globe" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.contactBody}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                  {t("contact.visite_site")}
                </Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>
                  zimnymagazine.com/contato
                </Text>
              </View>
            </PressableScale>
          </View>
        </GlassView>

        {/* ── Rodapé de marca ─────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <View style={[styles.footerRule, { backgroundColor: colors.borderStrong }]} />
          <Text style={[styles.footerTitle, { color: colors.text }]}>
            {t("about.footer_titulo")}
          </Text>
          <Text style={[styles.footerParagraph, { color: colors.textSecondary }]}>
            {t("about.footer_p1")}
          </Text>
          <Text style={[styles.footerParagraph, { color: colors.textSecondary }]}>
            {t("about.footer_p2")}
          </Text>

          <View style={styles.footerCtas}>
            {footerCtas.map((cta, i) => (
              <Text
                key={i}
                style={[
                  styles.footerCta,
                  { color: i === footerCtas.length - 1 ? colors.text : colors.textSecondary },
                ]}
              >
                {cta}
              </Text>
            ))}
          </View>

          <View style={[styles.footerLine, { backgroundColor: colors.borderStrong }]} />
          <Text style={[styles.footerBrand, { color: colors.text }]}>ZIMNY</Text>
          <Text style={[styles.footerTag, { color: colors.textSecondary }]}>
            MEDIA CORP
          </Text>
        </View>
      </ScrollView>

      {/* Visualizador em tela cheia da imagem do time */}
      <MediaViewer
        visible={viewerVisible}
        media={viewerVisible ? TEAM_MEDIA : null}
        onClose={() => setViewerVisible(false)}
      />
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
  heroTitle: {
    fontFamily: font.serif,
    fontSize: font.size.hero,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
    maxWidth: 340,
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

  // ── Imagem do time ─────────────────────────────────────────────────────
  teamImageFrame: {
    marginTop: spacing["2xl"],
    width: "100%",
    maxWidth: 420,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
    ...shadow.md,
  },
  teamImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: IMAGE_PLACEHOLDER,
  },
  expandBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.25)",
  },

  // ── Cards de vidro ──────────────────────────────────────────────────────
  glassCard: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
    padding: spacing.lg,
    marginBottom: spacing["3xl"],
    overflow: "hidden",
  },
  paragraphs: {
    gap: spacing.md,
  },
  paragraph: {
    fontSize: font.size.body,
    lineHeight: 26,
    letterSpacing: 0.2,
  },

  // ── Cabeçalho de seção ──────────────────────────────────────────────────
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionIndex: {
    fontSize: font.size.kicker,
    fontWeight: "700",
    letterSpacing: 2,
    marginRight: spacing.sm,
  },
  sectionRule: {
    width: 28,
    height: StyleSheet.hairlineWidth,
    marginRight: spacing.md,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: font.serif,
    fontSize: font.size.headline,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // ── Introdução / rodapé de seção ────────────────────────────────────────
  sectionIntro: {
    fontSize: font.size.small,
    lineHeight: 22,
    letterSpacing: 0.2,
    marginBottom: spacing.lg,
  },

  // ── Bloco de contato (About) ────────────────────────────────────────────
  contactRows: {
    gap: 2,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  contactBody: {
    flex: 1,
  },
  contactLabel: {
    fontSize: font.size.caption,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: font.size.body,
    fontWeight: "600",
  },
  contactDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },
  outro: {
    fontSize: font.size.body,
    lineHeight: 26,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginTop: spacing.lg,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.md,
  },

  // ── O que entregamos ────────────────────────────────────────────────────
  featureList: {
    gap: 0,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  featureBody: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontSize: font.size.body,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  featureDesc: {
    fontSize: font.size.small,
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  // ── Ecossistema ─────────────────────────────────────────────────────────
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
  },
  chipDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  chipText: {
    fontSize: font.size.small,
    letterSpacing: 0.2,
  },

  // ── Trilíngue ───────────────────────────────────────────────────────────
  langRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  langColumn: {
    flexDirection: "column",
  },
  langCard: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  langLabel: {
    fontSize: font.size.small,
    fontWeight: "600",
    letterSpacing: 0.3,
    textAlign: "center",
  },

  // ── Edição impressa ─────────────────────────────────────────────────────
  printBlock: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  printTitle: {
    fontFamily: font.serif,
    fontSize: font.size.title,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: spacing.xs,
  },
  bulletList: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: font.size.small,
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  // ── Distribuição ────────────────────────────────────────────────────────
  regionList: {
    gap: 0,
  },
  regionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  regionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  regionBody: {
    flex: 1,
    gap: 2,
  },
  regionTitle: {
    fontSize: font.size.body,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  regionDesc: {
    fontSize: font.size.small,
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  // ── Rodapé ──────────────────────────────────────────────────────────────
  footer: {
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  footerRule: {
    width: 48,
    height: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
  },
  footerTitle: {
    fontFamily: font.serif,
    fontSize: font.size.headline,
    fontWeight: "700",
    letterSpacing: 0.3,
    textAlign: "center",
    lineHeight: 32,
    maxWidth: 340,
  },
  footerParagraph: {
    fontSize: font.size.small,
    lineHeight: 22,
    letterSpacing: 0.2,
    textAlign: "center",
    maxWidth: 360,
  },
  footerCtas: {
    alignItems: "center",
    gap: spacing.xs,
    marginVertical: spacing.md,
  },
  footerCta: {
    fontFamily: font.serif,
    fontSize: font.size.bodyLarge,
    fontStyle: "italic",
    fontWeight: "600",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  footerLine: {
    width: 48,
    height: StyleSheet.hairlineWidth,
    marginTop: spacing.md,
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
