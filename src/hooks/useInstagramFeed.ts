/**
 * useInstagramFeed
 *
 * Hook que busca e cacheia os posts do Instagram @zimnymagazine.
 *
 * Fonte primária: WordPress REST (plugin Zimny Instagram Feed), com fallback
 * gratuito para a API pública do próprio Instagram quando o cache do servidor
 * estiver antigo. Este hook re-busca a cada hora e só atualiza o estado quando
 * os posts ou suas URLs realmente mudam.
 */

import { useEffect, useState } from "react";

import {
  fetchInstagramFeed,
  type InstagramPost,
} from "@/src/services/instagram";

// ─── Types ───────────────────────────────────────────────────────────────────

type State = {
  posts: InstagramPost[];
  loading: boolean;
  error: Error | null;
};

// O plugin WordPress atualiza o cache a cada 30 min → o app re-busca aqui a
// cada 1 hora. A atualização de estado só ocorre quando há post novo (ver
// refresh abaixo), então este intervalo não gera re-render desnecessário.
const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

// ─── Session cache ───────────────────────────────────────────────────────────

let _cache: State | null = null;

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useInstagramFeed(): State {
  const [state, setState] = useState<State>(
    _cache ?? { posts: [], loading: true, error: null },
  );

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const posts = await fetchInstagramFeed();
        if (cancelled) return;

        // Além dos IDs, compara as URLs. As assinaturas temporárias do CDN do
        // Instagram podem mudar sem que o post mude; ignorar isso deixava o
        // cache da sessão preso em uma imagem expirada.
        const prev = _cache;
        const unchanged =
          prev !== null &&
          prev.posts.length === posts.length &&
          prev.posts.every(
            (p, i) =>
              p.id === posts[i]?.id &&
              p.imageUrl === posts[i]?.imageUrl &&
              p.fallbackImageUrl === posts[i]?.fallbackImageUrl &&
              p.postUrl === posts[i]?.postUrl,
          );
        if (unchanged) return;

        const next: State = { posts, loading: false, error: null };
        _cache = next;
        setState(next);
      } catch (err) {
        if (cancelled) return;
        console.warn("Erro ao carregar feed do Instagram:", err);
        const next: State = { posts: [], loading: false, error: err as Error };
        _cache = next;
        setState(next);
      }
    };

    refresh();

    const intervalId = setInterval(refresh, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return state;
}
