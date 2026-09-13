/**
 * useZimnyCoberturas — Hooks para gerenciar estado das coberturas.
 *
 * Funcionalidades:
 * - Fetch da lista de coberturas (com filtro home/approved)
 * - Fetch da mídia de uma cobertura específica
 * - Fetch das coberturas selecionadas para o grid da Home
 * - Estados de loading, error e refresh
 */
import { useCallback, useEffect, useState } from "react";

import {
    fetchCoberturaMedia,
    fetchCoberturas,
    fetchHomeCoberturas,
    type CoberturaMediaItem,
    type FetchCoberturasParams,
    type ZimnyCobertura,
} from "@/src/services/zimnyCoberturas";

// ─── useCoberturas ─────────────────────────────────────────────────────────

type UseCoberturasReturn = {
  coberturas: ZimnyCobertura[];
  loading: boolean;
  error: Error | null;
  /** Re-fetch coberturas with current parameters */
  refresh: () => Promise<void>;
};

/**
 * Hook para buscar a lista de coberturas.
 *
 * @param params - Opções de filtro (home, approved, limite)
 */
export function useCoberturas(
  params: FetchCoberturasParams = {}
): UseCoberturasReturn {
  const [coberturas, setCoberturas] = useState<ZimnyCobertura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchCoberturas(params);
      setCoberturas(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [params.home, params.approved, params.limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    coberturas,
    loading,
    error,
    refresh: loadData,
  };
}

// ─── useCoberturaMedia ─────────────────────────────────────────────────────

type UseCoberturaMediaReturn = {
  media: CoberturaMediaItem[];
  loading: boolean;
  error: Error | null;
  /** Re-fetch the media cobertura */
  refresh: () => Promise<void>;
};

/**
 * Hook para buscar a mídia de uma cobertura específica.
 *
 * @param coberturaId - ID da cobertura (string vazia ou null desabilita a busca)
 */
export function useCoberturaMedia(
  coberturaId: string | null
): UseCoberturaMediaReturn {
  const [media, setMedia] = useState<CoberturaMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    if (!coberturaId) {
      setMedia([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await fetchCoberturaMedia(coberturaId);
      setMedia(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [coberturaId]);

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

// ─── useHomeCoberturas ─────────────────────────────────────────────────────

type UseHomeCoberturasReturn = {
  coberturas: ZimnyCobertura[];
  loading: boolean;
  error: Error | null;
  /** Re-fetch home coberturas */
  refresh: () => Promise<void>;
};

/**
 * Hook para buscar as coberturas selecionadas para o grid da Home.
 */
export function useHomeCoberturas(): UseHomeCoberturasReturn {
  const [coberturas, setCoberturas] = useState<ZimnyCobertura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchHomeCoberturas();
      setCoberturas(result);
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
    coberturas,
    loading,
    error,
    refresh: loadData,
  };
}