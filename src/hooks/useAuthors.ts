/**
 * useAuthors — Hook para buscar os colunistas via plugin WordPress Zimny Colunistas.
 *
 * Fetch de /wp-json/zimny/v1/colunistas — endpoint que retorna apenas
 * colunistas visíveis, ordenados por ordem de exibição.
 *
 * Se a API falhar, usa dados mockados como fallback.
 */
import { useCallback, useEffect, useState } from "react";

import { fetchColunistas, type Colunista } from "@/src/services/api";

// ─── Mock data para fallback ──────────────────────────────────────────────────

const MOCK_COLUNISTAS: Colunista[] = [
  {
    id: 1,
    name: "Bruno Zimny",
    slug: "brunozimny",
    description: "Editor-chefe e fundador da Zimny Magazine.",
    avatar_url: "https://ui-avatars.com/api/?name=Bruno+Zimny&background=1C1C1E&color=FFFFFF&size=256",
    order: 1,
    visible: true,
    clickable: true,
    post_count: 12,
  },
  {
    id: 2,
    name: "Ana Clara",
    slug: "ana-clara",
    description: "Jornalista especializada em moda e estilo de vida.",
    avatar_url: "https://ui-avatars.com/api/?name=Ana+Clara&background=1C1C1E&color=FFFFFF&size=256",
    order: 2,
    visible: true,
    clickable: true,
    post_count: 8,
  },
  {
    id: 3,
    name: "Lucas Mendes",
    slug: "lucas-mendes",
    description: "Fotógrafo e escritor de viagens e cultura.",
    avatar_url: "https://ui-avatars.com/api/?name=Lucas+Mendes&background=1C1C1E&color=FFFFFF&size=256",
    order: 3,
    visible: true,
    clickable: true,
    post_count: 15,
  },
  {
    id: 4,
    name: "Juliana Costa",
    slug: "juliana-costa",
    description: "Especialista em bem-estar e saúde integrativa.",
    avatar_url: "https://ui-avatars.com/api/?name=Juliana+Costa&background=1C1C1E&color=FFFFFF&size=256",
    order: 4,
    visible: true,
    clickable: true,
    post_count: 6,
  },
];

export function useAuthors() {
  const [authors, setAuthors] = useState<Colunista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchColunistas();
      setAuthors(data);
    } catch (e) {
      console.warn("Colunistas API failed, using mock data:", e);
      setAuthors(MOCK_COLUNISTAS);
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

  return { authors, loading, error, refresh };
}