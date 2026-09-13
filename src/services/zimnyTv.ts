/**
 * Zimny TV 24/7 — Service
 *
 * Busca os dados da transmissão linear a partir do endpoint nativo do WordPress.
 * Endpoint: GET https://zimnymagazine.com/wp-json/zimny/v1/live-tv
 *
 * Agora suporta duas fontes de vídeo:
 *   - WordPress Media Library (video_url): player nativo expo-video
 *   - YouTube (video_id): fallback via react-native-youtube-iframe
 */
import { ZIMNY_ORIGIN, zimnyFetchJson } from "@/src/services/api";

// ─── Types ─────────────────────────────────────────────────────────────────

/** Programa exibido (now_playing) ou próximo da grade (next_playing). */
export type TvProgram = {
  /** YouTube video ID (legado) ou attachment_id como string */
  video_id: string;
  title: string;
  category: string;
  /** URL direta do WordPress Media Library (quando attachment_id) */
  video_url?: string;
  /** URL da thumbnail do WordPress (quando attachment_id) */
  thumbnail_url?: string;
  /** Duração em segundos */
  duration?: number;
  /** Verdadeiro quando é a vinheta/abertura entre programas */
  is_intro?: boolean;
  seek_to_seconds: number;
  server_timestamp: number;
};

export type LiveTvData = {
  now_playing: TvProgram;
  /** Próximo vídeo da grade — usado pelo app para pré-carregar e fazer fade */
  next_playing?: TvProgram;
  /** Fila de próximos vídeos (programas + vinhetas) — encadeia sem refetch */
  upcoming?: TvProgram[];
  schedule: Array<{
    video_id: string;
    title: string;
    /** Epoch timestamp (UTC seconds) — o app formata no fuso local do dispositivo */
    time: number;
    is_now: boolean;
    is_next: boolean;
  }>;
};

// ─── Constants ─────────────────────────────────────────────────────────────

const LIVE_TV_ENDPOINT = `${ZIMNY_ORIGIN}/wp-json/zimny/v1/live-tv`;

// ─── Fetch ─────────────────────────────────────────────────────────────────

/**
 * Busca os dados atuais da transmissão ao vivo.
 * O WordPress já faz cache interno de 30 segundos via transients.
 */
export async function fetchLiveTv(fresh = false): Promise<LiveTvData> {
  // `_` cache-buster: o LiteSpeed/Hostinger cacheia GET por URL. Sem um
  // parâmetro único o app pode receber a MESMA resposta congelada por minutos
  // (skew crescente -> loop de vídeos). Com query única, sempre chega ao PHP.
  const cacheBust = Date.now();
  // `fresh` (ex: na virada de programa/vinheta) força o servidor a recalcular
  // sem usar o transient de 30s — evita dados defasados que causam travamento.
  const url = fresh
    ? `${LIVE_TV_ENDPOINT}?fresh=1&_=${cacheBust}`
    : `${LIVE_TV_ENDPOINT}?_=${cacheBust}`;
  return zimnyFetchJson<LiveTvData>(url);
}

/**
 * Pré-carrega os metadados da TV silenciosamente (ex: na inicialização do app).
 * Usado para garantir resposta instantânea quando o usuário abrir a aba da TV.
 * O resultado não é retornado — apenas armazenado em cache pelo mecanismo de fetch.
 */
export function prefetchLiveTv(): void {
  fetch(LIVE_TV_ENDPOINT, {
    method: "GET",
    headers: { Accept: "application/json" },
  }).catch(() => {
    // Silently fail — o fetch real na tela tratará o erro
  });
}