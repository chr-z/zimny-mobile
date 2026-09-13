/**
 * useTranslation — Lightweight i18n hook.
 *
 * Returns a `t(key)` function that looks up the current language's translation
 * from the translations dictionary. Falls back to Portuguese if the key is
 * missing for the current language, or to the key itself as a last resort.
 *
 * Usage:
 *   const { t, language } = useTranslation();
 *   <Text>{t("nav.noticias")}</Text>
 *
 * Supports interpolation:
 *   t("welcome", { name: "John" })  →  "Bem-vindo, John"
 */
import { useCallback } from "react";

import { useLanguage } from "@/src/hooks/useLanguage";
import { translations } from "./translations";
import type { TranslationKey } from "./types";

export function useTranslation() {
  const { language } = useLanguage();

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const entry = translations[key];
      if (!entry) return key;

      let text = entry[language] ?? entry.pt ?? key;

      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(`{{${k}}}`, String(v));
        }
      }

      return text;
    },
    [language],
  );

  return { t, language } as const;
}