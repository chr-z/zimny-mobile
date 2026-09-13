/**
 * useColunistasConfig — Hook para buscar a configuração dos colunistas.
 *
 * Fetch de /wp-json/zimny/v1/colunistas-config — endpoint que retorna:
 * - day_assignments: mapeamento dia-da-semana → user_id
 * - column_names: nomes personalizados das colunas
 * - today: colunista do dia atual (calculado no servidor)
 */
import { useCallback, useEffect, useState } from "react";

import {
    fetchColunistasConfig,
    type ColunistasConfig,
} from "@/src/services/zimnyPlay";

type UseColunistasConfigReturn = {
  config: ColunistasConfig | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

export function useColunistasConfig(): UseColunistasConfigReturn {
  const [config, setConfig] = useState<ColunistasConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchColunistasConfig();
      setConfig(data);
    } catch (e) {
      console.warn("Colunistas config API failed:", e);
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

  return { config, loading, error, refresh };
}