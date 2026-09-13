/**
 * LanguageSwitcherButton — Seletor de idioma do header (lado direito).
 *
 * Botão circular de vidro com globo. Ao tocar, abre um popup (modal) em vidro
 * com as três línguas suportadas — bandeira vetorial + nome em Georgia.
 * A língua ativa é destacada com uma "pill" branca (preto sobre branco),
 * micro-interação com haptics.
 *
 * Estética Quiet Luxury, consistente com o resto do app.
 */
import Feather from "@expo/vector-icons/Feather";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { FlagIcon } from "@/src/components/common/FlagIcon";
import { GlassView } from "@/src/components/common/GlassView";
import { PressableScale } from "@/src/components/common/PressableScale";
import { useLanguage } from "@/src/hooks/useLanguage";
import { useTranslation } from "@/src/i18n";
import type { TranslationKey } from "@/src/i18n/types";
import type { AppLanguage } from "@/src/stores/useLanguageStore";

const BUTTON_SIZE = 36;

const LANGUAGES: { code: AppLanguage; labelKey: TranslationKey }[] = [
  { code: "pt", labelKey: "language.portugues" },
  { code: "en", labelKey: "language.english" },
  { code: "es", labelKey: "language.espanol" },
];

export function LanguageSwitcherButton() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const select = (code: AppLanguage) => {
    if (code !== language) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setLanguage(code);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          setOpen(true);
        }}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t("settings.idioma")}
        style={styles.button}
      >
        <GlassView intensity={70} tint="dark" style={styles.buttonGlass}>
          <Feather name="globe" size={17} color="#FFFFFF" />
        </GlassView>
      </Pressable>

      {/* ── Popup de seleção (vidro, centralizado) ─────────────────────── */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {/* Nested Pressable swallows taps on the card so it stays open */}
          <Pressable style={styles.cardPressable} onPress={() => {}}>
            <Animated.View entering={FadeInDown.delay(40).duration(320)} style={styles.card}>
              <GlassView intensity={84} tint="dark" style={StyleSheet.absoluteFill} />

              {/* Handle */}
              <View style={styles.handle} />

              {/* Kicker com linhas flanqueadas */}
              <View style={styles.kickerRow}>
                <View style={styles.kickerLine} />
                <Text style={styles.kicker}>{t("settings.idioma_kicker")}</Text>
                <View style={styles.kickerLine} />
              </View>

              {/* Línguas */}
              {LANGUAGES.map((lang) => {
                const isActive = language === lang.code;
                return (
                  <PressableScale
                    key={lang.code}
                    scaleTo={0.97}
                    haptics
                    onPress={() => select(lang.code)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    style={[styles.row, isActive && styles.rowActive]}
                  >
                    <View style={styles.rowFlag}>
                      <FlagIcon code={lang.code} width={28} />
                    </View>
                    <Text style={[styles.rowLabel, isActive && styles.rowLabelActive]}>
                      {t(lang.labelKey)}
                    </Text>
                    <View style={[styles.check, isActive && styles.checkActive]}>
                      <Feather name="check" size={12} color={isActive ? "#FFFFFF" : "transparent"} />
                    </View>
                  </PressableScale>
                );
              })}

              {/* Rodapé: língua atual */}
              <Text style={styles.footnote}>
                {t("settings.idioma_atual")}: {language.toUpperCase()}
              </Text>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    overflow: "hidden",
  },
  buttonGlass: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: BUTTON_SIZE / 2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  cardPressable: {
    width: "100%",
    maxWidth: 300,
    borderRadius: 24,
    overflow: "hidden",
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignSelf: "center",
    marginBottom: 12,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  kickerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  kicker: {
    fontSize: 9.5,
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  rowActive: {
    backgroundColor: "#FFFFFF",
  },
  rowFlag: {
    width: 30,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontFamily: "Georgia",
    fontSize: 15.5,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.3,
  },
  rowLabelActive: {
    color: "#0A0A0A",
    fontWeight: "600",
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkActive: {
    backgroundColor: "#0A0A0A",
  },
  footnote: {
    fontSize: 10,
    textAlign: "center",
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.3)",
    marginTop: 12,
    textTransform: "uppercase",
  },
});
