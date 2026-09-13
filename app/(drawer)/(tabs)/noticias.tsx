/**
 * Notícias — Estilo Globo/G1 + Apple News
 *
 * Layout:
 * - Header compacto com navegação
 * - 1 destaque no topo (post mais recente entre as subcategorias)
 * - 7 seções, UMA POR SUBCATEGORIA (fetch dedicado por subcategoria),
 *   cada uma com até 4 posts em row horizontal (thumb + título + data)
 * - Nunca mistura conteúdo de colunistas aqui
 *
 * Subcategorias de notícias (WP category=4, filhas):
 *   206 New England | 207 Brasileiros | 208 Mundo
 *   209 Cultura     | 210 Business   | 211 Ciência & Tecnologia | 212 Esportes
 *
 * Fetch individual por subcategoria (per_page=5) garante seção sempre
 * populada mesmo quando uma editoria domina a produção (ex.: New England).
 * O destaque é excluído da própria seção para não repetir o card grande.
 */

import { useTranslation } from "@/src/i18n";
import type { TranslationKey } from "@/src/i18n/types";
import Feather from "@expo/vector-icons/Feather";
import { DrawerActions } from "expo-router/build/react-navigation/routers";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState } from "@/src/components/common/ErrorState";
import { CompactHeader } from "@/src/components/home/CompactHeader";
import { HEADER_COMPACT_H } from "@/src/components/home/SmartHeader";
import {
  formatNewsDate,
  NewsFeaturedCard,
} from "@/src/components/news/newsBits";
import { CATEGORY_COLORS } from "@/src/constants/newsSections";
import { useCategoryPosts } from "@/src/hooks/useCategoryPosts";
import {
  getFeaturedImageUrl,
  postTitlePlain,
  type WPPost,
} from "@/src/services/api";

/** Busca 5 por subcategoria: 4 exibidos + 1 reserva p/ excluir o destaque. */
const PER_SECTION = 5;

type SectionSource = {
  id: number;
  labelKey: TranslationKey;
  posts: WPPost[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

// ─── Destaque ────────────────────────────────────────────────────────────────

// ─── Card de post (formato horizontal: thumb + texto) ─────────────────────────

function PostRowItem({ post }: { post: WPPost }) {
  const router = useRouter();
  const { language } = useTranslation();
  const uri = getFeaturedImageUrl(post);
  const title = postTitlePlain(post);
  const date = formatNewsDate((post as { date?: string }).date, language);

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/post/[id]", params: { id: String(post.id) } })
      }
      android_ripple={{ color: "rgba(255,255,255,0.08)" }}
      style={styles.rowItem}
    >
      <View style={styles.rowThumbWrap}>
        {uri ? (
          <Image
            source={{ uri }}
            style={styles.rowThumb}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={160}
          />
        ) : (
          <View style={[styles.rowThumb, styles.thumbPh]} />
        )}
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={3}>
          {title}
        </Text>
        {date !== "" && <Text style={styles.rowMeta}>{date}</Text>}
      </View>
    </Pressable>
  );
}

// ─── Seção por subcategoria ─────────────────────────────────────────────────

function CategorySection({
  categoryId,
  label,
  color,
  posts,
  onSeeAll,
}: {
  categoryId: number;
  label: string;
  color: string;
  posts: WPPost[];
  onSeeAll?: () => void;
}) {
  const { t } = useTranslation();
  if (posts.length === 0) return null;

  return (
    <View style={styles.section}>
      {/* Header da seção — identidade visual da editoria */}
      <View style={styles.sectionHead}>
        <View style={[styles.sectionDot, { backgroundColor: color }]} />
        <Text style={[styles.sectionLabel, { color }]} numberOfLines={1}>
          {label}
        </Text>
        <View style={styles.sectionRule} />
        {onSeeAll && (
          <Pressable
            onPress={onSeeAll}
            hitSlop={8}
            style={({ pressed }) => [
              styles.seeAllBtn,
              pressed && styles.seeAllBtnPressed,
            ]}
          >
            <Text style={[styles.seeAllText, { color }]}>
              {t("common.ver_mais")}
            </Text>
            <View style={styles.seeAllChevronWrap}>
              <Feather
                name="chevron-right"
                size={11}
                color={color}
              />
            </View>
          </Pressable>
        )}
      </View>

      {/* Posts em row horizontal — FlashList mais leve */}
      <FlashList
        data={posts}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionListContent}
        keyExtractor={(item) => `section-${categoryId}-${item.id}`}
        renderItem={({ item }) => <PostRowItem post={item} />}
      />
    </View>
  );
}

// ─── Carrossel de destaques (uma editoria por slide) ─────────────────────────

type FeaturedSlide = {
  post: WPPost;
  kicker: string;
  color: string;
};

const AUTOPLAY_MS = 5000;

function FeaturedCarousel({ slides }: { slides: FeaturedSlide[] }) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(0);
  const draggingRef = useRef(false);
  const [active, setActive] = useState(0);

  // Clone do primeiro slide no fim: ao passar do último pro "clone", o
  // onMomentumScrollEnd "teleporta" pro índice 0 sem animação — parece infinito.
  const items = slides.length > 1 ? [...slides, slides[0]] : slides;

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      if (draggingRef.current) return;
      const next = indexRef.current + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [items.length, width]);

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      draggingRef.current = false;
      let idx = Math.round(e.nativeEvent.contentOffset.x / width);
      if (items.length > 1 && idx >= items.length - 1) {
        // Chegou no clone do primeiro — volta pro índice 0 sem pular visualmente.
        scrollRef.current?.scrollTo({ x: 0, animated: false });
        idx = 0;
      }
      indexRef.current = idx;
      setActive(idx);
    },
    [items.length, width]
  );

  if (slides.length === 0) return null;

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => {
          draggingRef.current = true;
        }}
        onMomentumScrollEnd={onMomentumEnd}
      >
        {items.map((s, i) => (
          <View
            key={`${s.post.id}-${i}`}
            style={{ width }}
          >
            <View style={styles.featureSlideCard}>
              <NewsFeaturedCard post={s.post} kicker={s.kicker} color={s.color} />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Indicador de posição (dots) — ativo na cor da editoria em foco */}
      <View style={styles.featureDots}>
        {slides.map((s, i) => (
          <View
            key={`${s.post.id}-dot-${i}`}
            style={[
              styles.featureDot,
              i === active && {
                width: 18,
                backgroundColor: slides[active]?.color ?? "#C9A84C",
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function NoticiasScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const { t } = useTranslation();

  // Fetch dedicado por subcategoria — seção sempre populada (4 cards).
  const sec206 = useCategoryPosts(206, PER_SECTION);
  const sec207 = useCategoryPosts(207, PER_SECTION);
  const sec208 = useCategoryPosts(208, PER_SECTION);
  const sec209 = useCategoryPosts(209, PER_SECTION);
  const sec210 = useCategoryPosts(210, PER_SECTION);
  const sec211 = useCategoryPosts(211, PER_SECTION);
  const sec212 = useCategoryPosts(212, PER_SECTION);
  const [refreshing, setRefreshing] = useState(false);

  const sources: SectionSource[] = useMemo(
    () => [
      { id: 206, labelKey: "news.cat_206", ...sec206 },
      { id: 207, labelKey: "news.cat_207", ...sec207 },
      { id: 208, labelKey: "news.cat_208", ...sec208 },
      { id: 209, labelKey: "news.cat_209", ...sec209 },
      { id: 210, labelKey: "news.cat_210", ...sec210 },
      { id: 211, labelKey: "news.cat_211", ...sec211 },
      { id: 212, labelKey: "news.cat_212", ...sec212 },
    ],
    [sec206, sec207, sec208, sec209, sec210, sec211, sec212]
  );

  // Destaques do carrossel: o post mais recente de CADA editoria, na ordem
  // das seções (o mais novo de cada uma alimenta um slide).
  const featuredSlides = useMemo<FeaturedSlide[]>(() => {
    const slides: FeaturedSlide[] = [];
    for (const s of sources) {
      const first = s.posts[0];
      if (!first) continue;
      slides.push({
        post: first,
        kicker: t(s.labelKey),
        color: CATEGORY_COLORS[s.id],
      });
    }
    return slides;
  }, [sources, t]);

  const anyData = sources.some((s) => s.posts.length > 0);
  const initialLoading = !anyData && sources.some((s) => s.loading);
  const fatalError = !anyData && sources.some((s) => s.error !== null);

  const openDrawer = () => {
    navigation.getParent()?.dispatch(DrawerActions.openDrawer());
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all(sources.map((s) => s.refresh()));
    setRefreshing(false);
  }, [sources]);

  return (
    <View style={styles.shell}>
      <CompactHeader onOpenDrawer={openDrawer} insetTop={insets.top} />

      <View style={{ flex: 1, paddingTop: insets.top + HEADER_COMPACT_H }}>
        {initialLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="rgba(255,255,255,0.25)" />
          </View>
        ) : fatalError ? (
          <ErrorState
            title={t("news.indisponivel_titulo")}
            message={t("news.indisponivel_msg")}
            onRetry={onRefresh}
          />
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="rgba(255,255,255,0.25)"
                colors={["rgba(255,255,255,0.25)"]}
                progressBackgroundColor="#1C1C1E"
              />
            }
          >
            {/* Carrossel de destaques — um slide por editoria, autoplay 5s */}
            <FeaturedCarousel slides={featuredSlides} />

            {/* Seções por subcategoria (o 1º post de cada uma já está no
                carrossel, então a seção começa do 2º) */}
            {sources.map((s) => (
              <CategorySection
                key={s.id}
                categoryId={s.id}
                label={t(s.labelKey)}
                color={CATEGORY_COLORS[s.id]}
                posts={s.posts.slice(1, 5)}
                onSeeAll={() =>
                  router.push({
                    pathname: "/category/[id]",
                    params: { id: String(s.id), title: t(s.labelKey) },
                  })
                }
              />
            ))}

            {/* Espaçamento no final */}
            <View style={{ height: 28 }} />
          </ScrollView>
        )}
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  // ── Carrossel de destaques ───────────────────────────────────────────────
  featureSlideCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    overflow: "hidden",
    height: 280,
    backgroundColor: "#1C1C1E",
  },
  featureDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  featureDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  // ── Seção ────────────────────────────────────────────────────────────────
  section: {
    marginTop: 20,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  sectionDot: {
    width: 7,
    height: 7,
    borderRadius: 2,
    backgroundColor: "#C9A84C",
    flexShrink: 0,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "700",
    flexShrink: 1,
  },
  sectionRule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 4,
    paddingLeft: 10,
    flexShrink: 0,
  },
  seeAllBtnPressed: {
    opacity: 0.5,
  },
  seeAllText: {
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  seeAllChevronWrap: {
    width: 13,
    height: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  sectionListContent: {
    paddingHorizontal: 16,
    gap: 12,
  },

  // ── Row item (thumb + texto) ────────────────────────────────────────────
  rowItem: {
    width: 170,
    marginRight: 12,
  },
  rowThumbWrap: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 7,
  },
  rowThumb: {
    width: 170,
    height: 104,
    borderRadius: 10,
    backgroundColor: "#1C1C1E",
  },
  thumbPh: {
    backgroundColor: "#2C2C2E",
  },
  rowText: {
    paddingHorizontal: 1,
  },
  rowTitle: {
    fontFamily: "Georgia",
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.15,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  rowMeta: {
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#8E8E93",
  },
});
