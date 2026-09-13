/**
 * AdvertiseCta — CTA "Anuncie Conosco" na ZYTV.
 *
 * Inspirado em layouts de alto engajamento, adaptado com a identidade
 * visual minimalista e elegante da Zimny (preto & branco).
 *
 * Todos os dados de contato vêm de `src/constants/contact.ts` (fonte única
 * de verdade) — nunca hardcodar telefone/e-mail aqui.
 */
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { whatsappUrl, ZIMNY_CONTACT } from "@/src/constants/contact";
import { font, radius, spacing } from "@/src/constants/designTokens";
import { useTranslation } from "@/src/i18n";

export function AdvertiseCta() {
  const { t } = useTranslation();
  const router = useRouter();

  // "CONHEÇA OS PLANOS" → página de contato com todos os canais (WhatsApp,
  // telefone, e-mail e redes sociais).
  const handlePlans = useCallback(() => {
    router.push("/contato");
  }, [router]);

  const handleWhatsApp = useCallback(() => {
    Linking.openURL(whatsappUrl()).catch(() => {});
  }, []);

  const handleEmail = useCallback(() => {
    Linking.openURL(`mailto:${ZIMNY_CONTACT.email}`).catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        {/* Header Section: Badge/Icon + Headline */}
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="megaphone-outline" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headline}>{t("tv.headline")}</Text>
            <Text style={styles.subHeadline}>{t("tv.cta_subtitle")}</Text>
          </View>
        </View>

        {/* Stats / Prova Social Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={16} color="#0A0A0A" />
            <Text style={styles.statValue}>+50k</Text>
            <Text style={styles.statLabel}>{t("tv.stat_viewers")}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Ionicons name="globe-outline" size={16} color="#0A0A0A" />
            <Text style={styles.statValue}>24/7</Text>
            <Text style={styles.statLabel}>{t("tv.stat_live")}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Ionicons name="trending-up-outline" size={16} color="#0A0A0A" />
            <Text style={styles.statValue}>{t("tv.stat_high")}</Text>
            <Text style={styles.statLabel}>{t("tv.stat_engagement")}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.ctaRow}>
          <Pressable
            onPress={handlePlans}
            style={styles.ctaButton}
            android_ripple={{ color: "rgba(255,255,255,0.15)" }}
          >
            <Text style={styles.ctaText}>{t("tv.contact_info")}</Text>
            <Feather name="arrow-right" size={14} color="#FFFFFF" />
          </Pressable>

          <Pressable
            onPress={handleWhatsApp}
            style={styles.whatsappBtn}
            android_ripple={{ color: "rgba(255,255,255,0.15)" }}
          >
            <FontAwesome name="whatsapp" size={16} color="#FFFFFF" />
            <Text style={styles.whatsappText}>{t("tv.fale_conosco")}</Text>
          </Pressable>
        </View>

        {/* Contact Info Footer */}
        <View style={styles.contactFooter}>
          <Pressable onPress={handleWhatsApp} style={styles.contactItem}>
            <FontAwesome name="whatsapp" size={12} color="#666666" />
            <Text style={styles.contactText}>{ZIMNY_CONTACT.phoneDisplay}</Text>
          </Pressable>

          <Pressable onPress={handleEmail} style={styles.contactItem}>
            <Feather name="mail" size={12} color="#666666" />
            <Text style={styles.contactText}>{ZIMNY_CONTACT.email}</Text>
          </Pressable>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: spacing.md,
    marginVertical: spacing.md,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  /* Header Styles */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headline: {
    fontFamily: font.serif,
    fontSize: font.size.body,
    fontWeight: "700",
    color: "#0A0A0A",
    lineHeight: font.size.body * 1.2,
  },
  subHeadline: {
    fontSize: 11,
    color: "#666666",
    marginTop: 2,
  },

  /* Stats Box Styles */
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.04)",
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0A0A0A",
    marginTop: 2,
  },
  statLabel: {
    fontSize: 9,
    color: "#777777",
    marginTop: 1,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  /* CTA Buttons */
  ctaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ctaButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0A0A",
    paddingVertical: 12,
    borderRadius: radius.sm,
    gap: 6,
  },
  ctaText: {
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25D366",
    paddingVertical: 12,
    borderRadius: radius.sm,
    gap: 6,
  },
  whatsappText: {
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* Contact Footer */
  contactFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
  },
  contactText: {
    fontSize: 10,
    color: "#666666",
  },
});
