/**
 * EventMasonryGrid — Grid masonry 3 colunas sem lacunas.
 *
 * - Vídeos: autoplay muted + loop
 * - Tap → MediaViewer em tela cheia (vídeo começa do 0 com áudio)
 * - Fotos: tap → MediaViewer
 */
import { Image } from "expo-image";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { NativeVideo } from "@/src/components/common/NativeVideo";
import { MediaViewer } from "@/src/components/common/MediaViewer";
import { radius, spacing, spring } from "@/src/constants/designTokens";
import type { EventMediaItem } from "@/src/services/zimnyEvents";

// ─── Constants ─────────────────────────────────────────────────────────────

const COLUMNS = 3;
const H_PADDING = spacing.lg;
const GAP = spacing.xs;

type PositionedItem = {
  item: EventMediaItem;
  x: number;
  y: number;
  width: number;
  height: number;
};

// ─── Masonry Layout ────────────────────────────────────────────────────────

function computeMasonryLayout(
  items: EventMediaItem[],
  cardWidth: number,
  gap: number
): PositionedItem[] {
  const colHeights = [0, 0, 0];
  const positioned: PositionedItem[] = [];

  for (const item of items) {
    const aspectRatio =
      item.width > 0 && item.height > 0
        ? item.width / item.height
        : item.orientation === "portrait"
          ? 9 / 16
          : item.orientation === "square"
            ? 1
            : 16 / 9;

    const colSpan = aspectRatio > 1.3 ? 2 : 1;
    const width = colSpan === 2 ? cardWidth * 2 + gap : cardWidth;
    const height = Math.floor(width / aspectRatio);

    let bestCol = 0;
    let bestHeight = Infinity;

    if (colSpan === 2) {
      const h01 = Math.max(colHeights[0], colHeights[1]);
      const h12 = Math.max(colHeights[1], colHeights[2]);

      if (h01 <= h12) {
        bestCol = 0;
        bestHeight = h01;
        colHeights[0] = bestHeight + height + gap;
        colHeights[1] = bestHeight + height + gap;
      } else {
        bestCol = 1;
        bestHeight = h12;
        colHeights[1] = bestHeight + height + gap;
        colHeights[2] = bestHeight + height + gap;
      }
    } else {
      for (let c = 0; c < COLUMNS; c++) {
        if (colHeights[c] < bestHeight) {
          bestHeight = colHeights[c];
          bestCol = c;
        }
      }
      colHeights[bestCol] = bestHeight + height + gap;
    }

    positioned.push({ item, x: bestCol * (cardWidth + gap), y: bestHeight, width, height });
  }

  return positioned;
}

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  media: EventMediaItem[];
  excludeFeatured?: boolean;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function EventMasonryGrid({ media, excludeFeatured = true }: Props) {
  const { width: screenW } = useWindowDimensions();
  const [viewerMedia, setViewerMedia] = useState<EventMediaItem | null>(null);

  const totalGap = GAP * (COLUMNS - 1);
  const cardWidth = Math.floor((screenW - H_PADDING * 2 - totalGap) / COLUMNS);

  const gridItems = useMemo(() => {
    const items = excludeFeatured ? media.filter((m) => !m.is_featured) : media;
    return computeMasonryLayout(items, cardWidth, GAP);
  }, [media, cardWidth, excludeFeatured]);

  const gridHeight = useMemo(() => {
    if (gridItems.length === 0) return 0;
    return Math.max(...gridItems.map((p) => p.y + p.height)) + 24;
  }, [gridItems]);

  const handleOpenViewer = useCallback((item: EventMediaItem) => {
    setViewerMedia(item);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setViewerMedia(null);
  }, []);

  return (
    <>
      <View style={[styles.container, { height: gridHeight }]}>
        {gridItems.map((pos) => (
          <MasonryItem
            key={pos.item.id}
            item={pos.item}
            x={pos.x}
            y={pos.y}
            width={pos.width}
            height={pos.height}
            onPress={handleOpenViewer}
          />
        ))}
      </View>

      <MediaViewer
        visible={viewerMedia !== null}
        media={viewerMedia}
        onClose={handleCloseViewer}
      />
    </>
  );
}

// ─── Masonry Item ──────────────────────────────────────────────────────────

type MasonryItemProps = {
  item: EventMediaItem;
  x: number;
  y: number;
  width: number;
  height: number;
  onPress: (item: EventMediaItem) => void;
};

function MasonryItem({ item, x, y, width, height, onPress }: MasonryItemProps) {
  const pressed = useSharedValue(false);
  const isVideo = item.type === "video";

  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? 0.97 : 1, spring.snappy) }],
  }));

  const handlePressIn = useCallback(() => { pressed.value = true; }, [pressed]);
  const handlePressOut = useCallback(() => { pressed.value = false; }, [pressed]);

  return (
    <Pressable
      onPress={() => onPress(item)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.itemPressable, { left: x, top: y, width, height }]}
    >
      <Animated.View style={[styles.itemCard, liftStyle]}>
        {isVideo ? (
          <NativeVideo
            key={item.id}
            source={{ uri: item.url }}
            style={{ width, height }}
            contentFit="cover"
            autoPlay
            loop
            muted
            nativeControls={false}
          />
        ) : (
          <Image
            source={{ uri: item.url }}
            style={{ width, height }}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={180}
          />
        )}

        {/* Minimal video indicator */}
        {isVideo && (
          <View style={styles.videoIndicator}>
            <View style={styles.playIcon} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "relative",
    paddingHorizontal: H_PADDING,
  },
  itemPressable: {
    position: "absolute",
  },
  itemCard: {
    flex: 1,
    borderRadius: radius.sm,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
  },
  videoIndicator: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: "#FFFFFF",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    marginLeft: 2,
  },
});