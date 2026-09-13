import { GlassView } from "@/src/components/common/GlassView";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";

import { AnimatedExpoImage } from "@/src/components/common/AnimatedExpoImage";
import { useParallaxTilt } from "@/src/hooks/useParallaxTilt";
import {
  getFeaturedImageUrl,
  postTitlePlain,
  type WPPost,
} from "@/src/services/api";

const GAP    = 8;
const CELL_H = 185;
const RADIUS = 20;
const PARALLAX_SCALE = 1.1;

type HomeBentoGridProps = { posts: WPPost[] };

export function HomeBentoGrid({ posts }: HomeBentoGridProps) {
  // Single tilt subscription for all cells
  const { tiltX, tiltY } = useParallaxTilt();

  if (posts.length === 0) return null;

  return (
    <View style={styles.section}>
      {[posts.slice(0, 2), posts.slice(2, 4)].map((row, ri) =>
        row.length > 0 ? (
          <View key={ri} style={[styles.row, ri > 0 && styles.rowSpaced]}>
            {row.map((post) => (
              <HomeBentoCell key={post.id} post={post} tiltX={tiltX} tiltY={tiltY} />
            ))}
          </View>
        ) : null
      )}
    </View>
  );
}

function HomeBentoCell({
  post,
  tiltX,
  tiltY,
}: {
  post: WPPost;
  tiltX: SharedValue<number>;
  tiltY: SharedValue<number>;
}) {
  const router = useRouter();
  const uri    = getFeaturedImageUrl(post);
  const title  = postTitlePlain(post);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tiltX.value * 0.7 },
      { translateY: tiltY.value * 0.7 },
      { scale: PARALLAX_SCALE },
    ],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      style={styles.cell}
      onPress={() =>
        router.push({ pathname: "/post/[id]", params: { id: String(post.id) } })
      }
    >
      <View style={styles.cellInner}>
        {uri ? (
          <AnimatedExpoImage
            source={{ uri }}
            style={[styles.cellImage, imageStyle]}
            contentFit="cover"
            transition={200}
            sharedTransitionTag={`post-image-${post.id}`}
          />
        ) : (
          <View style={[styles.cellImage, styles.ph]} />
        )}

        <View style={styles.glassWrap}>
          <GlassView intensity={52} tint="dark" style={styles.glassBlur}>
            <Text style={styles.cellTitle} numberOfLines={3}>
              {title}
            </Text>
          </GlassView>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: GAP,
    paddingTop: GAP,
    paddingBottom: 2,
  },
  row: {
    flexDirection: "row",
    gap: GAP,
  },
  rowSpaced: {
    marginTop: GAP,
  },
  cell: {
    flex: 1,
    minWidth: 0,
    borderRadius: RADIUS,
  },
  cellInner: {
    height: CELL_H,
    backgroundColor: "#D0D0D2",
    borderRadius: RADIUS,
    overflow: "hidden",
  },
  cellImage: {
    ...StyleSheet.absoluteFill,
  },
  ph: {
    backgroundColor: "#D0D0D2",
  },
  glassWrap: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    borderRadius: RADIUS - 4,
    overflow: "hidden",
  },
  glassBlur: {
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  cellTitle: {
    fontFamily: "Georgia",
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
    color: "#FFFFFF",
  },
});
