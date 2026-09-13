/**
 * columns.ts — Client-side translation of the columnist column names.
 *
 * The WordPress admin stores each column name as a single Portuguese string
 * (e.g. "Saúde & Bem-Estar"). This helper maps those known PT names to the
 * active app language (pt / en / es) so the UI "recognizes" the language.
 * If a name isn't in the map (e.g. a custom/unknown column), it is returned
 * unchanged so nothing breaks.
 */
import type { AppLanguage } from "./types";

const COLUMN_NAMES: Record<string, Record<AppLanguage, string>> = {
  "saúde & bem-estar": {
    pt: "Saúde & Bem-Estar",
    en: "Health & Wellness",
    es: "Salud y Bienestar",
  },
  "estética": {
    pt: "Estética",
    en: "Aesthetics",
    es: "Estética",
  },
  "neurobusiness": {
    pt: "Neurobusiness",
    en: "Neurobusiness",
    es: "Neurobusiness",
  },
  "moda & estilo": {
    pt: "Moda & Estilo",
    en: "Fashion & Style",
    es: "Moda y Estilo",
  },
  "aconteceu em ma": {
    pt: "Aconteceu em MA",
    en: "Happened in MA",
    es: "Sucedió en MA",
  },
  "publicidade sem filtro": {
    pt: "Publicidade Sem Filtro",
    en: "Filter-Free Marketing",
    es: "Publicidad Sin Filtro",
  },
  "dicas da bonita": {
    pt: "Dicas da Bonita",
    en: "Beauty Tips",
    es: "Consejos de Belleza",
  },
};

/**
 * Returns the column name translated into the active language.
 * Falls back to the original string when the name is unknown.
 */
export function translateColumnName(
  name: string,
  language: AppLanguage,
): string {
  if (!name) return name;
  const entry = COLUMN_NAMES[name.trim().toLowerCase()];
  if (!entry) return name;
  return entry[language] ?? entry.pt;
}
