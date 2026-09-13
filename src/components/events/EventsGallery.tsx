/**
 * EventsGallery — Mosaico estilo Pinterest 3 colunas.
 *
 * Alturas variáveis baseadas na orientação de cada mídia.
 * Usa FlatList com numColumns=3 para renderização eficiente.
 */
import { useCallback, useMemo } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";

import { EventMediaCard } from "@/src/components/events/EventMediaCard";
import { spacing } from "@/src/constants/designTokens";
import type { EventMedia } from "@/src/constants/eventsData";

// ─── Constants ─────────────────────────────────────────────────────────────

const COLUMNS = 3;
const H_PADDING = spacing.lg;
const GAP = spacing.sm;

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  media: EventMedia[];
  /** Optional category filter */
  filterCategory?: "producao" | "cobertura" | null;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function EventsGallery({ media, filterCategory }: Props) {
  const { width: screenW } = useWindowDimensions();

  const totalGap = GAP * (COLUMNS - 1);
  const cardWidth = Math.floor((screenW - H_PADDING * 2 - totalGap) / COLUMNS);

  // Filter by category
  const filtered = useMemo(() => {
    if (!filterCategory) return media;
    return media.filter((item) => item.category === filterCategory);
  }, [media, filterCategory]);

  const renderItem = useCallback(
    ({ item }: { item: EventMedia }) => (
      <EventMediaCard item={item} width={cardWidth} />
    ),
    [cardWidth]
  );

  const keyExtractor = useCallback((item: EventMedia) => item.id, []);

  return (
    <FlatList
      data={filtered}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      numColumns={COLUMNS}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.columnWrapper}
      scrollEnabled={false}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhum evento encontrado</Text>
        </View>
      }
    />
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 24,
  },
  columnWrapper: {
    gap: GAP,
  },
  empty: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#8E8E93",
    fontSize: 13,
    letterSpacing: 0.5,
    fontFamily: "Georgia",
  },
});