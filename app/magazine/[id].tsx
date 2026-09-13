/**
 * MagazineViewerScreen
 *
 * Exibe a revista interativa do WordPress (3D FlipBook) via react-native-webview.
 *
 * Fluxo:
 * 1. Pega o `id` da rota (número da edição, ex: "1", "7")
 * 2. Gera a URL da página WordPress via getMagazineUrl(id)
 * 3. Obtém o idioma atual do app via useLanguage() como fallback inicial
 * 4. Mantém um estado local `magazineLanguage` para troca de idioma on-demand
 * 5. Renderiza o MagazineViewer com a URL + magazineLanguage
 * 6. Exibe loading overlay + botão "Voltar" + botão "Globo" (idioma)
 */

import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassView } from "@/src/components/common/GlassView";
import { LiquidIconButton } from "@/src/components/common/LiquidIconButton";
import { MagazineViewer } from "@/src/components/magazine";
import { useLanguage } from "@/src/hooks/useLanguage";
import { useTranslation } from "@/src/i18n";
import { getMagazineUrl } from "@/src/services/magazineUrl";
import type { AppLanguage } from "@/src/stores/useLanguageStore";

// ─── Constants ────────────────────────────────────────────────────────────────

const LOCALE_ORDER: AppLanguage[] = ["pt", "en", "es"];

// ─── Language Picker ──────────────────────────────────────────────────────────

type LangPickerProps = {
  activeLocale: AppLanguage;
  labels: Record<AppLanguage, string>;
  title: string;
  onSelect: (locale: AppLanguage) => void;
  onDismiss: () => void;
};

function LangPicker({ activeLocale, labels, title, onSelect, onDismiss }: LangPickerProps) {
  return (
    <Pressable style={styles.pickerOverlay} onPress={onDismiss}>
      {/* stopPropagation: tap inside the card doesn't close */}
      <Pressable onPress={(e) => e.stopPropagation()}>
        <GlassView intensity={85} tint="dark" style={styles.pickerCard}>
          <Text style={styles.pickerTitle}>{title}</Text>
          {LOCALE_ORDER.map((key, idx) => {
            const isActive = key === activeLocale;
            const isLast = idx === LOCALE_ORDER.length - 1;
            return (
              <Pressable
                key={key}
                onPress={() => onSelect(key)}
                style={[styles.pickerRow, isLast && { borderBottomWidth: 0 }]}
              >
                <Text
                  style={[
                    styles.pickerLang,
                    isActive && styles.pickerLangActive,
                  ]}
                >
                  {labels[key]}
                </Text>
                {isActive && <View style={styles.pickerDot} />}
              </Pressable>
            );
          })}
        </GlassView>
      </Pressable>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MagazineViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language: appLanguage } = useLanguage();
  const { t } = useTranslation();

  const localeLabels: Record<AppLanguage, string> = {
    pt: `${t("language.portugues")} (BR)`,
    en: `${t("language.english")} (US)`,
    es: `${t("language.espanol")} (ES)`,
  };

  // Gera a URL diretamente — o id da rota é o número da edição
  const wordpressUrl = getMagazineUrl(id);

  // ── Idioma local da revista (independente do idioma global do app) ────────
  const [magazineLanguage, setMagazineLanguage] =
    useState<AppLanguage>(appLanguage);
  const [showLangPicker, setShowLangPicker] = useState(false);

  // Estado de loading da WebView
  const [webViewLoading, setWebViewLoading] = useState(true);

  const handleLoadEnd = useCallback(() => {
    // Delay pequeno para garantir que o Canvas do WebGL já começou a renderizar
    setTimeout(() => setWebViewLoading(false), 500);
  }, []);

  const handleError = useCallback(() => {
    setWebViewLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleLangSelect = useCallback((locale: AppLanguage) => {
    setMagazineLanguage(locale);
    setShowLangPicker(false);
  }, []);

  // Determina se o picker deve aparecer (sempre mostra para edições com variantes)
  // Como todas as edições têm PT/EN/ES no WordPress, sempre exibimos o botão
  const hasMultipleLanguages = true;

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <View style={styles.shell}>
      {/* WebView com o 3D FlipBook */}
      <MagazineViewer
        uri={wordpressUrl}
        language={magazineLanguage}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />

      {/* Loading overlay — desaparece quando o Canvas do 3D FlipBook renderiza */}
      {webViewLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#C9A84C" />
        </View>
      )}

      {/* Botão "Voltar" nativo sobreposto — canto superior esquerdo */}
      <View
        style={[styles.topLeft, { top: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        <LiquidIconButton
          icon="arrow-left"
          size={40}
          iconColor="#FFFFFF"
          tint="dark"
          intensity={80}
          onPress={handleClose}
          accessibilityLabel="Voltar"
        />
      </View>

      {/* Botão "Globo" (idioma) — canto superior direito */}
      {hasMultipleLanguages && (
        <View
          style={[styles.topRight, { top: insets.top + 8 }]}
          pointerEvents="box-none"
        >
          <LiquidIconButton
            icon="globe"
            size={40}
            iconSize={16}
            iconColor="rgba(255,255,255,0.8)"
            tint="dark"
            intensity={80}
            onPress={() => setShowLangPicker(true)}
            accessibilityLabel="Escolher idioma"
          />
        </View>
      )}

      {/* Language picker overlay */}
      {showLangPicker && (
        <LangPicker
          activeLocale={magazineLanguage}
          labels={localeLabels}
          title={t("common.idioma_edicao")}
          onSelect={handleLangSelect}
          onDismiss={() => setShowLangPicker(false)}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0A0A",
    zIndex: 10,
  },
  topLeft: {
    position: "absolute",
    left: 8,
    zIndex: 50,
  },
  topRight: {
    position: "absolute",
    right: 8,
    zIndex: 50,
  },

  // ── Language picker ───────────────────────────────────────────────────────
  pickerOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  pickerCard: {
    borderRadius: 18,
    overflow: "hidden",
    minWidth: 220,
  },
  pickerTitle: {
    fontSize: 9,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.45)",
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  pickerLang: {
    fontFamily: "Georgia",
    fontSize: 17,
    color: "rgba(255,255,255,0.7)",
  },
  pickerLangActive: {
    color: "#C9A84C",
  },
  pickerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#C9A84C",
  },
});
