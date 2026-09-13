/**
 * CategoryStack — UI dinâmica de pilha para as editorias.
 *
 * FECHADO: todas as categorias lado a lado horizontalmente.
 *   Cada editoria exibe 3 imagens empilhadas (position absolute, scale decrescente)
 *   com uma bolha de vidro com o nome da editoria à frente.
 *
 * ABERTO: ao clicar numa pilha, ela expande para full-width com withSpring,
 *   empurrando as outras lateralmente. O interior mostra um ScrollView horizontal
 *   com cards da categoria.
 */
import { GlassView } from "@/src/components/common/GlassView";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { useCategoryPosts } from "@/src/hooks/useCategoryPosts";
import { useTranslation } from "@/src/i18n";
import {
  getFeaturedImageUrl,
  postTitlePlain,
  type WPPost,
} from "@/src/services/api";
import { cachePosts } from "@/src/store/postCache";

// ─── Constants ────────────────────────────────────────────────────────────────

const STACK_W   = 130;
const STACK_H   = 200;
const CARD_W    = 200;
const CARD_H    = 130;
const SPRING    = { damping: 26, stiffness: 200, mass: 0.9 } as const;
const RADIUS    = 20;

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = { title: string; categoryId: number };

// ─── Helper: single animated stack item width ─────────────────────────────────

function StackItem({
  section,
  isExpanded,
  expandedW,
  onPress,
  onItemLayout,
}: {
  section: Section;
  isExpanded: boolean;
  expandedW: number;
  onPress: () => void;
  onItemLayout: (x: number) => void;
}) {
  const widthStyle = useAnimatedStyle(() => ({
    width: withSpring(isExpanded ? expandedW : STACK_W, SPRING),
  }));

  const { posts, loading } = useCategoryPosts(section.categoryId, 10);

  // Cache so article screen loads instantly
  if (posts.length > 0) cachePosts(posts);

  return (
    <Animated.View
      style={[styles.item, widthStyle]}
      onLayout={(e) => onItemLayout(e.nativeEvent.layout.x)}
    >
      {isExpanded ? (
        <ExpandedCategory
          title={section.title}
          posts={posts}
          loading={loading}
          onClose={onPress}
        />
      ) : (
        <CollapsedStack title={section.title} posts={posts} onPress={onPress} />
      )}
    </Animated.View>
  );
}

// ─── Collapsed: stacked image cards ──────────────────────────────────────────

function CollapsedStack({
  title,
  posts,
  onPress,
}: {
  title: string;
  posts: WPPost[];
  onPress: () => void;
}) {
  const stackPosts = posts.slice(0, 3);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.stackTouchable}
    >
      <View style={styles.stackContainer}>
        {/* Render back → front so the front card is painted last (on top) */}
        {[2, 1, 0].map((layerIdx) => {
          const post = stackPosts[layerIdx];
          const uri  = post ? getFeaturedImageUrl(post) : undefined;
          const scale = 1 - layerIdx * 0.08;
          const translateY = layerIdx * 10;
          return (
            <View
              key={layerIdx}
              style={[
                styles.stackCard,
                {
                  transform: [{ scale }, { translateY: -translateY }],
                  zIndex: 3 - layerIdx,
                },
              ]}
            >
              {uri ? (
                <Image
                  source={{ uri }}
                  style={styles.stackCardImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={[styles.stackCardImage, styles.stackCardPh]} />
              )}
            </View>
          );
        })}

        {/* Category label bubble — always on top */}
        <View style={styles.labelWrap}>
          <GlassView intensity={70} tint="light" style={styles.labelBlur}>
            <Text style={styles.labelText} numberOfLines={2}>
              {title}
            </Text>
          </GlassView>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Expanded: horizontal card scroll ────────────────────────────────────────

function ExpandedCategory({
  title,
  posts,
  loading,
  onClose,
}: {
  title: string;
  posts: WPPost[];
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <View style={styles.expanded}>
      {/* Header row */}
      <View style={styles.expandedHeader}>
        <Text style={styles.expandedTitle}>{title}</Text>
        <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
          <GlassView intensity={60} tint="dark" style={styles.closeBlur}>
            <Text style={styles.closeX}>✕</Text>
          </GlassView>
        </Pressable>
      </View>

      {/* Card scroll */}
      {loading ? (
        <View style={styles.expandedLoading}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.skeletonCard} />
          ))}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardList}
          decelerationRate="fast"
          snapToInterval={CARD_W + 12}
          snapToAlignment="start"
        >
          {posts.map((post) => (
            <ExpandedCard key={post.id} post={post} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function ExpandedCard({ post }: { post: WPPost }) {
  const router = useRouter();
  const uri    = getFeaturedImageUrl(post);
  const title  = postTitlePlain(post);

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      style={styles.card}
      onPress={() =>
        router.push({ pathname: "/post/[id]", params: { id: String(post.id) } })
      }
    >
      <View style={styles.cardImageWrap}>
        {uri ? (
          <Image source={{ uri }} style={styles.cardImage} contentFit="cover" transition={180} />
        ) : (
          <View style={[styles.cardImage, styles.stackCardPh]} />
        )}
        <View style={styles.cardGlassWrap}>
          <GlassView intensity={52} tint="dark" style={styles.cardGlassBlur}>
            <Text style={styles.cardTitle} numberOfLines={3}>{title}</Text>
          </GlassView>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── CategoryStack root ───────────────────────────────────────────────────────

type CategoryStackProps = {
  sections: readonly Section[];
};

export function CategoryStack({ sections }: CategoryStackProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const expandedW  = width - 16;
  const scrollRef  = useRef<ScrollView>(null);
  const itemXRefs  = useRef(new Map<number, number>());

  // Auto-scroll to align the expanded stack at the left with a small margin
  useEffect(() => {
    if (expandedId == null) return;
    const x = itemXRefs.current.get(expandedId);
    if (x != null) {
      scrollRef.current?.scrollTo({ x: Math.max(0, x - 16), animated: true });
    }
  }, [expandedId]);

  const toggleSection = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.sectionWrapper}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeading}>{t("home.editorias")}</Text>
        <View style={styles.sectionLine} />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        scrollEnabled={expandedId === null}
        decelerationRate="fast"
      >
        {sections.map((s) => (
          <StackItem
            key={s.categoryId}
            section={s}
            isExpanded={expandedId === s.categoryId}
            expandedW={expandedW}
            onPress={() => toggleSection(s.categoryId)}
            onItemLayout={(x) => itemXRefs.current.set(s.categoryId, x)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sectionWrapper: {
    paddingTop: 32,
    paddingBottom: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeading: {
    fontFamily: "Georgia",
    fontSize: 22,
    letterSpacing: 1.5,
    color: "#FFFFFF",
    marginBottom: 10,
  },
  sectionLine: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  listContent: {
    paddingLeft: 16,
    paddingRight: 8,
    gap: 10,
    alignItems: "flex-start",
  },
  // Item wrapper (animated width)
  item: {
    height: STACK_H,
    overflow: "hidden",
  },
  // Collapsed stack
  stackTouchable: {
    flex: 1,
  },
  stackContainer: {
    width: STACK_W,
    height: STACK_H,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  stackCard: {
    position: "absolute",
    width: STACK_W,
    height: STACK_H - 20,
    borderRadius: RADIUS,
    overflow: "hidden",
    bottom: 0,
  },
  stackCardImage: {
    width: "100%",
    height: "100%",
  },
  stackCardPh: {
    backgroundColor: "#D0D0D2",
  },
  labelWrap: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    borderRadius: RADIUS - 6,
    overflow: "hidden",
    zIndex: 10,
  },
  labelBlur: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  labelText: {
    fontFamily: "Georgia",
    fontSize: 12,
    lineHeight: 16,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  // Expanded
  expanded: {
    flex: 1,
  },
  expandedHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  expandedTitle: {
    flex: 1,
    fontFamily: "Georgia",
    fontSize: 17,
    letterSpacing: 0.8,
    color: "#FFFFFF",
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: "hidden",
  },
  closeBlur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeX: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  cardList: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  card: {
    width: CARD_W,
    marginRight: 12,
  },
  cardImageWrap: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: RADIUS,
    overflow: "hidden",
    backgroundColor: "#D0D0D2",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardGlassWrap: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    borderRadius: RADIUS - 6,
    overflow: "hidden",
  },
  cardGlassBlur: {
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  cardTitle: {
    fontFamily: "Georgia",
    fontSize: 12,
    lineHeight: 16,
    color: "#FFFFFF",
    letterSpacing: 0.1,
  },
  expandedLoading: {
    flexDirection: "row",
    paddingLeft: 12,
    gap: 12,
  },
  skeletonCard: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: RADIUS,
    backgroundColor: "#DCDCDF",
  },
});
