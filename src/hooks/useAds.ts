/**
 * useAds — Hook de publicidades
 *
 * Busca anúncios randomizados da API do plugin Zimny Admin e registra
 * impressões/cliques para as estatísticas do painel.
 *
 * Endpoints:
 *   GET  https://zimnymagazine.com/wp-json/zimny/v1/ads/random?placement=home|article&lang=pt|en|es
 *   POST https://zimnymagazine.com/wp-json/zimny/v1/ads/{id}/track-impression
 *   POST https://zimnymagazine.com/wp-json/zimny/v1/ads/{id}/track-click
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { ZIMNY_ORIGIN, zimnyFetchJson } from "@/src/services/api";
import { useLanguageStore } from "@/src/stores/useLanguageStore";

// ─── Types ──────────────────────────────────────────────────────────────────

export type AdPlacement = "home" | "article";

/** Anúncio como retornado pelo endpoint /ads/random */
export type AdItem = {
  id: string;
  logo_url: string;
  logo_id: number;
  image_url: string;
  image_id: number;
  title: string;
  description: string;
  cta_text: string;
  link: string;
  type: "banner" | "sponsored" | "custom" | "image_banner";
  placement: "home" | "article" | "both";
  active: boolean;
};

// ─── Endpoints ─────────────────────────────────────────────────────────────

const ADS_LIST_ENDPOINT = `${ZIMNY_ORIGIN}/wp-json/zimny/v1/ads`;
const AD_TRACK_BASE = `${ZIMNY_ORIGIN}/wp-json/zimny/v1/ads`;

// ─── Carousel ────────────────────────────────────────────────────────────────
// Tempo (em ms) que cada anúncio permanece visível antes do próximo entrar.
// Gera o carrossel infinito e automático com a rotatividade de cada cliente.
const AD_ROTATION_INTERVAL_MS = 7000;

// ─── Rotation store ─────────────────────────────────────────────────────────
// Compartilhado entre todas as instâncias de `useAd` do mesmo placement.
// Garante que o mesmo anúncio nunca apareça duas vezes seguidas e que slots
// diferentes (ex.: os dois blocos de publicidade da Home) exibam anúncios
// distintos, respeitando o placement e o formato de cada anúncio.

type RotationState = {
  eligible: AdItem[];        // lista completa de anúncios ativos do placement
  queue: AdItem[];           // fila embaralhada de rotação
  lastShownId: string | null;
  loaded: boolean;
  loadPromise: Promise<void> | null;
};

const rotation: Record<AdPlacement, RotationState> = {
  home:    { eligible: [], queue: [], lastShownId: null, loaded: false, loadPromise: null },
  article: { eligible: [], queue: [], lastShownId: null, loaded: false, loadPromise: null },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Retorna o código do idioma atual para passar à API. */
function getLangParam(): string {
  const lang = useLanguageStore.getState().language ?? "pt";
  return lang;
}

/** Carrega (uma única vez por chamada concorrente) a lista de anúncios elegíveis. */
function loadEligible(placement: AdPlacement): Promise<void> {
  const state = rotation[placement];
  if (state.loadPromise) return state.loadPromise;
  state.loadPromise = (async () => {
    try {
      const lang = getLangParam();
      const url = `${ADS_LIST_ENDPOINT}?placement=${encodeURIComponent(placement)}&lang=${lang}`;
      const list = await zimnyFetchJson<AdItem[]>(url);
      state.eligible = Array.isArray(list) ? list : [];
    } catch (e) {
      console.warn(`[Ads] Failed to load eligible ads (${placement}):`, e);
      state.eligible = [];
    } finally {
      state.loaded = true;
      state.loadPromise = null;
    }
  })();
  return state.loadPromise;
}

/**
 * Retorna o próximo anúncio da rotação para o placement, garantindo que ele
 * nunca seja igual ao último exibido. Quando a fila esgota, reembaralha a
 * lista completa (evitando repetição imediata do último anúncio).
 */
async function nextAd(placement: AdPlacement): Promise<AdItem | null> {
  const state = rotation[placement];
  if (!state.loaded) {
    await loadEligible(placement);
  }
  if (state.eligible.length === 0) {
    return null;
  }
  if (state.queue.length === 0) {
    // Rebusca para capturar anúncios novos/removidos e reembaralha.
    await loadEligible(placement);
    if (state.eligible.length === 0) return null;
    state.queue = shuffle(state.eligible);
    // Evita repetição imediata: se o primeiro da fila for o último exibido, move-o para o fim.
    if (state.queue.length > 1 && state.queue[0].id === state.lastShownId) {
      const first = state.queue.shift()!;
      state.queue.push(first);
    }
  }
  const ad = state.queue.shift() ?? null;
  state.lastShownId = ad?.id ?? null;
  return ad;
}

/**
 * Busca o próximo anúncio ativo para o placement informado, sem repetir o
 * último exibido. Retorna `null` quando não há anúncios elegíveis.
 */
export async function fetchRandomAd(
  placement: AdPlacement = "home"
): Promise<AdItem | null> {
  return nextAd(placement);
}

/**
 * Registra uma impressão do anúncio. Fire-and-forget (não lança erros).
 */
export async function trackAdImpression(adId: string): Promise<void> {
  if (!adId) return;
  try {
    await fetch(`${AD_TRACK_BASE}/${encodeURIComponent(adId)}/track-impression`, {
      method: "POST",
      headers: { Accept: "application/json" },
    });
  } catch (e) {
    console.warn("[Ads] Failed to track impression:", e);
  }
}

/**
 * Registra um clique no anúncio. Fire-and-forget (não lança erros).
 */
export async function trackAdClick(adId: string): Promise<void> {
  if (!adId) return;
  try {
    await fetch(`${AD_TRACK_BASE}/${encodeURIComponent(adId)}/track-click`, {
      method: "POST",
      headers: { Accept: "application/json" },
    });
  } catch (e) {
    console.warn("[Ads] Failed to track click:", e);
  }
}

// ─── useAd hook ─────────────────────────────────────────────────────────────

type UseAdReturn = {
  ad: AdItem | null;
  loading: boolean;
  /** Busca um novo anúncio aleatório */
  refresh: () => Promise<void>;
  /** Marca o anúncio atual como visto (impressão) */
  trackImpression: () => void;
  /** Marca o anúncio atual como clicado */
  trackClick: () => void;
};

/**
 * Hook que mantém um anúncio atualizado para um placement, em carrossel
 * infinito e automático.
 *
 * - Carrega automaticamente ao montar.
 * - A cada `AD_ROTATION_INTERVAL_MS` (7s) avança para o próximo anúncio da
 *   lista (rotação compartilhada entre todos os blocos do mesmo placement),
 *   garantindo a rotatividade de todos os clientes em todos os lugares.
 * - Cada anúncio permanece visível por exatamente 7 segundos.
 * - Pausa a rotação quando o app vai para segundo plano e retoma ao voltar.
 * - `refresh()` avança imediatamente para outro anúncio (rodízio manual).
 * - `trackImpression()`/`trackClick()` registram as métricas no backend,
 *   contando uma impressão por anúncio exibido (inclusive na rotação).
 */
export function useAd(placement: AdPlacement = "home"): UseAdReturn {
  const [ad, setAd] = useState<AdItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [appActive, setAppActive] = useState(
    () => AppState.currentState === "active"
  );
  const impressionSent = useRef(false);
  const adIdRef = useRef<string | null>(null);

  /** Avança para o próximo anúncio da rotação compartilhada do placement. */
  const rotate = useCallback(
    async (showLoading: boolean) => {
      if (showLoading) setLoading(true);
      const next = await fetchRandomAd(placement);
      impressionSent.current = false;
      adIdRef.current = next?.id ?? null;
      setAd(next);
      setLoading(false);
    },
    [placement]
  );

  const refresh = useCallback(() => rotate(true), [rotate]);

  // Carrega o primeiro anúncio ao montar.
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Acompanha se o app está em primeiro plano (evita girar em segundo plano).
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      setAppActive(next === "active");
    });
    return () => sub.remove();
  }, []);

  // ── Carrossel infinito e automático ──────────────────────────────────────
  // A cada 7s avança para o próximo anúncio. O timer é reiniciado a cada troca
  // de anúncio, então cada anúncio fica visível por exatamente 7 segundos.
  useEffect(() => {
    if (!ad) return;
    if (!appActive) return;
    const interval = setInterval(() => {
      rotate(false);
    }, AD_ROTATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [ad, appActive, rotate]);

  const trackImpression = useCallback(() => {
    if (impressionSent.current) return;
    if (!adIdRef.current) return;
    impressionSent.current = true;
    trackAdImpression(adIdRef.current);
  }, []);

  // Conta uma impressão para cada anúncio exibido (inclusive durante a rotação).
  useEffect(() => {
    trackImpression();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad?.id]);

  const trackClick = useCallback(() => {
    if (!adIdRef.current) return;
    trackAdClick(adIdRef.current);
  }, []);

  return { ad, loading, refresh, trackImpression, trackClick };
}
