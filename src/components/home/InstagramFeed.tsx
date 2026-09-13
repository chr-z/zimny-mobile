/**
 * InstagramFeed
 *
 * Exibe os 6 posts mais recentes do Instagram @zimnymagazine em um grid 3×2
 * (imagens 4:5) na Home, seguindo o mesmo padrão do GalleryHomeGrid.
 *
 * Design:
 * ┌──────────────────────────────────────────────┐
 * │  [icon] @zimnymagazine                       │
 * │  SIGA-NOS PARA CONTEÚDOS EXCLUSIVOS          │
 * ├──────────────────────────────────────────────┤
 * │  ┌────┐ ┌────┐ ┌────┐                        │
 * │  │4:5 │ │4:5 │ │4:5 │                        │
 * │  └────┘ └────┘ └────┘                        │
 * │  ┌────┐ ┌────┐ ┌────┐                        │
 * │  │4:5 │ │4:5 │ │4:5 │                        │
 * │  └────┘ └────┘ └────┘                        │
 * └──────────────────────────────────────────────┘
 */

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { color, font, radius, spacing } from "@/src/constants/designTokens";
import { useInstagramFeed } from "@/src/hooks/useInstagramFeed";
import type { InstagramPost } from "@/src/services/instagram";
import { getSafeHttpsUrl } from "@/src/utils/security";

// ─── Constants ───────────────────────────────────────────────────────────────

const COLUMNS = 3;
const ROWS = 2;
const MAX_ITEMS = COLUMNS * ROWS; // 6
const H_PADDING = spacing.lg; // 16
const GAP = spacing.sm; // 8
const ASPECT_RATIO = 5 / 4; // 4:5

// ─── Component ───────────────────────────────────────────────────────────────

export function InstagramFeed() {
  const { posts, loading, error } = useInstagramFeed();

  // Fallback silencioso: se não há dados e não está carregando, não renderiza
  if ((!loading && posts.length === 0) || (error && posts.length === 0)) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <InstagramHeader />
      {loading && posts.length === 0 ? (
        <SkeletonGrid />
      ) : (
        <InstagramGrid posts={posts.slice(0, MAX_ITEMS)} />
      )}
    </View>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

function InstagramHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <FontAwesome name="instagram" size={20} color={color.dark.text} />
        <Text style={styles.title}>@zimnymagazine</Text>
      </View>
      <Text style={styles.subtitle}>Siga-nos para conteúdos exclusivos</Text>
    </View>
  );
}

// ─── Grid 3×2 ────────────────────────────────────────────────────────────────

function InstagramGrid({ posts }: { posts: InstagramPost[] }) {
  const { width: screenW } = useWindowDimensions();
  const cardWidth = Math.floor(
    (screenW - H_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS,
  );
  const cardHeight = Math.floor(cardWidth * ASPECT_RATIO);

  // Agrupa em linhas explícitas para evitar problemas de flexWrap
  const rows: React.ReactNode[] = [];
  for (let i = 0; i < posts.length; i += COLUMNS) {
    const rowItems = posts.slice(i, i + COLUMNS);
    rows.push(
      <View key={`row-${i}`} style={styles.row}>
        {rowItems.map((post) => (
          <InstagramCard
            key={post.id}
            post={post}
            width={cardWidth}
            height={cardHeight}
          />
        ))}
      </View>,
    );
  }

  return <View style={styles.grid}>{rows}</View>;
}

// ─── Instagram Card ──────────────────────────────────────────────────────────

function InstagramCard({
  post,
  width,
  height,
}: {
  post: InstagramPost;
  width: number;
  height: number;
}) {
  const [imageUrl, setImageUrl] = useState(post.imageUrl);

  useEffect(() => {
    setImageUrl(post.imageUrl);
  }, [post.imageUrl]);

  const handlePress = () => {
    const safeUrl = getSafeHttpsUrl(post.postUrl);
    if (safeUrl) Linking.openURL(safeUrl).catch(() => {});
  };

  return (
    <Pressable onPress={handlePress} style={[styles.card, { width, height }]}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.cardImage}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        onError={() => {
          if (post.fallbackImageUrl && post.fallbackImageUrl !== imageUrl) {
            setImageUrl(post.fallbackImageUrl);
          }
        }}
      />
    </Pressable>
  );
}

// ─── Skeleton Grid ───────────────────────────────────────────────────────────

function SkeletonGrid() {
  const { width: screenW } = useWindowDimensions();
  const cardWidth = Math.floor(
    (screenW - H_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS,
  );
  const cardHeight = Math.floor(cardWidth * ASPECT_RATIO);

  const rows: React.ReactNode[] = [];
  for (let i = 0; i < MAX_ITEMS; i += COLUMNS) {
    rows.push(
      <View key={`skeleton-${i}`} style={styles.row}>
        {Array.from({ length: COLUMNS }).map((_, j) => (
          <View
            key={j}
            style={[styles.skeleton, { width: cardWidth, height: cardHeight }]}
          />
        ))}
      </View>,
    );
  }

  return <View style={styles.grid}>{rows}</View>;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  // ── Header ──
  header: {
    paddingHorizontal: H_PADDING,
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontFamily: font.serif,
    fontSize: font.size.title, // 20
    fontWeight: "700",
    color: color.dark.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: font.size.caption, // 11
    color: color.dark.textSecondary,
    letterSpacing: 2,
    marginTop: spacing.xs,
    textTransform: "uppercase",
  },

  // ── Grid ──
  grid: {
    paddingHorizontal: H_PADDING,
    gap: GAP,
  },
  row: {
    flexDirection: "row",
    gap: GAP,
  },

  // ── Card ──
  card: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: color.dark.surfaceAlt,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },

  // ── Skeleton ──
  skeleton: {
    borderRadius: radius.md,
    backgroundColor: color.dark.surfaceAlt,
  },
});
