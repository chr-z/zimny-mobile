/**
 * PodcastGrid — Grid de episódios em 2 colunas.
 *
 * Layout mais elegante: cards maiores com título abaixo da thumbnail.
 */
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { useCallback } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import { font, radius, spacing, spring } from "@/src/constants/designTokens";
import type { ZimnyPlayVideo } from "@/src/services/zimnyPlay";
import { getSafeHttpsUrl } from "@/src/utils/security";

// ─── Constants ─────────────────────────────────────────────────────────────

const COLUMNS = 2;
const H_PADDING = spacing.lg;
const GAP = spacing.md;

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  videos: ZimnyPlayVideo[];
  loading?: boolean;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function PodcastGrid({ videos }: Props) {
  const { width: screenW } = useWindowDimensions();
  const totalGap = GAP * (COLUMNS - 1);
  const cardWidth = Math.floor((screenW - H_PADDING * 2 - totalGap) / COLUMNS);
  const cardHeight = Math.floor(cardWidth * 0.5625); // 16:9

  const renderItem = useCallback(
    ({ item }: { item: ZimnyPlayVideo }) => (
      <PodcastGridCard video={item} width={cardWidth} height={cardHeight} />
    ),
    [cardWidth, cardHeight]
  );

  const keyExtractor = useCallback((item: ZimnyPlayVideo) => item.id, []);

  return (
    <FlatList
      data={videos}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      numColumns={COLUMNS}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.columnWrapper}
      scrollEnabled={false}
      ListHeaderComponent={
        <View style={styles.sectionHeader}>
          <View style={styles.headerLine} />
          <Text style={styles.sectionTitle}>EPISÓDIOS</Text>
          <View style={styles.headerLine} />
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhum episódio encontrado</Text>
        </View>
      }
    />
  );
}

// ─── Grid Card ─────────────────────────────────────────────────────────────

function PodcastGridCard({
  video,
  width,
  height,
}: {
  video: ZimnyPlayVideo;
  width: number;
  height: number;
}) {
  const pressed = useSharedValue(false);

  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? 0.96 : 1, spring.snappy) }],
  }));

  const handlePressIn = useCallback(() => { pressed.value = true; }, [pressed]);
  const handlePressOut = useCallback(() => { pressed.value = false; }, [pressed]);
  const handlePress = useCallback(async () => {
    const safeUrl = getSafeHttpsUrl(video.video_url);
    if (safeUrl) {
      try {
        await WebBrowser.openBrowserAsync(safeUrl);
      } catch (e) {
        console.warn("[Podcast] Failed to open video:", e);
      }
    }
  }, [video.video_url]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.pressable, { width }]}
    >
      <Animated.View style={[styles.card, liftStyle]}>
        {/* Thumbnail */}
        <View style={{ width, height }}>
          <Image
            source={{ uri: video.thumbnail_url }}
            style={{ width, height }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
          <View style={styles.playOverlay}>
            <View style={styles.tinyPlayIcon} />
          </View>
        </View>

        {/* Title below thumbnail */}
        <View style={styles.cardFooter}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {video.title}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 32,
  },
  columnWrapper: {
    gap: GAP,
    marginBottom: GAP,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  headerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  sectionTitle: {
    fontFamily: font.serif,
    fontSize: font.size.kicker,
    letterSpacing: 3,
    color: "rgba(255,255,255,0.5)",
    marginHorizontal: spacing.md,
  },
  pressable: {
    marginBottom: 0,
  },
  card: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  tinyPlayIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: "rgba(255,255,255,0.85)",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    marginLeft: 3,
  },
  cardFooter: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  cardTitle: {
    fontSize: 12,
    fontFamily: font.serif,
    color: "#E5E5E5",
    lineHeight: 16,
    letterSpacing: 0.2,
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
