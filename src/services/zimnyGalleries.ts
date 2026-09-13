/**
 * Zimny Galleries — Service
 *
 * Busca galerias e mídias a partir dos endpoints nativos do WordPress.
 *
 * Endpoints:
 *   GET https://zimnymagazine.com/wp-json/zimny/v1/galleries
 *   GET https://zimnymagazine.com/wp-json/zimny/v1/galleries/{id}/media
 *
 * Parâmetros (galleries):
 *   ?home=true   — Apenas galerias selecionadas para a Home
 *   ?limit=20    — Quantidade de galerias
 */
import { ZIMNY_ORIGIN, zimnyFetchJson } from "@/src/services/api";

// ─── Types ─────────────────────────────────────────────────────────────────

export type GalleryMediaItem = {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnail: string;
  title: string;
  orientation: "portrait" | "landscape" | "square";
  is_featured: boolean;
  width: number;
  height: number;
};

export type ZimnyGallery = {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  featured_media: GalleryMediaItem | null;
  media_count: number;
  show_on_home: boolean;
  home_order: number;
  order: number;
  date: string;
  created_at: string;
};

export type FetchGalleriesParams = {
  /** Only return galleries selected for home grid */
  home?: boolean;
  /** Max number of galleries to return */
  limit?: number;
};

// ─── Constants ─────────────────────────────────────────────────────────────

const GALLERIES_ENDPOINT = `${ZIMNY_ORIGIN}/wp-json/zimny/v1/galleries`;

// ─── Fetch Galleries ───────────────────────────────────────────────────────

/**
 * Busca a lista de galerias do WordPress.
 *
 * @param params - Opções de filtro (home, limite)
 * @returns Array de galerias tipadas
 */
export async function fetchGalleries(
  params: FetchGalleriesParams = {}
): Promise<ZimnyGallery[]> {
  const search = new URLSearchParams();

  if (params.home) {
    search.set("home", "true");
  }
  if (params.limit != null) {
    search.set("limit", String(Math.min(50, Math.max(1, params.limit))));
  }

  const queryString = search.toString();
  const url = queryString
    ? `${GALLERIES_ENDPOINT}?${queryString}`
    : GALLERIES_ENDPOINT;

  console.log(`[ZimnyGalleries] Fetching galleries: ${url}`);
  const data = await zimnyFetchJson<ZimnyGallery[]>(url);
  console.log(`[ZimnyGalleries] Galleries loaded: ${data.length}`);
  return data;
}

// ─── Fetch Gallery Media ───────────────────────────────────────────────────

/**
 * Busca a mídia completa de uma galeria específica.
 *
 * @param galleryId - ID da galeria
 * @returns Array de itens de mídia
 */
export async function fetchGalleryMedia(
  galleryId: string
): Promise<GalleryMediaItem[]> {
  const url = `${GALLERIES_ENDPOINT}/${galleryId}/media`;

  console.log(`[ZimnyGalleries] Fetching gallery media: ${url}`);
  const data = await zimnyFetchJson<GalleryMediaItem[]>(url);
  console.log(`[ZimnyGalleries] Gallery media loaded: ${data.length} items`);
  return data;
}

// ─── Fetch Home Galleries ──────────────────────────────────────────────────

/**
 * Busca as galerias selecionadas para o grid da Home.
 * Atalho para fetchGalleries({ home: true }).
 */
export async function fetchHomeGalleries(): Promise<ZimnyGallery[]> {
  return fetchGalleries({ home: true });
}

// ─── Prefetch ──────────────────────────────────────────────────────────────

/**
 * Pré-carrega as galerias silenciosamente (ex: na inicialização do app).
 */
export function prefetchGalleries(): void {
  fetch(`${GALLERIES_ENDPOINT}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  }).catch(() => {
    // Silently fail
  });
}