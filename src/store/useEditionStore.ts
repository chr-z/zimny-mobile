/**
 * useEditionStore — cache em memória + hook para a lista de edições.
 *
 * Zero-wait routing: getCachedEditionById() lê do cache sem React,
 * permitindo que magazine/[id].tsx injete o array pages no PagerView
 * instantaneamente quando o utilizador vem da estante.
 *
 * Deduplicação: se dois componentes montarem ao mesmo tempo,
 * apenas um fetch é feito; o segundo aguarda a mesma Promise.
 *
 * Fallback: se a API falhar, usa os dados mockados de MAGAZINE_EDITIONS.
 */
import { useCallback, useEffect, useRef, useState } from "react";

import { MAGAZINE_EDITIONS } from "@/src/constants/magazineEditions";
import {
  fetchEditions,
  type MagazineEdition,
} from "@/src/services/api";

// ─── Fallback mock data ────────────────────────────────────────────────────────

function mapMockToEdition(mock: typeof MAGAZINE_EDITIONS[number]): MagazineEdition {
  return {
    id:         mock.id,
    number:     mock.number,
    title:      mock.title,
    tagline:    mock.tagline,
    coverImage: mock.coverUrl,
  };
}

const FALLBACK_EDITIONS: MagazineEdition[] = MAGAZINE_EDITIONS.map(mapMockToEdition);

// ─── Module-level cache (sobrevive a re-mounts) ───────────────────────────────

let _cache: MagazineEdition[] | null = null;
let _pending: Promise<MagazineEdition[]> | null = null;

// ─── Cache readers (zero-wait, sem React) ─────────────────────────────────────

export function getCachedEditions(): MagazineEdition[] | null {
  return _cache;
}

export function getCachedEditionById(
  id: string | number
): MagazineEdition | undefined {
  return _cache?.find((e) => String(e.id) === String(id));
}

// ─── Internal fetch with deduplication ───────────────────────────────────────

async function loadEditions(force = false): Promise<MagazineEdition[]> {
  if (_cache && !force) return _cache;

  // Reuse in-flight request to avoid duplicate fetches on concurrent mounts
  if (!_pending || force) {
    _pending = fetchEditions().then((data) => {
      _cache = data;
      _pending = null;
      return data;
    }).catch((err) => {
      // Fallback para dados mockados se a API falhar
      console.warn("Editions API failed, using mock data:", err);
      _cache = FALLBACK_EDITIONS;
      _pending = null;
      return _cache;
    });
  }

  return _pending;
}

// ─── React hook ───────────────────────────────────────────────────────────────

type State = {
  editions: MagazineEdition[];
  loading: boolean;
  error: Error | null;
};

/**
 * Hook para a estante de edições (two.tsx).
 * Retorna dados do cache imediatamente se disponíveis; caso contrário faz fetch.
 */
export function useEditionStore() {
  const [state, setState] = useState<State>(() => ({
    editions: _cache ?? [],
    loading: _cache === null,
    error: null,
  }));

  const mounted = useRef(false);

  const load = useCallback(async (force = false) => {
    if (_cache && !force) {
      setState({ editions: _cache, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await loadEditions(force);
      if (mounted.current) {
        setState({ editions: data, loading: false, error: null });
      }
    } catch (e) {
      if (mounted.current) {
        setState((s) => ({
          ...s,
          loading: false,
          error: e instanceof Error ? e : new Error(String(e)),
        }));
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { ...state, refresh };
}
