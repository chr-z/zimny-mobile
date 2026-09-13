/**
 * PodcastHomeGrid — Grid 2×2 de podcasts na Home.
 *
 * Exibe os 4 episódios mais recentes do podcast (YouTube) em um grid 2×2,
 * do mais novo ao mais antigo. Cada card mostra thumbnail (16:9) + título.
 * Press → abre o vídeo no navegador.
 *
 * Inclui SectionTitle com "VER MAIS" → navega para a tela de podcast.
 *
 * Dados: useYoutubePlaylist() → mesma playlist do YouTube usada na tela de podcast.
 */
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { radius, spacing, spring } from "@/src/constants/designTokens";
import { useYoutubePlaylist } from "@/src/hooks/useYoutubePlaylist";
import { useTranslation } from "@/src/i18n";
import type { YouTubePlaylistItem } from "@/src/services/youtubePlaylist";
import { getSafeHttpsUrl } from "@/src/utils/security";
import { Image } from "expo-image";
import { SectionTitle } from "./SectionTitle";

// ─── Constants ─────────────────────────────────────────────────────────────

const COLUMNS = 2;
const H_PADDING = spacing.lg;
const GAP = spacing.md;

// ─── Adapter: YouTube → card props ─────────────────────────────────────────

function toCardVideo(yt: YouTubePlaylistItem) {
  return {
    id: yt.id,
    title: yt.title,
    thumbnail_url: yt.thumbnail,
    video_url: `https://www.youtube.com/watch?v=${yt.videoId}`,
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

export function PodcastHomeGrid() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width: screenW } = useWindowDimensions();
  const { videos, loading } = useYoutubePlaylist(4);

  const totalGap = GAP * (COLUMNS - 1);
  const cardWidth = Math.floor((screenW - H_PADDING * 2 - totalGap) / COLUMNS);
  const cardHeight = Math.floor(cardWidth * 0.5625); // 16:9

  if (loading && videos.length === 0) return null;
  if (videos.length === 0) return null;

  const items = videos.slice(0, 4);

  // Group items into explicit rows to prevent flexWrap issues
  const rows: React.ReactNode[] = [];
  for (let i = 0; i < items.length; i += COLUMNS) {
    const rowItems = items.slice(i, i + COLUMNS);
    rows.push(
      <View key={`row-${i}`} style={styles.row}>
        {rowItems.map((video) => (
          <PodcastHomeCard
            key={video.id}
            video={toCardVideo(video)}
            width={cardWidth}
            height={cardHeight}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <SectionTitle title={t("home.podcast")} sectionKey="podcast" />
      <View style={styles.grid}>
        {rows}
      </View>
      <View style={styles.bottomAction}>
        <Pressable
          onPress={() => router.push("/(drawer)/(tabs)/podcast" as any)}
          style={styles.actionPill}
        >
          <Text style={styles.actionText}>{t("header.ver_mais")}</Text>
          <Text style={styles.actionArrow}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Card ───────────────────────────────────────────────────────────────────

function PodcastHomeCard({
  video,
  width,
  height,
}: {
  video: { id: string; title: string; thumbnail_url: string; video_url: string };
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
        console.warn("[PodcastHome] Failed to open video:", e);
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
            <View style={styles.playIcon} />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
  grid: {
    paddingHorizontal: H_PADDING,
    gap: GAP,
  },
  row: {
    flexDirection: "row",
    gap: GAP,
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
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: "rgba(255,255,255,0.85)",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  bottomAction: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderRadius: 999,
    backgroundColor: "#38D080",
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  actionText: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  actionArrow: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "300",
    marginTop: -1,
  },
});
