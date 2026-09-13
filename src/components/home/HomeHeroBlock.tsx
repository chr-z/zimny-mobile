import { GlassView } from "@/src/components/common/GlassView";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAnimatedStyle } from "react-native-reanimated";

import { AnimatedExpoImage } from "@/src/components/common/AnimatedExpoImage";
import { spacing } from "@/src/constants/designTokens";
import { useParallaxTilt } from "@/src/hooks/useParallaxTilt";
import { useTranslation } from "@/src/i18n";
import {
  getFeaturedImageUrl,
  postTitlePlain,
  type WPPost,
} from "@/src/services/api";

const HERO_H = 420;
const PARALLAX_SCALE = 1.08;

type HomeHeroBlockProps = { post: WPPost };

export function HomeHeroBlock({ post }: HomeHeroBlockProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const uri    = getFeaturedImageUrl(post);
  const title  = postTitlePlain(post);
  const { tiltX, tiltY } = useParallaxTilt();

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tiltX.value },
      { translateY: tiltY.value },
      { scale: PARALLAX_SCALE },
    ],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() =>
        router.push({ pathname: "/post/[id]", params: { id: String(post.id) } })
      }
    >
      <View style={styles.wrap}>
        {uri ? (
          <AnimatedExpoImage
            source={{ uri }}
            style={[styles.image, imageStyle]}
            contentFit="cover"
            transition={220}
            sharedTransitionTag={`post-image-${post.id}`}
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}

        <View style={styles.glassStrip}>
          <GlassView intensity={80} tint="dark" style={styles.blurInner}>
            <Text style={styles.kicker}>{t("home.hero_capa")}</Text>
            <Text style={styles.title} numberOfLines={3}>{title}</Text>
          </GlassView>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    height: HERO_H,
    backgroundColor: "#D0D0D2",
    overflow: "hidden",
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  placeholder: {
    backgroundColor: "#D0D0D2",
  },
  glassStrip: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  blurInner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  kicker: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 4,
    color: "rgba(255,255,255,0.6)",
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: "Georgia",
    fontSize: 24,
    lineHeight: 31,
    letterSpacing: 0.4,
    color: "#FFFFFF",
  },
});
