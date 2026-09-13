/**
 * LanguageSwitcher — Seletor de idioma premium para o menu lateral.
 *
 * Três bandeiras vetoriais (PT • EN • ES) dentro de uma "pill" de vidro sutil.
 * A bandeira ativa ganha realce (fundo + anel branco) e um badge de check
 * no canto — micro-interação com haptics via PressableScale.
 *
 * Estética Quiet Luxury: preto & branco, cantos arredondados, letter-spacing
 * editorial. Consistente com os demais seletores do app.
 */
import * as Haptics from "expo-haptics";
import { StyleSheet, Text, View } from "react-native";

import { FlagIcon } from "@/src/components/common/FlagIcon";
import { PressableScale } from "@/src/components/common/PressableScale";
import { useLanguage } from "@/src/hooks/useLanguage";
import { useTranslation } from "@/src/i18n";
import type { AppLanguage } from "@/src/stores/useLanguageStore";

const LANGUAGES: { code: AppLanguage; label: string }[] = [
  { code: "pt", label: "language.portugues" },
  { code: "en", label: "language.english" },
  { code: "es", label: "language.espanol" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const select = (code: AppLanguage) => {
    if (code !== language) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setLanguage(code);
  };

  return (
    <View style={styles.wrap}>
      {LANGUAGES.map((lang) => {
        const isActive = language === lang.code;
        return (
          <PressableScale
            key={lang.code}
            scaleTo={0.88}
            haptics
            onPress={() => select(lang.code)}
            accessibilityRole="button"
            accessibilityLabel={t(lang.label as any)}
            accessibilityState={{ selected: isActive }}
            style={[styles.item, isActive && styles.itemActive]}
          >
            <FlagIcon code={lang.code} width={26} />
            {isActive && (
              <View style={styles.check}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            )}
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    padding: 3,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  item: {
    width: 36,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  itemActive: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.4)",
  },
  check: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    fontSize: 8,
    lineHeight: 11,
    color: "#0A0A0A",
    fontWeight: "800",
  },
});
