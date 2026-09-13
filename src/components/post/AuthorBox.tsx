/**
 * AuthorBox — Card editorial minimalista no fim de cada artigo.
 *
 * Labels dinâmicos:
 *   "Bruno Zimny"    → "CEO & Editor-Chefe"
 *   "Zimny Magazine" → "Redação"
 *   Qualquer outro   → "Colunista"
 *
 * Não exibe bio/descrição — card limpo: Avatar · Label · Nome.
 */
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { useTranslation } from "@/src/i18n";
import type { TranslationKey } from "@/src/i18n/types";
import { getAvatarUrl, type WPEmbeddedAuthor } from "@/src/services/api";

// ─── Label resolution ─────────────────────────────────────────────────────────

const CHIEF_SLUGS = new Set(["brunozimny", "bruno-zimny", "brunonascimentozimny"]);
const CHIEF_NAMES = new Set(["Bruno Zimny"]);
const DESK_SLUGS  = new Set(["zimnymagazine", "zimny-magazine", "redacao", "redação"]);
const DESK_NAMES  = new Set(["Zimny Magazine", "Redação", "Redacao"]);

function resolveLabelKey(author: WPEmbeddedAuthor): TranslationKey {
  const slug = author.slug.toLowerCase().replace(/[\s_]/g, "");
  const name = author.name.trim();

  if (CHIEF_SLUGS.has(slug) || CHIEF_NAMES.has(name)) return "author.ceo_editor";
  if (DESK_SLUGS.has(slug)  || DESK_NAMES.has(name))  return "author.redacao";
  return "author.colunista";
}

// ─── Component ────────────────────────────────────────────────────────────────

type AuthorBoxProps = {
  author:  WPEmbeddedAuthor;
  isDark?: boolean;
};

export function AuthorBox({ author, isDark = false }: AuthorBoxProps) {
  const { t }     = useTranslation();
  const label     = t(resolveLabelKey(author));
  const avatarUri = getAvatarUrl(author);

  const cardBg      = isDark ? "#1C1C1E" : "#FFFFFF";
  const borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const nameColor   = isDark ? "#FFFFFF" : "#000000";

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      {/* Avatar circular 96 px */}
      {avatarUri ? (
        <Image
          source={{ uri: avatarUri }}
          style={styles.avatar}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[styles.avatar, { backgroundColor: isDark ? "#333" : "#D0D0D2" }]} />
      )}

      {/* Gold label — uppercase, wide tracking */}
      <Text style={styles.label}>{label.toUpperCase()}</Text>

      {/* Author name — Georgia serif */}
      <Text style={[styles.name, { color: nameColor }]}>{author.name}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius:      4,
    borderWidth:       StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop:        28,
    paddingBottom:     24,
    alignItems:        "center",
    marginTop:         32,
    marginBottom:      8,
  },
  avatar: {
    width:        96,
    height:       96,
    borderRadius: 48,
    marginBottom: 16,
  },
  label: {
    fontSize:      9,
    letterSpacing: 3,
    textTransform: "uppercase",
    color:         "#C9A84C",
    fontWeight:    "700",
    marginBottom:  8,
  },
  name: {
    fontFamily:    "Georgia",
    fontSize:      20,
    letterSpacing: 0.4,
    textAlign:     "center",
  },
});
