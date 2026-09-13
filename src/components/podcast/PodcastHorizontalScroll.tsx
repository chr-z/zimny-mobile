/**
 * PodcastHorizontalScroll — Carrossel horizontal de episódios (16:9).
 *
 * Cards com proporção 16:9, thumbnail + overlay de play + título.
 */
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import { font, radius, spacing, spring } from "@/src/constants/designTokens";
import type { ZimnyPlayVideo } from "@/src/services/zimnyPlay";
import { getSafeHttpsUrl } from "@/src/utils/security";

// ─── Constants ─────────────────────────────────────────────────────────────

const CARD_W = 200;
const CARD_H = Math.floor(CARD_W * 0.5625); // 16:9
const CARD_GAP = 12;

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  title: string;
  videos: ZimnyPlayVideo[];
};

// ─── Component ──────────────────────────────────────────────────────────────

export function PodcastHorizontalScroll({ title, videos }: Props) {
  if (videos.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      <FlatList
        horizontal
        data={videos}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        decelerationRate="fast"
        snapToInterval={CARD_W + CARD_GAP}
        snapToAlignment="start"
        renderItem={({ item }) => <PodcastHorizontalCard video={item} />}
      />
    </View>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────

function PodcastHorizontalCard({ video }: { video: ZimnyPlayVideo }) {
  const pressed = useSharedValue(false);

  const liftStyle = useAnimatedStyle(() => {
    const p = pressed.value;
    return {
      transform: [{ scale: withSpring(p ? 0.95 : 1, spring.snappy) }],
    };
  });

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
      style={styles.pressable}
    >
      <Animated.View style={[styles.card, liftStyle]}>
        {/* Thumbnail */}
        <Image
          source={{ uri: video.thumbnail_url }}
          style={styles.thumbnail}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />

        {/* Play overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.smallPlayIcon} />
        </View>

        {/* Bottom info */}
        <View style={styles.cardInfo}>
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: font.size.caption,
    letterSpacing: 3,
    color: "#FFFFFF",
    marginBottom: spacing.md,
    paddingLeft: spacing.lg,
    fontWeight: "600",
  },
  listContent: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
  },
  pressable: {
    width: CARD_W,
    marginRight: CARD_GAP,
  },
  card: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  thumbnail: {
    width: CARD_W,
    height: CARD_H,
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  smallPlayIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: "rgba(255,255,255,0.9)",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    marginLeft: 3,
  },
  cardInfo: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  cardTitle: {
    fontSize: font.size.small,
    fontFamily: font.serif,
    color: "#FFFFFF",
    letterSpacing: 0.3,
    lineHeight: 18,
  },
});
