/**
 * useYoutubePlaylist — Hook para buscar vídeos da playlist do YouTube (Podcast).
 *
 * Tenta primeiro o endpoint WordPress; se falhar, usa YouTube Data API direta.
 */
import { useCallback, useEffect, useState } from "react";

import {
    fetchPodcastVideos,
    type YouTubePlaylistItem,
} from "@/src/services/youtubePlaylist";

// ─── Types ─────────────────────────────────────────────────────────────────

type UseYoutubePlaylistReturn = {
  videos: YouTubePlaylistItem[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useYoutubePlaylist(
  limit = 50
): UseYoutubePlaylistReturn {
  const [videos, setVideos] = useState<YouTubePlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPodcastVideos({ limit });
      setVideos(data);
    } catch (e) {
      setError(
        e instanceof Error ? e : new Error("Erro ao carregar podcast")
      );
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    videos,
    loading,
    error,
    refresh: load,
  };
}