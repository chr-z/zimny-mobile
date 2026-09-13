/**
 * HomeFeaturedVideosSection — Carrossel horizontal de vídeos em destaque na Home.
 *
 * Exibe os vídeos selecionados manualmente no painel admin (Vídeos em Destaque da Home).
 * Segue o mesmo padrão visual do VideoCarouselSection.
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
import { fetchHomeFeaturedVideos, type HomeFeaturedVideo } from "@/src/services/zimnyPlay";
import { getSafeHttpsUrl } from "@/src/utils/security";

// ─── Constants ─────────────────────────────────────────────────────────────

const CARD_W = 130;
const CARD_H = 231; // 9:16 ratio (130 * 16/9 ≈ 231)
const CARD_GAP = 12;
const LIFT_SPRING = { damping: 18, stiffness: 300, mass: 0.7 } as const;

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  /** Título de exibição da seção (vem do layout) */
  title: string;
};

// ─── Component ─────────────────────────────────────────────────────────────

export function HomeFeaturedVideosSection({ title }: Props) {
  const [videos, setVideos] = useState<HomeFeaturedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVideos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchHomeFeaturedVideos();
      setVideos(data);
    } catch (e) {
      console.warn("[HomeFeaturedVideos] Failed to load:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  if (loading && videos.length === 0) {
    return <FeaturedVideosSkeleton title={title} />;
  }

  if (videos.length === 0) {
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
        renderItem={({ item }) => <FeaturedVideoCard video={item} />}
      />
    </View>
  );
}

// ─── Video Card ────────────────────────────────────────────────────────────

function FeaturedVideoCard({ video }: { video: HomeFeaturedVideo }) {
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
        console.warn("[HomeFeaturedVideos] Failed to open video:", e);
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

function FeaturedVideosSkeleton({ title }: { title: string }) {
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2C2C2E",
  },
  placeholderIcon: {
    fontSize: 28,
  },
  skeletonRow: {
    flexDirection: "row",
    gap: CARD_GAP,
  },
  skeletonCard: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
});
