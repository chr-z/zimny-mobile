/**
 * YouTube Playlist — Service
 *
 * Busca vídeos do podcast pelo proxy WordPress da ZIMNY.
 * Credenciais de provedores externos nunca são incluídas no aplicativo.
 */
import { ZIMNY_ORIGIN, zimnyFetchJson } from "@/src/services/api";

// ─── Types ─────────────────────────────────────────────────────────────────

export type YouTubePlaylistItem = {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
};

export type FetchPlaylistParams = {
  /** Max number of videos to return (default: 50, max: 50) */
  limit?: number;
};

// ─── Constants ─────────────────────────────────────────────────────────────

// WordPress proxy endpoint — avoids exposing API key in the client
const PODCAST_ENDPOINT = `${ZIMNY_ORIGIN}/wp-json/zimny/v1/podcast`;

// ─── Fetch from WordPress proxy ───────────────────────────────────────────

/**
 * Busca a lista de vídeos do podcast via WordPress (proxy seguro).
 * O WordPress faz a chamada à YouTube API e retorna apenas os dados necessários.
 *
 * Se o endpoint WordPress estiver indisponível, retorna uma lista vazia sem
 * expor chaves ou fazer chamadas diretas autenticadas pelo dispositivo.
 */
export async function fetchPodcastFromWordPress(
  params: FetchPlaylistParams = {}
): Promise<YouTubePlaylistItem[]> {
  const search = new URLSearchParams();
  if (params.limit != null) {
    search.set("limit", String(Math.min(50, Math.max(1, params.limit))));
  }

  const queryString = search.toString();
  const url = queryString
    ? `${PODCAST_ENDPOINT}?${queryString}`
    : PODCAST_ENDPOINT;

  console.log(`[YouTubePlaylist] Fetching from WordPress: ${url}`);

  try {
    const data = await zimnyFetchJson<YouTubePlaylistItem[]>(url);
    console.log(`[YouTubePlaylist] Loaded ${data.length} videos from WordPress`);
    return data;
  } catch (error) {
    console.warn(
      "[YouTubePlaylist] WordPress endpoint unavailable:",
      error
    );
    return [];
  }
}

// ─── Sorting ──────────────────────────────────────────────────────────────

/**
 * Ordena os vídeos pela data de publicação (publishedAt), do mais recente
 * para o mais antigo. A API do YouTube retorna os itens na ordem da playlist,
 * que nem sempre corresponde à data de postagem do episódio.
 */
export function sortVideosByPublishedAt(
  videos: YouTubePlaylistItem[]
): YouTubePlaylistItem[] {
  return [...videos].sort((a, b) => {
    const timeA = Date.parse(a.publishedAt);
    const timeB = Date.parse(b.publishedAt);

    // Itens sem data válida vão para o final da lista
    if (Number.isNaN(timeA)) return 1;
    if (Number.isNaN(timeB)) return -1;

    return timeB - timeA; // mais recente primeiro
  });
}

// ─── Combined fetch ───────────────────────────────────────────────────────

/**
 * Busca os vídeos do podcast.
 * A lista retornada é sempre ordenada por data de publicação (mais recente primeiro).
 */
export async function fetchPodcastVideos(
  params: FetchPlaylistParams = {}
): Promise<YouTubePlaylistItem[]> {
  const wpData = await fetchPodcastFromWordPress(params);
  return sortVideosByPublishedAt(wpData);
}
