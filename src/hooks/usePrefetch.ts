/**
 * usePrefetch — Pré-carrega dados de todas as categorias principais na inicialização.
 *
 * Estratégia (após otimização de performance):
 * 1. Hidrata o cache persistido em disco (AsyncStorage) primeiro — navegação
 *    instantânea mesmo com o app recém-aberto.
 * 2. Prefetch priorizado: a categoria principal (Notícias) é disparada primeiro
 *    e as demais escalonadas (+350ms) para não congestionar o burst do startup
 *    (que também tem home feed, layout, Instagram, vídeos, eventos, etc.).
 * 3. Pré-carrega as imagens de capa dos posts mais recentes via expo-image,
 *    para o leitor e os cards abrirem sem placeholder.
 *
 * Resultados são armazenados no postCache e no prefetchCache, que persistem em
 * disco para sobreviver a reinícios.
 *
 * Uso: montar <PrefetchProvider /> no root layout.
 */

import { Image } from "expo-image";
import { useEffect, useRef } from "react";

import {
  fetchPostsByCategory,
  getFeaturedImageUrl,
  type WPPost,
} from "@/src/services/api";
import {
  cachePosts,
  getCacheSize,
  hydratePersistentCache,
} from "@/src/store/postCache";
import {
  cacheCategoryPosts,
  getCachedCategoryCount,
} from "@/src/store/prefetchCache";

// ─── Categorias principais do WordPress ─────────────────────────────────────
// ID 4  = Notícias (601 posts) — primeiro por ser a categoria mais acessada.
// ID 6  = Estética (48)
// ID 7  = Moda & Estilo (35)
// ID 8  = Aconteceu em Massachusetts (40)
// ID 10 = Saúde & Bem-Estar (61)
//
// A home feed (todos os posts) é carregada separadamente pelo useHomeFeed.

const CATEGORIES_TO_PREFETCH = [
  { id: 4, perPage: 60 },   // Notícias (prioridade)
  { id: 6, perPage: 48 },   // Estética
  { id: 7, perPage: 35 },   // Moda & Estilo
  { id: 8, perPage: 40 },   // Aconteceu em Massachusetts
  { id: 10, perPage: 61 },  // Saúde & Bem-Estar
] as const;

/** Atraso entre categorias para suavizar o burst de rede no startup. */
const STAGGER_MS = 350;
/** Limite total de imagens de capa pré-carregadas por execução. */
const IMAGE_PREFETCH_LIMIT = 30;

/**
 * Pré-carrega imagens de capa (expo-image baixa e guarda em disco).
 * Best-effort: falhas são ignoradas.
 */
function prefetchFeaturedImages(posts: WPPost[]): void {
  const seen = new Set<string>();
  let count = 0;
  for (const post of posts) {
    const url = getFeaturedImageUrl(post);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    count++;
    if (count >= IMAGE_PREFETCH_LIMIT) break;
    Image.prefetch(url).catch(() => {
      // Falha de imagem é esperada em rede ruim; a UI mostra placeholder.
    });
  }
  console.log(`[Perf] Prefetched ${count} featured images`);
}

/**
 * Hook que dispara o pré-carregamento de todas as categorias.
 * Pode ser montado no root layout ou em qualquer lugar da árvore.
 */
export function usePrefetch() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const prefetchAll = async () => {
      const t0 = Date.now();

      // 1) Restaura o cache persistido antes de disparar novos fetches.
      await hydratePersistentCache();

      // 2) Categorias priorizadas e escalonadas (disparos espaçados para não
      // congestionar o burst do startup), todas em paralelo de rede.
      const promises: Promise<void>[] = [];
      for (let i = 0; i < CATEGORIES_TO_PREFETCH.length; i++) {
        if (i > 0) {
          await new Promise((r) => setTimeout(r, STAGGER_MS));
        }
        const { id, perPage } = CATEGORIES_TO_PREFETCH[i];
        promises.push(
          fetchPostsByCategory(id, perPage)
            .then((posts) => {
              cachePosts(posts);
              cacheCategoryPosts(id, posts);
              // Pré-carrega capas apenas da categoria principal (Notícias).
              if (i === 0) prefetchFeaturedImages(posts);
            })
            .catch(() => {
              // Silently fail — cada página carrega individualmente se falhar
            })
        );
      }

      await Promise.allSettled(promises);

      // [Perf] Validation: how long does startup prefetch take / is it effective?
      console.log(
        `[Perf] Prefetch finished in ${Date.now() - t0}ms; ` +
        `categoriesCached=${getCachedCategoryCount()}; postCacheSize=${getCacheSize()}`
      );
    };

    prefetchAll();
  }, []);
}

/**
 * Componente Provider que monta o hook usePrefetch.
 * Coloque uma única instância no root layout.
 */
export function PrefetchProvider() {
  usePrefetch();
  return null;
}
