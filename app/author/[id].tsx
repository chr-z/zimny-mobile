/**
 * AuthorScreen â€” Tela com todos os posts de um colunista especÃ­fico.
 *
 * Recebe o `id` do colunista via rota, busca os dados do colunista
 * via plugin Zimny Colunistas e seus posts via WordPress REST API.
 *
 * Features:
 * - Parallax background image (bg_image_url) com fade gradient para preto
 * - Foto principal do perfil (profile_image_url) em scroll natural, blurProgressivo
 * - Glass box estilizado para nome, descriÃ§Ã£o e contagem de artigos
 * - HTML entities decodificadas na descriÃ§Ã£o
 * - Loading state elegante (skeleton)
 * - Fade-in animation nos cards
 */
import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LiquidIconButton } from "@/src/components/common/LiquidIconButton";
import { radius } from "@/src/constants/designTokens";
import { useTranslation } from "@/src/i18n";
import {
  decodeHtmlEntities,
  fetchColunistas,
  fetchPosts,
  getFeaturedImageUrl,
  postTitlePlain,
  type Colunista,
  type WPPost,
} from "@/src/services/api";

const { width: SCREEN_W } = Dimensions.get("window");
const PARALLAX_HEIGHT = SCREEN_W * 1.8;
const PROFILE_IMG_WIDTH = SCREEN_W * 0.85;


export default function AuthorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, language } = useTranslation();

  const [author, setAuthor] = useState<Colunista | null>(null);
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // â”€â”€â”€ Animated scroll â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const scrollY = useRef(new Animated.Value(0)).current;

  // BG parallax
  const bgTranslate = scrollY.interpolate({
    inputRange: [0, PARALLAX_HEIGHT],
    outputRange: [0, -PARALLAX_HEIGHT * 0.35],
    extrapolate: "clamp",
  });
  const bgScale = scrollY.interpolate({
    inputRange: [0, PARALLAX_HEIGHT],
    outputRange: [1, 1.15],
    extrapolate: "clamp",
  });

  // Blur na profile image â€” gradativo desde o inÃ­cio do scroll
  const profileBlur = scrollY.interpolate({
    inputRange: [0, 80, 200, 400, PARALLAX_HEIGHT],
    outputRange: [0, 1.5, 3, 6, 10],
    extrapolate: "clamp",
  });

  // Opacidade do glass box (entra suavemente)
  const glassOpacity = scrollY.interpolate({
    inputRange: [0, 60, 120],
    outputRange: [0.85, 0.92, 1],
    extrapolate: "clamp",
  });

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      scrollY.setValue(e.nativeEvent.contentOffset.y);
    },
    [scrollY]
  );

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [colunistas, postsData] = await Promise.all([
        fetchColunistas(),
        fetchPosts({ author: Number(id), per_page: 20 }),
      ]);
      const found = colunistas.find((a) => String(a.id) === id);
      setAuthor(found ?? null);
      setPosts(postsData);
    } catch {
      // Silently fail
    }
  }, [id, language]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const description = author?.description
    ? decodeHtmlEntities(author.description)
    : "";

  // Loading state
  if (loading && !author) {
    return (
      <View style={vstyles.shell}>
        <View style={[vstyles.header, { paddingTop: insets.top + 8 }]}>
          <LiquidIconButton
            icon="arrow-left"
            size={38}
            iconSize={16}
            iconColor="#FFFFFF"
            tint="dark"
            intensity={80}
            onPress={handleBack}
            accessibilityLabel={t("common.voltar")}
          />
        </View>
        <View style={[vstyles.listContent, { paddingTop: insets.top + 80 }]}>
          <View style={vstyles.profileSection}>
            <View style={vstyles.skeletonProfileImg} />
            <View style={vstyles.skeletonName} />
            <View style={vstyles.skeletonBio} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={vstyles.shell}>
      {/* â”€â”€â”€ Parallax Background (sempre atrÃ¡s) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Animated.View
        style={[
          vstyles.bgContainer,
          {
            transform: [
              { translateY: bgTranslate },
              { scale: bgScale },
            ],
          },
        ]}
      >
        {author?.bg_image_url ? (
          <ExpoImage
            source={{ uri: author.bg_image_url }}
            style={vstyles.bgImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={300}
          />
        ) : (
          <View style={vstyles.bgPlaceholder} />
        )}
        <LinearGradient
          colors={["transparent", "rgba(10,10,10,0.3)", "#0A0A0A"]}
          locations={[0, 0.35, 0.75]}
          style={vstyles.gradientOverlay}
        />
        {/* Blur sutil no BG para profundidade */}
        <BlurView intensity={8} tint="dark" style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* â”€â”€â”€ Header com botÃ£o voltar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <View style={[vstyles.header, { paddingTop: insets.top + 8 }]}>
        <LiquidIconButton
          icon="arrow-left"
          size={38}
          iconSize={16}
          iconColor="#FFFFFF"
          tint="dark"
          intensity={80}
          onPress={handleBack}
          accessibilityLabel={t("common.voltar")}
        />
      </View>

      {/* â”€â”€â”€ FlashList â€” profile image + glass box + posts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <FlashList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={[
          vstyles.listContent,
          { paddingTop: 0 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
            colors={["#FFFFFF"]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Ãrea do perfil: imagem + glass box sobreposto na base */}
            <View style={vstyles.profileArea}>
              {author?.profile_image_url && (
                <View style={vstyles.profileImageWrapper}>
                  <Animated.Image
                    source={{ uri: author.profile_image_url }}
                    style={vstyles.profileImage}
                    resizeMode="cover"
                    blurRadius={profileBlur as unknown as number}
                  />
                </View>
              )}

              {/* Glass box â€” sobrepÃµe a base da foto, base alinhada */}
              <Animated.View
                style={[
                  vstyles.glassBoxOuter,
                  author?.profile_image_url
                    ? vstyles.glassBoxOverlay
                    : vstyles.glassBoxStandalone,
                  { opacity: glassOpacity },
                ]}
              >
                <BlurView
                  intensity={70}
                  tint="dark"
                  style={vstyles.glassBlur}
                >
                  <View style={vstyles.glassContent}>
                    <Text style={tstyles.authorName}>
                      {author?.name ?? t("colunistas.colunista")}
                    </Text>
                    {description ? (
                      <Text style={tstyles.authorBio} numberOfLines={4}>
                        {description}
                      </Text>
                    ) : null}
                    <Text style={tstyles.postsCount}>
                      {t(
                        posts.length === 1
                          ? "colunistas.artigo_count"
                          : "colunistas.artigos_count",
                        { count: posts.length },
                      )}
                    </Text>
                  </View>
                </BlurView>
              </Animated.View>
            </View>

            {/* EspaÃ§amento extra antes dos posts */}
            <View style={vstyles.postsSpacer} />
          </View>
        }
        renderItem={({ item, index }) => (
          <PostCard post={item} index={index} />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={vstyles.emptyState}>
              <Text style={tstyles.emptyText}>
                {t("colunistas.sem_artigos")}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

function PostCard({ post, index }: { post: WPPost; index: number }) {
  const router = useRouter();
  const uri = getFeaturedImageUrl(post);
  const title = postTitlePlain(post);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <Pressable
        style={vstyles.postCard}
        onPress={() =>
          router.push({
            pathname: "/post/[id]",
            params: { id: String(post.id) },
          })
        }
      >
        <View style={vstyles.postCardInner}>
          {uri ? (
            <ExpoImage
              source={{ uri }}
              style={istyles.postImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
          ) : (
            <View style={[istyles.postImage, vstyles.postImagePh]} />
          )}
          <View style={vstyles.postCardBody}>
            <Text style={tstyles.postTitle} numberOfLines={2}>
              {title}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// â”€â”€â”€ View Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const vstyles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 12,
    flexDirection: "row" as const,
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  // â”€â”€â”€ Parallax Background â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  bgContainer: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: SCREEN_W,
    height: PARALLAX_HEIGHT,
    overflow: "hidden" as const,
    backgroundColor: "#1C1C1E",
  },
  bgImage: {
    width: "100%" as const,
    height: "100%" as const,
  },
  bgPlaceholder: {
    width: "100%" as const,
    height: "100%" as const,
    backgroundColor: "#1C1C1E",
  },
  gradientOverlay: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: PARALLAX_HEIGHT * 0.7,
  },
  // â”€â”€â”€ Profile Image (scroll natural) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  profileArea: {
    paddingTop: 100,
  },
  profileImageWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: PROFILE_IMG_WIDTH,
    aspectRatio: 0.74,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  // â”€â”€â”€ Glass Box â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  glassBoxOuter: {
    borderRadius: 16,
    overflow: "hidden" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  glassBlur: {
    borderRadius: 16,
    overflow: "hidden" as const,
  },
  glassContent: {
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  // Sobreposto Ã  base da imagem (base inferior alinhada com a do box)
  glassBoxOverlay: {
    position: "absolute" as const,
    left: 16,
    right: 16,
    bottom: 0,
  },
  // Sem imagem: box no fluxo normal
  glassBoxStandalone: {
    marginHorizontal: 16,
    marginTop: 120,
  },
  postsSpacer: {
    height: 16,
  },
  // â”€â”€â”€ Profile Section (skeleton fallback) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  skeletonProfileImg: {
    width: SCREEN_W * 0.7,
    height: SCREEN_W * 0.9,
    backgroundColor: "#2C2C2E",
    marginBottom: 16,
  },
  skeletonName: {
    width: 160,
    height: 22,
    backgroundColor: "#2C2C2E",
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonBio: {
    width: 240,
    height: 40,
    backgroundColor: "#2C2C2E",
    borderRadius: 4,
  },
  // Post cards
  postCard: {
    flex: 1,
    margin: 6,
    borderRadius: radius.md,
    backgroundColor: "#1C1C1E",
    overflow: "hidden" as const,
  },
  postCardInner: {
    flex: 1,
  },
  postImagePh: {
    backgroundColor: "#2C2C2E",
  },
  postCardBody: {
    padding: 10,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
});

// â”€â”€â”€ Text Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const tstyles = StyleSheet.create({
  authorName: {
    fontFamily: "Georgia",
    fontSize: 22,
    letterSpacing: 1,
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  authorBio: {
    fontSize: 13,
    letterSpacing: 0.5,
    color: "#E5E5EA",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  postsCount: {
    fontSize: 11,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase" as const,
  },
  postTitle: {
    fontSize: 13,
    letterSpacing: 0.5,
    color: "#FFFFFF",
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 14,
    letterSpacing: 1,
    color: "#8E8E93",
  },
});

// â”€â”€â”€ Image Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const istyles = StyleSheet.create({
  postImage: {
    width: "100%" as const,
    height: 140,
  },
});
