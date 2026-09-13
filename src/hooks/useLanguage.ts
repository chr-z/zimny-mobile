/**
 * useLanguage
 *
 * Detects the device language via expo-localization and merges it with
 * any manual override stored in useLanguageStore.
 *
 * Returns:
 *  - language:  the effective language ("pt" | "en" | "es")
 *  - setLanguage(lang | null): override or reset to auto
 *  - isOverridden: true when the user has manually chosen a language
 */
import { getLocales } from "expo-localization";
import { useMemo } from "react";

import { useLanguageStore, type AppLanguage } from "@/src/stores/useLanguageStore";

const FALLBACK: AppLanguage = "pt";

/**
 * Maps the device locale string to one of our supported languages.
 * Examples: "pt-BR" → "pt", "en-US" → "en", "es-ES" → "es"
 */
function detectDeviceLanguage(): AppLanguage {
  try {
    const locales = getLocales();
    if (locales.length > 0) {
      const tag = locales[0].languageCode?.toLowerCase() ?? "";
      if (tag.startsWith("pt")) return "pt";
      if (tag.startsWith("en")) return "en";
      if (tag.startsWith("es")) return "es";
    }
  } catch {
    // expo-localization may throw in some environments
  }
  return FALLBACK;
}

/**
 * Resolve a língua efetiva sem hook: override manual salvo OU locale do device.
 * Usado pelo pushService (register envia a língua da UI) e pelo hook abaixo.
 */
export function resolveAppLanguage(): AppLanguage {
  const storeLang = useLanguageStore.getState().language;
  return storeLang ?? detectDeviceLanguage();
}

export function useLanguage() {
  const storeLang = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const language = useMemo<AppLanguage>(() => resolveAppLanguage(), [storeLang]);

  return {
    language,
    setLanguage,
    isOverridden: storeLang !== null,
  };
}
