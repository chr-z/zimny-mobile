/**
 * GalleryScreen — Tela completa de uma galeria.
 *
 * - Header limpo: apenas ← Voltar + nome da galeria
 * - Fade-in animation ao abrir
 * - Featured Media no topo (hero)
 * - Grid masonry com todas as mídias
 * - Pré-carregamento via useGalleryMedia
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

import { MediaCard } from "@/src/components/common/MediaCard";
import { font, spacing } from "@/src/constants/designTokens";
import {
    fetchGalleries,
    fetchGalleryMedia,
    type GalleryMediaItem,
    type ZimnyGallery,
} from "@/src/services/zimnyGalleries";

// ─── Prefetch cache ────────────────────────────────────────────────────────

const mediaCache = new Map<string, Awaited<ReturnType<typeof fetchGalleryMedia>>>();
const galleryCache = new Map<string, Awaited<ReturnType<typeof fetchGalleries>>>();

/**
 * Pré-carrega galeria e mídias em background.
 */
export function prefetchGallery(galleryId: string) {
  if (!mediaCache.has(galleryId)) {
    fetchGalleryMedia(galleryId).then((media) => {
      mediaCache.set(galleryId, media);
    }).catch(() => {});
  }
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function GalleryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [localMedia, setLocalMedia] = useState<GalleryMediaItem[]>([]);
  const [localGallery, setLocalGallery] = useState<ZimnyGallery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try cache first
    const cachedMedia = mediaCache.get(id ?? "");
    
    const loadData = async () => {
      try {
        let media: GalleryMediaItem[];
        let galleries: ZimnyGallery[];

        if (cachedMedia) {
          media = cachedMedia;
        } else {
          media = await fetchGalleryMedia(id ?? "");
          mediaCache.set(id ?? "", media);
        }

        galleries = await fetchGalleries();
        const currentGallery = galleries.find((g) => g.id === id) ?? null;

        setLocalMedia(media);
        setLocalGallery(currentGallery);
      } catch (e) {
        console.warn("[GalleryScreen] Failed to load:", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  // Find featured media
  const featuredMedia = localMedia.find((m) => m.is_featured) ?? localMedia[0] ?? null;
  const otherMedia = localMedia.filter((m) => m !== featuredMedia);

  if (loading) {
    return (
      <View style={[styles.shell, styles.centered]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.shell, { opacity: fadeAnim }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={goBack} style={styles.backBtn} hitSlop={8}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {localGallery?.title ?? "Galeria"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* ── Featured Media ── */}
        {featuredMedia && (
          <View style={styles.featuredWrap}>
            <MediaCard
              item={featuredMedia}
              style={styles.featuredMedia}
            />
            {featuredMedia.title && (
              <Text style={styles.featuredTitle}>{featuredMedia.title}</Text>
            )}
          </View>
        )}

        {/* ── Media Grid ── */}
        {otherMedia.length > 0 && (
          <View style={styles.mediaSection}>
            <Text style={styles.sectionTitle}>MÍDIA</Text>
            <View style={styles.mediaGrid}>
              {otherMedia.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  style={styles.mediaItem}
                />
              ))}
            </View>
          </View>
        )}

        {localMedia.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma mídia encontrada</Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: 8,
    backgroundColor: "rgba(10,10,10,0.95)",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  backArrow: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: font.serif,
  },
  headerTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: font.serif,
  },
  headerSpacer: {
    width: 36,
  },
  featuredWrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  featuredMedia: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
  },
  featuredTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: font.serif,
    marginTop: spacing.sm,
    textAlign: "center",
    opacity: 0.8,
  },
  mediaSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    color: "#8E8E93",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: spacing.sm,
    fontFamily: font.sans,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  mediaItem: {
    width: "48%",
    aspectRatio: 16 / 9,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 13,
    color: "#8E8E93",
    letterSpacing: 1.5,
  },
});