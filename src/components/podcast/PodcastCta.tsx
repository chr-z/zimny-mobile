/**
 * PodcastCta — CTA para empresas participarem do podcast Zimny.
 *
 * Mensagem: "Sua empresa tem um lugar de fala" / "Conte a história da sua marca"
 * Reutiliza os contatos do CTA da Home (WhatsApp, E-mail, Telefone).
 */
import { Feather, FontAwesome } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GlassView } from "@/src/components/common/GlassView";
import { mailtoUrl, telUrl, whatsappUrl } from "@/src/constants/contact";
import { font, radius, spacing } from "@/src/constants/designTokens";
import { useTranslation } from "@/src/i18n";

// ─── Component ──────────────────────────────────────────────────────────────

export function PodcastCta() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleWhatsApp = useCallback(() => {
    Linking.openURL(whatsappUrl()).catch(() => {});
  }, []);

  const handleEmail = useCallback(() => {
    Linking.openURL(mailtoUrl()).catch(() => {});
  }, []);

  const handlePhone = useCallback(() => {
    Linking.openURL(telUrl()).catch(() => {});
  }, []);

  // Ações rápidas → página de contato com todos os canais.
  const handleFullContact = useCallback(() => {
    router.push("/contato");
  }, [router]);

  const actions = [
    {
      icon: "phone" as const,
      label: t("contact.ligar"),
      color: "#5AC8FA",
      onPress: handlePhone,
    },
    {
      icon: "envelope" as const,
      label: t("contact.email"),
      color: "#8E8E93",
      onPress: handleEmail,
    },
    {
      icon: "whatsapp" as const,
      label: t("contact.whatsapp"),
      color: "#25D366",
      onPress: handleWhatsApp,
    },
  ];

  return (
    <View style={styles.wrapper}>
      <GlassView intensity={65} tint="dark" style={styles.card}>
        {/* Headline */}
        <Text style={styles.headline}>{t("podcast.headline")}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {t("podcast.subtitle")}
        </Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          {actions.map((action) => (
            <View key={action.label} style={styles.actionItem}>
              <Pressable
                onPress={action.onPress}
                style={({ pressed }) => [
                  {
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: `${action.color}18`,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: `${action.color}30`,
                  },
                  pressed && { opacity: 0.6, transform: [{ scale: 0.92 }] },
                ]}
              >
                <FontAwesome name={action.icon} size={18} color={action.color} />
              </Pressable>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA principal → página de contato completa */}
        <Pressable
          onPress={handleFullContact}
          style={({ pressed }) => [
            styles.primaryCta,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
          android_ripple={{ color: "rgba(255,255,255,0.12)" }}
        >
          <FontAwesome name="whatsapp" size={15} color="#FFFFFF" />
          <Text style={styles.primaryCtaText}>{t("contact.fale_conosco")}</Text>
          <Feather name="arrow-right" size={14} color="#FFFFFF" />
        </Pressable>
      </GlassView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  headline: {
    fontFamily: font.serif,
    fontSize: font.size.title,
    color: "#FFFFFF",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: font.size.body,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: 0.3,
    marginBottom: spacing.md,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.xl,
    alignItems: "center",
  },
  actionItem: {
    alignItems: "center",
    gap: 6,
  },
  actionLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.5,
  },

  // ── CTA principal ─────────────────────────────────────────────────────
  primaryCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    alignSelf: "stretch",
    backgroundColor: "#25D366",
    paddingVertical: 12,
    borderRadius: radius.md,
    marginTop: spacing.lg,
  },
  primaryCtaText: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});