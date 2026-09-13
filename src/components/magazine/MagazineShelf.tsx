/**
 * MagazineShelf — Estante de edições em grid 3 colunas.
 *
 * Usa FlatList para performance com scroll vertical.
 * Reutiliza dados de useEditionStore().
 */
import { useCallback } from "react";
import {
    FlatList,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";

import { Skeleton } from "@/src/components/common/LoadingSkeleton";
import { MagazineCard } from "@/src/components/magazine/MagazineCard";
import { radius, spacing } from "@/src/constants/designTokens";
import type { MagazineEdition } from "@/src/services/api";

// ─── Constants ─────────────────────────────────────────────────────────────

const COLUMNS = 3;
const H_PADDING = spacing.lg;
const GAP = spacing.sm;

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  editions: MagazineEdition[];
  loading: boolean;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function MagazineShelf({ editions, loading }: Props) {
  const { width: screenW } = useWindowDimensions();

  // Calculate card width: screen width minus padding and gaps, divided by columns
  const totalGap = GAP * (COLUMNS - 1);
  const cardWidth = Math.floor((screenW - H_PADDING * 2 - totalGap) / COLUMNS);

  const renderItem = useCallback(
    ({ item }: { item: MagazineEdition }) => (
      <MagazineCard edition={item} width={cardWidth} />
    ),
    [cardWidth]
  );

  const keyExtractor = useCallback(
    (item: MagazineEdition) => item.id,
    []
  );

  if (loading && editions.length === 0) {
    return <ShelfSkeleton cardWidth={cardWidth} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={editions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={COLUMNS}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

function ShelfSkeleton({ cardWidth }: { cardWidth: number }) {
  const cardHeight = cardWidth * 1.5;

  return (
    <View style={styles.container}>
      <View style={styles.listContent}>
        {Array.from({ length: 6 }).map((_, rowIdx) => (
          <View key={`skel-row-${rowIdx}`} style={styles.columnWrapper}>
            {Array.from({ length: 3 }).map((_, colIdx) => (
              <View
                key={`skel-${rowIdx}-${colIdx}`}
                style={{ width: cardWidth, marginBottom: 12 }}
              >
                <Skeleton
                  width={cardWidth}
                  height={cardHeight}
                  borderRadius={radius.sm}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: 8,
    paddingBottom: 24,
  },
  columnWrapper: {
    gap: GAP,
  },
});