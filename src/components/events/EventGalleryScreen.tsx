/**
 * EventGalleryScreen — Tela completa da galeria de um evento.
 *
 * - Header limpo: apenas ← Voltar + nome do evento
 * - Fade-in animation ao abrir
 * - Featured Media no topo
 * - Seção "COBERTURA": vídeos marcados como cobertura em grid 3 colunas
 * - Seção "GALERIA": demais mídias em grid masonry
 * - Pré-carregamento da galeria via useEventMedia
 */
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MediaViewer } from "@/src/components/common/MediaViewer";
import { EventCoberturaGrid } from "@/src/components/events/EventCoberturaGrid";
import { EventFeaturedMedia } from "@/src/components/events/EventFeaturedMedia";
import { EventMasonryGrid } from "@/src/components/events/EventMasonryGrid";
import { font, spacing } from "@/src/constants/designTokens";
import { fetchEventMedia, fetchEvents, type EventMediaItem, type ZimnyEvent } from "@/src/services/zimnyEvents";

// ─── Prefetch cache ────────────────────────────────────────────────────────

const mediaCache = new Map<string, Awaited<ReturnType<typeof fetchEventMedia>>>();
const eventsCache = new Map<string, Awaited<ReturnType<typeof fetchEvents>>>();

/**
 * Pré-carrega eventos e mídias em background.
 * Pode ser chamado na inicialização do app para lazy loading.
 */
export function prefetchEventGallery(eventId: string) {
  // Don't re-fetch if already cached
  if (!mediaCache.has(eventId)) {
    fetchEventMedia(eventId).then((media) => {
      mediaCache.set(eventId, media);
    }).catch(() => {});
  }
}

export function prefetchAllEvents() {
  if (eventsCache.size === 0) {
    fetchEvents().then((events) => {
      events.forEach((e) => eventsCache.set(e.id, [e]));
      // Also prefetch media for first 5 events
      events.slice(0, 5).forEach((e) => prefetchEventGallery(e.id));
    }).catch(() => {});
  }
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function EventGalleryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [localMedia, setLocalMedia] = useState<EventMediaItem[]>([]);
  const [localEvents, setLocalEvents] = useState<ZimnyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try cache first
    const cachedMedia = mediaCache.get(id ?? "");
    const cachedEvents = eventsCache.get(id ?? "");
    
    const loadData = async () => {
      try {
        let media: EventMediaItem[];
        let events: ZimnyEvent[];

        if (cachedMedia) {
          media = cachedMedia;
        } else {
          media = await fetchEventMedia(id ?? "");
          mediaCache.set(id ?? "", media);
        }

        if (cachedEvents) {
          events = cachedEvents;
        } else {
          events = await fetchEvents();
          events.forEach((e) => eventsCache.set(e.id, [e]));
        }

        setLocalMedia(media);
        setLocalEvents(events);
      } catch (e) {
        console.warn("[EventGallery] Failed to load:", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [id]);

  const [viewerItem, setViewerItem] = useState<EventMediaItem | null>(null);

  const event = localEvents.find((e) => e.id === id);
  const featuredMedia = localMedia.find((m) => m.is_featured) ?? null;

  // Split remaining media: cobertura videos vs rest (produção)
  const otherMedia = localMedia.filter(
    (m) => !m.is_featured || m.id !== featuredMedia?.id
  );
  const coberturaMedia = otherMedia.filter((m) => m.is_cobertura);
  const restMedia = otherMedia.filter((m) => !m.is_cobertura);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleCoberturaPress = useCallback((item: EventMediaItem) => {
    setViewerItem(item);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setViewerItem(null);
  }, []);

  return (
    <View style={[styles.shell, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {event?.title ?? "Evento"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : (
        <Animated.View style={[styles.animatedContent, { opacity: fadeAnim }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {featuredMedia && (
              <EventFeaturedMedia media={featuredMedia} />
            )}

            {/* Cobertura section — 3-column grid of selected videos */}
            {coberturaMedia.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>COBERTURA</Text>
                <EventCoberturaGrid
                  media={coberturaMedia}
                  onItemPress={handleCoberturaPress}
                />
              </View>
            )}

            {/* Produção section — masonry grid of remaining media */}
            {restMedia.length > 0 && (
              <View style={styles.section}>
                {coberturaMedia.length > 0 && (
                  <Text style={styles.sectionLabel}>GALERIA</Text>
                )}
                <EventMasonryGrid media={restMedia} excludeFeatured={false} />
              </View>
            )}

            {localMedia.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  Nenhuma mídia disponível neste evento
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* Media viewer for full-screen playback */}
      <MediaViewer
        visible={viewerItem !== null}
        media={viewerItem}
        onClose={handleCloseViewer}
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#0A0A0A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  backArrow: { color: "#FFFFFF", fontSize: 22, fontWeight: "300" },
  headerTitle: {
    flex: 1,
    fontFamily: font.serif,
    fontSize: font.size.title,
    color: "#FFFFFF",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  headerSpacer: { width: 40 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  animatedContent: { flex: 1 },
  scrollContent: { paddingTop: spacing.md, paddingBottom: 40 },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: font.size.caption,
    letterSpacing: 3,
    color: "#8E8E93",
    marginBottom: spacing.md,
    paddingLeft: spacing.lg,
    fontWeight: "600",
  },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyText: { color: "#8E8E93", fontSize: 13, fontFamily: "Georgia", letterSpacing: 0.5 },
});