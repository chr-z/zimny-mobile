/**
 * PodcastSponsorBanner — Banner de conversão posicionado abaixo do player do Podcast.
 *
 * Focado em converter ouvintes/espectadores em patrocinadores ou clientes do
 * ecossistema de marketing da Zimny.
 *
 * Estética: card branco elegante, largura 80%, tipografia refinada.
 */
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { font, radius, spacing } from "@/src/constants/designTokens";
import { useTranslation } from "@/src/i18n";
import type { TranslationKey } from "@/src/i18n/types";

// ─── Benefit data ────────────────────────────────────────────────────────────

const BENEFITS: { icon: "microphone" | "book" | "bullhorn"; key: TranslationKey }[] = [
  { icon: "microphone", key: "podcast.sponsor_benefit_1" },
  { icon: "book", key: "podcast.sponsor_benefit_2" },
  { icon: "bullhorn", key: "podcast.sponsor_benefit_3" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function PodcastSponsorBanner() {
  const { t } = useTranslation();
  const router = useRouter();

  // CTA "Anuncie sua marca no Podcast" → página de contato com todos os canais.
  const handleSponsorClick = useCallback(() => {
    router.push("/contato");
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Accent line — detalhe refinado no topo */}
        <View style={styles.accentLine} />

        {/* Tag de Destaque */}
        <View style={styles.tagBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.tagText}>{t("podcast.sponsor_tag")}</Text>
        </View>

        {/* Título */}
        <Text style={styles.title}>{t("podcast.sponsor_title")}</Text>

        {/* Alcance */}
        <Text style={styles.subtitle}>{t("podcast.sponsor_reach")}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Benefícios */}
        <View style={styles.benefitsList}>
          {BENEFITS.map((b) => (
            <View key={b.key} style={styles.benefitRow}>
              <View style={styles.iconCircle}>
                <FontAwesome name={b.icon} size={14} color="#0A0A0A" />
              </View>
              <Text style={styles.benefitText}>{t(b.key)}</Text>
            </View>
          ))}
        </View>

        {/* CTA — WhatsApp */}
        <Pressable
          style={styles.ctaButton}
          onPress={handleSponsorClick}
          android_ripple={{ color: "rgba(255,255,255,0.15)" }}
        >
          <FontAwesome name="bullhorn" size={16} color="#FFFFFF" />
          <Text style={styles.ctaText}>{t("podcast.sponsor_cta")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: "80%",
    alignSelf: "center",
    marginVertical: spacing.xl,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },

  // ── Accent line ──────────────────────────────────────────────────────────
  accentLine: {
    width: 24,
    height: 2.5,
    backgroundColor: "#0A0A0A",
    borderRadius: 1,
    marginBottom: spacing.md,
  },

  // ── Tag ──────────────────────────────────────────────────────────────────
  tagBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    gap: 6,
    marginBottom: spacing.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0A0A0A",
  },
  tagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#333333",
    letterSpacing: 1,
  },

  // ── Title ────────────────────────────────────────────────────────────────
  title: {
    fontFamily: font.serif,
    fontSize: font.size.title,
    fontWeight: "700",
    color: "#0A0A0A",
    lineHeight: 26,
    marginBottom: spacing.xs,
  },

  // ── Subtitle (alcance) ───────────────────────────────────────────────────
  subtitle: {
    fontSize: font.size.caption,
    color: "#666666",
    lineHeight: 18,
    marginBottom: spacing.md,
  },

  // ── Divider ──────────────────────────────────────────────────────────────
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginBottom: spacing.md,
  },

  // ── Benefits ─────────────────────────────────────────────────────────────
  benefitsList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    flex: 1,
    fontSize: 12,
    color: "#444444",
    lineHeight: 16,
    letterSpacing: 0.2,
  },

  // ── CTA ──────────────────────────────────────────────────────────────────
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0A0A0A",
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  ctaText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 0.5,
  },
});