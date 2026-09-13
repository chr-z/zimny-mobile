/**
 * CoberturaScreen — Tela completa de uma cobertura.
 *
 * - Header limpo: apenas ← Voltar + nome da cobertura
 * - Fade-in animation ao abrir
 * - Featured Media no topo (hero)
 * - Grid masonry com todas as mídias
 * - Pré-carregamento via useCoberturaMedia
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
import { spacing } from "@/src/constants/designTokens";
import { useTranslation } from "@/src/i18n";
import {
    fetchCoberturaMedia,
    fetchCoberturas,
    type CoberturaMediaItem,
    type ZimnyCobertura,
} from "@/src/services/zimnyCoberturas";

// ─── Prefetch cache ────────────────────────────────────────────────────────

const mediaCache = new Map<string, Awaited<ReturnType<typeof fetchCoberturaMedia>>>();
const coberturaCache = new Map<string, Awaited<ReturnType<typeof fetchCoberturas>>>();

/**
 * Pré-carrega cobertura e mídias em background.
 */
export function prefetchCobertura(coberturaId: string) {
  if (!mediaCache.has(coberturaId)) {
    fetchCoberturaMedia(coberturaId).then((media) => {
      mediaCache.set(coberturaId, media);
    }).catch(() => {});
  }
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function CoberturaScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [localMedia, setLocalMedia] = useState<CoberturaMediaItem[]>([]);
  const [localCobertura, setLocalCobertura] = useState<ZimnyCobertura | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try cache first
    const cachedMedia = mediaCache.get(id ?? "");
    
    const loadData = async () => {
      try {
        let media: CoberturaMediaItem[];
        let coberturas: ZimnyCobertura[];

        if (cachedMedia) {
          media = cachedMedia;
        } else {
          media = await fetchCoberturaMedia(id ?? "");
          mediaCache.set(id ?? "", media);
        }

        coberturas = await fetchCoberturas();
        const currentCobertura = coberturas.find((c) => c.id === id) ?? null;

        setLocalMedia(media);
        setLocalCobertura(currentCobertura);
      } catch (e) {
        console.warn("[CoberturaScreen] Failed to load:", e);
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
          {localCobertura?.title ?? t("cobertura.fallback")}
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
            <Text style={styles.sectionTitle}>{t("cobertura.midia")}</Text>
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
            <Text style={styles.emptyText}>{t("cobertura.sem_midia")}</Text>
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
    backgroundColor: "#0A0A0A",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  backArrow: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Georgia",
  },
  headerTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Georgia",
  },
  headerSpacer: {
    width: 36,
  },
  featuredWrap: {
    marginHorizontal: spacing.lg,
    marginTop: 12,
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
    fontSize: 15,
    fontFamily: "Georgia",
    marginTop: 8,
    textAlign: "center",
  },
  mediaSection: {
    marginTop: 24,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    color: "#8E8E93",
    fontSize: 11,
    fontFamily: "Georgia",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  mediaItem: {
    width: "48%",
    aspectRatio: 16 / 9,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#8E8E93",
    fontSize: 14,
  },
});