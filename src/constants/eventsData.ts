/**
 * eventsData — Dados mockados de eventos e coberturas da Zimny.
 *
 * Estrutura: cada item pode ser foto (portrait/landscape) ou vídeo.
 * Substituir por dados da API WordPress quando disponível.
 */

export type EventMedia = {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnail: string;
  title: string;
  date: string;
  /** Orientation hint for layout */
  orientation: "portrait" | "landscape";
  /** Event category */
  category: "producao" | "cobertura";
};

// Helper to generate landscape picsum URLs
const land = (seed: string) =>
  `https://picsum.photos/seed/${seed}/640/427`;
const port = (seed: string) =>
  `https://picsum.photos/seed/${seed}/427/640`;

export const EVENTS_MEDIA: EventMedia[] = [
  // ── Zimny Produções ─────────────────────────────────────────────────
  {
    id: "e1",
    type: "photo",
    url: port("event-zimny-1"),
    thumbnail: port("event-zimny-1"),
    title: "Zimny Magazine — Lançamento Edição Inverno 2025",
    date: "2025-06-15",
    orientation: "portrait",
    category: "producao",
  },
  {
    id: "e2",
    type: "video",
    url: "https://www.youtube.com/watch?v=example1",
    thumbnail: land("event-zimny-2"),
    title: "Zimny Experience — Making Of",
    date: "2025-05-20",
    orientation: "landscape",
    category: "producao",
  },
  {
    id: "e3",
    type: "photo",
    url: land("event-zimny-3"),
    thumbnail: land("event-zimny-3"),
    title: "Zimny Talks — Painel de Moda Sustentável",
    date: "2025-04-10",
    orientation: "landscape",
    category: "producao",
  },
  {
    id: "e4",
    type: "photo",
    url: port("event-zimny-4"),
    thumbnail: port("event-zimny-4"),
    title: "Zimny Magazine — Edição Verão 2025",
    date: "2025-03-01",
    orientation: "portrait",
    category: "producao",
  },
  {
    id: "e5",
    type: "video",
    url: "https://www.youtube.com/watch?v=example2",
    thumbnail: land("event-zimny-5"),
    title: "Entrevista Exclusiva — Bastidores Zimny",
    date: "2025-02-18",
    orientation: "landscape",
    category: "producao",
  },
  {
    id: "e6",
    type: "photo",
    url: port("event-zimny-6"),
    thumbnail: port("event-zimny-6"),
    title: "Zimny Select — Feira de Arte e Cultura",
    date: "2025-01-25",
    orientation: "portrait",
    category: "producao",
  },

  // ── Coberturas Zimny ─────────────────────────────────────────────────
  {
    id: "e7",
    type: "photo",
    url: land("cover-1"),
    thumbnail: land("cover-1"),
    title: "São Paulo Fashion Week — Cobertura Zimny",
    date: "2025-06-10",
    orientation: "landscape",
    category: "cobertura",
  },
  {
    id: "e8",
    type: "photo",
    url: port("cover-2"),
    thumbnail: port("cover-2"),
    title: "Festival de Cinema — Tapete Vermelho",
    date: "2025-05-28",
    orientation: "portrait",
    category: "cobertura",
  },
  {
    id: "e9",
    type: "video",
    url: "https://www.youtube.com/watch?v=example3",
    thumbnail: land("cover-3"),
    title: "Resumo — Bienal de Arte 2025",
    date: "2025-05-15",
    orientation: "landscape",
    category: "cobertura",
  },
  {
    id: "e10",
    type: "photo",
    url: land("cover-4"),
    thumbnail: land("cover-4"),
    title: "Desfile de Alta Costura — Paris",
    date: "2025-04-22",
    orientation: "landscape",
    category: "cobertura",
  },
  {
    id: "e11",
    type: "photo",
    url: port("cover-5"),
    thumbnail: port("cover-5"),
    title: "Exposição de Fotografia — Novo Olhar",
    date: "2025-04-05",
    orientation: "portrait",
    category: "cobertura",
  },
  {
    id: "e12",
    type: "video",
    url: "https://www.youtube.com/watch?v=example4",
    thumbnail: land("cover-6"),
    title: "Entrevista — Curador da Bienal",
    date: "2025-03-20",
    orientation: "landscape",
    category: "cobertura",
  },
  {
    id: "e13",
    type: "photo",
    url: port("cover-7"),
    thumbnail: port("cover-7"),
    title: "Lançamento de Coleção — Designer Brasileiro",
    date: "2025-03-12",
    orientation: "portrait",
    category: "cobertura",
  },
  {
    id: "e14",
    type: "photo",
    url: land("cover-8"),
    thumbnail: land("cover-8"),
    title: "Feira de Design — Tendências 2025",
    date: "2025-02-28",
    orientation: "landscape",
    category: "cobertura",
  },
  {
    id: "e15",
    type: "video",
    url: "https://www.youtube.com/watch?v=example5",
    thumbnail: land("cover-9"),
    title: "Making Of — Campanha Zimny Verão",
    date: "2025-02-10",
    orientation: "landscape",
    category: "cobertura",
  },
];