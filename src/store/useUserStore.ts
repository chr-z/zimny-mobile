/**
 * useUserStore — Zustand store para o leitor ZIMNY.
 *
 * Persiste `savedPosts` via AsyncStorage para que os favoritos sobrevivam
 * ao fechamento do app. O `user` é mockado (real auth será implementada depois).
 *
 * Padrão de uso:
 *   const { savedPosts, toggleSavePost, isPostSaved } = useUserStore();
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { type WPPost } from "@/src/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MockUser = {
  id:        string;
  name:      string;
  email:     string;
  avatarUrl: string;
};

export type ThemePreference = "system" | "light" | "dark";

type UserStore = {
  user:                MockUser;
  savedPosts:          WPPost[];
  fontSizeMultiplier:  number;
  themePreference:     ThemePreference;
  toggleSavePost:      (post: WPPost) => void;
  isPostSaved:         (postId: number) => boolean;
  setFontSize:         (multiplier: number) => void;
  setTheme:            (theme: ThemePreference) => void;
};

// ─── Mock profile ─────────────────────────────────────────────────────────────

const MOCK_USER: MockUser = {
  id:        "1",
  name:      "Leitor ZIMNY",
  email:     "leitor@zimnymagazine.com",
  avatarUrl: "https://ui-avatars.com/api/?name=Leitor+ZIMNY&background=000000&color=FFFFFF&bold=true&size=128",
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user:               MOCK_USER,
      savedPosts:         [],
      fontSizeMultiplier: 1.0,
      themePreference:    "dark" as ThemePreference,

      toggleSavePost: (post: WPPost) => {
        const current = get().savedPosts;
        const exists  = current.some((p) => p.id === post.id);
        set({
          savedPosts: exists
            ? current.filter((p) => p.id !== post.id)
            : [post, ...current],
        });
      },

      isPostSaved: (postId: number) => {
        return get().savedPosts.some((p) => p.id === postId);
      },

      setFontSize: (multiplier: number) => {
        // Clamp between 0.8× and 1.6×
        set({ fontSizeMultiplier: Math.round(Math.min(1.6, Math.max(0.8, multiplier)) * 10) / 10 });
      },

      setTheme: (theme: ThemePreference) => {
        set({ themePreference: theme });
      },
    }),
    {
      name:    "zimny-user-store-v1",
      storage: createJSONStorage(() => AsyncStorage),
      // Persist reading preferences + saved posts
      partialize: (state) => ({
        savedPosts:         state.savedPosts,
        fontSizeMultiplier: state.fontSizeMultiplier,
        themePreference:    state.themePreference,
      }),
    }
  )
);
