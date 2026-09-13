/**
 * Cache de posts em memória (leitura síncrona/zero-wait) + persistência em disco
 * via AsyncStorage para sobreviver a reinícios do app.
 *
 * Escopo de idioma: o conteúdo do WordPress varia conforme o idioma
 * (X-Zimny-Lang). O cache é chaveado por `${lang}:${postId}` e persistido por
 * idioma, garantindo que um artigo lido em PT nunca seja exibido como EN/ES
 * (e vice-versa). O idioma atual é resolvido via getApiLang().
 *
 * Populado pelo useHomeFeed, sliders de categoria, prefetch e busca. Lido
 * imediatamente pelo ecrã de leitura para zero-wait routing.
 */
import { getApiLang, type WPPost } from "@/src/services/api";
import {
  CATEGORY_CACHE_KEY,
  cacheCategoryPosts,
} from "@/src/store/prefetchCache";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** Map<`${lang}:${postId}`, WPPost> */
const _cache = new Map<string, WPPost>();

// ─── Persistência em disco (AsyncStorage) ──────────────────────────────────
const STORAGE_KEY = "zimny-post-cache-v2";
/** Limite de posts mantidos em disco por idioma (controla o tamanho do JSON). */
const MAX_PERSISTED_PER_LANG = 120;

/** `{ lang: { id: post } }` — espelho do que já está em disco. */
let _diskCache: Record<string, Record<number, WPPost>> = {};
let _dirty = false;
let _saveTimer: ReturnType<typeof setTimeout> | null = null;

function langKey(id: number): string {
  return `${getApiLang()}:${id}`;
}

function schedulePersist(): void {
  _dirty = true;
  if (_saveTimer) return;
  _saveTimer = setTimeout(() => {
    _saveTimer = null;
    void persistNow();
  }, 600);
}

async function persistNow(): Promise<void> {
  if (!_dirty) return;
  _dirty = false;
  try {
    const lang = getApiLang();
    const bucket: Record<number, WPPost> = _diskCache[lang] ?? {};
    // Merge dos posts do idioma atual no espelho de disco.
    for (const [key, post] of _cache) {
      if (key.startsWith(`${lang}:`)) bucket[post.id] = post;
    }
    const entries = Object.entries(bucket);
    if (entries.length > MAX_PERSISTED_PER_LANG) {
      // Mantém os mais recentes (ordem de inserção do objeto).
      _diskCache[lang] = Object.fromEntries(
        entries.slice(-MAX_PERSISTED_PER_LANG)
      );
    } else {
      _diskCache[lang] = bucket;
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(_diskCache));
  } catch (e) {
    // Persistência é best-effort; falha silenciosa.
    console.warn("[Perf] Failed to persist post cache:", e);
  }
}

/**
 * Hidrata o cache em memória a partir do disco (todos os idiomas) e reconstrói
 * o cache de categorias (prefetchCache) do idioma atual a partir dos ids salvos.
 * Deve ser chamado UMA vez no startup (ex.: dentro do usePrefetch).
 */
export async function hydratePersistentCache(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    _diskCache = raw ? (JSON.parse(raw) as Record<string, Record<number, WPPost>>) : {};
    for (const [lang, bucket] of Object.entries(_diskCache)) {
      for (const post of Object.values(bucket)) {
        if (post && typeof post.id === "number") {
          _cache.set(`${lang}:${post.id}`, post);
        }
      }
    }

    // Reconstrói categorias → posts do idioma atual a partir dos ids salvos.
    const catRaw = await AsyncStorage.getItem(CATEGORY_CACHE_KEY);
    if (catRaw) {
      const catMap = JSON.parse(catRaw) as Record<string, Record<string, number[]>>;
      const lang = getApiLang();
      const perLang = catMap[lang];
      if (perLang) {
        for (const [catId, ids] of Object.entries(perLang)) {
          const catPosts = ids
            .map((id) => _cache.get(`${lang}:${id}`))
            .filter((p): p is WPPost => !!p);
          if (catPosts.length > 0) {
            cacheCategoryPosts(Number(catId), catPosts);
          }
        }
      }
    }

    console.log(`[Perf] Hydrated persistent cache: ${_cache.size} posts (lang=${getApiLang()})`);
    return _cache.size;
  } catch (e) {
    console.warn("[Perf] Failed to hydrate post cache:", e);
    return 0;
  }
}

// ─── API do cache em memória ───────────────────────────────────────────────

export function cachePosts(posts: WPPost[]): void {
  for (const post of posts) {
    _cache.set(langKey(post.id), post);
  }
  schedulePersist();
}

export function cachePost(post: WPPost): void {
  _cache.set(langKey(post.id), post);
  schedulePersist();
}

export function getCachedPost(id: number): WPPost | undefined {
  return _cache.get(langKey(id));
}

/** Todos os posts cacheados no idioma atual (usado pela busca). */
export function getAllCachedPosts(): WPPost[] {
  const lang = getApiLang();
  const prefix = `${lang}:`;
  const out: WPPost[] = [];
  for (const [key, post] of _cache) {
    if (key.startsWith(prefix)) out.push(post);
  }
  return out;
}

export function getCacheSize(): number {
  return _cache.size;
}
