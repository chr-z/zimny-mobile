/**
 * EventsMoreButton — Botão "MAIS EVENTOS" para a Home.
 *
 * Item independente do layout da Home, posicionável via painel WordPress
 * (Layout da Home → "Mais Eventos (botão)").
 *
 * Press → navega para a tela de eventos.
 */
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "@/src/constants/designTokens";
import { useTranslation } from "@/src/i18n";

export function EventsMoreButton() {
  const { t } = useTranslation();
  const router = useRouter();

  const handlePress = useCallback(() => {
    router.push("/(drawer)/(tabs)/events");
  }, [router]);

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={handlePress} style={styles.button}>
        <Text style={styles.text}>{t("common.mais_eventos")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  text: {
    fontSize: 12,
    letterSpacing: 1.5,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});