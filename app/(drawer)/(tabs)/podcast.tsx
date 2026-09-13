/**
 * Podcast — Tela de podcast on-demand com feed do YouTube.
 *
 * Busca os vídeos da playlist do YouTube configurada no WordPress
 * (mesma playlist da Zimny TV 24/7).
 *
 * Layout:
 * 1. Hero card com último episódio em destaque (16:9) — minimalista
 * 2. Grid 2 colunas com todos os episódios restantes (ordenados por data)
 *
 * Dados: useYoutubePlaylist() → YouTube Playlist API
 */
import { useTranslation } from "@/src/i18n";
import { DrawerActions } from "expo-router/build/react-navigation/routers";
import { useNavigation } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState } from "@/src/components/common/ErrorState";
import { Skeleton } from "@/src/components/common/LoadingSkeleton";
import { CompactHeader } from "@/src/components/home/CompactHeader";
import { HEADER_COMPACT_H } from "@/src/components/home/SmartHeader";
import {
  PodcastGrid,
  PodcastHeroCard,
  PodcastSponsorBanner,
} from "@/src/components/podcast";
import { useYoutubePlaylist } from "@/src/hooks/useYoutubePlaylist";
import type { ZimnyPlayVideo } from "@/src/services/zimnyPlay";

// ─── Adapter: YouTube → ZimnyPlayVideo ─────────────────────────────────────

function toZimnyPlayVideo(yt: {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  video_url?: string;
  publishedAt?: string;
}): ZimnyPlayVideo {
  return {
    id: yt.id,
    title: yt.title,
    video_url: yt.video_url || `https://www.youtube.com/watch?v=${yt.videoId}`,
    thumbnail_url: yt.thumbnail,
    carousels: [],
    order: 0,
    created_at: yt.publishedAt ?? "",
  };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PodcastScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { videos, loading, error, refresh } = useYoutubePlaylist(50);
  const [refreshing, setRefreshing] = useState(false);

  const openDrawer = () => {
    navigation.getParent()?.dispatch(DrawerActions.openDrawer());
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Convert YouTube data to the format expected by components
  const podcastVideos = useMemo(
    () => videos.map(toZimnyPlayVideo),
    [videos]
  );

  // Latest video = hero; rest goes to the grid
  const heroVideo = podcastVideos[0] ?? null;
  const gridVideos = podcastVideos.slice(1);

  const headerPadding = { paddingTop: insets.top + HEADER_COMPACT_H };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading && videos.length === 0) {
    return (
      <View style={styles.shell}>
        <CompactHeader onOpenDrawer={openDrawer} insetTop={insets.top} />
        <View style={[styles.inner, headerPadding]}>
          <Skeleton width="100%" height={200} borderRadius={12} />
          <View style={{ height: 16 }} />
          <Skeleton width="100%" height={120} borderRadius={12} />
        </View>
      </View>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error && videos.length === 0) {
    return (
      <View style={styles.shell}>
        <CompactHeader onOpenDrawer={openDrawer} insetTop={insets.top} />
        <View style={[styles.inner, headerPadding]}>
          <ErrorState
            title={t("podcast.indisponivel_titulo")}
            message={t("podcast.indisponivel_msg")}
          />
        </View>
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.shell}>
      <CompactHeader onOpenDrawer={openDrawer} insetTop={insets.top} />
      <View style={[styles.inner, headerPadding]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
              colors={["#FFFFFF"]}
            />
          }
        >
          {/* Hero — latest episode */}
          {heroVideo && <PodcastHeroCard video={heroVideo} />}

          {/* Sponsor Banner — Anuncie sua marca no Podcast */}
          <PodcastSponsorBanner />

          {/* Grid of all remaining episodes */}
          <PodcastGrid videos={gridVideos} />
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  inner: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 32,
  },
});