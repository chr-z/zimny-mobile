/**
 * Gallery — Rota dinâmica para galeria específica.
 *
 * Configurado como tela independente, sem header do Expo Router,
 * usando header customizado do GalleryScreen.
 */
import { Stack } from "expo-router";

import GalleryScreen from "@/src/components/gallery/GalleryScreen";

export default function GalleryRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <GalleryScreen />
    </>
  );
}