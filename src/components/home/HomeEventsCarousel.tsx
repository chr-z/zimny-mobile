/**
 * HomeEventsCarousel — Carrossel horizontal de eventos na Home.
 *
 * Thumbnails com proporção dinâmica baseada nas dimensões reais da imagem
 * (preserva a orientação original — landscape, portrait ou square).
 * Apenas a arte da capa, sem badges ou títulos.
 * Press → navega para a galeria do evento.
 *
 * O botão "MAIS EVENTOS" é um item separado do layout da Home (events_more_button),
 * configurável na página "Layout da Home" do painel WordPress.
 */
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Image as RNImage, StyleSheet, View } from "react-native";

import { radius, spacing } from "@/src/constants/designTokens";
import { useHomeEvents } from "@/src/hooks/useZimnyEvents";
import type { ZimnyEvent } from "@/src/services/zimnyEvents";

// ─── Constants ─────────────────────────────────────────────────────────────

/** Largura do card — aumentada para ficar mais proporcional ao dos colunistas. */
const CARD_WIDTH = 210;

/** Altura máxima para evitar thumbs muito altas em imagens portrait. */
const MAX_HEIGHT = 260;

const ITEM_GAP = spacing.sm;

// ─── Event Card Sub-component ──────────────────────────────────────────────

function EventCarouselCard({ event, onPress }: { event: ZimnyEvent; onPress: (id: string) => void }) {
  const [imgWidth, setImgWidth] = useState(event.thumbnail_width);
  const [imgHeight, setImgHeight] = useState(event.thumbnail_height);

  useEffect(() => {
    if (event.thumbnail_width > 0 && event.thumbnail_height > 0) {
      setImgWidth(event.thumbnail_width);
      setImgHeight(event.thumbnail_height);
      return;
    }

    if (event.thumbnail_url) {
      RNImage.getSize(
        event.thumbnail_url,
        (w, h) => {
          setImgWidth(w);
          setImgHeight(h);
        },
        () => {
          setImgWidth(1);
          setImgHeight(1);
        }
      );
    }
  }, [event.thumbnail_url, event.thumbnail_width, event.thumbnail_height]);

  const aspectRatio = imgWidth > 0 && imgHeight > 0 ? imgWidth / imgHeight : 1;
  const height = Math.min(Math.floor(CARD_WIDTH / aspectRatio), MAX_HEIGHT);

  return (
    <Pressable onPress={() => onPress(event.id)} style={styles.card}>
      <View style={[styles.thumbWrap, { height }]}>
        <Image
          source={{ uri: event.thumbnail_url }}
          style={{ width: CARD_WIDTH, height }}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={200}
        />
      </View>
    </Pressable>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function HomeEventsCarousel() {
  const router = useRouter();
  const { events, loading } = useHomeEvents();

  const handleEventPress = useCallback(
    (eventId: string) => {
      (router as any).push(`/event/${eventId}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: ZimnyEvent }) => (
      <EventCarouselCard event={item} onPress={handleEventPress} />
    ),
    [handleEventPress]
  );

  const keyExtractor = useCallback((item: ZimnyEvent) => item.id, []);

  if (!loading && events.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <FlatList
        data={events}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={CARD_WIDTH + ITEM_GAP}
        decelerationRate="fast"
        snapToAlignment="start"
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: ITEM_GAP,
  },
  card: {
    width: CARD_WIDTH,
  },
  thumbWrap: {
    width: CARD_WIDTH,
    borderRadius: radius.md,
    overflow: "hidden",
    position: "relative",
  },
});