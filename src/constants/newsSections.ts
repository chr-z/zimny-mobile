/**
 * newsSections — Configuração das editorias da aba Notícias (ids 206–212).
 *
 * Fonte única de ids/labels i18n/cores, compartilhada entre:
 * - a aba Notícias (`(tabs)/noticias.tsx`)
 * - a página da categoria (`/category/[id]`, aberta pelo "Ver mais")
 *
 * As cores são psicologicamente atreladas ao tema de cada editoria
 * (padrão G1/Apple News): a cor comunica o assunto antes da leitura.
 */
import type { TranslationKey } from "@/src/i18n/types";

export type NewsSection = {
  id: number;
  labelKey: TranslationKey;
  color: string;
};

export const NEWS_SECTIONS: NewsSection[] = [
  { id: 206, labelKey: "news.cat_206", color: "#B4493A" }, // New England — vermelho-tijolo colonial (Boston/outono)
  { id: 207, labelKey: "news.cat_207", color: "#2E9E5B" }, // Brasileiros — verde Brasil
  { id: 208, labelKey: "news.cat_208", color: "#2F6FED" }, // Mundo — azul global/confiança
  { id: 209, labelKey: "news.cat_209", color: "#9A6BD1" }, // Cultura — roxo arte/criatividade
  { id: 210, labelKey: "news.cat_210", color: "#C9A84C" }, // Business — dourado prosperidade (cor da marca)
  { id: 211, labelKey: "news.cat_211", color: "#12A5C9" }, // Ciência & Tecnologia — ciano inovação/futuro
  { id: 212, labelKey: "news.cat_212", color: "#F07818" }, // Esportes — laranja energia/ação
];

/** Cor por id de editoria (fallback = dourado da marca). */
export function categoryColor(id: number): string {
  return NEWS_SECTIONS.find((s) => s.id === id)?.color ?? "#C9A84C";
}

/** Record cor por id — conveniência para lookup direto. */
export const CATEGORY_COLORS: Record<number, string> = Object.fromEntries(
  NEWS_SECTIONS.map((s) => [s.id, s.color])
) as Record<number, string>;

/** Label i18n por id de editoria (fallback = undefined → "Categoria N"). */
export function categoryLabelKey(id: number): TranslationKey | undefined {
  return NEWS_SECTIONS.find((s) => s.id === id)?.labelKey;
}
