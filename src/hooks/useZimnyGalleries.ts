/**
 * useZimnyGalleries — Hooks para gerenciar estado das galerias.
 *
 * Funcionalidades:
 * - Fetch da lista de galerias (com filtro home)
 * - Fetch da mídia de uma galeria específica
 * - Fetch das galerias selecionadas para o grid da Home
 * - Estados de loading, error e refresh
 */
import { useCallback, useEffect, useState } from "react";

import {
    fetchGalleries,
    fetchGalleryMedia,
    fetchHomeGalleries,
    type FetchGalleriesParams,
    type GalleryMediaItem,
    type ZimnyGallery,
} from "@/src/services/zimnyGalleries";

// ─── useGalleries ──────────────────────────────────────────────────────────

type UseGalleriesReturn = {
  galleries: ZimnyGallery[];
  loading: boolean;
  error: Error | null;
  /** Re-fetch galleries with current parameters */
  refresh: () => Promise<void>;
};

/**
 * Hook para buscar a lista de galerias.
 *
 * @param params - Opções de filtro (home, limite)
 */
export function useGalleries(
  params: FetchGalleriesParams = {}
): UseGalleriesReturn {
  const [galleries, setGalleries] = useState<ZimnyGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchGalleries(params);
      setGalleries(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [params.home, params.limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    galleries,
    loading,
    error,
    refresh: loadData,
  };
}

// ─── useGalleryMedia ───────────────────────────────────────────────────────

type UseGalleryMediaReturn = {
  media: GalleryMediaItem[];
  loading: boolean;
  error: Error | null;
  /** Re-fetch the media gallery */
  refresh: () => Promise<void>;
};

/**
 * Hook para buscar a mídia de uma galeria específica.
 *
 * @param galleryId - ID da galeria (string vazia ou null desabilita a busca)
 */
export function useGalleryMedia(
  galleryId: string | null
): UseGalleryMediaReturn {
  const [media, setMedia] = useState<GalleryMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    if (!galleryId) {
      setMedia([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await fetchGalleryMedia(galleryId);
      setMedia(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [galleryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    media,
    loading,
    error,
    refresh: loadData,
  };
}

// ─── useHomeGalleries ──────────────────────────────────────────────────────

type UseHomeGalleriesReturn = {
  galleries: ZimnyGallery[];
  loading: boolean;
  error: Error | null;
  /** Re-fetch home galleries */
  refresh: () => Promise<void>;
};

/**
 * Hook para buscar as galerias selecionadas para o grid da Home.
 */
export function useHomeGalleries(): UseHomeGalleriesReturn {
  const [galleries, setGalleries] = useState<ZimnyGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchHomeGalleries();
      setGalleries(result);
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
    galleries,
    loading,
    error,
    refresh: loadData,
  };
}