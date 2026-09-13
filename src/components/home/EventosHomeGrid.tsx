/**
 * EventosHomeGrid — Grid 3×2 de eventos na Home.
 *
 * Exibe até 6 eventos da categoria "producao" em um grid 3×2,
 * do mais novo ao mais antigo. Cada card mostra thumbnail + título.
 * Press → navega para a página do evento.
 *
 * Inclui SectionTitle com "VER MAIS" → navega para a tela de eventos.
 */
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";

import { radius, spacing } from "@/src/constants/designTokens";
import { useEvents } from "@/src/hooks/useZimnyEvents";
import { useTranslation } from "@/src/i18n";
import { SectionTitle } from "./SectionTitle";

// ─── Constants ─────────────────────────────────────────────────────────────

const COLUMNS = 3;
const H_PADDING = spacing.lg;
const GAP = spacing.sm;

// ─── Component ──────────────────────────────────────────────────────────────

export function EventosHomeGrid() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width: screenW } = useWindowDimensions();
  const { events, loading } = useEvents({ category: "producao", limit: 6 });

  const totalGap = GAP * (COLUMNS - 1);
  const cardWidth = Math.floor((screenW - H_PADDING * 2 - totalGap) / COLUMNS);
  const cardHeight = Math.floor(cardWidth * 0.5625); // 16:9

  if (loading && events.length === 0) return null;
  if (events.length === 0) return null;

  const items = events.slice(0, 6);

  // Group items into explicit rows to prevent flexWrap issues
  const rows: React.ReactNode[] = [];
  for (let i = 0; i < items.length; i += COLUMNS) {
    const rowItems = items.slice(i, i + COLUMNS);
    rows.push(
      <View key={`row-${i}`} style={styles.row}>
        {rowItems.map((event) => (
          <EventosCard
            key={event.id}
            event={event}
            width={cardWidth}
            height={cardHeight}
            onPress={() => (router as any).push(`/event/${event.id}`)}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <SectionTitle title={t("home.producoes_eventos")} sectionKey="eventos" />
      <View style={styles.grid}>
        {rows}
      </View>
      <View style={styles.bottomAction}>
        <Pressable
          onPress={() => router.push("/(drawer)/(tabs)/events" as any)}
          style={styles.actionPill}
        >
          <Text style={styles.actionText}>{t("common.ver_mais")}</Text>
          <Text style={styles.actionArrow}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Card ───────────────────────────────────────────────────────────────────

function EventosCard({
  event,
  width,
  height,
  onPress,
}: {
  event: { id: string; title: string; thumbnail_url: string };
  width: number;
  height: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pressable, { width }]}
    >
      <View style={[styles.card, { width, height }]}>
        <Image
          source={{ uri: event.thumbnail_url }}
          style={{ width, height }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={180}
        />
      </View>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
  grid: {
    paddingHorizontal: H_PADDING,
    gap: GAP,
  },
  row: {
    flexDirection: "row",
    gap: GAP,
  },
  pressable: {
    marginBottom: 0,
  },
  card: {
    borderRadius: radius.sm,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
    position: "relative",
  },
  bottomAction: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderRadius: 999,
    backgroundColor: "#D0A838",
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  actionText: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  actionArrow: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "300",
    marginTop: -1,
  },
});