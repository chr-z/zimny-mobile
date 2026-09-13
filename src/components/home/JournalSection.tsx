/**
 * JournalSection — Seção "LEITURAS RECOMENDADAS" com scroll horizontal
 * de cards de artigos em estilo editorial Quiet Luxury.
 *
 * Título sobreposto à imagem com gradiente, seguindo estética da home.
 */
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { AnimatedExpoImage } from "@/src/components/common/AnimatedExpoImage";
import { radius } from "@/src/constants/designTokens";
import {
  getFeaturedImageUrl,
  postTitlePlain,
  type WPPost,
} from "@/src/services/api";

const CARD_W = 260;
const CARD_H = 340;
const CARD_GAP = 12;

type JournalSectionProps = {
  posts: WPPost[];
  loading: boolean;
};

export function JournalSection({ posts, loading }: JournalSectionProps) {
  console.log(`[JournalSection] loading=${loading}, posts=${posts.length}`);
  if (loading && posts.length === 0) {
    return <JournalSkeleton />;
  }
  if (posts.length === 0) {
    console.log("[JournalSection] No posts to show");
    return null;
  }

  return (
    <View style={styles.section}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        decelerationRate="fast"
        snapToInterval={CARD_W + CARD_GAP}
        snapToAlignment="start"
      >
        {posts.map((post) => (
          <JournalCard key={post.id} post={post} />
        ))}
      </ScrollView>
    </View>
  );
}

function JournalCard({ post }: { post: WPPost }) {
  const router = useRouter();
  const uri = getFeaturedImageUrl(post);
  const title = postTitlePlain(post);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() =>
          router.push({
            pathname: "/post/[id]",
            params: { id: String(post.id) },
          })
        }
      >
        <View style={styles.cardInner}>
          {/* Imagem ocupa o card inteiro */}
          {uri ? (
            <AnimatedExpoImage
              source={{ uri }}
              style={styles.cardImage}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[styles.cardImage, styles.cardPh]} />
          )}

          {/* Gradiente escuro sobre a imagem — texto legível */}
          <View style={styles.gradientWrap}>
            <LinearGradient
              colors={["transparent", "rgba(10,10,10,0.3)", "rgba(10,10,10,0.85)"]}
              locations={[0, 0.4, 1]}
              style={styles.gradientFill}
            />
          </View>

          {/* Título na base do card */}
          <View style={styles.cardTextWrap} pointerEvents="none">
            <Text style={styles.cardTitle} numberOfLines={3}>
              {title}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function JournalSkeleton() {
  return (
    <View style={styles.section}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      >
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.card, styles.skeletonCard]}>
            <View style={[styles.cardImage, styles.skeletonImage]} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
  },
  listContent: {
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    marginRight: CARD_GAP,
    borderRadius: radius.md,
    backgroundColor: "#1C1C1E",
    overflow: "hidden",
  },
  cardInner: {
    width: "100%",
    height: "100%",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardPh: {
    backgroundColor: "#2C2C2E",
  },
  gradientWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: CARD_H * 0.6,
  },
  gradientFill: {
    flex: 1,
  },
  cardTextWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 20,
  },
  cardTitle: {
    fontFamily: "Georgia",
    fontSize: 16,
    letterSpacing: 0.5,
    color: "#FFFFFF",
    lineHeight: 22,
  },
  skeletonCard: {
    backgroundColor: "#1C1C1E",
  },
  skeletonImage: {
    backgroundColor: "#2C2C2E",
  },
});