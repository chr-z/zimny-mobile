/**
 * PostReaderScreen — Tela de leitura imersiva com Infinite Contextual Stream.
 *
 * Arquitetura:
 *   · articleChain: WPPost[] — a corrente de artigos; começa com o post
 *     que o usuário clicou e cresce conforme o scroll.
 *   · findNextPost() — varre links internos no HTML do artigo atual; se
 *     não encontrar, usa o post mais recente não lido como fallback.
 *   · ContinueBridge — separador entre artigos: linha dourada "CONTINUE
 *     LENDO" + PremiumAdBlock, criando a ponte perfeita de retenção.
 *   · AuthorBox — card editorial ao fim de cada artigo.
 *   · Byline — "Nome do Autor  ·  Data" logo abaixo do título.
 */
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import RenderHTML, { useRendererProps } from "react-native-render-html";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PremiumAdBlock } from "@/src/components/ads/PremiumAdBlock";
import { AnimatedExpoImage } from "@/src/components/common/AnimatedExpoImage";
import { GlassView } from "@/src/components/common/GlassView";
import { LiquidIconButton } from "@/src/components/common/LiquidIconButton";
import { LanguageSwitcherButton } from "@/src/components/home/LanguageSwitcherButton";
import { AuthorBox } from "@/src/components/post/AuthorBox";
import { PostIframeRenderer } from "@/src/components/post/PostIframeRenderer";
import { categoryColor, categoryLabelKey } from "@/src/constants/newsSections";
import { articleTagsStyles } from "@/src/constants/articleHtmlStyles";
import { useAd } from "@/src/hooks/useAds";
import { useLanguage } from "@/src/hooks/useLanguage";
import { useTranslation } from "@/src/i18n";
import {
  fetchPostById,
  fetchPostBySlug,
  fetchPosts,
  fetchPostsByCategory,
  getFeaturedImageUrl,
  getPostAuthor,
  postTitlePlain,
  ZIMNY_ORIGIN,
  type WPPost,
} from "@/src/services/api";
import { cachePost, getCachedPost } from "@/src/store/postCache";
import { useUserStore, type ThemePreference } from "@/src/store/useUserStore";
import { getSafeHttpsUrl } from "@/src/utils/security";
import {
  HTMLContentModel,
  HTMLElementModel,
  type MixedStyleRecord,
} from "@native-html/transient-render-engine";
import type { CustomBlockRenderer } from "react-native-render-html";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function postUrl(post: WPPost): string {
  return post.link?.startsWith("http") ? post.link : `${ZIMNY_ORIGIN}/?p=${post.id}`;
}

function hasContent(post: WPPost): boolean {
  return !!(post.content?.rendered?.length);
}

// ─── Reading preferences helpers ─────────────────────────────────────────────

function scaledTagsStyles(mult: number, dark: boolean): MixedStyleRecord {
  const text    = dark ? "#E0DFD9" : "#1A1A1A";
  const heading = dark ? "#FFFFFF" : "#000000";
  return {
    ...articleTagsStyles,
    p:  { ...(articleTagsStyles.p  as object), fontSize: 18 * mult, lineHeight: 29 * mult, color: text },
    li: { ...(articleTagsStyles.li as object), fontSize: 18 * mult, lineHeight: 29 * mult, color: text },
    h1: { ...(articleTagsStyles.h1 as object), fontSize: 28 * mult, color: heading },
    h2: { ...(articleTagsStyles.h2 as object), fontSize: 24 * mult, color: heading },
    h3: { ...(articleTagsStyles.h3 as object), fontSize: 20 * mult, color: heading },
    blockquote: {
      ...(articleTagsStyles.blockquote as object),
      borderLeftColor: dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
    },
  };
}

// ─── Deep-link interception helpers ──────────────────────────────────────────

const ZIMNY_HOST = "zimnymagazine.com";

function isZimnyLink(href: string): boolean {
  if (!href) return false;
  if (href.startsWith("/")) return true;
  try {
    const parsed = new URL(href);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === ZIMNY_HOST || parsed.hostname.endsWith(`.${ZIMNY_HOST}`))
    );
  } catch {
    return false;
  }
}

function extractDirectId(href: string): number | null {
  try {
    const p = new URL(href).searchParams.get("p");
    if (p) { const n = parseInt(p, 10); return Number.isFinite(n) ? n : null; }
  } catch { /* ignore */ }
  return null;
}

function extractSlug(href: string): string | null {
  try {
    const pathname = new URL(href.startsWith("/") ? `https://${ZIMNY_HOST}${href}` : href).pathname;
    const parts    = pathname.replace(/\/$/, "").split("/").filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      if (!/^\d+$/.test(parts[i])) return parts[i];
    }
  } catch { /* ignore */ }
  return null;
}

// ─── Dynamic ad injection ─────────────────────────────────────────────────────

/**
 * Inserts <premium-ad></premium-ad> after a paragraph roughly in the middle of
 * the article, so the ad appears organically mid-text (never only at the end).
 * Works for articles with as few as 2 paragraphs; with a single paragraph the
 * article is too short to split, so no injection is performed.
 */
function injectAdIntoHtml(html: string): string {
  const parts = html.split("</p>");
  const nParagraphs = parts.length - 1; // number of </p> occurrences
  if (nParagraphs < 2) return html;

  // Insert after the middle paragraph (clamped between first and last).
  const insertAfterIdx = Math.min(
    nParagraphs - 1,
    Math.max(1, Math.round(nParagraphs / 2))
  );

  const before = parts.slice(0, insertAfterIdx + 1).join("</p>") + "</p>";
  const after  = parts.slice(insertAfterIdx + 1).join("</p>");
  return before + "<premium-ad></premium-ad>" + after;
}

/** Custom HTML element model so RenderHTML knows <premium-ad> is a block. */
const AD_ELEMENT_MODELS = {
  "premium-ad": HTMLElementModel.fromCustomModel({
    tagName:      "premium-ad",
    contentModel: HTMLContentModel.block,
    isVoid:       true,
  }),
};

/**
 * Augment the library's RenderersProps so `useRendererProps("premium-ad")`
 * is properly typed with the ad payload passed via renderersProps.
 */
declare module "react-native-render-html" {
  interface RenderersProps {
    "premium-ad"?: {
      ad?: import("@/src/hooks/useAds").AdItem | null;
      onImpression?: () => void;
      onClick?: () => void;
    };
  }
}

/**
 * Renderer: swaps <premium-ad> for the native PremiumAdBlock component.
 *
 * IMPORTANTE: o payload do anúncio NÃO está em `sharedProps` — ele é lido
 * através do hook `useRendererProps("premium-ad")`, exatamente como o
 * renderer interno `ARenderer` faz com `useRendererProps("a")`.
 */
const PremiumAdRenderer: CustomBlockRenderer = () => {
  const props = useRendererProps("premium-ad");
  const ad = props?.ad;
  if (!ad) return null;
  return (
    <PremiumAdBlock
      ad={ad}
      compact
      onImpression={props?.onImpression}
      onClick={props?.onClick}
    />
  );
};

// ─── Infinite Stream: next-post discovery ────────────────────────────────────

/** Patterns that are definitely not post slugs. */
const SKIP_PREFIXES = [
  "/category/", "/tag/", "/author/", "/page/",
  "/wp-content/", "/wp-includes/", "/feed",
];

/** Extract the last meaningful path segment (slug) from an href. */
function hrefToSlug(href: string): string | null {
  try {
    const base = href.startsWith("/") ? `https://${ZIMNY_HOST}${href}` : href;
    const path = new URL(base).pathname.replace(/\/$/, "");
    if (SKIP_PREFIXES.some((p) => path.startsWith(p))) return null;
    const parts = path.split("/").filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      if (!/^\d+$/.test(parts[i])) return parts[i];
    }
  } catch { /* ignore */ }
  return null;
}

/**
 * Finds the next post for the Infinite Stream.
 *
 * Strategy:
 * 1. Scan `html` for the first internal link whose slug resolves to a post
 *    not already in `usedIds`.
 * 2. Fallback: most recent post from the REST API not in `usedIds`.
 */
async function findNextPost(
  html:    string,
  usedIds: Set<number>
): Promise<WPPost | null> {
  const HREF_RE = /href=["']([^"'\s>]+)["']/gi;
  const tried   = new Set<string>();
  let   match:  RegExpExecArray | null;
  let   count   = 0;

  while ((match = HREF_RE.exec(html)) !== null && count < 10) {
    const href = match[1];
    if (!isZimnyLink(href)) continue;

    // Prefer ?p=ID direct links — instant resolution
    const directId = extractDirectId(href);
    if (directId && !usedIds.has(directId)) {
      const cached = getCachedPost(directId);
      if (cached) return cached;
      try {
        const post = await fetchPostById(directId);
        if (!usedIds.has(post.id)) return post;
      } catch { /* try next */ }
      count++;
      continue;
    }

    const slug = hrefToSlug(href);
    if (!slug || tried.has(slug)) continue;
    tried.add(slug);
    count++;

    try {
      const candidate = await fetchPostBySlug(slug);
      if (candidate && !usedIds.has(candidate.id)) return candidate;
    } catch { /* try next */ }
  }

  // Fallback: most recent post not already in chain
  try {
    const recent = await fetchPosts({ per_page: 12, orderby: "date", order: "desc" });
    return recent.find((p) => !usedIds.has(p.id)) ?? null;
  } catch {
    return null;
  }
}

// ─── Article Block ────────────────────────────────────────────────────────────

type ArticleBlockProps = {
  post:            WPPost;
  isFirst:         boolean;
  isDark:          boolean;
  contentW:        number;
  hPad:            number;
  tagsStyles:      MixedStyleRecord;
  onLinkPress:     (e: unknown, href: string) => void;
};

function ArticleBlock({
  post,
  isFirst,
  isDark,
  contentW,
  hPad,
  tagsStyles,
  onLinkPress,
}: ArticleBlockProps) {
  const { t } = useTranslation();
  // Cada ArticleBlock gerencia seu próprio anúncio via rotação compartilhada,
  // garantindo que artigos consecutivos na chain exibam anúncios diferentes.
  const { ad, trackImpression, trackClick } = useAd("article");
  const featured  = getFeaturedImageUrl(post);
  const title     = postTitlePlain(post);
  const rawHtml   = post.content?.rendered ?? "";
  const dateLabel = formatDate(post.date);
  const author    = getPostAuthor(post);

  const postWithCats = post as WPPost & { categories?: number[] };

  const headlineTint = isDark ? "#FFFFFF" : "#000000";
  const coverH       = isFirst ? 320 : 260;
  const coverBg      = isDark ? "#1A1A1A" : "#D0D0D2";

  // Inject ad once per article — memoised on post.id so position is stable.
  // Só o primeiro artigo da chain recebe ad no meio do texto; nos seguintes,
  // o anúncio fica no ContinueBridge (distribuição mais equilibrada).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const injectedHtml = useMemo(
    () => (isFirst ? injectAdIntoHtml(rawHtml) : rawHtml),
    [post.id, isFirst]
  );

  // Kicker da editoria (id 206–212), se o post tiver — conecta o leitor ao
  // padrão de editorias coloridas do resto do app.
  const editorialCat = (postWithCats.categories ?? []).find(
    (c) => c >= 206 && c <= 212
  );
  const catColor = editorialCat ? categoryColor(editorialCat) : null;
  const catLabelKey = editorialCat ? categoryLabelKey(editorialCat) : null;

  return (
    <View>
      {/* ── Cover image (arredondada, no padrão do app) ───────────────── */}
      <View style={styles.coverWrap}>
        {featured ? (
          <AnimatedExpoImage
            source={{ uri: featured }}
            style={[styles.cover, { height: coverH }]}
            contentFit="cover"
            transition={200}
            {...(isFirst ? { sharedTransitionTag: `post-image-${post.id}` } : {})}
          />
        ) : (
          <View style={[styles.cover, { height: coverH, backgroundColor: coverBg }]} />
        )}
      </View>

      {/* ── Meta block: kicker + title + byline ──────────────────────── */}
      <Animated.View
        entering={isFirst ? FadeIn.delay(220).duration(300) : FadeIn.duration(250)}
        style={[styles.metaBlock, { paddingHorizontal: hPad }]}
      >
        {catLabelKey && catColor && (
          <View style={styles.kickerRow}>
            <View style={[styles.kickerDot, { backgroundColor: catColor }]} />
            <Text style={[styles.kickerText, { color: catColor }]}>
              {t(catLabelKey).toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={[styles.headline, { color: headlineTint }]}>{title}</Text>

        {/* Byline: Author · Date */}
        {(author || dateLabel) && (
          <Text style={[styles.byline, { color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }]}>
            {author ? `${author.name}  ·  ${dateLabel}` : dateLabel}
          </Text>
        )}
      </Animated.View>

      {/* ── HTML body (ad injected organically via <premium-ad>) ──────── */}
      {rawHtml.length > 0 ? (
        <Animated.View
          entering={isFirst ? FadeIn.delay(280).duration(300) : FadeIn.duration(250)}
          style={{ paddingHorizontal: hPad, paddingTop: 8 }}
        >
          <RenderHTML
            contentWidth={contentW}
            source={{ html: injectedHtml }}
            tagsStyles={tagsStyles}
            customHTMLElementModels={AD_ELEMENT_MODELS}
            renderers={{
              iframe:       PostIframeRenderer,
              "premium-ad": PremiumAdRenderer,
            }}
            renderersProps={{
              a: { onPress: onLinkPress as (e: unknown, href: string) => void },
              "premium-ad": {
                ad,
                onImpression: trackImpression,
                onClick: trackClick,
              },
            }}
          />
        </Animated.View>
      ) : (
        <View style={[styles.ghostBody, { paddingHorizontal: hPad }]}>
          {[100, 92, 96, 80, 88, 60].map((w, i) => (
            <View key={i} style={[styles.ghostBodyLine, { width: `${w}%` }]} />
          ))}
        </View>
      )}

      {/* ── Author Box ────────────────────────────────────────────────── */}
      {author && (
        <View style={{ paddingHorizontal: hPad }}>
          <AuthorBox author={author} isDark={isDark} />
        </View>
      )}
    </View>
  );
}

// ─── Continue Bridge ──────────────────────────────────────────────────────────

function ContinueBridge({
  isDark,
  ad,
  onImpression,
  onClick,
}: {
  isDark: boolean;
  ad: import("@/src/hooks/useAds").AdItem | null;
  onImpression?: () => void;
  onClick?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={[styles.bridge, { backgroundColor: isDark ? "#0A0A0A" : "#F5F5F7" }]}>
      {/* "CONTINUE LENDO" header with gold flanking lines */}
      <View style={styles.bridgeHeader}>
        <View style={styles.bridgeGoldLine} />
        <Text style={styles.bridgeLabel}>{t("common.continue_lendo")}</Text>
        <View style={styles.bridgeGoldLine} />
      </View>

      {/* Sponsored bridge ad */}
      {ad && (
        <PremiumAdBlock
          ad={ad}
          onImpression={onImpression}
          onClick={onClick}
        />
      )}
    </View>
  );
}

// ─── Chain Loader ─────────────────────────────────────────────────────────────

function ChainLoader() {
  return (
    <View style={styles.chainLoaderWrap}>
      <ActivityIndicator size="small" color="#C9A84C" />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PostReaderScreen() {
  const { id }    = useLocalSearchParams<{ id: string }>();
  const router    = useRouter();
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const { t } = useTranslation();

  // ── Article ad ─────────────────────────────────────────────────────────────
  const { ad: articleAd, trackImpression: trackArticleAdImpression, trackClick: trackArticleAdClick, refresh: refreshArticleAd } = useAd("article");

  // Aceita id numérico (`/post/123`) OU slug (`/post/meu-slug`) — a home e
  // as seções de colunistas navegam por slug; o resto usa id.
  const rawParam    = String(id ?? "").trim();
  const isNumeric   = /^\d+$/.test(rawParam);
  const numericId   = isNumeric ? Number.parseInt(rawParam, 10) : NaN;
  const resolvedIdRef = useRef<number>(Number.isFinite(numericId) ? numericId : 0);
  const cached      = Number.isFinite(numericId) ? getCachedPost(numericId) : undefined;

  // [Perf] Validation: does the reader hit the network on open?
  const t0 = useRef(Date.now()).current;
  console.log(
    `[Perf] PostReader mount param=${rawParam} numeric=${numericId} cacheHIT=${!!cached} ` +
    `hasContent=${cached ? hasContent(cached) : false} ` +
    `contentLen=${cached?.content?.rendered?.length ?? 0} ` +
    `willFetch=${!(cached && hasContent(cached))}`
  );

  const [post,  setPost]  = useState<WPPost | null>(cached && hasContent(cached) ? cached : null);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    if (cached && hasContent(cached)) return;
    fetchedRef.current = true;
    const tFetch = Date.now();

    if (isNumeric) {
      fetchPostById(numericId)
        .then((data) => {
          console.log(`[Perf] PostReader fetchById resolved in ${Date.now() - tFetch}ms for id=${numericId} (contentLen=${data.content?.rendered?.length ?? 0})`);
          cachePost(data);
          resolvedIdRef.current = data.id;
          setPost(data);
        })
        .catch((e) => { if (!cached) setError(e instanceof Error ? e : new Error(String(e))); });
    } else {
      // Slug (ex.: card do colunista na home) — resolve para o post completo.
      fetchPostBySlug(rawParam)
        .then((data) => {
          if (!data) throw new Error("Artigo inválido");
          cachePost(data);
          resolvedIdRef.current = data.id;
          setPost(data);
        })
        .catch((e) => setError(e instanceof Error ? e : new Error(String(e))));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawParam]);

  // ── Reading preferences ───────────────────────────────────────────────────
  const { fontSizeMultiplier, themePreference, setFontSize, setTheme } =
    useUserStore();

  // Idioma da UI: quando muda, o conteúdo (traduzido no WP via X-Zimny-Lang)
  // precisa ser re-buscado — reseta a chain e recarrega o post inicial.
  const { language } = useLanguage();

  const systemScheme   = useColorScheme();
  const effectiveTheme = themePreference === "system" ? (systemScheme ?? "light") : themePreference;
  const isDark         = effectiveTheme === "dark";
  const shellBg        = isDark ? "#0A0A0A" : "#F5F5F7";

  // ── Infinite stream state ─────────────────────────────────────────────────
  const [articleChain,  setArticleChain]  = useState<WPPost[]>([]);
  const [chainLoading,  setChainLoading]  = useState(false);
  const chainIdsRef  = useRef<Set<number>>(new Set());
  const loadingRef   = useRef(false); // prevents double-fire from onEndReached

  // ── Recarrega o post ao trocar de idioma (conteúdo vem do WP por lang) ──
  const langRef = useRef(language);
  useEffect(() => {
    if (langRef.current === language) return;
    langRef.current = language;
    const targetId = resolvedIdRef.current;
    if (!targetId) return;
    const wasFetched = fetchedRef.current;
    fetchPostById(targetId)
      .then((data) => {
        cachePost(data);
        setPost(data);
        setArticleChain([]);
        chainIdsRef.current = new Set();
      })
      .catch(() => {
        if (!wasFetched) setError(new Error("Artigo inválido"));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // ── Seed the chain once the first post is available
  useEffect(() => {
    if (!post) return;
    setArticleChain((prev) => {
      if (prev.length === 0) {
        chainIdsRef.current.add(post.id);
        return [post];
      }
      // Update first article if we now have full content
      if (prev[0].id === post.id && !hasContent(prev[0]) && hasContent(post)) {
        return [post, ...prev.slice(1)];
      }
      return prev;
    });
  }, [post]);

  const loadNextInChain = useCallback(async () => {
    if (loadingRef.current) return;
    const lastPost = articleChain[articleChain.length - 1];
    if (!lastPost || !hasContent(lastPost)) return;

    loadingRef.current = true;
    setChainLoading(true);
    try {
      let next: WPPost | null = null;

      // 1) Continua na MESMA editoria (206–212) — stream contextual.
      const lastWithCats = lastPost as WPPost & { categories?: number[] };
      const editorialCat = (lastWithCats.categories ?? []).find(
        (c) => c >= 206 && c <= 212
      );
      if (editorialCat) {
        try {
          const related = await fetchPostsByCategory(editorialCat, 30);
          next =
            related.find((p) => !chainIdsRef.current.has(p.id)) ?? null;
        } catch {
          next = null;
        }
      }

      // 2) Fallback: links internos do artigo / recentes não lidos.
      if (!next) {
        next = await findNextPost(
          lastPost.content?.rendered ?? "",
          chainIdsRef.current
        );
      }

      if (next) {
        cachePost(next);
        chainIdsRef.current.add(next.id);
        setArticleChain((prev) => [...prev, next]);
      }
    } finally {
      loadingRef.current = false;
      setChainLoading(false);
    }
  }, [articleChain]);

  // The data shown in FlatList — bridging the gap between "post set" and
  // "chain seeded" (which happens 1 effect cycle after post is set)
  const chainData = useMemo<WPPost[]>(() => {
    if (articleChain.length > 0) return articleChain;
    return post ? [post] : [];
  }, [articleChain, post]);

  // ── Reader panel state ────────────────────────────────────────────────────
  const [showReaderPanel, setShowReaderPanel] = useState(false);

  const onShare = useCallback(async () => {
    if (!post) return;
    const title = postTitlePlain(post);
    const url   = postUrl(post);
    try {
      if (Platform.OS === "web") {
        await Share.share({ title, message: `${title}\n${url}` });
      } else {
        await Share.share({
          title,
          message: Platform.OS === "android" ? `${title}\n${url}` : title,
          url,
        });
      }
    } catch { /* cancel */ }
  }, [post]);

  // ── Internal link interception ────────────────────────────────────────────
  const [linkLoading, setLinkLoading] = useState(false);

  const handleLinkPress = useCallback(async (_e: unknown, href: string) => {
    if (!href) return;
    const safeHref = href.startsWith("/")
      ? `${ZIMNY_ORIGIN}${href}`
      : getSafeHttpsUrl(href);
    if (!safeHref) return;

    if (!isZimnyLink(safeHref)) {
      await WebBrowser.openBrowserAsync(safeHref, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        toolbarColor:      "#000000",
        controlsColor:     "#C9A84C",
      });
      return;
    }

    const directId = extractDirectId(safeHref);
    if (directId) {
      router.push({ pathname: "/post/[id]", params: { id: String(directId) } });
      return;
    }

    const slug = extractSlug(safeHref);
    if (!slug) {
      await WebBrowser.openBrowserAsync(safeHref, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET, toolbarColor: "#000000" });
      return;
    }

    setLinkLoading(true);
    try {
      const resolved = await fetchPostBySlug(slug);
      if (resolved) {
        cachePost(resolved);
        router.push({ pathname: "/post/[id]", params: { id: String(resolved.id) } });
      } else {
        await WebBrowser.openBrowserAsync(safeHref, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET, toolbarColor: "#000000" });
      }
    } catch {
      await WebBrowser.openBrowserAsync(safeHref, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET, toolbarColor: "#000000" }).catch(() => {});
    } finally {
      setLinkLoading(false);
    }
  }, [router]);

  const hPad     = 20;
  const contentW = width - hPad * 2;
  const tagsStyles = useMemo(
    () => scaledTagsStyles(fontSizeMultiplier, isDark),
    [fontSizeMultiplier, isDark]
  );

  // ── Error / Ghost states ──────────────────────────────────────────────────

  if (error && !post) {
    return (
      <View style={[styles.shell, { backgroundColor: shellBg }]}>
        <ReaderHeader insets={insets.top} onBack={() => router.back()} onShare={() => {}} shareDisabled />
        <View style={[styles.center, { paddingHorizontal: 24 }]}>
          <Text style={styles.errText}>{error.message}</Text>
        </View>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.shell, { backgroundColor: shellBg }]}>
        <ReaderHeader insets={insets.top} onBack={() => router.back()} onShare={() => {}} shareDisabled />
        <View style={styles.ghost}>
          <View style={styles.ghostCover} />
          <View style={[styles.ghostMeta, { paddingHorizontal: hPad }]}>
            <View style={styles.ghostTitle} />
            <View style={styles.ghostLine} />
          </View>
        </View>
      </View>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <View style={[styles.shell, { backgroundColor: shellBg }]}>
      <FlatList
        data={chainData}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item, index }) => (
          <ArticleBlock
            post={item}
            isFirst={index === 0}
            isDark={isDark}
            contentW={contentW}
            hPad={hPad}
            tagsStyles={tagsStyles}
            onLinkPress={handleLinkPress}
          />
        )}
        ItemSeparatorComponent={() => (
          <ContinueBridge
            isDark={isDark}
            ad={articleAd}
            onImpression={trackArticleAdImpression}
            onClick={trackArticleAdClick}
          />
        )}
        onEndReached={loadNextInChain}
        onEndReachedThreshold={2.0}
        ListFooterComponent={chainLoading ? <ChainLoader /> : null}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
      />

      {/* Floating header — sempre acima da FlatList */}
      <ReaderHeader
        insets={insets.top}
        onBack={() => router.back()}
        onShare={onShare}
        onReaderPanel={() => setShowReaderPanel(true)}
      />

      {showReaderPanel && (
        <ReaderPanel
          onClose={() => setShowReaderPanel(false)}
          multiplier={fontSizeMultiplier}
          theme={themePreference}
          onSetFontSize={setFontSize}
          onSetTheme={setTheme}
          insetBottom={insets.bottom}
        />
      )}

      {linkLoading && (
        <View style={styles.linkPillWrap} pointerEvents="none">
          <GlassView intensity={70} tint="dark" style={styles.linkPill}>
            <ActivityIndicator size="small" color="#C9A84C" />
            <Text style={styles.linkPillText}>Abrindo matéria…</Text>
          </GlassView>
        </View>
      )}
    </View>
  );
}

// ─── Floating Reader Header ───────────────────────────────────────────────────

function ReaderHeader({
  insets,
  onBack,
  onShare,
  onReaderPanel,
  shareDisabled,
}: {
  insets:          number;
  onBack:          () => void;
  onShare:         () => void;
  onReaderPanel?:  () => void;
  shareDisabled?:  boolean;
}) {
  const { t } = useTranslation();
  return (
    <View style={[styles.headerWrap, { paddingTop: insets + 8 }]}>
      <View style={styles.headerRow}>
        <LiquidIconButton
          icon="arrow-left" size={44} iconSize={19} iconColor="#FFFFFF"
          tint="dark" intensity={80} onPress={onBack}
          accessibilityRole="button" accessibilityLabel={t("common.voltar")}
        />
        <View style={{ flex: 1 }} />

        {onReaderPanel && (
          <Pressable onPress={onReaderPanel} hitSlop={10} style={styles.aaBtn} accessibilityRole="button" accessibilityLabel="Preferências de leitura">
            <GlassView intensity={80} tint="dark" style={styles.aaBtnBlur}>
              <Text style={styles.aaBtnText}>Aa</Text>
            </GlassView>
          </Pressable>
        )}

        {/* Seletor de idioma (no lugar do antigo botão de salvar) */}
        <View style={styles.langBtnWrap}>
          <LanguageSwitcherButton />
        </View>

        <LiquidIconButton
          icon="share-alt" size={44} iconSize={18}
          iconColor={shareDisabled ? "rgba(255,255,255,0.4)" : "#FFFFFF"}
          tint="dark" intensity={80} onPress={onShare} disabled={shareDisabled}
          accessibilityRole="button" accessibilityLabel="Partilhar"
        />
      </View>
    </View>
  );
}

// ─── Reading Panel ────────────────────────────────────────────────────────────

const FONT_STEPS = [0.8, 0.9, 1.0, 1.1, 1.2, 1.4, 1.6];
const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light",  label: "Claro"   },
  { value: "dark",   label: "Escuro"  },
];

function ReaderPanel({
  onClose, multiplier, theme, onSetFontSize, onSetTheme, insetBottom,
}: {
  onClose:       () => void;
  multiplier:    number;
  theme:         ThemePreference;
  onSetFontSize: (m: number) => void;
  onSetTheme:    (t: ThemePreference) => void;
  insetBottom:   number;
}) {
  const decrease = () => {
    const idx = FONT_STEPS.findIndex((s) => s >= multiplier);
    if (idx > 0) onSetFontSize(FONT_STEPS[idx - 1]);
  };
  const increase = () => {
    const idx = FONT_STEPS.findLastIndex((s) => s <= multiplier);
    if (idx < FONT_STEPS.length - 1) onSetFontSize(FONT_STEPS[idx + 1]);
  };

  return (
    <Pressable style={styles.panelOverlay} onPress={onClose}>
      <Pressable style={[styles.panel, { paddingBottom: Math.max(insetBottom, 20) + 8 }]} onPress={(e) => e.stopPropagation()}>
        <GlassView intensity={82} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.panelHandle} />

        <View style={styles.panelRow}>
          <Text style={styles.panelLabel}>Tamanho do Texto</Text>
          <View style={styles.panelControls}>
            <Pressable onPress={decrease} hitSlop={12} style={styles.panelBtn}>
              <Text style={styles.panelBtnText}>A-</Text>
            </Pressable>
            <Text style={styles.panelSizeValue}>{Math.round(multiplier * 100)}%</Text>
            <Pressable onPress={increase} hitSlop={12} style={styles.panelBtn}>
              <Text style={[styles.panelBtnText, { fontSize: 17 }]}>A+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.panelRow}>
          <Text style={styles.panelLabel}>Tema</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map(({ value, label }) => (
              <Pressable key={value} onPress={() => onSetTheme(value)} style={[styles.themeChip, theme === value && styles.themeChipActive]}>
                <Text style={[styles.themeChipText, theme === value && styles.themeChipTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#F5F5F7" },

  // Header
  headerWrap: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 40, paddingHorizontal: 12 },
  headerRow:  { flexDirection: "row", alignItems: "center" },

  // Article block
  coverWrap: { marginHorizontal: 16, marginTop: 12, borderRadius: 16, overflow: "hidden", backgroundColor: "#1A1A1A" },
  cover:     { width: "100%", height: 320, backgroundColor: "#D0D0D2" },
  metaBlock: { paddingTop: 22, paddingBottom: 20 },
  headline:  { fontFamily: "Georgia", fontSize: 30, lineHeight: 38, letterSpacing: 0.3, color: "#000000" },
  byline:    {
    marginTop:     12,
    fontSize:      13,
    fontStyle:     "italic",
    letterSpacing: 0.4,
    color:         "rgba(0,0,0,0.45)",
  },
  kickerRow:  { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 10 },
  kickerDot:  { width: 7, height: 7, borderRadius: 2.5 },
  kickerText: { fontSize: 10, letterSpacing: 2.2, fontWeight: "700" },
  langBtnWrap: { marginRight: 8, justifyContent: "center" },

  // Infinite bridge
  bridge: {
    paddingVertical:   26,
    paddingHorizontal: 20,
  },
  bridgeHeader: {
    flexDirection: "row",
    alignItems:    "center",
    marginBottom:  20,
    gap:           12,
  },
  bridgeGoldLine: { flex: 1, height: StyleSheet.hairlineWidth * 2, backgroundColor: "#C9A84C" },
  bridgeLabel:    {
    fontSize:      9,
    letterSpacing: 3.5,
    color:         "#C9A84C",
    fontWeight:    "700",
    textTransform: "uppercase",
  },

  // Chain loader footer
  chainLoaderWrap: { paddingVertical: 32, alignItems: "center" },

  // Ghost placeholders
  ghost:        { flex: 1 },
  ghostCover:   { width: "100%", height: 320, backgroundColor: "#DCDCDF" },
  ghostMeta:    { paddingTop: 30, gap: 12 },
  ghostTitle:   { width: "75%", height: 28, borderRadius: 6, backgroundColor: "#E4E4E6" },
  ghostLine:    { width: "45%", height: 14, borderRadius: 4, backgroundColor: "#E8E8EA" },
  ghostBody:    { paddingTop: 8, gap: 10 },
  ghostBodyLine:{ height: 14, borderRadius: 4, backgroundColor: "#E8E8EA" },

  // Center (error)
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errText:{ textAlign: "center", fontSize: 16, color: "rgba(0,0,0,0.65)" },

  // 'Aa' button
  aaBtn:     { width: 44, height: 44, borderRadius: 22, overflow: "hidden", marginRight: 8 },
  aaBtnBlur: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  aaBtnText: { fontFamily: "Georgia", fontSize: 14, letterSpacing: 0.5, color: "#FFFFFF", fontWeight: "600" },

  // Reader panel
  panelOverlay: { ...StyleSheet.absoluteFill, zIndex: 90, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  panel:        { overflow: "hidden", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 10, paddingHorizontal: 24 },
  panelHandle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)", alignSelf: "center", marginBottom: 20 },
  panelRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.12)" },
  panelLabel:   { fontFamily: "Georgia", fontSize: 14, letterSpacing: 0.5, color: "rgba(255,255,255,0.75)" },
  panelControls:{ flexDirection: "row", alignItems: "center", gap: 16 },
  panelBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  panelBtnText: { fontSize: 13, color: "#FFFFFF", fontWeight: "600", letterSpacing: 0.5 },
  panelSizeValue:{ fontSize: 13, color: "#C9A84C", fontWeight: "700", letterSpacing: 1, minWidth: 44, textAlign: "center" },
  themeRow:     { flexDirection: "row", gap: 8 },
  themeChip:    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  themeChipActive:{ backgroundColor: "#C9A84C", borderColor: "#C9A84C" },
  themeChipText:  { fontSize: 12, letterSpacing: 0.8, color: "rgba(255,255,255,0.65)", fontWeight: "600" },
  themeChipTextActive: { color: "#000000" },

  // Link-resolving pill
  linkPillWrap: { position: "absolute", bottom: 36, left: 0, right: 0, alignItems: "center", zIndex: 80 },
  linkPill:     { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 28, overflow: "hidden" },
  linkPillText: { fontFamily: "Georgia", fontSize: 13, letterSpacing: 0.5, color: "rgba(255,255,255,0.88)" },
});
