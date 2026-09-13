/**
 * Zimny Coberturas — Service
 *
 * Busca coberturas e mídias a partir dos endpoints nativos do WordPress.
 *
 * Endpoints:
 *   GET https://zimnymagazine.com/wp-json/zimny/v1/coberturas
 *   GET https://zimnymagazine.com/wp-json/zimny/v1/coberturas/{id}/media
 *
 * Parâmetros (coberturas):
 *   ?home=true      — Apenas coberturas selecionadas para a Home
 *   ?approved=true  — Apenas coberturas aprovadas (padrão: true)
 *   ?limit=20       — Quantidade de coberturas
 */
import { ZIMNY_ORIGIN, zimnyFetchJson } from "@/src/services/api";

// ─── Types ─────────────────────────────────────────────────────────────────

export type CoberturaMediaItem = {
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

export type ZimnyCobertura = {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  featured_media: CoberturaMediaItem | null;
  media_count: number;
  show_on_home: boolean;
  home_order: number;
  order: number;
  is_approved: boolean;
  date: string;
  created_at: string;
};

export type FetchCoberturasParams = {
  /** Only return coberturas selected for home grid */
  home?: boolean;
  /** Only return approved coberturas (default: true) */
  approved?: boolean;
  /** Max number of coberturas to return */
  limit?: number;
};

// ─── Constants ─────────────────────────────────────────────────────────────

const COBERTURAS_ENDPOINT = `${ZIMNY_ORIGIN}/wp-json/zimny/v1/coberturas`;

// ─── Fetch Coberturas ──────────────────────────────────────────────────────

/**
 * Busca a lista de coberturas do WordPress.
 *
 * @param params - Opções de filtro (home, approved, limite)
 * @returns Array de coberturas tipadas
 */
export async function fetchCoberturas(
  params: FetchCoberturasParams = {}
): Promise<ZimnyCobertura[]> {
  const search = new URLSearchParams();

  if (params.home) {
    search.set("home", "true");
  }
  if (params.approved !== false) {
    search.set("approved", "true");
  }
  if (params.limit != null) {
    search.set("limit", String(Math.min(50, Math.max(1, params.limit))));
  }

  const queryString = search.toString();
  const url = queryString
    ? `${COBERTURAS_ENDPOINT}?${queryString}`
    : COBERTURAS_ENDPOINT;

  console.log(`[ZimnyCoberturas] Fetching coberturas: ${url}`);
  const data = await zimnyFetchJson<ZimnyCobertura[]>(url);
  console.log(`[ZimnyCoberturas] Coberturas loaded: ${data.length}`);
  return data;
}

// ─── Fetch Cobertura Media ─────────────────────────────────────────────────

/**
 * Busca a mídia completa de uma cobertura específica.
 *
 * @param coberturaId - ID da cobertura
 * @returns Array de itens de mídia
 */
export async function fetchCoberturaMedia(
  coberturaId: string
): Promise<CoberturaMediaItem[]> {
  const url = `${COBERTURAS_ENDPOINT}/${coberturaId}/media`;

  console.log(`[ZimnyCoberturas] Fetching cobertura media: ${url}`);
  const data = await zimnyFetchJson<CoberturaMediaItem[]>(url);
  console.log(`[ZimnyCoberturas] Cobertura media loaded: ${data.length} items`);
  return data;
}

// ─── Fetch Home Coberturas ─────────────────────────────────────────────────

/**
 * Busca as coberturas selecionadas para o grid da Home.
 * Atalho para fetchCoberturas({ home: true }).
 */
export async function fetchHomeCoberturas(): Promise<ZimnyCobertura[]> {
  return fetchCoberturas({ home: true });
}

// ─── Prefetch ──────────────────────────────────────────────────────────────

/**
 * Pré-carrega as coberturas silenciosamente (ex: na inicialização do app).
 */
export function prefetchCoberturas(): void {
  fetch(`${COBERTURAS_ENDPOINT}?approved=true`, {
    method: "GET",
    headers: { Accept: "application/json" },
  }).catch(() => {
    // Silently fail
  });
}