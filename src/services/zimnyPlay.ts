/**
 * Zimny Play — Service
 *
 * Busca vídeos verticais 9:16 e o layout da Home a partir dos endpoints nativos do WordPress.
 *
 * Endpoints:
 *   GET https://zimnymagazine.com/wp-json/zimny/v1/videos
 *   GET https://zimnymagazine.com/wp-json/zimny/v1/home-layout
 *
 * Parâmetros (videos):
 *   ?carousel=home-capa   — Filtra por carrossel específico
 *   ?limit=10             — Quantidade de vídeos
 */
import { ZIMNY_ORIGIN, zimnyFetchJson } from "@/src/services/api";

// ─── Types ─────────────────────────────────────────────────────────────────

export type ZimnyPlayVideo = {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
  carousels: Array<{ id: number; name: string; slug: string }>;
  order: number;
  created_at: string;
};

export type FetchZimnyPlayParams = {
  /** Taxonomy slug to filter by carousel (e.g., "home-capa") */
  carousel?: string;
  /** Max number of videos to return (default: 30, max: 50) */
  limit?: number;
};

/** A single section in the home layout */
export type HomeLayoutSection = {
  type: "hero_banner" | "acervo_carousel" | "colunistas_carousel" | "colunista_dia" | "ad_block" | "journal_section" | "instagram_feed" | "video_carousel" | "home_featured_videos" | "events_carousel" | "events_more_button" | "marketing_plans_carousel" | "anuncie_card_v1" | "anuncie_card_v2" | "anuncie_card_v3" | "anuncie_card_v4" | "podcast_grid" | "cobertura_grid" | "eventos_grid";
  slug: string;
  /** Human-readable title */
  title: string;
  /** Whether this section is visible on the home screen */
  visible: boolean;
  /** Whether to show the title on the home screen (configurable via plugin layout) */
  show_title?: boolean;
  /** Only present for video_carousel type — the taxonomy term ID */
  term_id?: number;
  /** Top padding in px (configurable via plugin layout) */
  padding_top?: number;
  /** Bottom padding in px (configurable via plugin layout) */
  padding_bottom?: number;
};

// ─── Constants ─────────────────────────────────────────────────────────────

const VIDEOS_ENDPOINT = `${ZIMNY_ORIGIN}/wp-json/zimny/v1/videos`;
const HOME_LAYOUT_ENDPOINT = `${ZIMNY_ORIGIN}/wp-json/zimny/v1/home-layout`;

// ─── Fetch Videos ──────────────────────────────────────────────────────────

/**
 * Busca a lista de vídeos do Zimny Play.
 *
 * @param params - Opções de filtro (carrossel, limite)
 * @returns Array de vídeos tipados
 */
export async function fetchZimnyPlayVideos(
  params: FetchZimnyPlayParams = {}
): Promise<ZimnyPlayVideo[]> {
  const search = new URLSearchParams();

  if (params.carousel) {
    search.set("carousel", params.carousel);
  }
  if (params.limit != null) {
    search.set("limit", String(Math.min(50, Math.max(1, params.limit))));
  }

  const queryString = search.toString();
  const url = queryString
    ? `${VIDEOS_ENDPOINT}?${queryString}`
    : VIDEOS_ENDPOINT;

  console.log(`[ZimnyPlay] Fetching videos: ${url}`);

  const data = await zimnyFetchJson<ZimnyPlayVideo[]>(url);
  console.log(`[ZimnyPlay] Videos loaded: ${data.length}`);
  return data;
}

/**
 * Pré-carrega os vídeos silenciosamente (ex: na inicialização do app).
 */
export function prefetchZimnyPlayVideos(carousel?: string): void {
  const search = carousel ? `?carousel=${encodeURIComponent(carousel)}` : "";
  fetch(`${VIDEOS_ENDPOINT}${search}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  }).catch(() => {
    // Silently fail
  });
}

// ─── Fetch Splash Videos ──────────────────────────────────────────────────

export type SplashVideo = {
  id: string;
  video_url: string;
  thumbnail_url: string;
};

/**
 * Busca os vídeos selecionados para o Splash Player (PiP na Home).
 * Retorna em ordem aleatória (shuffle feito no servidor).
 */
export async function fetchSplashVideos(): Promise<SplashVideo[]> {
  const url = `${ZIMNY_ORIGIN}/wp-json/zimny/v1/splash-videos`;
  console.log(`[ZimnyPlay] Fetching splash videos: ${url}`);
  const data = await zimnyFetchJson<SplashVideo[]>(url);
  console.log(`[ZimnyPlay] Splash videos loaded: ${data.length}`);
  return data;
}

// ─── Fetch Home Layout ─────────────────────────────────────────────────────

/**
 * Busca o layout ordenado da Home do app.
 * A ordem dos itens define a sequência de renderização das seções na tela inicial.
 *
 * @returns Array de seções do layout, na ordem definida no painel admin
 */
export async function fetchHomeLayout(): Promise<HomeLayoutSection[]> {
  console.log(`[ZimnyPlay] Fetching home layout: ${HOME_LAYOUT_ENDPOINT}`);
  const data = await zimnyFetchJson<HomeLayoutSection[]>(HOME_LAYOUT_ENDPOINT);
  console.log(`[ZimnyPlay] Home layout loaded: ${data.length} sections`);
  return data;
}

/**
 * Pré-carrega o layout da Home silenciosamente.
 */
export function prefetchHomeLayout(): void {
  fetch(HOME_LAYOUT_ENDPOINT, {
    method: "GET",
    headers: { Accept: "application/json" },
  }).catch(() => {
    // Silently fail
  });
}

// ─── Fetch Home Featured Videos ────────────────────────────────────────────

export type HomeFeaturedVideo = {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
  order: number;
  created_at: string;
};

/**
 * Busca os vídeos selecionados como "Vídeos em Destaque da Home".
 * Retorna em ordem crescente (campo "order"), depois por data decrescente.
 *
 * GET /wp-json/zimny/v1/home-featured-videos
 */
export async function fetchHomeFeaturedVideos(): Promise<HomeFeaturedVideo[]> {
  const url = `${ZIMNY_ORIGIN}/wp-json/zimny/v1/home-featured-videos`;
  console.log(`[ZimnyPlay] Fetching home featured videos: ${url}`);
  const data = await zimnyFetchJson<HomeFeaturedVideo[]>(url);
  console.log(`[ZimnyPlay] Home featured videos loaded: ${data.length}`);
  return data;
}

// ─── Marketing Plans ────────────────────────────────────────────────────────

export type MarketingPlan = {
  id: string;
  image_url: string;
  image_id: number;
  title: string;
  link: string;
};

const MARKETING_PLANS_ENDPOINT = `${ZIMNY_ORIGIN}/wp-json/zimny/v1/marketing-plans`;

/**
 * Busca as imagens dos planos de marketing digital para o carrossel da Home.
 * Retorna na ordem definida no painel admin.
 */
export async function fetchMarketingPlans(): Promise<MarketingPlan[]> {
  console.log(`[ZimnyPlay] Fetching marketing plans: ${MARKETING_PLANS_ENDPOINT}`);
  const data = await zimnyFetchJson<MarketingPlan[]>(MARKETING_PLANS_ENDPOINT);
  console.log(`[ZimnyPlay] Marketing plans loaded: ${data.length}`);
  return data;
}

// ─── Colunistas Config ─────────────────────────────────────────────────────

export type Colunista = {
  id: number;
  name: string;
  slug: string;
  description: string;
  avatar_url: string;
  bg_image_url?: string;
  profile_image_url?: string;
  order: number;
  visible: boolean;
  clickable: boolean;
  post_count: number;
};

export type ColunistasConfig = {
  day_assignments: Record<number, number>;
  column_names: Record<number, string>;
  column_colors: Record<number, string>;
  instagram_handles: Record<number, string>;
  today: {
    day_number: number;
    colunista_id: number;
    colunista: Colunista;
  } | null;
};

const COLUNISTAS_CONFIG_ENDPOINT = `${ZIMNY_ORIGIN}/wp-json/zimny/v1/colunistas-config`;

/**
 * Busca a configuração dos colunistas (day assignments, column names, today's columnist).
 * GET /wp-json/zimny/v1/colunistas-config
 */
export async function fetchColunistasConfig(): Promise<ColunistasConfig> {
  const url = `${COLUNISTAS_CONFIG_ENDPOINT}?_t=${Date.now()}`;
  console.log(`[ZimnyPlay] Fetching colunistas config: ${url}`);
  const data = await zimnyFetchJson<ColunistasConfig>(url);
  console.log(`[ZimnyPlay] Colunistas config loaded:`, JSON.stringify(data));
  return data;
}

// ─── Anuncie Conosco Cards ──────────────────────────────────────────────────

export type AnuncieCard = {
  id: string;
  image_url: string;
  image_id: number;
  variant: number;
  variant_label: string;
  title: string;
  description: string;
  cta_text: string;
  cta_link: string;
};

const ANUNCIE_CARDS_ENDPOINT = `${ZIMNY_ORIGIN}/wp-json/zimny/v1/anuncie-cards`;

/**
 * Busca os cards "Anuncie Conosco" configurados no painel admin.
 * Retorna na ordem definida no painel.
 *
 * GET /wp-json/zimny/v1/anuncie-cards
 */
export async function fetchAnuncieCards(): Promise<AnuncieCard[]> {
  const url = `${ANUNCIE_CARDS_ENDPOINT}?_t=${Date.now()}`;
  console.log(`[ZimnyPlay] Fetching anuncie cards: ${url}`);
  const data = await zimnyFetchJson<AnuncieCard[]>(url);
  console.log(`[ZimnyPlay] Anuncie cards loaded: ${data.length}`);
  return data;
}