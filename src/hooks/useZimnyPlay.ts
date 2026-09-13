/**
 * useZimnyPlay — Hooks para gerenciar estado dos vídeos e layout do Zimny Play.
 *
 * Funcionalidades:
 * - Fetch dos vídeos verticais 9:16
 * - Fetch do layout ordenado da Home
 * - Suporte a filtro por carrossel (slug)
 * - Estados de loading, error e refresh
 */
import { useCallback, useEffect, useState } from "react";

import {
  fetchHomeFeaturedVideos,
  fetchHomeLayout,
  fetchZimnyPlayVideos,
  type HomeFeaturedVideo,
  type HomeLayoutSection,
  type ZimnyPlayVideo,
} from "@/src/services/zimnyPlay";

// ─── useZimnyPlayVideos ────────────────────────────────────────────────────

type UseZimnyPlayVideosOptions = {
  /** Taxonomy slug to filter by carousel (e.g., "home-capa") */
  carousel?: string;
  /** Max number of videos to return */
  limit?: number;
};

type UseZimnyPlayVideosReturn = {
  videos: ZimnyPlayVideo[];
  loading: boolean;
  error: Error | null;
  /** Re-fetch videos with current parameters */
  refresh: () => Promise<void>;
};

/**
 * Hook para buscar vídeos do Zimny Play.
 */
export function useZimnyPlayVideos(
  options: UseZimnyPlayVideosOptions = {}
): UseZimnyPlayVideosReturn {
  const { carousel, limit } = options;

  const [videos, setVideos] = useState<ZimnyPlayVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchZimnyPlayVideos({ carousel, limit });
      setVideos(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [carousel, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    videos,
    loading,
    error,
    refresh: loadData,
  };
}

// ─── useHomeLayout ─────────────────────────────────────────────────────────

type UseHomeLayoutReturn = {
  layout: HomeLayoutSection[];
  loading: boolean;
  error: Error | null;
  /** Re-fetch the layout */
  refresh: () => Promise<void>;
};

/**
 * Hook para buscar o layout ordenado da Home do app.
 * A ordem dos itens define a sequência de renderização das seções na tela inicial.
 */
export function useHomeLayout(): UseHomeLayoutReturn {
  const [layout, setLayout] = useState<HomeLayoutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchHomeLayout();
      setLayout(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    layout,
    loading,
    error,
    refresh: loadData,
  };
}

// ─── useHomeFeaturedVideos ─────────────────────────────────────────────────

type UseHomeFeaturedVideosReturn = {
  videos: HomeFeaturedVideo[];
  loading: boolean;
  error: Error | null;
  /** Re-fetch featured videos */
  refresh: () => Promise<void>;
};

/**
 * Hook para buscar os vídeos selecionados como "Vídeos em Destaque da Home".
 * Os vídeos retornam ordenados pelo campo "Ordem" (menor primeiro).
 */
export function useHomeFeaturedVideos(): UseHomeFeaturedVideosReturn {
  const [videos, setVideos] = useState<HomeFeaturedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchHomeFeaturedVideos();
      setVideos(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    videos,
    loading,
    error,
    refresh: loadData,
  };
}