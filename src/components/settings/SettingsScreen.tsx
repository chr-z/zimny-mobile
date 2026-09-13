/**
 * SettingsScreen — Configurações redesenhadas (Quiet Luxury).
 *
 * A estética do app é "Quiet Luxury": preto & branco, tipografia Georgia,
 * kickers editoriais com letter-spacing largo e cards em vidro.
 *
 * Foco da tela: PREFERÊNCIAS DE LEITURA. O tema (claro/escuro/sistema) e o
 * tamanho da fonte se aplicam à leitura de posts e artigos — exatamente como
 * no leitor (app/post/[id].tsx). Uma pré-visualização ao vivo mostra o
 * resultado combinado das duas escolhas antes mesmo de abrir uma matéria.
 *
 * Sem header nativo do Expo: top bar própria com botão voltar (padrão do app).
 */
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  useColorScheme,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FlagIcon, type FlagCode } from "@/src/components/common/FlagIcon";
import { GlassView } from "@/src/components/common/GlassView";
import { PressableScale } from "@/src/components/common/PressableScale";
import Constants from "expo-constants";
import { useLanguage } from "@/src/hooks/useLanguage";
import { useTheme } from "@/src/hooks/useTheme";
import { useTranslation } from "@/src/i18n";
import type { TranslationKey } from "@/src/i18n/types";
import { usePushStore } from "@/src/store/usePushStore";
import { registerForPush, disablePush } from "@/src/services/pushService";
import { useUserStore, type ThemePreference } from "@/src/store/useUserStore";
import { useLanguageStore } from "@/src/stores/useLanguageStore";

// ─── Types & constants ───────────────────────────────────────────────────────

type LangOption = {
  code: "pt" | "en" | "es" | null;
  label: string;
  flag: FlagCode | "auto";
};

/** Presets rápidos de tamanho de fonte (labels via i18n). */
const FONT_SIZES = [
  { value: 0.8, label: "settings.pequena" },
  { value: 1.0, label: "settings.normal" },
  { value: 1.2, label: "settings.grande" },
  { value: 1.4, label: "settings.muito_grande" },
  { value: 1.6, label: "settings.enorme" },
] as const;

/** Mesma escala de passos usada pelo ReaderPanel do leitor de artigos. */
const FONT_STEPS = [0.8, 0.9, 1.0, 1.1, 1.2, 1.4, 1.6];

const THEME_OPTIONS: {
  value: ThemePreference;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  label: TranslationKey;
}[] = [
  { value: "light",  icon: "sun-o",   label: "settings.claro" },
  { value: "dark",   icon: "moon-o",  label: "settings.escuro" },
  { value: "system", icon: "mobile",  label: "settings.sistema_auto" },
];

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({ kicker }: { kicker: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionKicker}>{kicker}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

// ─── Setting Card ────────────────────────────────────────────────────────────

function SettingCard({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.cardWrap}>
      <GlassView intensity={70} tint="dark" style={styles.glassFill} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <FontAwesome name={icon} size={14} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{title}</Text>
            {hint ? <Text style={styles.cardHint}>{hint}</Text> : null}
          </View>
        </View>
        {children}
      </View>
    </View>
  );
}

// ─── Reading Preview (WYSIWYG) ───────────────────────────────────────────────

function ReadingPreview({ dark, multiplier }: { dark: boolean; multiplier: number }) {
  const { t } = useTranslation();

  const surface   = dark ? "#121214" : "#F5F5F7";
  const titleC    = dark ? "#FFFFFF" : "#0A0A0A";
  const bodyC     = dark ? "#E0DFD9" : "#3A3A3C";
  const metaC     = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const ruleC     = dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)";
  const modeLabel = dark ? t("settings.tema_preview_escuro") : t("settings.tema_preview_claro");
  const chipIcon  = dark ? "moon-o" : "sun-o";

  return (
    <View style={styles.cardWrap}>
      <GlassView intensity={70} tint="dark" style={styles.glassFill} />
      <View style={styles.cardContent}>
        {/* Header: PRÉ-VISUALIZAÇÃO + tema + Aa */}
        <View style={styles.previewHeader}>
          <Text style={styles.previewHeaderText}>{t("settings.preview")}</Text>
          <View style={styles.previewScaleRow}>
            <View style={styles.previewModeChip}>
              <FontAwesome name={chipIcon} size={10} color="#FFFFFF" />
              <Text style={styles.previewModeChipText}>{modeLabel}</Text>
            </View>
            <Text style={styles.previewAa}>Aa</Text>
          </View>
        </View>

        {/* Mini-artigo ao vivo */}
        <View style={[styles.previewSurface, { backgroundColor: surface }]}>
          <Text style={[styles.previewKicker, { color: metaC }]}>ZIMNY · MAGAZINE</Text>
          <Text
            style={[
              styles.previewTitle,
              { color: titleC, fontSize: 20 * multiplier, lineHeight: 28 * multiplier },
            ]}
          >
            {t("settings.preview_titulo")}
          </Text>
          <Text style={[styles.previewMeta, { color: metaC }]}>{t("settings.preview_autor")}</Text>
          <Text
            style={[
              styles.previewBody,
              { color: bodyC, fontSize: 14 * multiplier, lineHeight: 22 * multiplier },
            ]}
          >
            {t("settings.preview_corpo")}
          </Text>
          <View style={[styles.previewRule, { backgroundColor: ruleC }]} />
        </View>

        {/* Nota: aplicado à leitura */}
        <Text style={styles.previewNote}>
          <FontAwesome name="bookmark-o" size={10} color="rgba(255,255,255,0.35)" />{" "}
          {t("settings.aplicado_leitura")}
        </Text>
      </View>
    </View>
  );
}

// ─── Theme Segmented Control ─────────────────────────────────────────────────

function ThemeSegmented({
  value,
  onChange,
}: {
  value: ThemePreference;
  onChange: (v: ThemePreference) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.segmentWrap}>
      {THEME_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <PressableScale
            key={opt.value}
            scaleTo={0.95}
            haptics
            onPress={() => onChange(opt.value)}
            containerStyle={styles.segmentSlot}
            style={styles.segmentPressable}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <View style={[styles.segment, active && styles.segmentActive]}>
              <FontAwesome
                name={opt.icon}
                size={13}
                color={active ? "#0A0A0A" : "rgba(255,255,255,0.5)"}
              />
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {t(opt.label)}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

// ─── Language Option Row ─────────────────────────────────────────────────────

function LangOptionRow({
  option,
  isActive,
  onPress,
}: {
  option: LangOption;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale scaleTo={0.97} haptics onPress={onPress} accessibilityRole="button">
      <View style={styles.row}>
        <View style={styles.flagIcon}>
          {option.flag === "auto" ? (
            <FontAwesome name="globe" size={18} color="#FFFFFF" />
          ) : (
            <FlagIcon code={option.flag} width={30} />
          )}
        </View>
        <Text style={[styles.rowLabel, !isActive && styles.rowLabelMuted]}>{option.label}</Text>
        {isActive && (
          <View style={styles.checkCircle}>
            <FontAwesome name="check" size={12} style={styles.checkIcon} />
          </View>
        )}
      </View>
    </PressableScale>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export function SettingsScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const storeLang = useLanguageStore((s) => s.language);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const { themePreference, setTheme, fontSizeMultiplier, setFontSize } = useUserStore();

  // ── Push (notificações) ──
  const pushEnabled = usePushStore((s) => s.enabled);
  const setPushEnabled = usePushStore((s) => s.setEnabled);
  const [pushWorking, setPushWorking] = useState(false);

  const togglePush = async () => {
    if (pushWorking) return;
    setPushWorking(true);
    try {
      if (!pushEnabled) {
        const res = await registerForPush();
        if (res.ok) {
          setPushEnabled(true);
        } else if (res.reason === "permission") {
          // Sem permissão do SO: orienta o usuário a habilitar manualmente.
          Alert.alert(
            t("push.permissao_titulo"),
            t("push.permissao_msg"),
          );
        } else {
          Alert.alert(
            t("push.indisponivel_titulo"),
            t("push.indisponivel_msg"),
          );
        }
      } else {
        await disablePush();
        setPushEnabled(false);
      }
    } catch {
      // Nunca deixar o toque do toggle gerar uncaught: qualquer falha inesperada
      // aqui (ex: registro) é tratada como "indisponível" e não quebra a UI.
      if (!pushEnabled) {
        Alert.alert(t("push.indisponivel_titulo"), t("push.indisponivel_msg"));
      } else {
        setPushEnabled(false);
      }
    } finally {
      setPushWorking(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(drawer)/(tabs)");
    }
  };

  // O tema de leitura resolve igual ao leitor de artigos (app/post/[id].tsx).
  const systemScheme = useColorScheme();
  const readingDark =
    themePreference === "dark" ||
    (themePreference === "system" && systemScheme === "dark");

  const LANG_OPTIONS: LangOption[] = [
    { code: null, label: t("settings.automatico"), flag: "auto" },
    { code: "pt", label: t("language.portugues"), flag: "pt" },
    { code: "en", label: t("language.english"),  flag: "en" },
    { code: "es", label: t("language.espanol"),  flag: "es" },
  ];

  // ── Font stepper (mesma escala do ReaderPanel) ──
  const currentIdx   = FONT_STEPS.findIndex((s) => s >= fontSizeMultiplier);
  const canDecrease  = currentIdx > 0;
  const canIncrease  = FONT_STEPS.findLastIndex((s) => s <= fontSizeMultiplier) < FONT_STEPS.length - 1;

  const decrease = () => {
    if (currentIdx > 0) setFontSize(FONT_STEPS[currentIdx - 1]);
  };
  const increase = () => {
    const idx = FONT_STEPS.findLastIndex((s) => s <= fontSizeMultiplier);
    if (idx < FONT_STEPS.length - 1) setFontSize(FONT_STEPS[idx + 1]);
  };

  const currentPreset = FONT_SIZES.find((f) => f.value === fontSizeMultiplier);
  const currentLabel  = currentPreset ? t(currentPreset.label) : `${Math.round(fontSizeMultiplier * 100)}%`;

  return (
    <View style={[styles.shell, { backgroundColor: colors.surface }]}>
      {/* ── Top bar própria (sem header nativo do Expo) ─────────────────── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <PressableScale
          scaleTo={0.88}
          haptics
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t("common.voltar")}
        >
          <GlassView tint="dark" intensity={70} style={styles.backButton}>
            <Feather name="arrow-left" size={18} color="#FFFFFF" />
          </GlassView>
        </PressableScale>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(60).duration(420)} style={styles.hero}>
          <Text style={styles.heroTitle}>{t("layout.configuracoes")}</Text>
          <Text style={styles.heroSubtitle}>{t("settings.sua_experiencia")}</Text>
        </Animated.View>

        {/* ── Preferências de Leitura ────────────────────────────────────── */}
        <SectionHeader kicker={t("settings.leitura")} />

        <ReadingPreview dark={readingDark} multiplier={fontSizeMultiplier} />

        <SettingCard
          icon="adjust"
          title={t("settings.tema_leitura")}
          hint={t("settings.tema_leitura_hint")}
        >
          <ThemeSegmented value={themePreference} onChange={setTheme} />
        </SettingCard>

        <SettingCard
          icon="font"
          title={t("settings.tamanho_fonte")}
          hint={t("settings.tamanho_fonte_hint")}
        >
          {/* Stepper A- / % / A+ */}
          <View style={styles.fontControlRow}>
            <PressableScale
              scaleTo={0.9}
              haptics
              onPress={decrease}
              disabled={!canDecrease}
              accessibilityRole="button"
              accessibilityLabel={t("settings.diminuir")}
            >
              <View style={[styles.aaBtn, !canDecrease && styles.aaBtnDisabled]}>
                <Text style={styles.aaBtnText}>A-</Text>
              </View>
            </PressableScale>

            <View style={styles.fontValueWrap}>
              <Text style={styles.fontValue}>{Math.round(fontSizeMultiplier * 100)}%</Text>
              <Text style={styles.fontValueCaption}>{currentLabel}</Text>
            </View>

            <PressableScale
              scaleTo={0.9}
              haptics
              onPress={increase}
              disabled={!canIncrease}
              accessibilityRole="button"
              accessibilityLabel={t("settings.aumentar")}
            >
              <View style={[styles.aaBtn, !canIncrease && styles.aaBtnDisabled]}>
                <Text style={[styles.aaBtnText, { fontSize: 18 }]}>A+</Text>
              </View>
            </PressableScale>
          </View>

          <View style={styles.divider} />

          {/* Presets rápidos */}
          <View style={styles.pillRow}>
            {FONT_SIZES.map((opt) => {
              const active = fontSizeMultiplier === opt.value;
              return (
                <PressableScale
                  key={opt.value}
                  scaleTo={0.94}
                  haptics
                  onPress={() => setFontSize(opt.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <View style={[styles.fontPill, active && styles.fontPillActive]}>
                    <Text style={[styles.fontPillText, active && styles.fontPillTextActive]}>
                      {t(opt.label)}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </View>
        </SettingCard>

        {/* ── Notificações Push ─────────────────────────────────────────── */}
        <SectionHeader kicker={t("push.kicker")} />

        <SettingCard
          icon="bell"
          title={t("push.titulo")}
          hint={t("push.hint")}
        >
          <PressableScale
            scaleTo={0.95}
            haptics
            onPress={togglePush}
            disabled={pushWorking}
            accessibilityRole="switch"
            accessibilityState={{ checked: pushEnabled }}
          >
            <View
              style={[
                styles.pushToggle,
                { backgroundColor: pushEnabled ? "#34C759" : "rgba(255,255,255,0.18)" },
              ]}
            >
              <View
                style={[
                  styles.pushKnob,
                  pushEnabled && styles.pushKnobOn,
                ]}
              />
            </View>
          </PressableScale>
        </SettingCard>

        {/* ── Idioma ─────────────────────────────────────────────────────── */}
        <SectionHeader kicker={t("settings.idioma_kicker")} />

        <View style={styles.cardWrap}>
          <GlassView intensity={70} tint="dark" style={styles.glassFill} />
          <View style={styles.cardContent}>
            {LANG_OPTIONS.map((opt, idx) => (
              <View key={opt.label}>
                <LangOptionRow
                  option={opt}
                  isActive={storeLang === opt.code}
                  onPress={() => setLanguage(opt.code)}
                />
                {idx < LANG_OPTIONS.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))}
            <Text style={styles.langHint}>
              {storeLang !== null
                ? `${t("settings.override_manual")}: ${language.toUpperCase()}`
                : `${t("settings.idioma_atual")}: ${language.toUpperCase()}`}
            </Text>
          </View>
        </View>

        {/* ── Sobre ──────────────────────────────────────────────────────── */}
        <SectionHeader kicker={t("settings.sobre_kicker")} />

        <View style={styles.cardWrap}>
          <GlassView intensity={70} tint="dark" style={styles.glassFill} />
          <View style={styles.cardContent}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>{t("settings.versao")}</Text>
              <Text style={styles.aboutValue}>{appVersion}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 48,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  // Hero
  hero: {
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: "Georgia",
    fontSize: 30,
    lineHeight: 38,
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    fontFamily: "Georgia",
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.55)",
    marginTop: 10,
    fontStyle: "italic",
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  sectionKicker: {
    fontSize: 10,
    letterSpacing: 3,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "700",
  },
  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  // Cards
  cardWrap: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
  },
  glassFill: {
    ...StyleSheet.absoluteFill,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  cardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: "Georgia",
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  cardHint: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.42)",
    marginTop: 2,
    letterSpacing: 0.2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 14,
  },

  // Reading preview
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  previewHeaderText: {
    fontSize: 9.5,
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "700",
  },
  previewScaleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  previewModeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  previewModeChipText: {
    fontSize: 8.5,
    letterSpacing: 1,
    color: "#FFFFFF",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  previewAa: {
    fontFamily: "Georgia",
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.5,
  },
  previewSurface: {
    borderRadius: 14,
    padding: 18,
  },
  previewKicker: {
    fontSize: 9,
    letterSpacing: 3,
    fontWeight: "700",
  },
  previewTitle: {
    fontFamily: "Georgia",
    marginTop: 10,
    letterSpacing: 0.2,
  },
  previewMeta: {
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 8,
    letterSpacing: 0.4,
  },
  previewBody: {
    fontFamily: "Georgia",
    marginTop: 14,
    letterSpacing: 0.1,
  },
  previewRule: {
    height: 2,
    width: 32,
    marginTop: 16,
    borderRadius: 1,
  },
  previewNote: {
    fontSize: 10.5,
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
    marginTop: 12,
    letterSpacing: 0.5,
  },

  // Theme segmented
  segmentWrap: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 3,
    gap: 3,
  },
  segmentSlot: {
    flex: 1,
  },
  segmentPressable: {
    flex: 1,
  },
  segment: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 11,
  },
  segmentActive: {
    backgroundColor: "#FFFFFF",
  },
  segmentText: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  segmentTextActive: {
    color: "#0A0A0A",
    fontWeight: "700",
  },

  // Font size
  fontControlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  aaBtn: {
    width: 52,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  aaBtnDisabled: {
    opacity: 0.35,
  },

  // ── Push toggle ──────────────────────────────────────────────────────────
  pushToggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    padding: 2,
    justifyContent: "center",
  },
  pushKnob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
  },
  pushKnobOn: {
    alignSelf: "flex-end",
  },
  aaBtnText: {
    fontFamily: "Georgia",
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  fontValueWrap: {
    alignItems: "center",
    flex: 1,
  },
  fontValue: {
    fontFamily: "Georgia",
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 1,
  },
  fontValueCaption: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.4)",
    marginTop: 4,
    textTransform: "uppercase",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  fontPill: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  fontPillActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  fontPillText: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  fontPillTextActive: {
    color: "#0A0A0A",
    fontWeight: "700",
  },

  // Rows
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginLeft: 46,
  },
  flagIcon: {
    width: 32,
    height: 21,
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontFamily: "Georgia",
    fontSize: 15.5,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  rowLabelMuted: {
    color: "rgba(255,255,255,0.55)",
    fontWeight: "400",
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    color: "#0A0A0A",
  },
  langHint: {
    fontSize: 11,
    textAlign: "center",
    color: "rgba(255,255,255,0.35)",
    marginTop: 8,
    letterSpacing: 0.5,
  },

  // About
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
  },
  aboutLabel: {
    fontSize: 13.5,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.3,
  },
  aboutValue: {
    fontFamily: "Georgia",
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
