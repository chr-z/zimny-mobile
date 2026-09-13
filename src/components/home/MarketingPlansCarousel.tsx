/**
 * MarketingPlansCarousel — Carrossel de planos de marketing digital.
 *
 * Exibe uma imagem por vez (proporção ~1:1) com swipe manual nativo
 * e rotação automática a cada 15 segundos.
 * Os dados vêm do endpoint /zimny/v1/marketing-plans, gerenciado
 * pelo painel WordPress (Layout da Home → Planos de Marketing Digital).
 *
 * Ao clicar, navega para o link configurado (se houver).
 */
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import { AnimatedExpoImage } from "@/src/components/common/AnimatedExpoImage";
import { Skeleton } from "@/src/components/common/LoadingSkeleton";
import { SectionTitle } from "@/src/components/home/SectionTitle";
import { color, font, radius, spacing } from "@/src/constants/designTokens";
import { useTranslation } from "@/src/i18n";
import { fetchMarketingPlans, type MarketingPlan } from "@/src/services/zimnyPlay";

const AUTO_SWIPE_MS = 15000;
const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W - 48; // 24px margin each side
const CARD_H = CARD_W; // 1:1 aspect ratio

type MarketingPlansCarouselProps = {
  /** Optional pre-fetched plans. If not provided, fetches internally. */
  plans?: MarketingPlan[];
  loading?: boolean;
};

export function MarketingPlansCarousel({
  plans: externalPlans,
  loading: externalLoading,
}: MarketingPlansCarouselProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [internalPlans, setInternalPlans] = useState<MarketingPlan[]>([]);
  const [internalLoading, setInternalLoading] = useState(!externalPlans);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isManuallyScrolling = useRef(false);

  const plans = externalPlans ?? internalPlans;
  const loading = externalLoading ?? internalLoading;

  // Fetch plans if not provided externally
  useEffect(() => {
    if (externalPlans) {
      setInternalLoading(false);
      return;
    }

    let cancelled = false;
    setInternalLoading(true);

    fetchMarketingPlans()
      .then((data) => {
        if (!cancelled) {
          setInternalPlans(data);
          setInternalLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInternalPlans([]);
          setInternalLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [externalPlans]);

  // Auto-swipe timer
  useEffect(() => {
    if (plans.length <= 1) return;

    timerRef.current = setInterval(() => {
      if (!isManuallyScrolling.current) {
        const nextIndex = (currentIndex + 1) % plans.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setCurrentIndex(nextIndex);
      }
    }, AUTO_SWIPE_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [plans.length, currentIndex]);

  // Reset timer when user manually swipes
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (plans.length > 1) {
      timerRef.current = setInterval(() => {
        if (!isManuallyScrolling.current) {
          const nextIndex = (currentIndex + 1) % plans.length;
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          setCurrentIndex(nextIndex);
        }
      }, AUTO_SWIPE_MS);
    }
  }, [plans.length, currentIndex]);

  const goToSlide = useCallback(
    (index: number) => {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
      resetTimer();
    },
    [resetTimer]
  );

  const handleVerMais = useCallback(() => {
    router.push("/(drawer)/(tabs)/marketing-digital");
  }, [router]);

  const handleMomentumEnd = useCallback(
    (e: any) => {
      const newIndex = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        resetTimer();
      }
    },
    [currentIndex, resetTimer]
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        // Just update index silently, the momentum end handles the reset
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_W,
      offset: CARD_W * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback((item: MarketingPlan) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: MarketingPlan }) => (
      <SlideItem plan={item} onPress={resetTimer} />
    ),
    [resetTimer]
  );

  if (loading && plans.length === 0) {
    return <MarketingPlansSkeleton />;
  }

  if (plans.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      {/* Title bar */}
      <SectionTitle title={t("home.marketing_digital")} sectionKey="marketing digital" />

      {/* Carousel slide with manual swipe */}
      <View style={styles.slideContainer}>
        <FlatList
          ref={flatListRef}
          horizontal
          data={plans}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={CARD_W}
          snapToAlignment="start"
          onMomentumScrollEnd={handleMomentumEnd}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialScrollIndex={0}
          removeClippedSubviews={false}
        />
      </View>

      {/* Dots indicator */}
      {plans.length > 1 && (
        <View style={styles.dotsRow}>
          {plans.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => goToSlide(index)}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Ver mais button — padronizado com os demais componentes da Home */}
      <View style={styles.bottomAction}>
        <Pressable onPress={handleVerMais} style={styles.actionPill}>
          <Text style={styles.actionText}>{t("common.ver_mais")}</Text>
          <Text style={styles.actionArrow}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Slide Item ─────────────────────────────────────────────────────────────

function SlideItem({
  plan,
  onPress,
}: {
  plan: MarketingPlan;
  onPress: () => void;
}) {
  const router = useRouter();

  const handlePress = useCallback(() => {
    onPress();
    if (plan.link) {
      router.push(plan.link as any);
    }
  }, [onPress, plan.link, router]);

  return (
    <View style={styles.slide}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.pressable,
          pressed && { opacity: 0.92 },
        ]}
      >
        <AnimatedExpoImage
          source={{ uri: plan.image_url }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={300}
        />

        {/* Title overlay at bottom */}
        {plan.title ? (
          <View style={styles.overlay}>
            <Text style={styles.overlayText} numberOfLines={2}>
              {plan.title}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function MarketingPlansSkeleton() {
  const { t } = useTranslation();
  return (
    <View style={styles.wrapper}>
      <SectionTitle title={t("home.marketing_digital")} sectionKey="marketing digital" />
      <View style={styles.container}>
        <Skeleton
          width={CARD_W}
          height={CARD_H}
          borderRadius={radius.lg}
        />
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
    marginBottom: 4,
  },
  container: {
    marginHorizontal: 24,
  },
  slideContainer: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: color.dark.surfaceAlt,
    marginHorizontal: spacing.lg,
  },
  slide: {
    width: CARD_W,
    height: CARD_H,
  },
  pressable: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  overlayText: {
    color: color.dark.text,
    fontSize: font.size.small,
    fontWeight: "600",
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: color.dark.text,
    borderRadius: 4,
  },
  dotInactive: {
    backgroundColor: color.dark.textTertiary,
  },
  bottomAction: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderRadius: 999,
    backgroundColor: "#8C5CD0",
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  actionText: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  actionArrow: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "300",
    marginTop: -1,
  },
});