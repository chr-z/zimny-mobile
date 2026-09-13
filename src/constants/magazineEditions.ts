/**
 * Mock de dados das edições do ZIMNY Magazine.
 * Estrutura espelha o que seria retornado ao consumir as imagens do FlipBook3D
 * diretamente do WordPress (ignorando o plugin e extraindo apenas as imagens WebP).
 *
 * Substituir coverUrl e pages pelas URLs reais das imagens no WordPress
 * quando as edições digitais estiverem mapeadas.
 */

const pg = (seed: string, n: number) =>
  Array.from(
    { length: n },
    (_, i) => `https://picsum.photos/seed/${seed}pg${i + 1}/800/1200`
  );

export type MagazineEdition = {
  id: string;
  number: string;
  season: string;
  title: string;
  tagline: string;
  coverUrl: string;
  pages: string[]; // capa + páginas internas
};

export const MAGAZINE_EDITIONS: MagazineEdition[] = [
  {
    id: "1",
    number: "01",
    season: "INVERNO 2024",
    title: "A Arte de Viver Bem",
    tagline: "Moda · Identidade · Estilo",
    coverUrl: "https://picsum.photos/seed/zmed01/800/1200",
    pages: ["https://picsum.photos/seed/zmed01/800/1200", ...pg("zed01", 13)],
  },
  {
    id: "2",
    number: "02",
    season: "PRIMAVERA 2024",
    title: "Renascer & Renovar",
    tagline: "Beleza · Saúde · Bem-Estar",
    coverUrl: "https://picsum.photos/seed/zmed02/800/1200",
    pages: ["https://picsum.photos/seed/zmed02/800/1200", ...pg("zed02", 11)],
  },
  {
    id: "3",
    number: "03",
    season: "VERÃO 2024",
    title: "Horizontes Dourados",
    tagline: "Viagem · Luxo · Horizonte",
    coverUrl: "https://picsum.photos/seed/zmed03/800/1200",
    pages: ["https://picsum.photos/seed/zmed03/800/1200", ...pg("zed03", 15)],
  },
  {
    id: "4",
    number: "04",
    season: "OUTONO 2024",
    title: "Raízes Profundas",
    tagline: "Arte · Cultura · Memória",
    coverUrl: "https://picsum.photos/seed/zmed04/800/1200",
    pages: ["https://picsum.photos/seed/zmed04/800/1200", ...pg("zed04", 9)],
  },
  {
    id: "5",
    number: "05",
    season: "INVERNO 2025",
    title: "Equilíbrio Interior",
    tagline: "Estética · Mente · Corpo",
    coverUrl: "https://picsum.photos/seed/zmed05/800/1200",
    pages: ["https://picsum.photos/seed/zmed05/800/1200", ...pg("zed05", 11)],
  },
  {
    id: "6",
    number: "06",
    season: "PRIMAVERA 2025",
    title: "Terra Viva",
    tagline: "Sustentabilidade · Moda · Futuro",
    coverUrl: "https://picsum.photos/seed/zmed06/800/1200",
    pages: ["https://picsum.photos/seed/zmed06/800/1200", ...pg("zed06", 13)],
  },
];

export function getEditionById(id: string): MagazineEdition | undefined {
  return MAGAZINE_EDITIONS.find((e) => e.id === id);
}
