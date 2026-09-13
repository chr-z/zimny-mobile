import { useCallback, useEffect, useRef, useState } from "react";

import { fetchPostsByCategory, type WPPost } from "@/src/services/api";
import { cachePosts } from "@/src/store/postCache";
import {
  cacheCategoryPosts,
  getCachedCategoryPosts,
  isCategoryCached,
} from "@/src/store/prefetchCache";

type State = {
  posts: WPPost[];
  loading: boolean;
  error: Error | null;
};

/**
 * Carrega posts de uma categoria específica.
 *
 * Cache-first: se o prefetchCache já tiver dados para esta categoria,
 * retorna imediatamente sem loading. Depois faz um fetch silencioso em
 * background para atualizar (se o cache tiver vindo do pré-carregamento).
 *
 * Suporta refresh manual via `refresh()`.
 * Aborta requisições anteriores para evitar race conditions.
 */
export function useCategoryPosts(categoryId: number, perPage = 10) {
  const [state, setState] = useState<State>(() => {
    // Cache-first: se já foi pré-carregado, usa na hora
    const cached = getCachedCategoryPosts(categoryId);
    if (cached) {
      return { posts: cached, loading: false, error: null };
    }
    return { posts: [], loading: true, error: null };
  });

  const abortRef = useRef<AbortController | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, []);

  const load = useCallback(
    async (isRefresh = false) => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (!isRefresh && !isCategoryCached(categoryId)) {
        setState((prev) => ({ ...prev, loading: true, error: null }));
      }

      try {
        const posts = await fetchPostsByCategory(categoryId, perPage);
        if (controller.signal.aborted) return;

        cachePosts(posts);
        cacheCategoryPosts(categoryId, posts);
        fetchedRef.current = true;
        setState({ posts, loading: false, error: null });
      } catch (e) {
        if (controller.signal.aborted) return;

        // Requisição compartilhada cancelada por outro caller (dedupe/prefetch):
        // não é erro real — tenta de novo em breve em vez de mostrar erro.
        if (e instanceof Error && e.name === "AbortError") {
          if (retryTimerRef.current) {
            clearTimeout(retryTimerRef.current);
          }
          retryTimerRef.current = setTimeout(() => {
            retryTimerRef.current = null;
            if (abortRef.current?.signal.aborted) return;
            load(true);
          }, 1500);
          return;
        }

        // Se já temos dados do cache, não sobrescreve com erro
        if (state.posts.length > 0) return;

        setState({
          posts: [],
          loading: false,
          error: e instanceof Error ? e : new Error(String(e)),
        });
      }
    },
    [categoryId, perPage, state.posts.length]
  );

  useEffect(() => {
    // Só faz fetch se não tiver sido pré-carregado
    if (!fetchedRef.current && !isCategoryCached(categoryId)) {
      load();
    }
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const refresh = useCallback(async () => {
    await load(true);
  }, [load]);

  return { ...state, refresh };
}
