import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useCategoryPosts } from "@/src/hooks/useCategoryPosts";
import { getFeaturedImageUrl, postTitlePlain, type WPPost } from "@/src/services/api";

const CARD_W   = 210;
const CARD_H   = 140;
const CARD_GAP = 12;
const RADIUS   = 20;

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonPulse({ style }: { style?: object }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return <Animated.View style={[styles.skeletonBase, style, { opacity }]} />;
}

function SliderSkeleton() {
  return (
    <ScrollView
      horizontal
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    >
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[styles.card, { marginRight: CARD_GAP }]}>
          <SkeletonPulse style={styles.skeletonCard} />
          <SkeletonPulse style={styles.skeletonLine1} />
          <SkeletonPulse style={styles.skeletonLine2} />
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function CategoryCard({ post }: { post: WPPost }) {
  const router = useRouter();
  const uri    = getFeaturedImageUrl(post);
  const title  = postTitlePlain(post);

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      style={styles.card}
      onPress={() =>
        router.push({ pathname: "/post/[id]", params: { id: String(post.id) } })
      }
    >
      {/* Image fill */}
      <View style={styles.cardImageWrap}>
        {uri ? (
          <Image
            source={{ uri }}
            style={styles.cardImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.cardImage, styles.cardPh]} />
        )}

        {/* Glass title bubble inside image */}
        <View style={styles.cardGlassWrap}>
          <BlurView intensity={52} tint="dark" style={styles.cardGlassBlur}>
            <Text style={styles.cardTitle} numberOfLines={3}>
              {title}
            </Text>
          </BlurView>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

type CategorySectionSliderProps = {
  title: string;
  categoryId: number;
};

export function CategorySectionSlider({
  title,
  categoryId,
}: CategorySectionSliderProps) {
  const { posts, loading } = useCategoryPosts(categoryId, 10);

  return (
    <View style={styles.section}>
      {loading ? (
        <SliderSkeleton />
      ) : posts.length === 0 ? null : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          decelerationRate="fast"
          snapToInterval={CARD_W + CARD_GAP}
          snapToAlignment="start"
        >
          {posts.map((post) => (
            <CategoryCard key={post.id} post={post} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
  },
  listContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  card: {
    width: CARD_W,
    marginRight: CARD_GAP,
  },
  cardImageWrap: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: RADIUS,
    overflow: "hidden",
    backgroundColor: "#D0D0D2",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardPh: {
    backgroundColor: "#D0D0D2",
  },
  cardGlassWrap: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    borderRadius: RADIUS - 6,
    overflow: "hidden",
  },
  cardGlassBlur: {
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  cardTitle: {
    fontFamily: "Georgia",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
    color: "#FFFFFF",
  },
  // Skeleton
  skeletonBase: {
    backgroundColor: "#DCDCDF",
    borderRadius: RADIUS,
  },
  skeletonCard: {
    width: CARD_W,
    height: CARD_H,
  },
  skeletonLine1: {
    marginTop: 10,
    height: 13,
    borderRadius: 6,
    width: "88%",
  },
  skeletonLine2: {
    marginTop: 6,
    height: 13,
    borderRadius: 6,
    width: "60%",
  },
});
