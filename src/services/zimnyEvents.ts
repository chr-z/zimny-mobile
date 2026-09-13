/**
 * Zimny Events — Service
 *
 * Busca eventos e galerias de mídia a partir dos endpoints nativos do WordPress.
 *
 * Endpoints:
 *   GET https://zimnymagazine.com/wp-json/zimny/v1/events
 *   GET https://zimnymagazine.com/wp-json/zimny/v1/events/{id}/media
 *
 * Parâmetros (events):
 *   ?category=producao|cobertura  — Filtra por categoria
 *   ?limit=20                     — Quantidade de eventos
 *   ?home=true                    — Apenas eventos selecionados para a Home
 */
import { ZIMNY_ORIGIN, zimnyFetchJson } from "@/src/services/api";

// ─── Types ─────────────────────────────────────────────────────────────────

export type EventMediaItem = {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnail: string;
  title: string;
  orientation: "portrait" | "landscape" | "square";
  is_featured: boolean;
  /** Whether this item is marked as "Cobertura" (coverage) video */
  is_cobertura?: boolean;
  width: number;
  height: number;
};

export type ZimnyEvent = {
  id: string;
  title: string;
  content: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  category: "producao" | "cobertura";
  date: string;
  order: number;
  home_order: number;
  show_on_home: boolean;
  featured_media: EventMediaItem | null;
  media_count: number;
  created_at: string;
};

export type FetchEventsParams = {
  /** Filter by category slug */
  category?: "producao" | "cobertura";
  /** Max number of events to return */
  limit?: number;
  /** Only return events selected for home carousel */
  home?: boolean;
};

// ─── Constants ─────────────────────────────────────────────────────────────

const EVENTS_ENDPOINT = `${ZIMNY_ORIGIN}/wp-json/zimny/v1/events`;

// ─── Fetch Events ──────────────────────────────────────────────────────────

/**
 * Busca a lista de eventos do WordPress.
 *
 * @param params - Opções de filtro (categoria, limite, home)
 * @returns Array de eventos tipados
 */
export async function fetchEvents(
  params: FetchEventsParams = {}
): Promise<ZimnyEvent[]> {
  const search = new URLSearchParams();

  if (params.category) {
    search.set("category", params.category);
  }
  if (params.limit != null) {
    search.set("limit", String(Math.min(50, Math.max(1, params.limit))));
  }
  if (params.home) {
    search.set("home", "true");
  }

  const queryString = search.toString();
  const url = queryString
    ? `${EVENTS_ENDPOINT}?${queryString}`
    : EVENTS_ENDPOINT;

  console.log(`[ZimnyEvents] Fetching events: ${url}`);
  const data = await zimnyFetchJson<ZimnyEvent[]>(url);
  console.log(`[ZimnyEvents] Events loaded: ${data.length}`);
  return data;
}

// ─── Fetch Event Media ─────────────────────────────────────────────────────

/**
 * Busca a galeria completa de mídia de um evento específico.
 *
 * @param eventId - ID do evento
 * @returns Array de itens de mídia
 */
export async function fetchEventMedia(
  eventId: string
): Promise<EventMediaItem[]> {
  const url = `${EVENTS_ENDPOINT}/${eventId}/media`;

  console.log(`[ZimnyEvents] Fetching event media: ${url}`);
  const data = await zimnyFetchJson<EventMediaItem[]>(url);
  console.log(`[ZimnyEvents] Event media loaded: ${data.length} items`);
  return data;
}

// ─── Fetch Home Events ─────────────────────────────────────────────────────

/**
 * Busca os eventos selecionados para o carrossel da Home.
 * Atalho para fetchEvents({ home: true }).
 */
export async function fetchHomeEvents(): Promise<ZimnyEvent[]> {
  return fetchEvents({ home: true });
}

// ─── Prefetch ──────────────────────────────────────────────────────────────

/**
 * Pré-carrega os eventos silenciosamente (ex: na inicialização do app).
 */
export function prefetchEvents(category?: string): void {
  const search = category ? `?category=${encodeURIComponent(category)}` : "";
  fetch(`${EVENTS_ENDPOINT}${search}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  }).catch(() => {
    // Silently fail
  });
}