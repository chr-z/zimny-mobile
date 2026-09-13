/**
 * Instagram Feed Service
 *
 * Consome o cache REST do WordPress e, quando esse cache estiver antigo,
 * consulta gratuitamente a mesma API pública usada pelo site do Instagram.
 * Nenhuma fonte paga ou credencial secreta é usada pelo aplicativo.
 */

import { ZIMNY_ORIGIN } from "@/src/services/api";
import { getSafeHttpsUrl } from "@/src/utils/security";

// ─── Types ───────────────────────────────────────────────────────────────────

export type InstagramPost = {
  id: string;
  /** URL da imagem (displayUrl, thumbnailUrl ou fallback) */
  imageUrl: string;
  /** URL original do provedor, usada apenas se a URL estável falhar. */
  fallbackImageUrl?: string;
  /** Legenda do post */
  caption: string;
  /** Link para abrir o post no Instagram */
  postUrl: string;
};

// ─── Endpoints ───────────────────────────────────────────────────────────────

/**
 * Endpoint REST do plugin WordPress — fonte primária.
 * Retorna: { posts: [{ id, image_url, caption, likes_count, permalink, timestamp }], cached_at }
 */
const WP_INSTAGRAM_URL = `${ZIMNY_ORIGIN}/wp-json/zimny/v1/instagram`;

const INSTAGRAM_PUBLIC_URL =
  "https://www.instagram.com/api/v1/users/web_profile_info/?username=zimnymagazine";

const TIMEOUT_MS = 12000;
const MAX_POSTS = 8;
const WP_CACHE_MAX_AGE_MS = 2 * 60 * 60 * 1000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchWithTimeout(
  url: string,
  headers: Record<string, string> = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: { Accept: "application/json", ...headers },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Extrai a legenda aceitando string ou objeto { text }. */
function cleanCaption(caption: unknown): string {
  if (typeof caption === "string") return caption;
  if (caption && typeof caption === "object" && "text" in caption) {
    const text = (caption as { text?: unknown }).text;
    return typeof text === "string" ? text : "";
  }
  return "";
}

/**
 * Converte o permalink público do post na rota de mídia do próprio Instagram.
 *
 * As URLs CDN retornadas por scrapers têm assinatura e expiram depois de
 * alguns dias. A rota /media/ é permanente, acompanha redirecionamentos do
 * Instagram e evita que o app fique preso exibindo quadrados cinza.
 */
function getStableInstagramImageUrl(value: unknown): string {
  const safeUrl = getSafeHttpsUrl(value);
  if (!safeUrl) return "";

  try {
    const parsed = new URL(safeUrl);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== "instagram.com" && hostname !== "www.instagram.com") {
      return "";
    }

    const match = parsed.pathname.match(
      /^\/(p|reel|tv)\/([A-Za-z0-9_-]+)\/?$/i,
    );
    if (!match) return "";

    const shortcode = match[2];
    // A rota /p/ também resolve a capa de Reels; /reel/.../media pode
    // responder 404/500 em alguns aparelhos e regiões.
    return `https://www.instagram.com/p/${shortcode}/media/?size=l`;
  } catch {
    return "";
  }
}

/** Mapeia o formato do plugin WordPress → InstagramPost. */
function parseWordPress(payload: unknown): InstagramPost[] {
  const posts =
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { posts?: unknown }).posts)
      ? (payload as { posts: any[] }).posts
      : [];

  return posts
    .map((item: any, index: number): InstagramPost | null => {
      const sourceImageUrl = getSafeHttpsUrl(
        item.image_url ||
          item.imageUrl ||
          item.displayUrl ||
          item.thumbnailUrl ||
          "",
      );
      const postUrl =
        getSafeHttpsUrl(item.permalink || item.url || item.inputUrl || "") ||
        "https://instagram.com/zimnymagazine";
      const imageUrl = getStableInstagramImageUrl(postUrl) || sourceImageUrl;
      if (!imageUrl) return null;
      return {
        id: String(item.id ?? item.shortCode ?? index),
        imageUrl,
        fallbackImageUrl:
          sourceImageUrl && sourceImageUrl !== imageUrl
            ? sourceImageUrl
            : undefined,
        caption: cleanCaption(item.caption),
        postUrl,
      };
    })
    .filter((post): post is InstagramPost => post !== null)
    .slice(0, MAX_POSTS);
}

/** Verifica se o cache do WordPress é recente o bastante para ser a fonte principal. */
function isFreshWordPressPayload(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const cachedAt = (payload as { cached_at?: unknown }).cached_at;
  if (typeof cachedAt !== "string") return false;

  const timestamp = Date.parse(cachedAt);
  if (!Number.isFinite(timestamp)) return false;
  const age = Date.now() - timestamp;
  return age >= -5 * 60 * 1000 && age <= WP_CACHE_MAX_AGE_MS;
}

/** Mapeia a resposta pública do perfil e remove o efeito de posts fixados. */
function parsePublicInstagram(payload: unknown): InstagramPost[] {
  const edges =
    payload &&
    typeof payload === "object" &&
    (payload as any).data?.user?.edge_owner_to_timeline_media?.edges;

  if (!Array.isArray(edges)) return [];

  return edges
    .map((edge: any) => edge?.node)
    .filter((node: any) => node && typeof node.shortcode === "string")
    .sort(
      (a: any, b: any) =>
        Number(b.taken_at_timestamp ?? 0) - Number(a.taken_at_timestamp ?? 0),
    )
    .map((node: any): InstagramPost | null => {
      const shortcode = String(node.shortcode ?? "").trim();
      if (!/^[A-Za-z0-9_-]+$/.test(shortcode)) return null;

      const kind = node.is_video ? "reel" : "p";
      const postUrl = `https://www.instagram.com/${kind}/${shortcode}/`;
      const imageUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
      const fallbackImageUrl = getSafeHttpsUrl(
        node.display_url || node.thumbnail_src || "",
      );
      const caption =
        node.edge_media_to_caption?.edges?.[0]?.node?.text ??
        node.caption ??
        "";

      return {
        id: String(node.id ?? shortcode),
        imageUrl,
        fallbackImageUrl: fallbackImageUrl || undefined,
        caption: cleanCaption(caption),
        postUrl,
      };
    })
    .filter((post): post is InstagramPost => post !== null)
    .slice(0, MAX_POSTS);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Busca os últimos posts do Instagram @zimnymagazine.
 *
 * Estratégia sem custo:
 *   1. WordPress REST — rápido e com cache server-side.
 *   2. Se o cache estiver antigo, API pública do próprio Instagram.
 *   3. Se o Instagram limitar temporariamente o aparelho, mantém o cache WP.
 *
 * Se todas as fontes falharem, retorna [] (fallback silencioso — o app não quebra).
 */
export async function fetchInstagramFeed(): Promise<InstagramPost[]> {
  let cachedWordPressPosts: InstagramPost[] = [];

  // ── Fonte 1: WordPress ──
  try {
    const response = await fetchWithTimeout(WP_INSTAGRAM_URL);
    if (!response.ok) {
      throw new Error(`Instagram feed HTTP error: ${response.status}`);
    }
    const payload: unknown = await response.json();
    cachedWordPressPosts = parseWordPress(payload);
    if (cachedWordPressPosts.length > 0 && isFreshWordPressPayload(payload)) {
      console.log(
        `[Instagram] WordPress respondeu com ${cachedWordPressPosts.length} posts recentes.`,
      );
      return cachedWordPressPosts;
    }
    console.warn(
      "[Instagram] Cache WordPress ausente ou antigo; tentando fonte pública…",
    );
  } catch (error) {
    console.warn(
      "[Instagram] WordPress indisponível; tentando fonte pública…",
      error,
    );
  }

  // ── Fonte 2: API pública do próprio Instagram (sem token e sem cota) ──
  try {
    const response = await fetchWithTimeout(INSTAGRAM_PUBLIC_URL, {
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      "X-IG-App-ID": "936619743392459",
    });
    if (!response.ok) {
      throw new Error(`Instagram public feed HTTP error: ${response.status}`);
    }
    const payload: unknown = await response.json();
    const posts = parsePublicInstagram(payload);
    if (posts.length > 0) {
      console.log(
        `[Instagram] Fonte pública respondeu com ${posts.length} posts recentes.`,
      );
      return posts;
    }
    throw new Error("Instagram public feed returned no posts");
  } catch (error) {
    console.warn(
      "[Instagram] Fonte pública temporariamente indisponível; usando cache WordPress.",
      error,
    );
    return cachedWordPressPosts;
  }
}
