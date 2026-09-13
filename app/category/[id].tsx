/**
 * CategoryScreen — página de uma editoria, no padrão visual da aba Notícias.
 *
 * Acessada pelo botão "Ver mais" das seções da aba Notícias (editorias
 * 206–212), ou por qualquer link com id + title.
 *
 * Layout (mesmo DNA da aba Notícias):
 * - Header escuro com voltar + nome da editoria
 * - Destaque full-bleed do post mais recente (imagem + scrim + kicker na
 *   cor da editoria) — mesmo componente da aba
 * - Grade limpa 2 colunas com TODOS os posts da editoria (imagem arredondada
 *   + título Georgia + data; sem caixas)
 * - Paginação infinita (per_page=20, page++) até a API esgotar
 * - Pull-to-refresh + ErrorState com retry na primeira carga
 */
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState } from "@/src/components/common/ErrorState";
import { LiquidIconButton } from "@/src/components/common/LiquidIconButton";
import {
  NewsPostCard,
} from "@/src/components/news/newsBits";
import { categoryColor, categoryLabelKey } from "@/src/constants/newsSections";
import { useTranslation } from "@/src/i18n";
import {
  fetchPostsByCategory,
  type WPPost,
} from "@/src/services/api";
import { cacheCategoryPosts, getCachedCategoryPosts } from "@/src/store/prefetchCache";

/** Posts por página da grade (10 linhas de 2 colunas). */
const PER_PAGE = 20;

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function CategoryScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const router = useRouter();
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();

  const categoryId = useMemo(() => Number(id), [id]);
  const isFiniteId = Number.isFinite(categoryId);
  const labelKey = isFiniteId ? categoryLabelKey(categoryId) : undefined;
  const categoryTitle =
    title && title.trim() !== ""
      ? title
      : labelKey
        ? t(labelKey)
        : t("news.categoria_numero", {
            id: isFiniteId ? String(categoryId) : "",
          });
  const accent = isFiniteId ? categoryColor(categoryId) : "#C9A84C";

  const [posts, setPosts] = useState<WPPost[]>(() =>
    isFiniteId ? (getCachedCategoryPosts(categoryId) ?? []) : []
  );
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialError, setInitialError] = useState<Error | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const pageRef = useRef(0);
  const fetchingRef = useRef(false);
  const lastLocaleRef = useRef(language);

  // Fetch de uma página. page=1 substitui a lista; page>1 faz append.
  const fetchPage = useCallback(
    async (page: number, isRefresh = false) => {
      if (fetchingRef.current) return;
      if (!isFiniteId) return;
      fetchingRef.current = true;
      if (page === 1) {
        setInitialError(null);
      } else {
        setLoadMoreError(false);
      }
      try {
        const result = await fetchPostsByCategory(categoryId, PER_PAGE, page);
        const seen = new Set<number>();
        setPosts((prev) => {
          if (page === 1) return result;
          prev.forEach((p) => seen.add(p.id));
          return [...prev, ...result.filter((p) => !seen.has(p.id))];
        });
        if (page === 1) cacheCategoryPosts(categoryId, result);
        pageRef.current = page;
        setHasMore(result.length === PER_PAGE);
      } catch (e) {
        if (page === 1) {
          setInitialError(e instanceof Error ? e : new Error(String(e)));
        } else {
          setLoadMoreError(true);
        }
      } finally {
        fetchingRef.current = false;
        setInitialLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [categoryId, isFiniteId]
  );

  // Primeira carga: cache-first + refresh silencioso em background.
  useEffect(() => {
    if (!isFiniteId) {
      setInitialLoading(false);
      return;
    }
    const cached = getCachedCategoryPosts(categoryId);
    pageRef.current = 0;
    setPosts(cached ?? []);
    setInitialLoading(!cached);
    setInitialError(null);
    setHasMore(true);
    fetchPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  // Quando o idioma muda, os títulos vêm traduzidos do WP — re-busca.
  useEffect(() => {
    if (lastLocaleRef.current !== language) {
      lastLocaleRef.current = language;
      fetchPage(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Rolagem infinita: carrega a próxima página perto do fim.
  const onEndReached = useCallback(() => {
    if (!hasMore || loadMoreError) return;
    setLoadingMore(true);
    fetchPage(pageRef.current + 1);
  }, [fetchPage, hasMore, loadMoreError]);

  const retryLoadMore = useCallback(() => {
    setLoadingMore(true);
    fetchPage(pageRef.current + 1);
  }, [fetchPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPage(1, true);
  }, [fetchPage]);

  // Destaque fica apenas na aba Notícias geral — aqui a lista é a grade
  // com todos os posts da editoria.
  // Grade 2 colunas SEM depender de numColumns (que falha no iOS/RN 0.86):
  // os posts são agrupados em pares e cada linha é renderizada como row.
  const rows = useMemo(() => {
    const out: WPPost[][] = [];
    for (let i = 0; i < posts.length; i += 2) {
      out.push(posts.slice(i, i + 2));
    }
    return out;
  }, [posts]);

  const footer = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="rgba(255,255,255,0.35)" />
        </View>
      );
    }
    if (loadMoreError) {
      return (
        <Pressable
          onPress={retryLoadMore}
          hitSlop={8}
          style={({ pressed }) => [styles.footerRetry, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.footerRetryText}>{t("common.tentar_novamente")}</Text>
        </Pressable>
      );
    }
    return null;
  }, [loadingMore, loadMoreError, retryLoadMore, t]);

  return (
    <View style={styles.shell}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <LiquidIconButton
          icon="arrow-left"
          onPress={() => router.back()}
          accessibilityLabel={t("common.voltar")}
        />
        <View style={styles.headerTitleWrap}>
          <View style={[styles.headerDot, { backgroundColor: accent }]} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {categoryTitle}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Conteúdo */}
      {initialLoading && posts.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="rgba(255,255,255,0.25)" />
        </View>
      ) : initialError && posts.length === 0 ? (
        <ErrorState
          title={t("news.categoria_erro_titulo")}
          message={t("news.categoria_erro_msg")}
          onRetry={onRefresh}
        />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item, i) =>
            `cat-row-${categoryId}-${i}-${item[0]?.id ?? "x"}`
          }
          renderItem={({ item }) => (
            <View style={styles.gridRow}>
              {item.map((post) => (
                <View key={post.id} style={styles.gridCell}>
                  <NewsPostCard post={post} />
                </View>
              ))}
              {item.length === 1 && <View style={styles.gridCell} />}
            </View>
          )}
          ItemSeparatorComponent={RowSeparator}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.6}
          ListFooterComponent={footer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="rgba(255,255,255,0.25)"
              colors={["rgba(255,255,255,0.25)"]}
              progressBackgroundColor="#1C1C1E"
            />
          }
          ListEmptyComponent={
            posts.length === 0 ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>{t("news.categoria_vazia")}</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

function RowSeparator() {
  return <View style={styles.rowSeparator} />;
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerTitleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 2.5,
  },
  headerTitle: {
    fontFamily: "Georgia",
    fontSize: 20,
    color: "#FFFFFF",
    flexShrink: 1,
  },
  headerSpacer: {
    width: 44,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  gridRow: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 16,
  },
  gridCell: {
    flex: 1,
  },
  rowSeparator: {
    height: 22,
  },
  footer: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  footerRetry: {
    paddingVertical: 16,
    alignItems: "center",
  },
  footerRetryText: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontWeight: "700",
    color: "#C9A84C",
  },
  emptyText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
    textAlign: "center",
  },
});
