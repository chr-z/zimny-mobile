/**
 * Event Gallery — Rota dinâmica para galeria de um evento específico.
 *
 * Configurado como tela independente, sem header do Expo Router,
 * usando header customizado do EventGalleryScreen.
 */
import { Stack } from "expo-router";

import EventGalleryScreen from "@/src/components/events/EventGalleryScreen";

export default function EventGalleryRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <EventGalleryScreen />
    </>
  );
}