/**
 * ColunistaDiaSection — Seção em destaque "Coluna do Dia" na Home.
 *
 * Design editorial moderno e compacto:
 * - Card principal com foto do colunista (4:5) + info ao lado
 * - Dia da semana, nome da coluna (colorido), nome do colunista
 * - @instagram clicável (abre perfil do Instagram)
 * - Grid horizontal dos 3 artigos mais recentes com capa 4:5
 */
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Linking,
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

import { SectionTitle } from "./SectionTitle";

const SCREEN_W = Dimensions.get("window").width;
const CARD_MARGIN = spacing.lg;
const CARD_W = SCREEN_W - CARD_MARGIN * 2;

const AVATAR_W = 80;
const AVATAR_H = 100; // 4:5
const THUMB_W = (CARD_W - 24 - 8 * 2) / 3;
const THUMB_H = THUMB_W * 1.25;

type ColunistaDiaSectionProps = {
  colunista: Colunista | null | undefined;
  columnName?: string;
  loading: boolean;
  color?: string;
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

export function ColunistaDiaSection({
  colunista,
  columnName,
  loading,
  color,
  instagramHandle,
}: ColunistaDiaSectionProps) {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const isBlocked = !colunista || colunista.post_count < 1 || !colunista.clickable;

  const handleVerMais = useCallback(() => {
    if (isBlocked) return;
    router.push(`/author/${colunista!.id}` as any);
  }, [router, colunista, isBlocked]);

  const handlePostPress = useCallback(
    (slug: string) => {
      router.push(`/post/${slug}` as any);
    },
    [router]
  );

  const handleInstagramPress = useCallback(() => {
    if (!instagramHandle) return;
    const url = `https://instagram.com/${instagramHandle}`;
    Linking.openURL(url).catch(() => {
      console.warn("[ColunistaDia] Failed to open Instagram URL:", url);
    });
  }, [instagramHandle]);

  const loadPosts = useCallback(async () => {
    if (!colunista) return;
    try {
      setPostsLoading(true);
      const data = await fetchPosts({
        author: colunista.id,
        per_page: 3,
        orderby: "date",
        order: "desc",
      });
      setPosts(data);
    } catch (e) {
      console.warn("[ColunistaDia] Failed to load posts:", e);
    } finally {
      setPostsLoading(false);
    }
  }, [colunista]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  if (loading && !colunista) {
    return <ColunistaDiaSkeleton />;
  }
  if (!colunista) return null;

  const titleColor = color || "#8E8E93";
  const dayName = getDayLabel(jsDayToZimnyDay(new Date().getDay()), t);

  return (
    <View style={styles.section}>
      <SectionTitle
        title={t("home.coluna_do_dia")}
        color={titleColor}
        sectionKey="coluna do dia"
      />

      <Pressable onPress={handleVerMais} style={styles.card}>
        {/* Colunista row */}
        <View style={styles.colunistaRow}>
          <View style={styles.avatarWrap}>
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
          </View>
          <View style={styles.colunistaInfo}>
            <Text style={styles.dayName}>{dayName}</Text>
            <Text style={[styles.columnName, { color: titleColor }]}>
              {translateColumnName(columnName || "", language) ||
                t("home.coluna_do_dia")}
            </Text>
            <Text style={styles.colunistaName}>{colunista.name}</Text>
            {instagramHandle && (
              <Pressable onPress={handleInstagramPress} style={styles.instagramRow}>
                <Text style={styles.instagramText}>@{instagramHandle}</Text>
                <Text style={styles.instagramArrow}>›</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Articles */}
        {posts.length > 0 && (
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
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.7)"]}
                      locations={[0.5, 1]}
                      style={styles.articleGradient}
                    >
                      <Text style={styles.articleDate}>{dateStr}</Text>
                    </LinearGradient>
                  </View>
                  <Text style={styles.articleTitle} numberOfLines={2}>
                    {postTitlePlain(post)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </Pressable>

    </View>
  );
}

function ColunistaDiaSkeleton() {
  return (
    <View style={styles.section}>
      <View style={styles.skeletonTitle} />
      <View style={[styles.card, { backgroundColor: "#1C1C1E" }]}>
        <View style={styles.colunistaRow}>
          <View style={[styles.avatarBorder, { backgroundColor: "#2C2C2E" }]} />
          <View style={styles.colunistaInfo}>
            <View style={styles.skeletonDayName} />
            <View style={styles.skeletonColumnName} />
            <View style={styles.skeletonColunistaName} />
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
    marginTop: 8,
    marginBottom: 4,
  },
  card: {
    marginHorizontal: CARD_MARGIN,
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    gap: 12,
  },
  colunistaRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
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
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarPlaceholder: { backgroundColor: "#2C2C2E" },
  colunistaInfo: {
    flex: 1,
    gap: 2,
    paddingRight: 4,
  },
  dayName: {
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "700",
    color: "#555557",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  columnName: {
    fontSize: 11,
    letterSpacing: 2.5,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  colunistaName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  instagramRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  instagramIcon: {
    fontSize: 11,
  },
  instagramText: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  instagramArrow: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "300",
    marginTop: -1,
  },
  articlesRow: {
    flexDirection: "row",
    gap: 8,
  },
  articleCard: {
    flex: 1,
    gap: 6,
  },
  articleThumbWrap: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: 10,
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
  placeholderIcon: { fontSize: 22 },
  articleGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    justifyContent: "flex-end",
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  articleDate: {
    fontSize: 9,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  articleTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 15,
    letterSpacing: 0.2,
  },
  skeletonTitle: {
    height: 16,
    width: 140,
    backgroundColor: "#2C2C2E",
    borderRadius: 4,
    marginHorizontal: CARD_MARGIN,
    marginBottom: spacing.xs,
  },
  skeletonDayName: {
    height: 10,
    width: "40%",
    backgroundColor: "#3A3A3C",
    borderRadius: 3,
  },
  skeletonColumnName: {
    height: 12,
    width: "60%",
    backgroundColor: "#3A3A3C",
    borderRadius: 3,
    marginTop: 4,
  },
  skeletonColunistaName: {
    height: 18,
    width: "80%",
    backgroundColor: "#3A3A3C",
    borderRadius: 3,
    marginTop: 4,
  },
  skeletonArticleTitle: {
    height: 10,
    width: "70%",
    backgroundColor: "#3A3A3C",
    borderRadius: 3,
    marginTop: 4,
  },
});