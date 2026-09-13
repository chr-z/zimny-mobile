/**
 * useLanguageStore
 *
 * Zustand store for user language preference.
 * - `language`: the user's manual override (null = use device locale)
 * - `setLanguage(lang)`: persists the override to AsyncStorage
 * - `clearLanguage()`: resets to device detection
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AppLanguage = "pt" | "en" | "es";

type LanguageState = {
  /** null means "use device locale" (auto-detect) */
  language: AppLanguage | null;
  setLanguage: (lang: AppLanguage | null) => void;
};

const STORAGE_KEY = "zimny-language-preference";

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: null,
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
