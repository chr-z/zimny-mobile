/**
 * useEditions — Hook para buscar as edições da revista via API WordPress.
 *
 * Fetch da rota /wp-json/zimny/v3/edicoes que retorna as edições
 * no formato MagazineEdition (id, number, title, tagline, coverImage).
 *
 * Se a API falhar, usa os dados mockados de MAGAZINE_EDITIONS como fallback.
 */
import { useCallback, useEffect, useState } from "react";

import { MAGAZINE_EDITIONS } from "@/src/constants/magazineEditions";
import {
  fetchEditions,
  type MagazineEdition,
} from "@/src/services/api";

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

export function useEditions() {
  const [editions, setEditions] = useState<MagazineEdition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchEditions();
      setEditions(data);
    } catch (e) {
      // Fallback para dados mockados se a API falhar
      console.warn("Editions API failed, using mock data:", e);
      setEditions(FALLBACK_EDITIONS);
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
    await load();
  }, [load]);

  return { editions, loading, error, refresh };
}