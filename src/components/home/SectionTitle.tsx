/**
 * SectionTitle — Barra estilo macOS para seções da Home.
 *
 * Similar à titlebar de uma janela do macOS:
 * - Fundo na cor da seção ocupando toda a largura
 * - Título centralizado em branco
 */
import { StyleSheet, Text, View } from "react-native";

import { spacing } from "@/src/constants/designTokens";

// ─── Cores das seções (mesmo palette do MenuDrawerContent / SmartHeader) ──────
// Usa sectionKey (language-independent) para garantir cor consistente em qualquer idioma.

const SECTION_COLORS: Record<string, string> = {
  "revista":             "#4A90D9",
  "podcast":            "#38D080",
  "cobertura":          "#D4508C",
  "eventos":            "#D0A838",
  "marketing digital":  "#8C5CD0",
  "coluna do dia":      "#8C5CD0",
  "galerias":           "#2AA8A0",
};

// ─── Types ───────────────────────────────────────────────────────────────────

type SectionTitleProps = {
  title: string;
  /** Cor opcional para sobrescrever a cor automática */
  color?: string;
  /** Chave language-independent para lookup de cor (ex: "revista", "podcast").
   *  Se omitido, faz o fallback para o title em português. */
  sectionKey?: string;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function SectionTitle({ title, color, sectionKey }: SectionTitleProps) {
  if (!title) return null;

  const accentColor = color || (sectionKey ? SECTION_COLORS[sectionKey] : undefined) || "#000000";

  return (
    <View style={[styles.bar, { backgroundColor: accentColor }]}>
      <Text style={styles.text}>{title.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    marginBottom: spacing.xs,
    marginHorizontal: spacing.lg,
    borderRadius: 6,
  },
  text: {
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});