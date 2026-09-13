import { useCallback, useEffect, useState } from "react";

import { fetchPosts, type WPPost } from "@/src/services/api";
import { cachePosts } from "@/src/store/postCache";

/**
 * Feed cronológico único (`orderby=date`) para fatiar na home:
 * [0] hero, [1..4] grelha 2×2, [5..] sliders.
 * Todos os posts são escritos no postCache para zero-wait routing.
 */
export function useHomeFeed() {
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const latest = await fetchPosts({
        per_page: 30,
        orderby: "date",
        order: "desc",
      });
      cachePosts(latest);
      setPosts(latest);
    } catch (e) {
      console.warn("Home feed API error:", e);
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { posts, loading, refreshing, error, refresh };
}
