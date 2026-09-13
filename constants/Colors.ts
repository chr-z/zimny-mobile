/**
 * Colors — Zimny Magazine palette.
 *
 * ⚠ This file is kept for backward compatibility with @react-navigation/native.
 * New components should import from `@/src/constants/designTokens` instead.
 */

const black = '#000000';
const white = '#ffffff';
const gray = '#F5F5F7';

export default {
  light: {
    text: black,
    background: gray,
    tint: black,
    tabIconDefault: `${black}99`,
    tabIconSelected: black,
  },
  dark: {
    text: white,
    background: black,
    tint: white,
    tabIconDefault: `${white}99`,
    tabIconSelected: white,
  },
};

export { color } from '@/src/constants/designTokens';
