import { useCallback, useEffect, useState } from "react";

import {
  fetchPosts,
  type WPPost,
} from "@/src/services/api";

/**
 * Posts da capa (WordPress) com estado de carregamento e pull-to-refresh.
 */
export function useZimnyApi(perPage = 20) {
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadPosts = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchPosts({ per_page: perPage });
      setPosts(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, [perPage]);

  const initialLoad = useCallback(async () => {
    setLoading(true);
    await loadPosts();
    setLoading(false);
  }, [loadPosts]);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, [loadPosts]);

  return {
    posts,
    loading,
    refreshing,
    error,
    refresh,
  };
}
