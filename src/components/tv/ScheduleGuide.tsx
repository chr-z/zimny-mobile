/**
 * ScheduleGuide — Guia de programação da Zimny TV (retrátil).
 *
 * Accordion minimalista: tap no header expande/recolhe a lista.
 * Animação suave de altura com Reanimated.
 * Design elegante e moderno — espaço otimizado.
 */
import { useCallback, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { font, spacing } from "@/src/constants/designTokens";
import { useTranslation } from "@/src/i18n";
import type { LiveTvData } from "@/src/services/zimnyTv";

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  schedule: LiveTvData["schedule"];
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function getStatusTag(item: LiveTvData["schedule"][number], t: (key: any) => string): {
  label: string;
  color: string;
} | null {
  if (item.is_now) return { label: t("tv.no_ar"), color: "#FF3B30" };
  if (item.is_next) return { label: t("tv.a_seguir"), color: "#8E8E93" };
  return null;
}

/**
 * Formata um epoch timestamp (segundos UTC) no horário local do dispositivo.
 * Ex: 14:05 — garante que a programação reflita o fuso do usuário.
 */
function formatLocalTime(epochSeconds: number): string {
  const d = new Date(epochSeconds * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Component ─────────────────────────────────────────────────────────────

export function ScheduleGuide({ schedule }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const rotation = useSharedValue(0);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
    rotation.value = withTiming(rotation.value === 0 ? 180 : 0, {
      duration: 300,
    });
  }, [rotation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentHeight = useSharedValue(0);
  const contentStyle = useAnimatedStyle(() => ({
    maxHeight: withTiming(expanded ? 1000 : 0, { duration: 350 }),
    opacity: withTiming(expanded ? 1 : 0, { duration: 250 }),
    overflow: "hidden",
  }));

  if (!schedule || schedule.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>{t("tv.sem_programas")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Toggle Header ─────────────────────────────────────────────── */}
      <Pressable
        onPress={toggleExpanded}
        style={styles.header}
        hitSlop={8}
      >
        <Text style={styles.sectionTitle}>{t("tv.programacao")}</Text>
        <Animated.Text style={[styles.chevron, chevronStyle]}>
          ▾
        </Animated.Text>
      </Pressable>

      {/* ── Collapsible Content ───────────────────────────────────────── */}
      <Animated.View style={contentStyle}>
        {schedule.map((item, index) => {
          const status = getStatusTag(item, t);
          const isNow = item.is_now;

          return (
            <View
              key={`${item.video_id}-${index}`}
              style={[styles.row, isNow && styles.rowNow]}
            >
              {/* Time — formatado no fuso local do dispositivo */}
              <Text style={[styles.time, isNow && styles.timeNow]}>
                {formatLocalTime(item.time)}
              </Text>

              {/* Title */}
              <Text
                style={[styles.title, isNow && styles.titleNow]}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              {/* Status tag */}
              {status && (
                <View
                  style={[
                    styles.tag,
                    { backgroundColor: status.color + "18" },
                  ]}
                >
                  <View
                    style={[
                      styles.tagDot,
                      { backgroundColor: status.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.tagLabel,
                      { color: status.color },
                    ]}
                  >
                    {status.label}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontFamily: font.serif,
    fontSize: font.size.kicker,
    letterSpacing: font.tracking.kicker as unknown as number,
    color: "#8E8E93",
    fontWeight: "600",
  },
  chevron: {
    fontSize: 10,
    color: "#8E8E93",
  },
  emptyText: {
    fontFamily: font.serif,
    fontSize: font.size.body,
    color: "#8E8E93",
    textAlign: "center",
    paddingVertical: spacing.xl,
  },

  // ── Row ─────────────────────────────────────────────────────────────────
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
    gap: spacing.md,
  },
  rowNow: {
    backgroundColor: "rgba(255, 59, 48, 0.04)",
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomColor: "rgba(255, 59, 48, 0.15)",
  },

  // ── Time ────────────────────────────────────────────────────────────────
  time: {
    fontFamily: font.mono,
    fontSize: font.size.small,
    color: "#8E8E93",
    minWidth: 44,
  },
  timeNow: {
    color: "#FF3B30",
    fontWeight: "600",
  },

  // ── Title ───────────────────────────────────────────────────────────────
  title: {
    flex: 1,
    fontFamily: font.serif,
    fontSize: font.size.small,
    color: "#FFFFFF",
    lineHeight: font.size.small * font.leading.normal,
  },
  titleNow: {
    fontWeight: "600",
  },

  // ── Tag ─────────────────────────────────────────────────────────────────
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    gap: spacing.xs,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagLabel: {
    fontFamily: font.serif,
    fontSize: font.size.caption,
    letterSpacing: font.tracking.wider as unknown as number,
    fontWeight: "600",
  },
});