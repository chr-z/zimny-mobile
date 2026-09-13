/**
 * AcervoCarousel — Grid 3×2 "ACERVO DE EDIÇÕES" com as capas
 * das edições anteriores em proporção 2:3.
 *
 * Exibe no máximo 6 edições, da mais nova para a mais antiga,
 * incluindo a edição em destaque (Hero).
 */
import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { AnimatedExpoImage } from "@/src/components/common/AnimatedExpoImage";
import { radius, spacing } from "@/src/constants/designTokens";
import { useTranslation } from "@/src/i18n";
import {
  type MagazineEdition
} from "@/src/services/api";

import { SectionTitle } from "./SectionTitle";

const CARD_ASPECT = 2 / 3; // width / height
const CARD_GAP = 12;
const COL_COUNT = 3;
const LIFT_SPRING = { damping: 18, stiffness: 300, mass: 0.7 } as const;

type AcervoCarouselProps = {
  editions: MagazineEdition[];
  loading: boolean;
};

export function AcervoCarousel({ editions, loading }: AcervoCarouselProps) {
  const { t } = useTranslation();
  const { width: screenW } = useWindowDimensions();
  const router = useRouter();

  if (loading && editions.length === 0) {
    return <AcervoSkeleton screenW={screenW} />;
  }
  if (editions.length === 0) return null;

  // Mostra no máximo 6 edições
  const displayed = editions.slice(0, 6);

  const cardW = (screenW - 16 * 2 - CARD_GAP * (COL_COUNT - 1)) / COL_COUNT;
  const cardH = cardW / CARD_ASPECT;

  // Group items into explicit rows to prevent flexWrap issues
  const rows: React.ReactNode[] = [];
  for (let i = 0; i < displayed.length; i += COL_COUNT) {
    const rowItems = displayed.slice(i, i + COL_COUNT);
    rows.push(
      <View key={`row-${i}`} style={styles.row}>
        {rowItems.map((item) => (
          <AcervoCard key={item.id} edition={item} cardW={cardW} cardH={cardH} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <SectionTitle title={t("home.revista_zimny")} sectionKey="revista" />
      <View style={styles.grid}>
        {rows}
      </View>
      <View style={styles.bottomAction}>
        <Pressable
          onPress={() => router.push("/(drawer)/(tabs)/magazine" as any)}
          style={styles.actionPill}
        >
          <Text style={styles.actionText}>{t("common.ver_mais")}</Text>
          <Text style={styles.actionArrow}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

type AcervoCardProps = {
  edition: MagazineEdition;
  cardW: number;
  cardH: number;
};

function AcervoCard({ edition, cardW, cardH }: AcervoCardProps) {
  const router = useRouter();
  const pressed = useSharedValue(false);

  const liftStyle = useAnimatedStyle(() => {
    const p = pressed.value;
    return {
      transform: [{ scale: withSpring(p ? 1.045 : 1, LIFT_SPRING) }],
      shadowOpacity: withSpring(p ? 0.42 : 0.22, LIFT_SPRING),
      shadowRadius: withSpring(p ? 26 : 14, LIFT_SPRING),
      elevation: withSpring(p ? 20 : 10, LIFT_SPRING),
    };
  });

  const handlePressIn = useCallback(() => { pressed.value = true; }, [pressed]);
  const handlePressOut = useCallback(() => { pressed.value = false; }, [pressed]);
  const handlePress = useCallback(() => {
    router.push(`/magazine/${edition.id}` as any);
  }, [router, edition.id]);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={styles.pressable}
    >
      <Animated.View style={[styles.shadowWrap, { width: cardW, height: cardH }, liftStyle]}>
        <View style={[styles.coverClip, { width: cardW, height: cardH }]}>
          <AnimatedExpoImage
            source={{ uri: edition.coverImage }}
            style={styles.coverImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={280}
          />
        </View>
      </Animated.View>

      <View style={styles.meta}>
        <Text style={styles.editionNumber}>Nº {edition.number}</Text>
      </View>
    </Pressable>
  );
}

type AcervoSkeletonProps = {
  screenW: number;
};

function AcervoSkeleton({ screenW }: AcervoSkeletonProps) {
  const cardW = (screenW - 16 * 2 - CARD_GAP * (COL_COUNT - 1)) / COL_COUNT;
  const cardH = cardW / CARD_ASPECT;

  return (
    <View style={styles.section}>
      <View style={styles.grid}>
        <View style={styles.row}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.pressable}>
              <View style={[styles.coverClip, { width: cardW, height: cardH, backgroundColor: '#2C2C2E' }]} />
              <View style={styles.skeletonMeta}>
                <View style={[styles.skeletonLine, { width: '55%', height: 9 }]} />
              </View>
            </View>
          ))}
        </View>
        <View style={styles.row}>
          {[3, 4, 5].map((i) => (
            <View key={i} style={styles.pressable}>
              <View style={[styles.coverClip, { width: cardW, height: cardH, backgroundColor: '#2C2C2E' }]} />
              <View style={styles.skeletonMeta}>
                <View style={[styles.skeletonLine, { width: '55%', height: 9 }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
  },
  grid: {
    paddingHorizontal: 16,
    gap: CARD_GAP,
  },
  row: {
    flexDirection: "row",
    gap: CARD_GAP,
  },
  pressable: {
    width: undefined, // defined dynamically
  },
  shadowWrap: {
    borderRadius: radius.sm,
    backgroundColor: "#1C1C1E",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 10,
    overflow: "visible",
  },
  coverClip: {
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  meta: {
    marginTop: 8,
    paddingHorizontal: 2,
  },
  editionNumber: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#8E8E93",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  skeletonMeta: {
    marginTop: 8,
    paddingHorizontal: 2,
  },
  skeletonLine: {
    backgroundColor: "#2C2C2E",
    borderRadius: 4,
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
    backgroundColor: "#4A90D9",
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