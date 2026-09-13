/**
 * Cobertura de Eventos — Vídeos do carrossel "cobertura-em-eventos".
 *
 * Layout:
 * - Header fixo com navegação
 * - Grid 3 colunas com thumbs
 * - Pull-to-refresh
 * - Clique → toca o vídeo inline
 *
 * Dados: API WordPress (zimny/v1/videos?carousel=cobertura-em-eventos)
 */
import { useTranslation } from "@/src/i18n";
import { DrawerActions } from "expo-router/build/react-navigation/routers";
import { Image } from "expo-image";
import { useNavigation } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NativeVideo } from "@/src/components/common/NativeVideo";
import { CompactHeader } from "@/src/components/home/CompactHeader";
import { HEADER_COMPACT_H } from "@/src/components/home/SmartHeader";
import { spacing } from "@/src/constants/designTokens";
import { useZimnyPlayVideos } from "@/src/hooks/useZimnyPlay";
import type { ZimnyPlayVideo } from "@/src/services/zimnyPlay";

// ─── Constants ──────────────────────────────────────────────────────────────

const H_PADDING = spacing.lg;
const GRID_GAP = spacing.sm;
const GRID_COLUMNS = 3;

// ─── Cobertura Card ─────────────────────────────────────────────────────────

type CoberturaCardProps = {
  thumbnail: string;
  onPress: () => void;
  width: number;
};

function CoberturaCard({ thumbnail, onPress, width }: CoberturaCardProps) {
  // 9:16 aspect ratio (vertical/reels)
  const height = Math.floor(width * 1.777);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.coberturaCard, { width }]}
    >
      <View style={[styles.coberturaThumb, { width, height }]}>
        <Image
          source={{ uri: thumbnail }}
          style={{ width, height }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={180}
        />
        {/* Play icon overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playIcon} />
        </View>
      </View>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CoberturaEventosScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const navigation = useNavigation();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const { videos, loading, error, refresh } = useZimnyPlayVideos({ carousel: "cobertura-em-eventos", limit: 50 });
  const [refreshing, setRefreshing] = useState(false);

  const openDrawer = () => {
    navigation.getParent()?.dispatch(DrawerActions.openDrawer());
  };

  // 3-column grid
  const totalGridGap = GRID_GAP * (GRID_COLUMNS - 1);
  const colWidth = Math.floor((screenW - H_PADDING * 2 - totalGridGap) / GRID_COLUMNS);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const headerPadding = { paddingTop: insets.top + HEADER_COMPACT_H };

  return (
    <View style={styles.shell}>
      <CompactHeader onOpenDrawer={openDrawer} insetTop={insets.top} />
      <View style={[styles.inner, headerPadding]}>
        {loading && videos.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : error && videos.length === 0 ? (
          <View style={styles.error}>
            <Text style={styles.errorText}>{t("cobertura.erro_carregar")}</Text>
            <Pressable onPress={refresh} style={styles.retryButton}>
              <Text style={styles.retryText}>{t("common.tentar_novamente")}</Text>
            </Pressable>
          </View>
        ) : (
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
            <View style={styles.coberturaGrid}>
              {videos.map((video: ZimnyPlayVideo) => (
                <CoberturaCard
                  key={video.id}
                  thumbnail={video.thumbnail_url}
                  width={colWidth}
                  onPress={() => video.video_url ? setActiveVideo(video.video_url) : null}
                />
              ))}
            </View>

            {videos.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>{t("cobertura.sem_videos")}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Video player modal */}
      <Modal visible={!!activeVideo} transparent animationType="fade" onRequestClose={() => setActiveVideo(null)}>
        <View style={styles.videoBackdrop}>
          <Pressable style={styles.videoCloseBtn} onPress={() => setActiveVideo(null)}>
            <Text style={styles.videoCloseText}>✕</Text>
          </Pressable>
          {activeVideo && (
            <NativeVideo
              source={{ uri: activeVideo }}
              style={{ width: screenW, height: screenH * 0.9 }}
              contentFit="contain"
              autoPlay
              loop
              nativeControls
            />
          )}
        </View>
      </Modal>
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
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  errorText: {
    color: "#8E8E93",
    fontSize: 14,
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    letterSpacing: 1.5,
  },
  scrollContent: {
    padding: H_PADDING,
    paddingBottom: spacing.xl,
  },
  coberturaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  coberturaCard: {
    marginBottom: GRID_GAP,
  },
  coberturaThumb: {
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderLeftWidth: 10,
    borderRightWidth: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftColor: "rgba(255,255,255,0.9)",
    borderRightColor: "transparent",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  videoBackdrop: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  videoCloseBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoCloseText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 13,
    color: "#8E8E93",
    letterSpacing: 1.5,
  },
});