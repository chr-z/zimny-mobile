import { DrawerActions } from "expo-router/build/react-navigation/routers";
import { useNavigation, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View
} from "react-native";
import Reanimated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AdBlockSection } from "@/src/components/ads/AdBlockSection";
import { AcervoCarousel } from "@/src/components/home/AcervoCarousel";
import { AnuncieCardsSection } from "@/src/components/home/AnuncieCardsSection";
import { CoberturaHomeGrid } from "@/src/components/home/CoberturaHomeGrid";
import { ColunistasHomeGrid } from "@/src/components/home/ColunistasHomeGrid";
import { EventosHomeGrid } from "@/src/components/home/EventosHomeGrid";
import { EventsMoreButton } from "@/src/components/home/EventsMoreButton";
import { HeroBanner } from "@/src/components/home/HeroBanner";
import { HomeEventsCarousel } from "@/src/components/home/HomeEventsCarousel";
import { HomeFeaturedVideosSection } from "@/src/components/home/HomeFeaturedVideosSection";
import { InstagramFeed } from "@/src/components/home/InstagramFeed";
import { JournalSection } from "@/src/components/home/JournalSection";
import { MarketingPlansCarousel } from "@/src/components/home/MarketingPlansCarousel";
import { PodcastHomeGrid } from "@/src/components/home/PodcastHomeGrid";
import { SectionTitle } from "@/src/components/home/SectionTitle";
import {
  HEADER_COMPACT_H,
  SmartHeader,
} from "@/src/components/home/SmartHeader";
import { VideoCarouselSection } from "@/src/components/home/VideoCarouselSection";
import { SearchOverlay } from "@/src/components/search/SearchOverlay";
import { SplashPlayer } from "@/src/components/SplashPlayer";
import { useAuthors } from "@/src/hooks/useAuthors";
import { useColunistasConfig } from "@/src/hooks/useColunistasConfig";
import { useHomeFeed } from "@/src/hooks/useHomeFeed";
import { useHomeLayout } from "@/src/hooks/useZimnyPlay";
import { useEditionStore } from "@/src/store/useEditionStore";

export default function HomeScreen() {
  const navigation            = useNavigation();
  const router                = useRouter();
  const insets                = useSafeAreaInsets();
  const { height: windowH }   = useWindowDimensions();

  const { posts, loading, refreshing, error, refresh } = useHomeFeed();
  const { editions, loading: editionsLoading } = useEditionStore();
  const { authors, loading: authorsLoading } = useAuthors();
  const { layout, loading: layoutLoading } = useHomeLayout();
  const { config: colunistasConfig, loading: configLoading } = useColunistasConfig();

  // ── Search overlay state ──────────────────────────────────────────────────
  const [showSearch, setShowSearch] = useState(false);

  // Splash dismisses when loading finishes
  const isContentLoaded = !loading;

  // Starts at full window height — SmartHeader will spring to compact once loaded.
  const animHeight = useSharedValue(windowH);

  // Scroll position — drives the SmartHeader data-row hide/show.
  const scrollY    = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      "worklet";
      scrollY.value = e.contentOffset.y;
    },
  });

  // Spacer drives content below the floating animated header
  const spacerStyle = useAnimatedStyle(() => ({
    height: animHeight.value,
  }));

  const openDrawer = () => {
    navigation.getParent()?.dispatch(DrawerActions.openDrawer());
  };

  const compactH   = insets.top + HEADER_COMPACT_H;

  // Dados para as seções
  const latestEdition = editions[0] ?? null;
  // Grid do acervo: inclui TODAS as edições (inclusive a do Hero), máximo 6, da mais nova para a mais antiga
  const acervoEditions = editions.slice(0, 6);
  const journalPosts  = posts.slice(0, 10);

  // ── Render section by type ────────────────────────────────────────────────

  // Log layout data for debugging
  console.log(`[HomeScreen] Layout loaded: ${layout.length} sections`, JSON.stringify(layout.map(s => ({ type: s.type, slug: s.slug, visible: s.visible }))));

  const renderSection = (section: { type: string; slug: string; title: string; visible: boolean; show_title?: boolean; term_id?: number; padding_top?: number; padding_bottom?: number }, index: number) => {
    if (!section.visible) {
      console.log(`[HomeScreen] Section hidden: ${section.type} (${section.slug})`);
      return null;
    }

    console.log(`[HomeScreen] Rendering section: ${section.type} (${section.slug})`);

    let content: React.ReactNode = null;

    switch (section.type) {
      case "hero_banner":
        content = <HeroBanner key="hero_banner" edition={latestEdition} loading={editionsLoading} />;
        break;

      case "acervo_carousel":
        content = <AcervoCarousel key="acervo_carousel" editions={acervoEditions} loading={editionsLoading} />;
        break;

      case "colunistas_carousel":
      case "colunista_dia":
        content = (
          <ColunistasHomeGrid
            key="colunistas-grid"
            authors={authors}
            config={colunistasConfig}
            loading={authorsLoading || configLoading}
          />
        );
        break;

      case "ad_block":
        content = <AdBlockSection key={`ad_block-${index}`} />;
        break;

      case "journal_section":
        content = <JournalSection key="journal_section" posts={journalPosts} loading={loading} />;
        break;

      case "instagram_feed":
        content = <InstagramFeed key="instagram_feed" />;
        break;

      case "video_carousel":
        content = (
          <VideoCarouselSection
            key={`vc-${section.slug}`}
            carouselSlug={section.slug}
            title={section.title}
          />
        );
        break;

      case "home_featured_videos":
        content = (
          <HomeFeaturedVideosSection
            key="home-featured-videos"
            title={section.title}
          />
        );
        break;

      case "events_carousel":
        content = <HomeEventsCarousel key="events_carousel" />;
        break;

      case "events_more_button":
        content = <EventsMoreButton key="events_more_button" />;
        break;

      case "marketing_plans_carousel":
        content = <MarketingPlansCarousel key="marketing_plans_carousel" />;
        break;

      case "podcast_grid":
        content = <PodcastHomeGrid key="podcast_grid" />;
        break;

      case "cobertura_grid":
        content = <CoberturaHomeGrid key="cobertura_grid" />;
        break;

      case "eventos_grid":
        content = <EventosHomeGrid key="eventos_grid" />;
        break;

      case "anuncie_card_v1":
        content = <AnuncieCardsSection key="anuncie-v1" variant={1} />;
        break;

      case "anuncie_card_v2":
        content = <AnuncieCardsSection key="anuncie-v2" variant={2} />;
        break;

      case "anuncie_card_v3":
        content = <AnuncieCardsSection key="anuncie-v3" variant={3} />;
        break;

      case "anuncie_card_v4":
        content = <AnuncieCardsSection key="anuncie-v4" variant={4} />;
        break;

      default:
        return null;
    }

    // Espaçamentos configuráveis via painel WordPress (Layout da Home)
    const paddingTop = section.padding_top ?? 16;
    const paddingBottom = section.padding_bottom ?? 8;
    const showTitle = section.show_title ?? true;

    if (showTitle && section.title) {
      return (
        <View key={`section-${index}`} style={{ paddingTop, paddingBottom }}>
          <SectionTitle title={section.title} />
          {content}
        </View>
      );
    }

    return (
      <View key={`section-${index}`} style={{ paddingTop, paddingBottom }}>
        {content}
      </View>
    );
  };

  return (
    <View style={styles.shell}>
      {/* ── Floating animated header ── */}
      <SmartHeader
        onOpenDrawer={openDrawer}
        onSearchPress={() => setShowSearch(true)}
        isContentLoaded={isContentLoaded}
        insetTop={insets.top}
        animHeight={animHeight}
        scrollY={scrollY}
      />

      <Reanimated.ScrollView
        style={styles.scroll}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ top: compactH }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#FFFFFF"
            colors={["#FFFFFF"]}
            progressViewOffset={compactH}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 16 },
        ]}
      >
        {/* Spacer matches animated header height exactly */}
        <Reanimated.View style={spacerStyle} />

        {/* ── Widescreen Splash Player (topo da Home) ── */}
        <SplashPlayer />

        {/* ── Dynamic sections from Home Layout API ── */}
        {!layoutLoading && layout.length > 0
          ? layout.map((section, idx) => renderSection(section, idx))
          : (
              <>
                {/* Fallback: render sections in default order if layout not loaded */}
                <HeroBanner edition={latestEdition} loading={editionsLoading} />
                <AcervoCarousel editions={acervoEditions} loading={editionsLoading} />
                <ColunistasHomeGrid
                  authors={authors}
                  config={colunistasConfig}
                  loading={authorsLoading || configLoading}
                />
                <AdBlockSection />
                <JournalSection posts={journalPosts} loading={loading} />
                <MarketingPlansCarousel />
                <InstagramFeed />
              </>
            )
        }
      </Reanimated.ScrollView>

      {/* ── Search Overlay ── */}
      <SearchOverlay
        visible={showSearch}
        onClose={() => setShowSearch(false)}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    /* top offset handled by animated spacer */
  },
});
