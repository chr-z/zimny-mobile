/**
 * EventCoberturaGrid — Grid 3 colunas para vídeos de cobertura.
 *
 * Exibe vídeos marcados como "Cobertura" (is_cobertura) em um grid
 * 3xN dinâmico com thumbs no formato 16:9 e indicador de play.
 *
 * Usado dentro de EventGalleryScreen para separar o conteúdo
 * de "Produção" (fotos) do conteúdo de "Cobertura" (vídeos selecionados).
 */
import { Image } from "expo-image";
import { useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { radius, spacing } from "@/src/constants/designTokens";
import type { EventMediaItem } from "@/src/services/zimnyEvents";

// ─── Constants ─────────────────────────────────────────────────────────────

const COLUMNS = 3;
const H_PADDING = spacing.lg;
const GAP = spacing.sm;

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  media: EventMediaItem[];
  onItemPress?: (item: EventMediaItem) => void;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function EventCoberturaGrid({ media, onItemPress }: Props) {
  const { width: screenW } = useWindowDimensions();

  const totalGap = GAP * (COLUMNS - 1);
  const cardWidth = Math.floor((screenW - H_PADDING * 2 - totalGap) / COLUMNS);
  const cardHeight = Math.floor(cardWidth * 0.5625); // 16:9

  // Group items into explicit rows to prevent flexWrap issues
  const rows: React.ReactNode[] = [];
  for (let i = 0; i < media.length; i += COLUMNS) {
    const rowItems = media.slice(i, i + COLUMNS);
    rows.push(
      <View key={`row-${i}`} style={styles.row}>
        {rowItems.map((item) => (
          <CoberturaGridItem
            key={item.id}
            item={item}
            width={cardWidth}
            height={cardHeight}
            onPress={onItemPress}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {rows}
    </View>
  );
}

// ─── Grid Item ──────────────────────────────────────────────────────────────

type ItemProps = {
  item: EventMediaItem;
  width: number;
  height: number;
  onPress?: (item: EventMediaItem) => void;
};

function CoberturaGridItem({ item, width, height, onPress }: ItemProps) {
  const handlePress = useCallback(() => {
    onPress?.(item);
  }, [item, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.itemPressable, { width }]}
    >
      <View style={[styles.itemCard, { width, height }]}>
        <Image
          source={{ uri: item.url }}
          style={{ width, height }}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={180}
        />

        {/* Play icon overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playIcon} />
        </View>

        {/* Title overlay at bottom */}
        <View style={styles.titleOverlay}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  grid: {
    gap: GAP,
    paddingHorizontal: H_PADDING,
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: GAP,
  },
  itemPressable: {
    marginBottom: 0,
  },
  itemCard: {
    borderRadius: radius.sm,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
    position: "relative",
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.20)",
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderTopWidth: 9,
    borderBottomWidth: 9,
    borderLeftColor: "#FFFFFF",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  titleOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  itemTitle: {
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "Georgia",
    letterSpacing: 0.3,
    lineHeight: 12,
  },
});