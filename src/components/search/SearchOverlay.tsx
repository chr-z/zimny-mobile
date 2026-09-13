/**
 * SearchOverlay — Overlay de busca em tela cheia com animação slide-down + fade.
 *
 * · Acionado pelo ícone de lupa no SmartHeader
 * · Fundo escuro (#0A0A0A) — estética idêntica à home
 * · Sem filtros de categoria — apenas "Tudo" como padrão
 * · Grid mosaico 3 colunas com FlashList
 * · Animação elegante de ~400ms com Easing.inOut
 */
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
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PremiumAdBlock } from "@/src/components/ads/PremiumAdBlock";
import { GlassView } from "@/src/components/common/GlassView";
import { LiquidIconButton } from "@/src/components/common/LiquidIconButton";
import { useAd } from "@/src/hooks/useAds";
import {
  fetchPosts,
  getFeaturedImageUrl,
  postExcerptPlain,
  postTitlePlain,
  type WPPost
} from "@/src/services/api";
import { cachePosts, getAllCachedPosts } from "@/src/store/postCache";

// ─── Constants ────────────────────────────────────────────────────────────────

const GAP          = 1;   // px between cells
const SEARCH_H     = 52;  // height of the search bar area
const FEATURED_INT = 9;   // regular posts before a featured2x block
const AD_EVERY     = 15;  // inject ad every N cells

// ─── Grid row model ───────────────────────────────────────────────────────────

type GridRow =
  | { kind: "triple";     cells: WPPost[]                                          }
  | { kind: "featured2x"; main: WPPost; sideA: WPPost; sideB: WPPost; flip: boolean }
  | { kind: "ad";         key: string                                              };

function buildGridRows(posts: WPPost[]): GridRow[] {
  const rows: GridRow[] = [];
  let i                 = 0;
  let sinceFeature      = 0;
  let featIdx           = 0;
  let cellCount         = 0;

  const pushAd = () => {
    if (cellCount > 0 && cellCount % AD_EVERY === 0) {
      rows.push({ kind: "ad", key: `ad-${cellCount}` });
    }
  };

  while (i < posts.length) {
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
          <View style={styles.featuredScrim} />
          <GlassView intensity={44} tint="dark" style={styles.featuredGlass}>
            <Text style={styles.featuredBadge}>DESTAQUE</Text>
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
          <View key={`pad-${i}`} style={{ width: cellSize, height: cellSize, backgroundColor: "#1C1C1E" }} />
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

// ─── Props ────────────────────────────────────────────────────────────────────

type SearchOverlayProps = {
  visible: boolean;
  onClose: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchOverlay({ visible, onClose }: SearchOverlayProps) {
  const insets             = useSafeAreaInsets();
  const { ad: searchAd, trackImpression: trackSearchAdImpression, trackClick: trackSearchAdClick } = useAd("home");
  const { width: screenW } = useWindowDimensions();
  const router             = useRouter();

  // cellSize: exactly screenW / 3, minus the 2 gaps between 3 columns
  const cellSize = Math.floor((screenW - GAP * 2) / 3);

  // ── Animation ─────────────────────────────────────────────────────────────
  const slideAnim = useRef(new Animated.Value(-screenW)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset to initial state first
      slideAnim.setValue(-screenW);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue:         0,
          duration:        420,
          easing:          Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue:         1,
          duration:        400,
          easing:          Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, screenW, slideAnim, fadeAnim]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue:         -screenW,
        duration:        280,
        easing:          Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue:         0,
        duration:        260,
        easing:          Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [screenW, slideAnim, fadeAnim, onClose]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [posts,         setPosts]        = useState<WPPost[]>([]);
  const [searchQuery,   setSearchQuery]  = useState("");
  const [loadingPosts,  setLoadingPosts] = useState(true);

  // Per-session cache
  const localCache = useRef(new Map<string, WPPost[]>());

  // ── Fetch posts on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;

    const cacheKey = "all";
    const cached   = localCache.current.get(cacheKey);

    // [Perf] Validation: is the search dataset available without a network call?
    console.log(
      `[Perf] SearchOverlay open: localCache=${cached ? "HIT" : "MISS"} ` +
      `(localCache size=${localCache.current.size}, sharedPostCache=${getAllCachedPosts().length})`
    );

    if (cached) {
      setPosts(cached);
      setLoadingPosts(false);
      return;
    }

    // Seed instantâneo: a home feed já populou o postCache com os posts mais
    // recentes — a busca abre na hora e atualiza em background depois.
    const shared = getAllCachedPosts()
      .filter((p) => !!p.date)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    if (shared.length >= 30) {
      localCache.current.set(cacheKey, shared);
      setPosts(shared);
      setLoadingPosts(false);
      console.log(`[Perf] SearchOverlay seeded from postCache (${shared.length} posts)`);
      // Refresh silencioso em background (dedupe na API evita request duplicado).
      fetchPosts({ per_page: 30, orderby: "date", order: "desc" })
        .then((data) => {
          localCache.current.set(cacheKey, data);
          cachePosts(data);
          setPosts(data);
        })
        .catch(() => {});
      return;
    }

    const t0 = Date.now();
    setLoadingPosts(true);
    fetchPosts({ per_page: 30, orderby: "date", order: "desc" })
      .then((data) => {
        localCache.current.set(cacheKey, data);
        cachePosts(data);
        setPosts(data);
        console.log(`[Perf] SearchOverlay network fetch resolved in ${Date.now() - t0}ms (${data.length} posts)`);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));
  }, [visible]);

  // ── Filtered posts (client-side search) ───────────────────────────────────
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
  const headerH = insets.top + SEARCH_H;

  // ── Don't render if not visible (after close animation) ───────────────────
  if (!visible) return null;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <Animated.View
      style={[
        styles.shell,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
      pointerEvents="auto"
    >
      {/* ── Mosaic FlatList ──────────────────────────────────────────────── */}
      {loadingPosts && rows.length === 0 ? (
        <View style={[styles.center, { paddingTop: headerH }]}>
          <ActivityIndicator size="large" color="rgba(255,255,255,0.3)" />
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
              ad={searchAd}
              onImpression={trackSearchAdImpression}
              onClick={trackSearchAdClick}
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

      {/* ── Fixed Dark Header ────────────────────────────────────────────── */}
      <View style={styles.fixedHeader} pointerEvents="box-none">
        <GlassView intensity={85} tint="dark" style={styles.headerGlass}>
          <View style={{ paddingTop: insets.top }}>

            {/* ── Search bar + Close button ──────────────────────────────── */}
            <View style={styles.searchRow}>
              <LiquidIconButton
                icon="close"
                size={38}
                iconSize={16}
                iconColor="#FFFFFF"
                tint="dark"
                intensity={70}
                onPress={handleClose}
                accessibilityLabel="Fechar pesquisa"
              />

              <View style={styles.searchBar}>
                <FontAwesome name="search" size={14} color="rgba(255,255,255,0.38)" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Pesquisar matérias…"
                  placeholderTextColor="rgba(255,255,255,0.32)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  clearButtonMode="while-editing"
                  returnKeyType="search"
                  autoCorrect={false}
                  autoCapitalize="none"
                  autoFocus
                />
              </View>
            </View>

          </View>
          {/* Bottom separator */}
          <View style={styles.headerSep} />
        </GlassView>
      </View>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: {
    ...StyleSheet.absoluteFill,
    flex:            1,
    backgroundColor: "#0A0A0A",
    zIndex:          100,
  },
  listContent: {
    backgroundColor: "#0A0A0A",
  },

  // ── Fixed header ──────────────────────────────────────────────────────────
  fixedHeader: {
    position: "absolute",
    top:      0,
    left:     0,
    right:    0,
    zIndex:   60,
  },
  headerGlass: {
    // GlassView fills from top:0
  },
  headerSep: {
    height:          StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  // ── Search bar ────────────────────────────────────────────────────────────
  searchRow: {
    flexDirection:    "row",
    alignItems:       "center",
    paddingHorizontal: 12,
    paddingTop:        10,
    paddingBottom:     6,
    gap:              10,
  },
  searchBar: {
    flex:              1,
    flexDirection:     "row",
    alignItems:        "center",
    gap:               8,
    height:            38,
    borderRadius:      25,
    backgroundColor:   "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
  },
  searchInput: {
    flex:          1,
    fontSize:      15,
    color:         "#FFFFFF",
    letterSpacing: 0.2,
    paddingVertical: 0,
  },

  // ── Grid ──────────────────────────────────────────────────────────────────
  tripleRow: {
    flexDirection: "row",
    gap:           GAP,
  },
  cell: {
    overflow:        "hidden",
    backgroundColor: "#1C1C1E",
  },
  cellPh: {
    backgroundColor: "#2C2C2E",
  },

  // ── Featured overlay ──────────────────────────────────────────────────────
  featuredScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  featuredGlass: {
    position:          "absolute",
    bottom:            0,
    left:              0,
    right:             0,
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
    backgroundColor:   "#0A0A0A",
    borderTopWidth:    StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor:       "rgba(255,255,255,0.06)",
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
    color:         "rgba(255,255,255,0.4)",
    letterSpacing: 0.5,
    textAlign:     "center",
  },
});