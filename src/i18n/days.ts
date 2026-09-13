/**
 * days.ts — Shared day-of-week label helper for the colunistas screens.
 *
 * Zimny day numbering: 1 = Monday … 7 = Sunday.
 * Reuses the `colunistas.*` translation keys so the day labels are
 * rendered in the active app language (pt / en / es) instead of being
 * hardcoded in Portuguese.
 */
import type { TranslationKey } from "./types";

const DAY_KEYS: Record<number, TranslationKey> = {
  1: "colunistas.segunda",
  2: "colunistas.terca",
  3: "colunistas.quarta",
  4: "colunistas.quinta",
  5: "colunistas.sexta",
  6: "colunistas.sabado",
  7: "colunistas.domingo",
};

/** Translates a Zimny day number (1=Mon..7=Sun) via the active language. */
export function getDayLabel(
  dayNumber: number | undefined,
  t: (key: TranslationKey) => string,
): string {
  if (!dayNumber) return "";
  const key = DAY_KEYS[dayNumber];
  return key ? t(key) : "";
}

/** Converts a JS day (0=Sun..6=Sat) to Zimny day number (1=Mon..7=Sun). */
export function jsDayToZimnyDay(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}
