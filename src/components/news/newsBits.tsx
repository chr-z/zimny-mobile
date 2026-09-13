/**
 * newsBits — componentes visuais compartilhados do padrão "Notícias".
 *
 * Fonte única do visual de destaque/cards usado pela aba Notícias e pela
 * página de categoria (aberta pelo "Ver mais"), garantindo consistência:
 * fundo escuro #0A0A0A, títulos Georgia, kicker/dot na cor da editoria,
 * imagens com cantos arredondados 10.
 */
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTranslation } from "@/src/i18n";
import {
  getFeaturedImageUrl,
  postTitlePlain,
  type WPPost,
} from "@/src/services/api";

/** Locale de formatação de data conforme a língua da UI. */
export function localeForNews(language: string): string {
  if (language === "en") return "en-US";
  if (language === "es") return "es-ES";
  return "pt-BR";
}

export function formatNewsDate(iso?: string, language?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return d.toLocaleDateString(localeForNews(language ?? "pt"), {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

// ─── Destaque (imagem full-bleed + scrim + kicker) ─────────────────────────

export function NewsFeaturedCard({
  post,
  kicker,
  color,
}: {
  post: WPPost;
  /** Nome da editoria (uppercase na tela). */
  kicker?: string;
  /** Cor da editoria; fallback = dourado da marca. */
  color?: string;
}) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const uri = getFeaturedImageUrl(post);
  const title = postTitlePlain(post);
  const date = formatNewsDate((post as { date?: string }).date, language);
  const accent = color ?? "#C9A84C";
  const kickerText = (kicker ?? t("common.destaque")).toUpperCase();

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/post/[id]", params: { id: String(post.id) } })
      }
      android_ripple={{ color: "rgba(255,255,255,0.1)" }}
    >
      <View style={styles.featuredCard}>
        {uri ? (
          <Image
            source={{ uri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={220}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.featuredPh]} />
        )}
        <View style={styles.featuredScrim} />
        <View style={styles.featuredBody}>
          <View style={styles.featuredBadgeRow}>
            <View style={styles.featuredKickerChip}>
              <View
                style={[styles.featuredBadgeDot, { backgroundColor: accent }]}
              />
              <Text
                style={[styles.featuredBadge, { color: accent }]}
                numberOfLines={1}
              >
                {kickerText}
              </Text>
            </View>
            <Text style={styles.featuredDate} numberOfLines={1}>
              {date}
            </Text>
          </View>
          <Text style={styles.featuredTitle} numberOfLines={4}>
            {title}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Card de grade (imagem em cima + título + data) ─────────────────────────

export function NewsPostCard({ post }: { post: WPPost }) {
  const router = useRouter();
  const { language } = useTranslation();
  const uri = getFeaturedImageUrl(post);
  const title = postTitlePlain(post);
  const date = formatNewsDate((post as { date?: string }).date, language);

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/post/[id]", params: { id: String(post.id) } })
      }
      android_ripple={{ color: "rgba(255,255,255,0.08)" }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardImageWrap}>
        {uri ? (
          <Image
            source={{ uri }}
            style={styles.cardImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={180}
          />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePh]} />
        )}
      </View>
      <Text style={styles.cardTitle} numberOfLines={3}>
        {title}
      </Text>
      {date !== "" && <Text style={styles.cardMeta}>{date}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Destaque full-bleed (mesmo da aba Notícias)
  featuredCard: {
    height: 280,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
    marginBottom: 4,
  },
  featuredScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  featuredPh: {
    backgroundColor: "#2C2C2E",
  },
  featuredBody: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 50,
    paddingBottom: 20,
  },
  featuredBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  featuredKickerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    flexShrink: 1,
  },
  featuredBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 2,
    backgroundColor: "#C9A84C",
    flexShrink: 0,
  },
  featuredBadge: {
    fontSize: 9,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    fontWeight: "700",
    flexShrink: 1,
  },
  featuredDate: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.55)",
  },
  featuredTitle: {
    fontFamily: "Georgia",
    fontSize: 22,
    lineHeight: 29,
    letterSpacing: 0.25,
    color: "#FFFFFF",
  },

  // Card de grade limpo (sem caixa — imagem + texto sobre o fundo do app)
  card: {
    flex: 1,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardImageWrap: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
    marginBottom: 8,
  },
  cardImage: {
    width: "100%",
    aspectRatio: 16 / 10,
    backgroundColor: "#1C1C1E",
  },
  cardImagePh: {
    backgroundColor: "#2C2C2E",
  },
  cardTitle: {
    fontFamily: "Georgia",
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: "#FFFFFF",
  },
  cardMeta: {
    marginTop: 5,
    fontSize: 10,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    color: "#8E8E93",
  },
});
