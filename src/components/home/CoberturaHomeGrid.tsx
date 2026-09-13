/**
 * CoberturaHomeGrid — Grid 3×2 de vídeos do carrossel "cobertura-em-eventos".
 *
 * Exibe até 6 vídeos do carrossel criado no plugin.
 * Cada card mostra thumbnail.
 * Press → toca o vídeo inline no app.
 */
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";

import { NativeVideo } from "@/src/components/common/NativeVideo";
import { radius, spacing } from "@/src/constants/designTokens";
import { useZimnyPlayVideos } from "@/src/hooks/useZimnyPlay";
import { useTranslation } from "@/src/i18n";
import { SectionTitle } from "./SectionTitle";

// ─── Constants ─────────────────────────────────────────────────────────────

const COLUMNS = 3;
const H_PADDING = spacing.lg;
const GAP = spacing.sm;
const CAROUSEL_SLUG = "cobertura-em-eventos";

// ─── Component ──────────────────────────────────────────────────────────────

export function CoberturaHomeGrid() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const { videos, loading } = useZimnyPlayVideos({ carousel: CAROUSEL_SLUG, limit: 6 });

  const totalGap = GAP * (COLUMNS - 1);
  const cardWidth = Math.floor((screenW - H_PADDING * 2 - totalGap) / COLUMNS);
  const cardHeight = Math.floor(cardWidth * 1.777); // 9:16 (vertical/reels)

  if (loading && videos.length === 0) return null;
  if (videos.length === 0) return null;

  const items = videos.slice(0, 6);

  // Group items into explicit rows to prevent flexWrap issues
  const rows: React.ReactNode[] = [];
  for (let i = 0; i < items.length; i += COLUMNS) {
    const rowItems = items.slice(i, i + COLUMNS);
    rows.push(
      <View key={`row-${i}`} style={styles.row}>
        {rowItems.map((video) => (
          <CoberturaCard
            key={video.id}
            cobertura={video}
            width={cardWidth}
            height={cardHeight}
            onPress={() => video.video_url ? setActiveVideo(video.video_url) : null}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <SectionTitle title={t("home.coberturas")} sectionKey="cobertura" />
      <View style={styles.grid}>
        {rows}
      </View>
      <View style={styles.bottomAction}>
        <Pressable
          onPress={() => router.push("/(drawer)/(tabs)/cobertura-eventos" as any)}
          style={styles.actionPill}
        >
          <Text style={styles.actionText}>{t("common.ver_mais")}</Text>
          <Text style={styles.actionArrow}>›</Text>
        </Pressable>
      </View>

      {/* Video player modal */}
      <Modal visible={!!activeVideo} transparent animationType="fade" onRequestClose={() => setActiveVideo(null)}>
        <View style={styles.videoBackdrop}>
          <Pressable style={styles.videoClose} onPress={() => setActiveVideo(null)}>
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

// ─── Card ───────────────────────────────────────────────────────────────────

function CoberturaCard({
  cobertura,
  width,
  height,
  onPress,
}: {
  cobertura: { id: string; title: string; thumbnail_url: string };
  width: number;
  height: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pressable, { width }]}
    >
      <View style={[styles.card, { width, height }]}>
        <Image
          source={{ uri: cobertura.thumbnail_url }}
          style={{ width, height }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={180}
        />
      </View>
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
    borderRadius: radius.sm,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
    position: "relative",
  },
  videoBackdrop: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  videoClose: {
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
    backgroundColor: "#D4508C",
    // Cor fixa de cobertura — não usar a cor do SectionTitle, que é dinâmica
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