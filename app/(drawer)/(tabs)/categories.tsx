/**
 * EXPLORAR — mosaico de descoberta estilo Instagram premium.
 *
 * · Header fixo full-bleed (GlassView de top:0, conteúdo abaixo do inset)
 * · Barra de pesquisa Liquid Glass (borderRadius: 25)
 * · Pills de categoria com animação de fade/collapse no foco
 * · Mosaico 3 colunas, gap 1px; Featured2x alternado (esq/dir) a cada 9 posts
 * · Ads a cada ~15 células; fundo #F5F5F7
 * · Cache por categoria — sem spinner na segunda visita
 * · decodeHtmlEntities em todos os textos vindos da API
 */
import { useTranslation } from "@/src/i18n";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PremiumAdBlock } from "@/src/components/ads/PremiumAdBlock";
import { GlassView } from "@/src/components/common/GlassView";
import { useAd } from "@/src/hooks/useAds";
import {
  decodeHtmlEntities,
  fetchCategories,
  fetchPosts,
  fetchPostsByCategory,
  getFeaturedImageUrl,
  postExcerptPlain,
  postTitlePlain,
  type WPCategory,
  type WPPost,
} from "@/src/services/api";
import { cachePosts } from "@/src/store/postCache";

// ─── Constants ────────────────────────────────────────────────────────────────

const GAP           = 1;   // px between cells
const PILLS_H       = 48;  // height of the pill strip
const SEARCH_H      = 52;  // height of the search bar area (incl vertical padding)
const FEATURED_INT  = 9;   // regular posts before a featured2x block (consumes 3)
const AD_EVERY      = 15;  // inject ad every N cells

// ─── Grid row model ───────────────────────────────────────────────────────────

type GridRow =
  | { kind: "triple";     cells: WPPost[]                                          }
  | { kind: "featured2x"; main: WPPost; sideA: WPPost; sideB: WPPost; flip: boolean }
  | { kind: "ad";         key: string                                              };

function buildGridRows(posts: WPPost[]): GridRow[] {
  const rows: GridRow[] = [];
  let i                 = 0;
  let sinceFeature      = 0; // posts since last featured block
  let featIdx           = 0; // alternates left/right
  let cellCount         = 0;

  const pushAd = () => {
    if (cellCount > 0 && cellCount % AD_EVERY === 0) {
      rows.push({ kind: "ad", key: `ad-${cellCount}` });
    }
  };

  while (i < posts.length) {
    // Enough buffer + interval elapsed → featured2x block
    if (sinceFeature >= FEATURED_INT && posts.length - i >= 3) {
      rows.push({
        kind:  "featured2x",
        main:  posts[i],
        sideA: posts[i + 1],
        sideB: posts[i + 2],
        flip:  featIdx % 2 !== 0,
      });
      i            += 3;
      cellCount    += 3;
      sinceFeature  = 0;
      featIdx++;
      pushAd();
    } else {
      // Regular triple (or partial at end)
      const batch = posts.slice(i, Math.min(i + 3, posts.length));
      rows.push({ kind: "triple", cells: batch });
      i            += batch.length;
      cellCount    += batch.length;
      sinceFeature += batch.length;
      pushAd();
    }
  }

  return rows;
}

// ─── MosaicCell ───────────────────────────────────────────────────────────────

function MosaicCell({
  post,
  width,
  height,
  featured = false,
}: {
  post:      WPPost;
  width:     number;
  height:    number;
  featured?: boolean;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const uri    = getFeaturedImageUrl(post);
  const title  = postTitlePlain(post);

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/post/[id]", params: { id: String(post.id) } })}
      style={[styles.cell, { width, height }]}
      android_ripple={{ color: "rgba(255,255,255,0.15)" }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={180}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.cellPh]} />
      )}

      {featured && (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.featuredGradient} />
          <GlassView intensity={44} tint="dark" style={styles.featuredGlass}>
            <Text style={styles.featuredBadge}>{t("common.destaque")}</Text>
            <Text style={styles.featuredTitle} numberOfLines={3}>{title}</Text>
          </GlassView>
        </View>
      )}
    </Pressable>
  );
}

// ─── Row renderers ────────────────────────────────────────────────────────────

function TripleRow({ row, cellSize }: { row: Extract<GridRow, { kind: "triple" }>; cellSize: number }) {
  return (
    <View style={[styles.tripleRow, { marginBottom: GAP }]}>
      {row.cells.map((post) => (
        <MosaicCell key={post.id} post={post} width={cellSize} height={cellSize} />
      ))}
      {row.cells.length < 3 &&
        Array.from({ length: 3 - row.cells.length }).map((_, i) => (
          <View key={`pad-${i}`} style={{ width: cellSize, height: cellSize, backgroundColor: "#F5F5F7" }} />
        ))}
    </View>
  );
}

function Featured2xRow({
  row,
  cellSize,
}: {
  row: Extract<GridRow, { kind: "featured2x" }>;
  cellSize: number;
}) {
  const bigW = 2 * cellSize + GAP;
  const bigH = 2 * cellSize + GAP;

  const mainCell = (
    <MosaicCell post={row.main} width={bigW} height={bigH} featured />
  );
  const sideCol = (
    <View style={{ gap: GAP }}>
      <MosaicCell post={row.sideA} width={cellSize} height={cellSize} />
      <MosaicCell post={row.sideB} width={cellSize} height={cellSize} />
    </View>
  );

  return (
    <View style={[styles.tripleRow, { marginBottom: GAP }]}>
      {row.flip ? <>{sideCol}{mainCell}</> : <>{mainCell}{sideCol}</>}
    </View>
  );
}

function AdRow({
  ad,
  onImpression,
  onClick,
}: {
  ad: import("@/src/hooks/useAds").AdItem | null;
  onImpression?: () => void;
  onClick?: () => void;
}) {
  if (!ad) return null;
  return (
    <View style={styles.adRow}>
      <PremiumAdBlock
        ad={ad}
        compact
        onImpression={onImpression}
        onClick={onClick}
      />
    </View>
  );
}

function GridRowView({
  row,
  cellSize,
  ad,
  onImpression,
  onClick,
}: {
  row: GridRow;
  cellSize: number;
  ad: import("@/src/hooks/useAds").AdItem | null;
  onImpression?: () => void;
  onClick?: () => void;
}) {
  if (row.kind === "triple")     return <TripleRow row={row} cellSize={cellSize} />;
  if (row.kind === "featured2x") return <Featured2xRow row={row} cellSize={cellSize} />;
  return <AdRow ad={ad} onImpression={onImpression} onClick={onClick} />;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ExplorarScreen() {
  const insets             = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const { ad: categoryAd, trackImpression: trackCategoryAdImpression, trackClick: trackCategoryAdClick } = useAd("home");

  // cellSize: exactly screenW / 3, minus the 2 gaps between 3 columns
  const cellSize = Math.floor((screenW - GAP * 2) / 3);

  // ── State ─────────────────────────────────────────────────────────────────
  const [categories,         setCategories]        = useState<WPCategory[]>([]);
  const [posts,              setPosts]             = useState<WPPost[]>([]);
  const [selectedCategoryId, setSelectedCategory]  = useState<number | null>(null);
  const [searchQuery,        setSearchQuery]       = useState("");
  const [loadingPosts,       setLoadingPosts]      = useState(true);
  const [searchFocused,      setSearchFocused]     = useState(false);

  // Per-category post cache (survives tab switches within session)
  const localCache = useRef(new Map<string, WPPost[]>());

  // ── Pills slide animation ─────────────────────────────────────────────────
  const pillsAnim = useRef(new Animated.Value(1)).current;

  const animatePills = useCallback((visible: boolean) => {
    Animated.timing(pillsAnim, {
      toValue:         visible ? 1 : 0,
      duration:        220,
      easing:          Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [pillsAnim]);

  const onSearchFocus = useCallback(() => {
    setSearchFocused(true);
    animatePills(false);
  }, [animatePills]);

  const onSearchBlur = useCallback(() => {
    setSearchFocused(false);
    animatePills(true);
  }, [animatePills]);

  // ── Fetch categories once ─────────────────────────────────────────────────
  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  // ── Fetch posts (cache-aware) ─────────────────────────────────────────────
  useEffect(() => {
    const cacheKey = String(selectedCategoryId ?? "all");
    const cached   = localCache.current.get(cacheKey);

    if (cached) {
      setPosts(cached);
      setLoadingPosts(false);
      return;
    }

    setLoadingPosts(true);
    const req = selectedCategoryId
      ? fetchPostsByCategory(selectedCategoryId, 30)
      : fetchPosts({ per_page: 30, orderby: "date", order: "desc" });

    req
      .then((data) => {
        localCache.current.set(cacheKey, data);
        cachePosts(data);
        setPosts(data);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));
  }, [selectedCategoryId]);

  // ── Filtered posts (search — client-side, memoized) ───────────────────────
  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        postTitlePlain(p).toLowerCase().includes(q) ||
        postExcerptPlain(p).toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  // ── Grid rows ─────────────────────────────────────────────────────────────
  const rows = useMemo(() => buildGridRows(filteredPosts), [filteredPosts]);

  // ── Header height for FlatList top offset ─────────────────────────────────
  const headerH = insets.top + SEARCH_H + PILLS_H;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <View style={styles.shell}>

      {/* ── Mosaic FlatList ────────────────────────────────────────────────── */}
      {loadingPosts && rows.length === 0 ? (
        <View style={[styles.center, { paddingTop: headerH }]}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      ) : (
        <FlashList
          data={rows}
          keyExtractor={(item: any, idx: number) =>
            item.kind === "triple"
              ? `t-${item.cells[0]?.id ?? idx}`
              : item.kind === "featured2x"
              ? `f-${item.main.id}`
              : item.key
          }
          renderItem={({ item }: { item: any }) => (
            <GridRowView
              row={item}
              cellSize={cellSize}
              ad={categoryAd}
              onImpression={trackCategoryAdImpression}
              onClick={trackCategoryAdClick}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: headerH, paddingBottom: Math.max(insets.bottom, 20) + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            !loadingPosts ? (
              <View style={[styles.center, { paddingTop: 40 }]}>
                <Text style={styles.emptyText}>Nenhuma matéria encontrada.</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* ── Fixed Glass Header (full-bleed from y=0) ───────────────────────── */}
      <View style={styles.fixedHeader} pointerEvents="box-none">
        <GlassView intensity={85} tint="light" style={styles.headerGlass}>
          {/* Safe-area offset is applied here (inside the glass) */}
          <View style={{ paddingTop: insets.top }}>

            {/* ── Search bar ─────────────────────────────────────────────── */}
            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <FontAwesome name="search" size={14} color="rgba(0,0,0,0.38)" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Pesquisar matérias…"
                  placeholderTextColor="rgba(0,0,0,0.32)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={onSearchFocus}
                  onBlur={onSearchBlur}
                  clearButtonMode="while-editing"
                  returnKeyType="search"
                  autoCorrect={false}
                  autoCapitalize="none"
                />
              </View>
              {searchFocused && (
                <Pressable onPress={() => { setSearchQuery(""); onSearchBlur(); }} hitSlop={12}>
                  <Text style={styles.cancelBtn}>Cancelar</Text>
                </Pressable>
              )}
            </View>

            {/* ── Pills strip (animated height + opacity) ───────────────── */}
            <Animated.View
              style={{
                height:   pillsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILLS_H] }),
                opacity:  pillsAnim,
                overflow: "hidden",
              }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillsContent}
                keyboardShouldPersistTaps="always"
              >
                {/* 'Tudo' pill */}
                <Pressable
                  onPress={() => setSelectedCategory(null)}
                  style={[styles.pill, selectedCategoryId === null && styles.pillActive]}
                >
                  <Text style={[styles.pillText, selectedCategoryId === null && styles.pillTextActive]}>
                    Tudo
                  </Text>
                </Pressable>

                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() =>
                      setSelectedCategory((prev) => (prev === cat.id ? null : cat.id))
                    }
                    style={[styles.pill, selectedCategoryId === cat.id && styles.pillActive]}
                  >
                    <Text
                      style={[styles.pillText, selectedCategoryId === cat.id && styles.pillTextActive]}
                      numberOfLines={1}
                    >
                      {decodeHtmlEntities(cat.name)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>

          </View>
          {/* Bottom separator */}
          <View style={styles.headerSep} />
        </GlassView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: {
    flex:            1,
    backgroundColor: "#F5F5F7",
  },
  listContent: {
    backgroundColor: "#F5F5F7",
  },

  // ── Fixed header ──────────────────────────────────────────────────────────
  fixedHeader: {
    position: "absolute",
    top:      0,        // extends to the very top (beneath status bar)
    left:     0,
    right:    0,
    zIndex:   60,
  },
  headerGlass: {
    // GlassView fills from top:0 — the blur covers Dynamic Island
  },
  headerSep: {
    height:          StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  // ── Search bar ────────────────────────────────────────────────────────────
  searchRow: {
    flexDirection:   "row",
    alignItems:      "center",
    paddingHorizontal: 14,
    paddingTop:       10,
    paddingBottom:    6,
    gap:              10,
  },
  searchBar: {
    flex:             1,
    flexDirection:    "row",
    alignItems:       "center",
    gap:              8,
    height:           38,
    borderRadius:     25,           // very rounded — Liquid Glass style
    backgroundColor:  "rgba(0,0,0,0.07)",
    paddingHorizontal: 14,
  },
  searchInput: {
    flex:          1,
    fontSize:      15,
    color:         "#000000",
    letterSpacing: 0.2,
    paddingVertical: 0,
  },
  cancelBtn: {
    fontSize:      14,
    color:         "#C9A84C",
    fontWeight:    "600",
    letterSpacing: 0.3,
  },

  // ── Pills ─────────────────────────────────────────────────────────────────
  pillsContent: {
    paddingHorizontal: 14,
    paddingVertical:   6,
    gap:               8,
    alignItems:        "center",
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical:    8,
    borderRadius:      20,
    backgroundColor:   "rgba(0,0,0,0.06)",
    borderWidth:        1,
    borderColor:       "rgba(0,0,0,0.07)",
  },
  pillActive: {
    backgroundColor: "#C9A84C",
    borderColor:     "#C9A84C",
  },
  pillText: {
    fontSize:      11.5,
    letterSpacing: 0.9,
    fontWeight:    "600",
    color:         "rgba(0,0,0,0.55)",
    textTransform: "uppercase",
  },
  pillTextActive: {
    color: "#000000",
  },

  // ── Grid ──────────────────────────────────────────────────────────────────
  tripleRow: {
    flexDirection:   "row",
    gap:             GAP,
  },
  cell: {
    overflow:        "hidden",
    backgroundColor: "#D8D8DA",  // visible during image load
  },
  cellPh: {
    backgroundColor: "#D0D0D2",
  },

  // ── Featured overlay ──────────────────────────────────────────────────────
  featuredGradient: {
    ...StyleSheet.absoluteFill,
    // No LinearGradient dependency — just a semi-transparent bottom scrim via the GlassView below
  },
  featuredGlass: {
    position:      "absolute",
    bottom:        0,
    left:          0,
    right:         0,
    paddingHorizontal: 14,
    paddingVertical:   12,
  },
  featuredBadge: {
    fontSize:      8.5,
    letterSpacing: 3,
    textTransform: "uppercase",
    color:         "#C9A84C",
    fontWeight:    "700",
    marginBottom:  5,
  },
  featuredTitle: {
    fontFamily:    "Georgia",
    fontSize:      18,
    lineHeight:    24,
    letterSpacing: 0.3,
    color:         "#FFFFFF",
  },

  // ── Ad row ────────────────────────────────────────────────────────────────
  adRow: {
    paddingHorizontal: 10,
    paddingVertical:   14,
    backgroundColor:   "#F5F5F7",
    borderTopWidth:    StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor:       "rgba(0,0,0,0.06)",
    marginBottom:      GAP,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  center: {
    alignItems:     "center",
    justifyContent: "center",
    flex:           1,
  },
  emptyText: {
    fontFamily:    "Georgia",
    fontSize:      16,
    color:         "rgba(0,0,0,0.4)",
    letterSpacing: 0.5,
    textAlign:     "center",
  },
});
