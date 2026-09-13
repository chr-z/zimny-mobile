/**
 * useZimnyTv — Hook para gerenciar estado da Zimny TV 24/7.
 *
 * Funcionalidades:
 * - Fetch dos dados da transmissão ao vivo
 * - Auto-refresh a cada 30s
 * - Lazy sync: só monta o player quando isFocused === true
 * - Controle de play/pause com resync ao vivo
 * - Auto-advance quando vídeo acaba
 * - Resume correto ao reabrir o app (mantém seek sincronizado)
 */
import { useCallback, useEffect, useRef, useState } from "react";

import { fetchLiveTv, type LiveTvData, type TvProgram } from "@/src/services/zimnyTv";

// ─── Constants ─────────────────────────────────────────────────────────────

const REFRESH_INTERVAL_MS = 30_000;

// Skew máximo tolerado entre o relógio do cliente e o server_timestamp do
// payload. O transient do servidor dura 30s; acima de 120s o payload veio de
// cache de página/CDN congelado e NÃO deve ser aplicado (causa loop de vídeos).
const MAX_SKEW_SECONDS = 120;

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useZimnyTv(isFocused: boolean) {
  const [data, setData] = useState<LiveTvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFetchRef = useRef<number>(0);
  const dataRef = useRef<LiveTvData | null>(null);
  const prevFocusRef = useRef<boolean | null>(null);
  const queueRef = useRef<TvProgram[] | null>(null);
  const lastAdvanceRef = useRef<number>(0);
  const anchorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const staleRetryRef = useRef(false);

  // ── Fetch data ──────────────────────────────────────────────────────────

  const loadData = useCallback(async (forceFresh = false) => {
    try {
      const result = await fetchLiveTv(forceFresh);
      const clientNow = Math.floor(Date.now() / 1000);
      const skew = clientNow - (result?.now_playing?.server_timestamp ?? clientNow);

      // Payload congelado em cache de página/CDN (skew absurdo): descarta e
      // tenta UMA vez com fresh. Se continuar velho e já temos dados, mantém
      // o último válido em vez de aplicar o corpo congelado (evita loop).
      if (skew > MAX_SKEW_SECONDS) {
        if (!staleRetryRef.current) {
          staleRetryRef.current = true;
          console.warn(`[ZimnyTV] payload defasado (skew=${skew}s) -> refetch fresh`);
          void loadData(true);
          return;
        }
        if (dataRef.current) {
          staleRetryRef.current = false;
          console.warn(`[ZimnyTV] payload continua defasado (skew=${skew}s) -> mantém último válido`);
          return;
        }
      }
      staleRetryRef.current = false;

      dataRef.current = result;
      // Fila local: permite encadear programas/vinhetas sem refetch na virada.
      queueRef.current = Array.isArray(result.upcoming)
        ? result.upcoming.map((item) => ({ ...item }))
        : [];
      setData(result);
      setError(null);
      lastFetchRef.current = Date.now();
      console.log(
        `[ZimnyTV] fetch OK -> video=${result.now_playing.video_id} seek=${result.now_playing.seek_to_seconds} serverTs=${result.now_playing.server_timestamp} dur=${result.now_playing.duration ?? "?"} clientNow=${clientNow} skew=${skew}`
      );
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.warn(`[ZimnyTV] fetch FAIL -> ${err.message} hasData=${!!dataRef.current}`);
      // Falha transitória com dados já carregados → mantém o player no último
      // horário válido (não derruba a tela para 'indisponível'). Só vira erro
      // fatal (sem player) se nunca tivemos dados (primeira carga).
      if (!dataRef.current) {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Initial load + auto-refresh ─────────────────────────────────────────

  useEffect(() => {
    loadData();
    intervalRef.current = setInterval(loadData, REFRESH_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (anchorTimerRef.current) {
        clearTimeout(anchorTimerRef.current);
        anchorTimerRef.current = null;
      }
    };
  }, [loadData]);

  // ── Play/pause based on focus ───────────────────────────────────────────
  // TV ao vivo: toca sempre que a aba está focada e há dados; pausa ao sair.
  // `setIsPlaying(true)` repetido a cada refresh é no-op (estado já true),
  // então não gera seeks desnecessários — o player só re-sincroniza quando
  // os dados da grade realmente mudam.

  useEffect(() => {
    if (prevFocusRef.current !== isFocused) {
      console.log(
        `[ZimnyTV] focus -> ${isFocused} (prev=${prevFocusRef.current}) data=${!!data}`
      );
      prevFocusRef.current = isFocused;
    }
    // TV ao vivo: deve tocar sempre que a aba está focada; pausa ao sair.
    // Removido o guard `hasDataRef` para que voltar à aba retome o play.
    if (isFocused && data) {
      setIsPlaying(true);
    } else if (!isFocused) {
      setIsPlaying(false);
      console.log(`[ZimnyTV] not focused -> pause`);
    }
  }, [isFocused, data]);

  // ── Controls ────────────────────────────────────────────────────────────

  const play = useCallback(() => {
    console.log(`[ZimnyTV] play()`);
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    console.log(`[ZimnyTV] pause()`);
    setIsPlaying(false);
  }, []);

  /**
   * Re-sincroniza com o AO VIVO.
   * Força re-fetch + play.
   */
  const syncToLive = useCallback(() => {
    console.log(`[ZimnyTV] syncToLive()`);
    loadData(true);
    setIsPlaying(true);
  }, [loadData]);

  /**
   * Avança para o próximo item quando o atual acaba.
   *
   * Usa a fila local (`upcoming` que o servidor mandou) para encadear
   * programa → vinheta → programa sem refetch a cada virada. Só busca a
   * grade nova quando a fila esvazia — com cooldown para nunca entrar em
   * loop quente se o servidor responder o mesmo vídeo.
   */
  const advanceToNext = useCallback(() => {
    const base = dataRef.current;
    const queue = queueRef.current;

    if (base && Array.isArray(queue) && queue.length > 0) {
      const [nextItem] = queue.splice(0, 1);
      queueRef.current = queue;

      const now = Math.floor(Date.now() / 1000);
      const nextNowPlaying: TvProgram = {
        ...nextItem,
        seek_to_seconds: 0,
        server_timestamp: now,
      };
      const nextUpcoming =
        queue.length > 0
          ? [
              {
                ...queue[0],
                seek_to_seconds: 0,
                server_timestamp: now,
              } as TvProgram,
            ]
          : undefined;

      const next: LiveTvData = {
        ...base,
        now_playing: nextNowPlaying,
        next_playing: queue.length > 0 ? nextUpcoming?.[0] : base.next_playing,
        upcoming: queue,
      };
      console.log(
        `[ZimnyTV] advance (fila) -> ${nextItem.video_id} intro=${!!nextItem.is_intro} restantes=${queue.length}`
      );
      dataRef.current = next;
      setData(next);
      setIsPlaying(true);

      // Re-ancora no relógio absoluto do servidor pouco antes do fim deste
      // item: mantém a fluidez (sem fetch na virada) E a sincronia entre
      // aparelhos (como uma transmissão RTMP de verdade).
      if (anchorTimerRef.current) {
        clearTimeout(anchorTimerRef.current);
        anchorTimerRef.current = null;
      }
      const itemDuration = Math.max(
        1,
        Math.min(nextItem.duration ?? 15, 60 * 60),
      );
      const anchorDelayMs = Math.max(1500, (itemDuration - 2) * 1000);
      anchorTimerRef.current = setTimeout(() => {
        anchorTimerRef.current = null;
        if (mountedRef.current) {
          console.log(`[ZimnyTV] re-ancora grade (fim do item ${nextItem.video_id})`);
          loadData(true);
        }
      }, anchorDelayMs);
      return;
    }

    // Fila esvaziada: busca grade nova, com cooldown contra loop.
    const nowMs = Date.now();
    if (nowMs - lastAdvanceRef.current < 8000) {
      console.log(`[ZimnyTV] advance ignorado (cooldown)`);
      return;
    }
    lastAdvanceRef.current = nowMs;
    console.log(`[ZimnyTV] advance (refetch)`);
    loadData(true);
    setIsPlaying(true);
  }, [loadData]);

  return {
    data,
    loading,
    error,
    isPlaying,
    play,
    pause,
    syncToLive,
    advanceToNext,
  };
}