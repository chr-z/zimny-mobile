/**
 * VideoCarouselSection — Carrossel horizontal de vídeos 9:16 para a Home.
 *
 * Segue o mesmo padrão visual dos demais carrosséis da Home:
 * - Título uppercase com letterSpacing
 * - FlatList horizontal com snap
 * - Cards com thumbnail + play overlay
 * - Ao tocar, abre o vídeo no player nativo
 */
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { AnimatedExpoImage } from "@/src/components/common/AnimatedExpoImage";
import { radius } from "@/src/constants/designTokens";
import { fetchZimnyPlayVideos, type ZimnyPlayVideo } from "@/src/services/zimnyPlay";
import { getSafeHttpsUrl } from "@/src/utils/security";

// ─── Constants ─────────────────────────────────────────────────────────────

const CARD_W = 130;
const CARD_H = 231; // 9:16 ratio (130 * 16/9 ≈ 231)
const CARD_GAP = 12;
const LIFT_SPRING = { damping: 18, stiffness: 300, mass: 0.7 } as const;

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  /** Slug do carrossel (ex: "entrevistas") */
  carouselSlug: string;
  /** Título de exibição da seção (vem do layout) */
  title: string;
};

// ─── Component ─────────────────────────────────────────────────────────────

export function VideoCarouselSection({ carouselSlug, title }: Props) {
  const [videos, setVideos] = useState<ZimnyPlayVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchZimnyPlayVideos({
        carousel: carouselSlug,
        limit: 20,
      });
      setVideos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar vídeos");
    } finally {
      setLoading(false);
    }
  }, [carouselSlug]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  if (loading && videos.length === 0) {
    return <VideoCarouselSkeleton title={title} />;
  }

  if (error || videos.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <FlatList
        horizontal
        data={videos}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        decelerationRate="fast"
        snapToInterval={CARD_W + CARD_GAP}
        snapToAlignment="start"
        renderItem={({ item }) => <VideoCard video={item} />}
      />
    </View>
  );
}

// ─── Video Card ────────────────────────────────────────────────────────────

function VideoCard({ video }: { video: ZimnyPlayVideo }) {
  const pressed = useSharedValue(false);

  const liftStyle = useAnimatedStyle(() => {
    const p = pressed.value;
    return {
      transform: [{ scale: withSpring(p ? 1.045 : 1, LIFT_SPRING) }],
      shadowOpacity: withSpring(p ? 0.42 : 0.22, LIFT_SPRING),
      shadowRadius: withSpring(p ? 26 : 14, LIFT_SPRING),
      elevation: withSpring(p ? 20 : 10, LIFT_SPRING),
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
        console.warn("[ZimnyPlay] Failed to open video:", e);
      }
    }
  }, [video.video_url]);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={styles.pressable}
    >
      <Animated.View style={[styles.shadowWrap, { width: CARD_W, height: CARD_H }, liftStyle]}>
        <View style={[styles.thumbClip, { width: CARD_W, height: CARD_H }]}>
          {video.thumbnail_url ? (
            <AnimatedExpoImage
              source={{ uri: video.thumbnail_url }}
              style={styles.thumbImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={280}
            />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <Text style={styles.placeholderIcon}>🎬</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

function VideoCarouselSkeleton({ title }: { title: string }) {
  return (
    <View style={styles.section}>
      <View style={styles.listContent}>
        <View style={styles.skeletonRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.skeletonCard]}>
              <View style={[styles.thumbClip, { width: CARD_W, height: CARD_H, backgroundColor: '#2C2C2E' }]} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
  },
  listContent: {
    paddingHorizontal: 16,
  },
  pressable: {
    width: CARD_W,
    marginRight: CARD_GAP,
  },
  shadowWrap: {
    borderRadius: radius.sm,
    backgroundColor: "#1C1C1E",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 10,
    overflow: "visible",
  },
  thumbClip: {
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2C2C2E",
  },
  placeholderIcon: {
    fontSize: 32,
  },
  skeletonRow: {
    flexDirection: "row",
  },
  skeletonCard: {
    width: CARD_W,
    marginRight: CARD_GAP,
  },
});
