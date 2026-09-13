/**
 * HeroBanner — Banner principal da home com estética Quiet Luxury.
 *
 * Exibe a capa da edição mais recente em altura de ~58% da tela,
 * com gradiente inferior suave. A capa inteira é tocável — sem botões
 * poluindo a imagem. Texto centralizado na base com "Tocar para ler"
 * em destaque sutil com animação de pulse.
 */
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { AnimatedExpoImage } from "@/src/components/common/AnimatedExpoImage";
import { useTranslation } from "@/src/i18n";
import type { MagazineEdition } from "@/src/services/api";

const HERO_H = 480;

type HeroBannerProps = {
  edition: MagazineEdition | null;
  loading: boolean;
};

export function HeroBanner({ edition, loading }: HeroBannerProps) {
  const { t } = useTranslation();
  const router = useRouter();

  // Animação de pulse sutil para o "Tocar para ler"
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(0.8, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  if (loading || !edition) {
    return <View style={[styles.wrap, styles.placeholder]} />;
  }

  const handlePress = () => {
    router.push({
      pathname: "/magazine/[id]",
      params: { id: edition.id },
    });
  };

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
      <View style={styles.wrap}>
        {/* Imagem de fundo */}
        <AnimatedExpoImage
          source={{ uri: edition.coverImage }}
          style={styles.image}
          contentFit="cover"
          transition={400}
          cachePolicy="memory-disk"
        />

        {/* Gradiente inferior sutil */}
        <LinearGradient
          colors={["transparent", "rgba(10,10,10,0.4)", "rgba(10,10,10,0.7)"]}
          locations={[0, 0.6, 1]}
          style={styles.bottomGradient}
          pointerEvents="none"
        />

        {/* Texto centralizado na base */}
        <View style={styles.content} pointerEvents="none">
          <Text style={styles.kicker}>{t("home.hero_kicker")}</Text>
          <Animated.Text style={[styles.hint, pulseStyle]}>
            Tocar para ler
          </Animated.Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    height: HERO_H,
    overflow: "hidden",
  },
  placeholder: {
    backgroundColor: "#1C1C1E",
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 1,
  },
  kicker: {
    fontSize: 9,
    letterSpacing: 3,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  hint: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
});