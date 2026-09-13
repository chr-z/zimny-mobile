/**
 * ColunistaCarouselIndividual — Carrossel de posts de um colunista.
 *
 * Layout diagramado com a foto como referência vertical:
 * - Topo da foto → dia da semana
 * - Meio da foto → nome da coluna
 * - Abaixo do nome → nome do colunista
 * - Base da foto → @instagram
 * - "VER MAIS" no canto superior direito, alinhado com o topo da foto
 * - Tudo dentro do box (sem SectionTitle externo)
 */
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import { AnimatedExpoImage } from "@/src/components/common/AnimatedExpoImage";
import { spacing } from "@/src/constants/designTokens";
import { useTranslation } from "@/src/i18n";
import { translateColumnName } from "@/src/i18n/columns";
import { getDayLabel, jsDayToZimnyDay } from "@/src/i18n/days";
import {
  fetchPosts,
  getFeaturedImageUrl,
  postTitlePlain,
  type WPPost,
} from "@/src/services/api";
import type { Colunista } from "@/src/services/zimnyPlay";

const SCREEN_W = Dimensions.get("window").width;
const CARD_MARGIN = spacing.lg;
const CARD_W = SCREEN_W - CARD_MARGIN * 2;

const AVATAR_W = 60;
const AVATAR_H = 75; // 4:5
const THUMB_W = (CARD_W - 20 - 6 * 2) / 3;

type Props = {
  colunista: Colunista;
  columnName: string;
  color?: string;
  dayNumber?: number;
  instagramHandle?: string;
};

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  } catch {
    return "";
  }
}

export function ColunistaCarouselIndividual({
  colunista,
  columnName,
  color,
  dayNumber,
  instagramHandle,
}: Props) {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPosts({
        author: colunista.id,
        per_page: 3,
        orderby: "date",
        order: "desc",
      });
      setPosts(data);
    } catch (e) {
      console.warn(`[ColunistaCarousel] Failed to load posts for ${colunista.name}:`, e);
    } finally {
      setLoading(false);
    }
  }, [colunista.id, colunista.name]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const isBlocked = colunista.post_count < 1 || !colunista.clickable;

  const handleVerMais = useCallback(() => {
    if (isBlocked) return;
    router.push(`/author/${colunista.id}` as any);
  }, [router, colunista.id, isBlocked]);

  const handlePostPress = useCallback(
    (slug: string) => {
      router.push(`/post/${slug}` as any);
    },
    [router]
  );

  if (loading && posts.length === 0) {
    return <ColunistaCarouselSkeleton />;
  }
  if (posts.length === 0) return null;

  const titleColor = color || "#8E8E93";
  const dayLabel = getDayLabel(
    dayNumber ?? jsDayToZimnyDay(new Date().getDay()),
    t,
  );

  // Só reduz a fonte em nomes longos sem espaços (ex.: NEUROBUSINESS) e
  // handles longos — os demais cards mantêm o tamanho original.
  const translatedColumnName = translateColumnName(columnName, language);
  const isLongColumnName =
    !/\s/.test(translatedColumnName) && translatedColumnName.length > 10;
  const isLongHandle = (instagramHandle?.length ?? 0) > 10;

  return (
    <View style={styles.section}>
      <View style={styles.card}>
        {/* Header row: avatar + text + VER MAIS */}
        <View style={styles.headerRow}>
          {/* Avatar */}
          <View style={styles.avatarBorder}>
            {colunista.avatar_url ? (
              <AnimatedExpoImage
                source={{ uri: colunista.avatar_url }}
                style={styles.avatarImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
            ) : (
              <View style={[styles.avatarImage, styles.avatarPlaceholder]} />
            )}
          </View>

          {/* Text stack aligned with avatar top/bottom */}
              <View style={styles.textStack}>
                <View style={styles.textTopGroup}>
                  <Text style={styles.dayName}>{dayLabel}</Text>
                  <Text
                    style={[
                      styles.columnName,
                      isLongColumnName ? styles.columnNameLong : null,
                      { color: titleColor },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.4}
                  >
                    {translatedColumnName}
                  </Text>
                  <Text style={styles.colunistaName}>
                    {colunista.name}
                  </Text>
                </View>
                {instagramHandle && (
                  <Pressable onPress={handleVerMais} style={styles.instagramChip}>
                    <Text
                      style={[
                        styles.instagramText,
                        isLongHandle ? styles.instagramTextLong : null,
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.5}
                    >
                      @{instagramHandle}
                    </Text>
                    <Text style={styles.instagramArrow}>›</Text>
                  </Pressable>
                )}
              </View>

          {/* VER MAIS top-right, aligned with avatar top */}
          <Pressable onPress={handleVerMais} style={styles.verMaisBtn}>
            <Text style={[styles.verMaisText, { color: titleColor }]}>{t("common.ver_mais")}</Text>
            <Text style={[styles.verMaisArrow, { color: titleColor }]}>›</Text>
          </Pressable>
        </View>

        {/* Articles row */}
        <View style={styles.articlesRow}>
          {posts.map((post) => {
            const thumbUrl = getFeaturedImageUrl(post);
            const dateStr = formatDate(post.date);
            return (
              <Pressable
                key={post.id}
                onPress={() => handlePostPress(post.slug)}
                style={styles.articleCard}
              >
                <View style={styles.articleThumbWrap}>
                  {thumbUrl ? (
                    <AnimatedExpoImage
                      source={{ uri: thumbUrl }}
                      style={styles.articleThumb}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={200}
                    />
                  ) : (
                    <View style={styles.articleThumbPlaceholder}>
                      <Text style={styles.placeholderIcon}>📰</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.articleDate}>{dateStr}</Text>
                <Text style={styles.articleTitle} numberOfLines={2}>
                  {postTitlePlain(post)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function ColunistaCarouselSkeleton() {
  return (
    <View style={styles.section}>
      <View style={[styles.card, { backgroundColor: "#1C1C1E" }]}>
        <View style={styles.headerRow}>
          <View style={[styles.avatarBorder, { backgroundColor: "#2C2C2E" }]} />
          <View style={styles.textStack}>
            <View style={styles.skeletonDay} />
            <View style={styles.skeletonColName} />
            <View style={styles.skeletonName} />
          </View>
        </View>
        <View style={styles.articlesRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.articleCard}>
              <View style={[styles.articleThumbWrap, { backgroundColor: "#2C2C2E" }]} />
              <View style={styles.skeletonArticleTitle} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 4,
  },
  card: {
    marginHorizontal: CARD_MARGIN,
    backgroundColor: "#151515",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#252525",
    gap: 10,
  },
  // ── Header ─────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  avatarBorder: {
    width: AVATAR_W,
    height: AVATAR_H,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarPlaceholder: { backgroundColor: "#2C2C2E" },
  textStack: {
    flex: 1,
    height: AVATAR_H,
    justifyContent: "space-between",
    paddingVertical: 1,
  },
  textTopGroup: {
    gap: 1,
  },
  dayName: {
    fontSize: 8,
    letterSpacing: 1.5,
    fontWeight: "700",
    color: "#555557",
    textTransform: "uppercase",
  },
  columnName: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
    textTransform: "uppercase",
    flexShrink: 1,
  },
  columnNameLong: {
    fontSize: 8,
    letterSpacing: 1,
    flexShrink: 1,
  },
  colunistaName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  instagramChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    maxWidth: "100%",
    gap: 3,
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  instagramText: {
    fontSize: 10,
    color: "#8E8E93",
    fontWeight: "600",
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  instagramTextLong: {
    fontSize: 8.5,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  instagramArrow: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "300",
    marginTop: -1,
  },
  verMaisBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingTop: 2,
    paddingLeft: 4,
  },
  verMaisText: {
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  verMaisArrow: {
    fontSize: 14,
    fontWeight: "300",
    marginTop: -1,
  },
  // ── Articles ────────────────────────────────────────────────────────
  articlesRow: {
    flexDirection: "row",
    gap: 6,
  },
  articleCard: {
    flex: 1,
    gap: 4,
  },
  articleThumbWrap: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#2C2C2E",
  },
  articleThumb: { width: "100%", height: "100%" },
  articleThumbPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2C2C2E",
  },
  placeholderIcon: { fontSize: 18 },
  articleDate: {
    fontSize: 9,
    color: "#8E8E93",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  articleTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 13,
    letterSpacing: 0.2,
  },
  // ── Skeleton ────────────────────────────────────────────────────────
  skeletonDay: {
    height: 8,
    width: "25%",
    backgroundColor: "#3A3A3C",
    borderRadius: 3,
  },
  skeletonColName: {
    height: 10,
    width: "50%",
    backgroundColor: "#3A3A3C",
    borderRadius: 3,
  },
  skeletonName: {
    height: 12,
    width: "60%",
    backgroundColor: "#3A3A3C",
    borderRadius: 3,
  },
  skeletonArticleTitle: {
    height: 10,
    width: "60%",
    backgroundColor: "#3A3A3C",
    borderRadius: 3,
    marginTop: 4,
  },
});