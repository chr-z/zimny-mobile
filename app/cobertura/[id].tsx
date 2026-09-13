/**
 * Cobertura — Rota dinâmica para cobertura específica.
 *
 * Configurado como tela independente, sem header do Expo Router,
 * usando header customizado do CoberturaScreen.
 */
import { Stack } from "expo-router";

import CoberturaScreen from "@/src/components/cobertura/CoberturaScreen";

export default function CoberturaRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CoberturaScreen />
    </>
  );
}