/**
 * MarketingPlanCard — Glass box card for a single marketing plan.
 *
 * Renders plan name, subtitle, tag badge, item list, and bonus section
 * inside a GlassView container with an accent color border.
 */
import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { GlassView } from "@/src/components/common/GlassView";
import { PressableScale } from "@/src/components/common/PressableScale";
import { color, font, radius, spacing } from "@/src/constants/designTokens";
import { useTranslation } from "@/src/i18n";

// ─── Types ─────────────────────────────────────────────────────────────────

export type MarketingPlanCardProps = {
  planKey: "legacy" | "prestige" | "essential";
  name: string;
  subtitle: string;
  tag: { label: string; color: string };
  items: string[];
  bonuses?: string[];
  accentColor: string;
  onPress?: () => void;
};

// ─── Component ──────────────────────────────────────────────────────────────

export function MarketingPlanCard({
  name,
  subtitle,
  tag,
  items,
  bonuses,
  accentColor,
  onPress,
}: MarketingPlanCardProps) {
  const { t } = useTranslation();
  return (
    <PressableScale scaleTo={0.98} onPress={onPress} haptics={false}>
      <GlassView intensity={65} tint="dark" style={styles.card}>
        {/* Accent top border */}
        <View style={[styles.accentBorder, { backgroundColor: accentColor }]} />

        {/* Tag badge */}
        <View style={[styles.tagBadge, { backgroundColor: `${tag.color}20`, borderColor: `${tag.color}50` }]}>
          <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
        </View>

        {/* Plan name */}
        <Text style={styles.planName}>{name}</Text>

        {/* Subtitle */}
        <Text style={styles.planSubtitle}>{subtitle}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Items list */}
        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Feather name="check" size={12} color={accentColor} style={styles.itemIcon} />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Bonuses section */}
        {bonuses && bonuses.length > 0 && (
          <View style={[styles.bonusSection, { backgroundColor: `${accentColor}08`, borderColor: `${accentColor}20` }]}>
            <Text style={[styles.bonusTitle, { color: accentColor }]}>
              {t("marketing.destaques_bonus")}
            </Text>
            {bonuses.map((bonus, index) => (
              <View key={index} style={styles.bonusRow}>
                <Feather name="star" size={11} color={accentColor} style={styles.bonusIcon} />
                <Text style={styles.bonusText}>{bonus}</Text>
              </View>
            ))}
          </View>
        )}
      </GlassView>
    </PressableScale>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    position: "relative",
  },
  accentBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  tagBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  tagText: {
    fontSize: font.size.kicker,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  planName: {
    fontFamily: font.serif,
    fontSize: font.size.headline,
    fontWeight: "700",
    color: color.dark.text,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  planSubtitle: {
    fontSize: font.size.small,
    color: color.dark.textSecondary,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginBottom: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: spacing.md,
  },
  itemsList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  itemIcon: {
    marginTop: 2,
  },
  itemText: {
    flex: 1,
    fontSize: font.size.caption,
    color: color.dark.textSecondary,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  bonusSection: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bonusTitle: {
    fontSize: font.size.kicker,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  bonusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 4,
  },
  bonusIcon: {
    marginTop: 2,
  },
  bonusText: {
    flex: 1,
    fontSize: font.size.caption,
    color: color.dark.text,
    lineHeight: 16,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});