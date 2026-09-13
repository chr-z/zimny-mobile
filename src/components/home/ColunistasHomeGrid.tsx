/**
 * ColunistasHomeGrid — Grid de colunistas na Home.
 *
 * Layout:
 * - Linha exclusiva: Coluna do Dia (com artigo mais recente)
 * - Grid 3 colunas: demais colunistas (apenas capa + infos)
 * - Sem gap entre a coluna do dia e o grid
 * - Esquema de cores individuais mantido
 */
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { getDayLabel } from "@/src/i18n/days";
import {
  fetchPosts,
  getFeaturedImageUrl,
  postTitlePlain,
  type WPPost,
} from "@/src/services/api";
import type { Colunista, ColunistasConfig } from "@/src/services/zimnyPlay";

import { SectionTitle } from "./SectionTitle";

const SCREEN_W = Dimensions.get("window").width;
const PADDING = spacing.lg;
const GAP = 8;

// Coluna do Dia
const DIA_AVATAR_W = 80;
const DIA_AVATAR_H = 100;

// Grid cards
const GRID_CARDS = 3;
const GRID_W = (SCREEN_W - PADDING * 2 - GAP * (GRID_CARDS - 1)) / GRID_CARDS;
const GRID_H = GRID_W * 1.25; // 4:5

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

type Props = {
  authors: Colunista[];
  config: ColunistasConfig | null;
  loading: boolean;
};

export function ColunistasHomeGrid({ authors, config, loading }: Props) {
  const { t, language } = useTranslation();
  const router = useRouter();

  // Find today's columnist
  const todayData = useMemo(() => {
    if (!config?.today?.colunista) return null;
    return {
      colunista: config.today.colunista,
      colunistaId: config.today.colunista_id,
      dayNumber: config.today.day_number,
      columnName: translateColumnName(
        config.column_names?.[config.today.colunista_id] || "",
        language,
      ),
      color: config.column_colors?.[config.today.colunista_id] || "#8E8E93",
      instagramHandle: config.instagram_handles?.[config.today.colunista_id],
    };
  }, [config, language]);

  // Other columnists (excluding today's)
  const otherAuthors = useMemo(() => {
    if (!todayData) return authors;
    return authors.filter((a) => a.id !== todayData.colunistaId);
  }, [authors, todayData]);

  // Fetch latest article for today's columnist
  const [latestPost, setLatestPost] = useState<WPPost | null>(null);
  useEffect(() => {
    if (!todayData) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPosts({
          author: todayData.colunistaId,
          per_page: 1,
          orderby: "date",
          order: "desc",
        });
        if (!cancelled && data.length > 0) setLatestPost(data[0]);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [todayData]);

  const handleAuthorPress = useCallback(
    (id: number) => router.push(`/author/${id}` as any),
    [router]
  );
  const handlePostPress = useCallback(
    (slug: string) => router.push(`/post/${slug}` as any),
    [router]
  );

  if (loading && authors.length === 0) {
    return <ColunistasHomeGridSkeleton />;
  }
  if (authors.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      {/* ── Coluna do Dia ── */}
      {todayData && (
        <View style={styles.diaSection}>
          <SectionTitle
            title={t("home.coluna_do_dia")}
            color={todayData.color}
            sectionKey="coluna do dia"
          />

          {/* Card do colunista */}
          <Pressable
            onPress={() => handleAuthorPress(todayData.colunistaId)}
            style={styles.diaCard}
          >
            <View style={styles.diaRow}>
              <View style={styles.diaAvatarWrap}>
                <View style={styles.diaAvatarBorder}>
                  {todayData.colunista.avatar_url ? (
                    <AnimatedExpoImage
                      source={{ uri: todayData.colunista.avatar_url }}
                      style={styles.diaAvatarImage}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={200}
                    />
                  ) : (
                    <View style={[styles.diaAvatarImage, styles.avatarPlaceholder]} />
                  )}
                </View>
              </View>
              <View style={styles.diaInfo}>
                <Text style={styles.diaDay}>{getDayLabel(todayData.dayNumber, t)}</Text>
                <Text style={[styles.diaColName, { color: todayData.color }]}>
                  {todayData.columnName || t("home.coluna_do_dia")}
                </Text>
                <Text style={styles.diaAuthorName}>{todayData.colunista.name}</Text>
                {todayData.instagramHandle && (
                  <Text style={styles.diaInstagram}>@{todayData.instagramHandle}</Text>
                )}
              </View>
            </View>

            {/* Latest article */}
            {latestPost && (
              <Pressable
                onPress={() => handlePostPress(latestPost.slug)}
                style={styles.latestArticle}
              >
                <View style={styles.latestThumbWrap}>
                  {getFeaturedImageUrl(latestPost) ? (
                    <AnimatedExpoImage
                      source={{ uri: getFeaturedImageUrl(latestPost) }}
                      style={styles.latestThumb}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={200}
                    />
                  ) : (
                    <View style={styles.latestThumbPlaceholder} />
                  )}
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.8)"]}
                    locations={[0.4, 1]}
                    style={styles.latestGradient}
                  >
                    <Text style={styles.latestTitle} numberOfLines={2}>
                      {postTitlePlain(latestPost)}
                    </Text>
                    <Text style={styles.latestDate}>{formatDate(latestPost.date)}</Text>
                  </LinearGradient>
                </View>
              </Pressable>
            )}
          </Pressable>

        </View>
      )}

      {/* ── Grid dos demais colunistas ── */}
      {otherAuthors.length > 0 && (
        <View style={styles.grid}>
          {(() => {
            // Group items into explicit rows to prevent flexWrap issues
            const rows: React.ReactNode[] = [];
            for (let i = 0; i < otherAuthors.length; i += GRID_CARDS) {
              const rowItems = otherAuthors.slice(i, i + GRID_CARDS);
              rows.push(
                <View key={`row-${i}`} style={styles.gridRow}>
                  {rowItems.map((author) => {
                    let dayNumber: number | undefined;
                    if (config?.day_assignments) {
                      for (const [day, uid] of Object.entries(config.day_assignments)) {
                        if (uid === author.id) { dayNumber = Number(day); break; }
                      }
                    }
                    const colName = translateColumnName(
                      config?.column_names?.[author.id] || "",
                      language,
                    );
                    const colColor = config?.column_colors?.[author.id] || "#8E8E93";
                    const instagramHandle = config?.instagram_handles?.[author.id];

                    return (
                      <Pressable
                        key={author.id}
                        onPress={() => handleAuthorPress(author.id)}
                        style={styles.gridCard}
                      >
                        <View style={styles.gridPhotoWrap}>
                          {author.avatar_url ? (
                            <AnimatedExpoImage
                              source={{ uri: author.avatar_url }}
                              style={styles.gridPhoto}
                              contentFit="cover"
                              cachePolicy="memory-disk"
                              transition={200}
                            />
                          ) : (
                            <View style={[styles.gridPhoto, styles.avatarPlaceholder]} />
                          )}
                        </View>
                        <View style={styles.gridInfo}>
                          {dayNumber ? (
                            <Text style={styles.gridDay}>{getDayLabel(dayNumber, t)}</Text>
                          ) : null}
                          {colName ? (
                            <Text style={[styles.gridColName, { color: colColor }]}>
                              {colName}
                            </Text>
                          ) : null}
                          <Text style={styles.gridAuthor}>
                            {author.name}
                          </Text>
                          {instagramHandle ? (
                            <Text style={styles.gridInstagram}>@{instagramHandle}</Text>
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              );
            }
            return rows;
          })()}
        </View>
      )}
    </View>
  );
}

function ColunistasHomeGridSkeleton() {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.diaCard, { backgroundColor: "#1C1C1E" }]}>
        <View style={styles.diaRow}>
          <View style={[styles.diaAvatarBorder, { backgroundColor: "#2C2C2E" }]} />
          <View style={styles.diaInfo}>
            <View style={styles.skelDiaDay} />
            <View style={styles.skelDiaCol} />
            <View style={styles.skelDiaName} />
          </View>
        </View>
      </View>
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.gridCard}>
              <View style={[styles.gridPhotoWrap, { backgroundColor: "#2C2C2E" }]} />
              <View style={styles.gridInfo}>
                <View style={styles.skelGridDay} />
                <View style={styles.skelGridCol} />
                <View style={styles.skelGridName} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
  // ── Coluna do Dia ──────────────────────────────────────────────
  diaSection: {},
  diaCard: {
    marginHorizontal: PADDING,
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    gap: 12,
  },
  diaRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  diaAvatarWrap: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  diaAvatarBorder: {
    width: DIA_AVATAR_W,
    height: DIA_AVATAR_H,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
  },
  diaAvatarImage: { width: "100%", height: "100%" },
  avatarPlaceholder: { backgroundColor: "#2C2C2E" },
  diaInfo: {
    flex: 1,
    gap: 2,
  },
  diaDay: {
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "700",
    color: "#555557",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  diaColName: {
    fontSize: 11,
    letterSpacing: 2.5,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  diaAuthorName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  diaInstagram: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "500",
    letterSpacing: 0.3,
    marginTop: 2,
  },
  // Latest article
  latestArticle: {
    borderRadius: 10,
    overflow: "hidden",
  },
  latestThumbWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#2C2C2E",
    borderRadius: 10,
    overflow: "hidden",
  },
  latestThumb: { width: "100%", height: "100%" },
  latestThumbPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#2C2C2E",
  },
  latestGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    justifyContent: "flex-end",
    padding: 12,
    gap: 4,
  },
  latestTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  latestDate: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  // ── Grid ──────────────────────────────────────────────────────
  grid: {
    paddingHorizontal: PADDING,
    gap: GAP,
    marginTop: 8,
  },
  gridRow: {
    flexDirection: "row",
    gap: GAP,
  },
  gridCard: {
    width: GRID_W,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#252525",
  },
  gridPhotoWrap: {
    width: "100%",
    height: GRID_H,
    backgroundColor: "#2C2C2E",
  },
  gridPhoto: { width: "100%", height: "100%" },
  gridInfo: {
    padding: 8,
    gap: 1,
  },
  gridDay: {
    fontSize: 7,
    letterSpacing: 1.2,
    fontWeight: "700",
    color: "#555557",
    textTransform: "uppercase",
    marginBottom: 1,
  },
  gridColName: {
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  gridAuthor: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  gridInstagram: {
    fontSize: 8,
    color: "#8E8E93",
    fontWeight: "500",
    letterSpacing: 0.2,
    marginTop: 1,
  },
  // ── Skeleton ──────────────────────────────────────────────────
  skelDiaDay: { height: 9, width: "30%", backgroundColor: "#3A3A3C", borderRadius: 3 },
  skelDiaCol: { height: 10, width: "50%", backgroundColor: "#3A3A3C", borderRadius: 3, marginTop: 4 },
  skelDiaName: { height: 16, width: "70%", backgroundColor: "#3A3A3C", borderRadius: 3, marginTop: 4 },
  skelGridDay: { height: 7, width: "40%", backgroundColor: "#3A3A3C", borderRadius: 2 },
  skelGridCol: { height: 8, width: "60%", backgroundColor: "#3A3A3C", borderRadius: 2, marginTop: 3 },
  skelGridName: { height: 10, width: "50%", backgroundColor: "#3A3A3C", borderRadius: 2, marginTop: 3 },
});