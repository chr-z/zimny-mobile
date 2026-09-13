/**
 * useTheme — Reactive theme hook for Zimny Magazine.
 *
 * Reads `themePreference` from useUserStore and resolves to `isDark`.
 * Exposes semantic color objects for convenient use in components.
 */
import { useColorScheme } from 'react-native';

import { color, type ThemeColorSet } from '@/src/constants/designTokens';
import { useUserStore } from '@/src/store/useUserStore';

export type ThemeColors = ThemeColorSet;

export function useTheme() {
  const systemScheme = useColorScheme();
  const preference   = useUserStore((s) => s.themePreference);

  const isDark =
    preference === 'dark' ||
    (preference === 'system' && systemScheme === 'dark');

  const colors: ThemeColors = {
    ...(isDark ? color.dark : color.light),
  };

  return { isDark, colors, preference };
}
