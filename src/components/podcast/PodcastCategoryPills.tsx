/**
 * PodcastCategoryPills — Pills horizontais para filtrar episódios por categoria.
 *
 * Estilo escuro com pill ativa em branco.
 */
import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { spacing } from "@/src/constants/designTokens";

// ─── Types ─────────────────────────────────────────────────────────────────

export type PodcastCategory = {
  slug: string;
  name: string;
};

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  categories: PodcastCategory[];
  activeCategory: string | null;
  onSelect: (slug: string | null) => void;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function PodcastCategoryPills({
  categories,
  activeCategory,
  onSelect,
}: Props) {
  const handleSelect = useCallback(
    (slug: string | null) => () => onSelect(slug),
    [onSelect]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="always"
    >
      {/* "Todos" pill */}
      <Pressable
        onPress={handleSelect(null)}
        style={[styles.pill, activeCategory === null && styles.pillActive]}
      >
        <Text
          style={[
            styles.pillText,
            activeCategory === null && styles.pillTextActive,
          ]}
        >
          TODOS
        </Text>
      </Pressable>

      {categories.map((cat) => (
        <Pressable
          key={cat.slug}
          onPress={handleSelect(cat.slug)}
          style={[
            styles.pill,
            activeCategory === cat.slug && styles.pillActive,
          ]}
        >
          <Text
            style={[
              styles.pillText,
              activeCategory === cat.slug && styles.pillTextActive,
            ]}
            numberOfLines={1}
          >
            {cat.name.toUpperCase()}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignItems: "center",
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  pillActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  pillText: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
  },
  pillTextActive: {
    color: "#0A0A0A",
  },
});