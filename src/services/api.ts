/**
 * WordPress REST API — posts com `_embed` para imagem de destaque e metadados embutidos.
 * @see https://developer.wordpress.org/rest-api/reference/posts/
 *
 * All API calls automatically include the `lang` parameter based on the
 * user's current language preference, so GTranslate on the WordPress side
 * returns translated content when available.
 */

import { useLanguageStore } from "@/src/stores/useLanguageStore";

export const ZIMNY_ORIGIN = "https://zimnymagazine.com";

/**
 * Strips leading non-JSON characters from a response string.
 * The WordPress server sometimes outputs garbage (e.g. a stray "c" character)
 * before the actual JSON response. This helper removes anything before the
 * first valid JSON token ({ or [).
 */
export function stripJsonPrefix(text: string): string {
  const start = text.search(/[{[]/);
  return start > 0 ? text.slice(start) : text;
}

/**
 * Fetches a URL and parses the response as JSON, stripping any leading
 * garbage characters that may be present in the server response.
 */
/**
 * Returns the current language code for API calls.
 * Falls back to "pt" if no preference is set.
 */
export function getApiLang(): string {
  try {
    return useLanguageStore.getState().language ?? "pt";
  } catch {
    return "pt";
  }
}

/**
 * Appends the `lang` query parameter to a URL based on the current language.
 *
 * - Custom Zimny endpoints (/zimny/v1/): `?lang=en` query param (handled by plugin).
 * - Standard WordPress REST API (/wp/v2/): NO query param — GTranslate Free would
 *   intercept it and break the response. Instead the lang is sent via the
 *   `X-Zimny-Lang` header, read by our `rest_prepare_post` filter.
 */
export function withLang(url: string): string {
  const lang = getApiLang();
  if (lang === "pt") return url; // PT is the default, no param needed
  // Only add lang as query param to custom Zimny endpoints
  if (url.includes("/zimny/v1/")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}lang=${lang}`;
  }
  return url;
}

/**
 * Returns the `X-Zimny-Lang` header for standard WP REST API calls,
 * so our plugin can serve translated posts without GTranslate interference.
 */
export function langHeaders(): Record<string, string> {
  const lang = getApiLang();
  return lang === "pt" ? {} : { "X-Zimny-Lang": lang };
}

/**
 * Detecta erro de cancelamento/timeout de fetch. No RN novo (SDK 57) o abort
 * nativo rejeita com "FetchRequestCanceledException" (iOS), não com AbortError
 * — sem esse reconhecimento, aborts viram "Uncaught (in promise)" no LogBox.
 */
export function isCancellationError(e: unknown): boolean {
  if (e instanceof Error) {
    if (e.name === "AbortError") return true;
    if (/canceled|cancelled|aborted/i.test(e.message)) return true;
  }
  return false;
}

/** Relança o erro de cancelamento como AbortError (padrão que os hooks tratam). */
export function rethrowAbortAsStandard(e: unknown): never {
  const err = new Error(e instanceof Error ? e.message : "Aborted");
  err.name = "AbortError";
  throw err;
}

export async function zimnyFetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const langUrl = withLang(url);
  const timeoutController = options?.signal ? null : new AbortController();
  const timeoutId = timeoutController
    ? setTimeout(() => timeoutController.abort(), 12_000)
    : null;
  let res: Response;
  try {
    res = await fetch(langUrl, {
      ...options,
      signal: options?.signal ?? timeoutController?.signal,
      headers: {
        Accept: "application/json",
        ...langHeaders(),
        ...options?.headers,
      },
    });
  } catch (e) {
    if (isCancellationError(e)) rethrowAbortAsStandard(e);
    throw e;
  } finally {
    if (timeoutId != null) clearTimeout(timeoutId);
  }
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  const text = await res.text();
  const cleaned = stripJsonPrefix(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(
      `API returned non-JSON (${text.slice(0, 200)}...)`
    );
  }
}

/** Base da API WP REST v2 (sem query string). */
export const WP_API_BASE = `${ZIMNY_ORIGIN}/wp-json/wp/v2`;

export type WPEmbeddedMedia = {
  source_url: string;
  alt_text?: string;
};

/** Shape of the author object embedded via `_embed=1`. */
export type WPEmbeddedAuthor = {
  id:          number;
  name:        string;
  /** WordPress user `user_nicename` (URL-safe slug, e.g. "brunozimny"). */
  slug:        string;
  description: string;
  /** Gravatar URLs keyed by pixel size ("24", "48", "96", …). */
  avatar_urls: Record<string, string>;
};

export type WPPost = {
  id: number;
  date: string;
  slug: string;
  link?: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content?: {
    rendered: string;
    protected?: boolean;
  };
  _embedded?: {
    "wp:featuredmedia"?: WPEmbeddedMedia[];
    author?:             WPEmbeddedAuthor[];
  };
};

export type WPCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
  description?: string;
};

export type ApiFetchOptions = RequestInit & {
  softFail?: boolean;
};

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/** Decodifica entidades numéricas e nomeadas comuns do WordPress. */
export function decodeHtmlEntities(text: string): string {
  let s = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&hellip;/g, "…");

  s = s.replace(/&#(\d+);/g, (_, n) =>
    String.fromCharCode(parseInt(n, 10))
  );
  s = s.replace(/&#x([0-9a-fA-F]+);/gi, (_, h) =>
    String.fromCharCode(parseInt(h, 16))
  );
  return s;
}

export function postTitlePlain(post: WPPost): string {
  return decodeHtmlEntities(stripHtml(post.title.rendered));
}

export function postExcerptPlain(post: WPPost): string {
  return decodeHtmlEntities(stripHtml(post.excerpt.rendered));
}

export function getFeaturedImageUrl(post: WPPost): string | undefined {
  const url = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  return url?.trim() || undefined;
}

/** Returns the first embedded author, or undefined if not present. */
export function getPostAuthor(post: WPPost): WPEmbeddedAuthor | undefined {
  return post._embedded?.author?.[0];
}

/**
 * Picks the best-quality Gravatar URL from `avatar_urls`.
 * Prefers 96 px; falls back to 48, then the first available key.
 */
export function getAvatarUrl(author: WPEmbeddedAuthor): string | undefined {
  return (
    author.avatar_urls["96"] ??
    author.avatar_urls["48"] ??
    Object.values(author.avatar_urls)[0]
  );
}

export type FetchPostsParams = {
  page?: number;
  per_page?: number;
  categories?: number[];
  author?: number;
  /** WordPress: `date` é o mais compatível (evitar `comment_count` — muitos servidores devolvem 400). */
  orderby?: "date" | "relevance" | "modified";
  order?: "asc" | "desc";
};

function appendSearchParams(
  search: URLSearchParams,
  params: FetchPostsParams
): void {
  search.set("_embed", "1");
  if (params.page != null) search.set("page", String(params.page));
  if (params.per_page != null) {
    search.set("per_page", String(Math.min(100, Math.max(1, params.per_page))));
  }
  if (params.orderby) search.set("orderby", params.orderby);
  if (params.order) search.set("order", params.order);
  if (params.author != null) search.set("author", String(params.author));
  if (params.categories?.length) {
    for (const id of params.categories) {
      search.append("categories", String(id));
    }
  }
}

// Dedupe de requisições idênticas: home feed e busca usam o MESMO fetch
// (`per_page=30&orderby=date`), e o prefetch repete categorias. Compartilhar a
// promise evita duplicar requests e congestionar o startup.
const _dedupe = new Map<string, Promise<WPPost[]>>();
const DEDUPE_TTL_MS = 10_000;

/**
 * Lista posts com imagens e embeds (`_embed=1` inclui `wp:featuredmedia`).
 */
export async function fetchPosts(
  params: FetchPostsParams = {}
): Promise<WPPost[]> {
  const search = new URLSearchParams();
  appendSearchParams(search, params);

  const url = `${WP_API_BASE}/posts?${search.toString()}`;
  // Inclui o idioma na chave (header X-Zimny-Lang muda o conteúdo para /wp/v2).
  const lang = getApiLang();
  const key = `${url}|lang=${lang}`;

  const inFlight = _dedupe.get(key);
  if (inFlight) {
    console.log(`[Perf] fetchPosts dedupe HIT: ${url}`);
    return inFlight;
  }

  const promise = doFetchPosts(url);
  _dedupe.set(key, promise);
  promise.finally(() => {
    setTimeout(() => {
      // Remove apenas se ainda for a mesma promise (evita matar um refetch novo).
      if (_dedupe.get(key) === promise) _dedupe.delete(key);
    }, DEDUPE_TTL_MS);
  });
  return promise;
}

async function doFetchPosts(url: string): Promise<WPPost[]> {
  console.log(`[Zimny] Fetching posts: ${url}`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  let data: WPPost[];
  try {
    data = await zimnyFetchJson<WPPost[]>(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }

  // [Perf] Validation: does the LIST endpoint include full article content?
  // If no, the reader screen will always re-fetch by ID on navigation.
  const withContent = data.filter((p) => (p.content?.rendered?.length ?? 0) > 0).length;
  console.log(
    `[Perf] fetchPosts -> ${data.length} posts; withContent=${withContent}; ` +
    `sampleContentLen=${data[0]?.content?.rendered?.length ?? 0}; ` +
    `firstId=${data[0]?.id ?? "n/a"}`
  );

  return data;
}

/**
 * Posts de uma categoria específica (para os sliders editoriais e a
 * página da categoria). Fetches via `categories[]` query param do WP REST API.
 * `page` permite paginar até esgotar os posts (grade "ver mais").
 */
export async function fetchPostsByCategory(
  categoryId: number,
  perPage = 10,
  page = 1
): Promise<WPPost[]> {
  return fetchPosts({
    categories: [categoryId],
    per_page: perPage,
    page,
    orderby: "date",
    order: "desc",
  });
}

/** Primeiro post de uma categoria (para imagem de capa no grid). */
export async function fetchFirstPostForCategory(
  categoryId: number
): Promise<WPPost | null> {
  const posts = await fetchPosts({
    categories: [categoryId],
    per_page: 1,
    orderby: "date",
    order: "desc",
  });
  return posts[0] ?? null;
}

/**
 * Resolve um slug WordPress para o WPPost completo (com `_embed=1` para
 * dados de autor e imagem em destaque).
 * Retorna `null` se nenhum post for encontrado ou se a requisição falhar.
 */
export async function fetchPostBySlug(slug: string): Promise<WPPost | null> {
  const url = `${WP_API_BASE}/posts?slug=${encodeURIComponent(slug)}&_embed=1&per_page=1`;
  try {
    const data = await zimnyFetchJson<WPPost[]>(url);
    return data[0] ?? null;
  } catch {
    return null;
  }
}

/** Post individual com `content.rendered` completo (uso na tela de leitura). */
export async function fetchPostById(id: number): Promise<WPPost> {
  const url = `${WP_API_BASE}/posts/${id}?_embed=1`;
  return zimnyFetchJson<WPPost>(url);
}

export async function fetchCategories(): Promise<WPCategory[]> {
  const url = `${WP_API_BASE}/categories?per_page=100&hide_empty=true`;
  return zimnyFetchJson<WPCategory[]>(url);
}

// ─── Edições (API v3 — minimalista) ──────────────────────────────────────────

/**
 * Edição de revista — versão simplificada.
 *
 * O WebView carrega a página WordPress diretamente via getMagazineUrl(number).
 * Cada post no WordPress = uma edição (1 post por edição).
 */
export type MagazineEdition = {
  /** Número da edição (usado como route param e para gerar a URL). */
  id:         string;
  number:     string;
  title:      string;
  tagline:    string;
  coverImage: string;
};

const ZIMNY_EDITIONS_URL = `${ZIMNY_ORIGIN}/wp-json/zimny/v3/edicoes`;

export async function fetchEditions(): Promise<MagazineEdition[]> {
  return zimnyFetchJson<MagazineEdition[]>(ZIMNY_EDITIONS_URL);
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { softFail, ...init } = options;
  const url = path.startsWith("http")
    ? path
    : `${WP_API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });

  if (!res.ok && !softFail) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  const cleaned = stripJsonPrefix(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error("Resposta não é JSON válido");
  }
}

// ─── Colunistas (via plugin Zimny Colunistas) ──────────────────────────────────

export type Colunista = {
  id:          number;
  name:        string;
  slug:        string;
  description: string;
  /** URL da foto personalizada (4:5) ou Gravatar (256px) */
  avatar_url:  string;
  /** URL da imagem de fundo do perfil */
  bg_image_url?: string;
  /** URL da foto principal do perfil (PNG com transparência) */
  profile_image_url?: string;
  order:       number;
  visible:     boolean;
  /** Se false, o colunista aparece no carrossel mas não pode ser clicado */
  clickable:   boolean;
  post_count:  number;
};

const ZIMNY_COLUNISTAS_URL = `${ZIMNY_ORIGIN}/wp-json/zimny/v1/colunistas`;

/**
 * Busca a lista de colunistas via plugin WordPress Zimny Colunistas.
 * GET /wp-json/zimny/v1/colunistas
 *
 * Retorna apenas colunistas visíveis, ordenados por ordem de exibição.
 */
export async function fetchColunistas(): Promise<Colunista[]> {
  const url = `${ZIMNY_COLUNISTAS_URL}?_t=${Date.now()}`;
  const data = await zimnyFetchJson<Colunista[]>(url);
  console.log(`[Zimny] Colunistas API: ${data.length} colunistas loaded`);
  if (data.length > 0) {
    console.log(`[Zimny] First colunista:`, JSON.stringify(data[0]));
  }
  return data;
}
