/**
 * useZimnyEvents — Hooks para gerenciar estado dos eventos e galerias.
 *
 * Funcionalidades:
 * - Fetch da lista de eventos (com filtro por categoria)
 * - Fetch da galeria de mídia de um evento específico
 * - Fetch dos eventos selecionados para o carrossel da Home
 * - Estados de loading, error e refresh
 */
import { useCallback, useEffect, useState } from "react";

import {
  fetchEventMedia,
  fetchEvents,
  fetchHomeEvents,
  type EventMediaItem,
  type FetchEventsParams,
  type ZimnyEvent,
} from "@/src/services/zimnyEvents";

// ─── useEvents ─────────────────────────────────────────────────────────────

type UseEventsReturn = {
  events: ZimnyEvent[];
  loading: boolean;
  error: Error | null;
  /** Re-fetch events with current parameters */
  refresh: () => Promise<void>;
};

/**
 * Hook para buscar a lista de eventos.
 *
 * @param params - Opções de filtro (categoria, limite)
 */
export function useEvents(
  params: FetchEventsParams = {}
): UseEventsReturn {
  const [events, setEvents] = useState<ZimnyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchEvents(params);
      setEvents(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [params.category, params.limit, params.home]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    events,
    loading,
    error,
    refresh: loadData,
  };
}

// ─── useEventMedia ─────────────────────────────────────────────────────────

type UseEventMediaReturn = {
  media: EventMediaItem[];
  loading: boolean;
  error: Error | null;
  /** Re-fetch the media gallery */
  refresh: () => Promise<void>;
};

/**
 * Hook para buscar a galeria de mídia de um evento específico.
 *
 * @param eventId - ID do evento (string vazia ou null desabilita a busca)
 */
export function useEventMedia(
  eventId: string | null
): UseEventMediaReturn {
  const [media, setMedia] = useState<EventMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    if (!eventId) {
      setMedia([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await fetchEventMedia(eventId);
      setMedia(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

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

// ─── useHomeEvents ─────────────────────────────────────────────────────────

type UseHomeEventsReturn = {
  events: ZimnyEvent[];
  loading: boolean;
  error: Error | null;
  /** Re-fetch home events */
  refresh: () => Promise<void>;
};

/**
 * Hook para buscar os eventos selecionados para o carrossel da Home.
 *
 * A ordenação é definida pelo backend WordPress, que agora aplica a ordem
 * da página "Ordenar Eventos" (drag-and-drop) mesmo para o carrossel da Home.
 */
export function useHomeEvents(): UseHomeEventsReturn {
  const [events, setEvents] = useState<ZimnyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchHomeEvents();
      setEvents(result);
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
    events,
    loading,
    error,
    refresh: loadData,
  };
}