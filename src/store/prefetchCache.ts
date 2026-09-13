/**
 * prefetchCache — Cache de posts por categoria para navegação instantânea.
 *
 * Escopo de idioma: o conteúdo do WordPress varia conforme o idioma
 * (X-Zimny-Lang). Por isso o cache é chaveado por `${lang}:${categoryId}` —
 * os leitores resolvem o idioma atual via getApiLang(), sem mudar call sites.
 *
 * O mapa `{ lang: { catId: [postIds] } }` é persistido em AsyncStorage para que,
 * ao reabrir o app, o cache seja reconstruído (os posts em si são restaurados
 * pelo postCache via hydratePersistentCache).
 *
 * Uso:
 *   cacheCategoryPosts(4, posts)  // busca e armazena no idioma atual
 *   getCachedCategoryPosts(4)     // retorna instantaneamente (idioma atual)
 *   isCategoryCached(4)           // true se já foi buscado no idioma atual
 */

import { getApiLang, type WPPost } from "@/src/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** Chave usada para persistir o mapa categoria → ids (lida pelo postCache). */
export const CATEGORY_CACHE_KEY = "zimny-category-post-ids-v2";

/** Map<`${lang}:${categoryId}`, WPPost[]> */
const _categoryCache = new Map<string, WPPost[]>();

/** Conjunto de chaves já totalmente carregadas. */
const _ready = new Set<string>();

function langKey(categoryId: number): string {
  return `${getApiLang()}:${categoryId}`;
}

// ─── Persistência em disco (AsyncStorage) ──────────────────────────────────
let _catDirty = false;
let _catTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleCategoryPersist(): void {
  _catDirty = true;
  if (_catTimer) return;
  _catTimer = setTimeout(() => {
    _catTimer = null;
    if (!_catDirty) return;
    _catDirty = false;
    const map: Record<string, Record<string, number[]>> = {};
    for (const [key, posts] of _categoryCache) {
      const [lang, catId] = key.split(":");
      if (!lang || !catId) continue;
      map[lang] ??= {};
      map[lang][catId] = posts.map((p) => p.id);
    }
    AsyncStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(map)).catch(() => {
      // Persistência é best-effort; falha silenciosa.
    });
  }, 600);
}

/**
 * Armazena posts de uma categoria no cache (idioma atual).
 */
export function cacheCategoryPosts(categoryId: number, posts: WPPost[]): void {
  _categoryCache.set(langKey(categoryId), posts);
  _ready.add(langKey(categoryId));
  scheduleCategoryPersist();
}

/**
 * Retorna os posts cacheados de uma categoria (idioma atual), ou undefined.
 */
export function getCachedCategoryPosts(
  categoryId: number
): WPPost[] | undefined {
  return _categoryCache.get(langKey(categoryId));
}

/**
 * Verifica se uma categoria já foi pré-carregada no idioma atual.
 */
export function isCategoryCached(categoryId: number): boolean {
  return _ready.has(langKey(categoryId));
}

/**
 * Limpa o cache (útil para refresh forçado).
 */
export function clearCategoryCache(categoryId?: number): void {
  const lang = getApiLang();
  if (categoryId != null) {
    const key = langKey(categoryId);
    _categoryCache.delete(key);
    _ready.delete(key);
  } else {
    // Remove apenas entradas do idioma atual.
    for (const key of _categoryCache.keys()) {
      if (key.startsWith(`${lang}:`)) {
        _categoryCache.delete(key);
        _ready.delete(key);
      }
    }
  }
  scheduleCategoryPersist();
}

/**
 * Número de categorias cacheadas (todas as entradas, todos os idiomas).
 */
export function getCachedCategoryCount(): number {
  return _ready.size;
}
