/**
 * ColunistasCarousel â€” Carrossel horizontal "COLUNISTAS" com fotos
 * 4:5 dos colunistas da revista.
 *
 * Os dados vÃªm do plugin WordPress Zimny Colunistas (endpoint /zimny/v1/colunistas),
 * que jÃ¡ retorna apenas colunistas visÃ­veis em ordem de exibiÃ§Ã£o.
 *
 * Ao clicar, navega para a tela do colunista com todos os seus posts.
 */
import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  View
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { AnimatedExpoImage } from "@/src/components/common/AnimatedExpoImage";
import type { Colunista } from "@/src/services/api";

const AVATAR_W = 130;
const AVATAR_H = 163; // 4:5 ratio
const CARD_GAP = 16;
const LIFT_SPRING = { damping: 18, stiffness: 300, mass: 0.7 } as const;

type ColunistasCarouselProps = {
  authors: Colunista[];
  loading: boolean;
};

export function ColunistasCarousel({ authors, loading }: ColunistasCarouselProps) {
  if (loading && authors.length === 0) {
    return <ColunistasSkeleton />;
  }
  if (authors.length === 0) return null;

  return (
    <View style={styles.section}>
      <FlatList
        horizontal
        data={authors}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        decelerationRate="fast"
        snapToInterval={AVATAR_W + CARD_GAP}
        snapToAlignment="start"
        renderItem={({ item }) => <ColunistaCard author={item} />}
      />
    </View>
  );
}

function ColunistaCard({ author }: { author: Colunista }) {
  const router = useRouter();
  const pressed = useSharedValue(false);

  const liftStyle = useAnimatedStyle(() => {
    const p = pressed.value;
    return {
      transform: [{ scale: withSpring(p ? 1.06 : 1, LIFT_SPRING) }],
    };
  });

  /** Bloqueia clique se post_count < 1 (automÃ¡tico) ou clickable === false (manual). */
  const isBlocked = author.post_count < 1 || !author.clickable;

  const handlePressIn = useCallback(() => { pressed.value = true; }, [pressed]);
  const handlePressOut = useCallback(() => { pressed.value = false; }, [pressed]);
  const handlePress = useCallback(() => {
    if (isBlocked) return;
    router.push(`/author/${author.id}` as any);
  }, [router, author.id, isBlocked]);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={styles.pressable}
    >
      <Animated.View style={[styles.avatarWrap, liftStyle]}>
        <View style={styles.avatarBorder}>
          {author.avatar_url ? (
            <AnimatedExpoImage
              source={{ uri: author.avatar_url }}
              style={styles.avatarImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
          ) : (
            <View style={[styles.avatarImage, styles.avatarPlaceholder]} />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

function ColunistasSkeleton() {
  return (
    <View style={styles.section}>
      <View style={styles.listContent}>
        <View style={styles.skeletonRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.pressable}>
              <View style={[styles.avatarBorder, styles.skeletonAvatar]} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
  },
  listContent: {
    paddingHorizontal: 16,
  },
  pressable: {
    width: AVATAR_W,
    marginRight: CARD_GAP,
  },
  avatarWrap: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarBorder: {
    width: AVATAR_W,
    height: AVATAR_H,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    backgroundColor: "#2C2C2E",
  },
  skeletonRow: {
    flexDirection: "row",
  },
  skeletonAvatar: {
    width: AVATAR_W,
    height: AVATAR_H,
    borderRadius: 8,
    backgroundColor: "#2C2C2E",
  },
});
