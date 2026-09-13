/**
 * ImageBanner — Banner de imagem horizontal clicável.
 *
 * Renderiza a imagem preenchendo 100% do container pai (o slot 16:9 fixo do
 * PremiumAdBlock) com `contentFit="cover"`. Não define proporção própria: o
 * slot controla o tamanho, garantindo que todos os formatos de anúncio
 * ocupem exatamente o mesmo espaço (sem "pulo" na tela ao alternar entre
 * ad e banner).
 */
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useRef } from "react";
import {
  type LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { getSafeHttpsUrl } from "@/src/utils/security";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ImageBannerItem = {
  id: string;
  image_url: string;
  image_id: number;
  link: string;
};

export type ImageBannerProps = {
  banner: ImageBannerItem;
  onImpression?: () => void;
  onClick?: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ImageBanner({
  banner,
  onImpression,
  onClick,
}: ImageBannerProps) {
  const impressionFired = useRef(false);

  const handleLayout = useCallback(
    (_e: LayoutChangeEvent) => {
      if (impressionFired.current) return;
      impressionFired.current = true;
      onImpression?.();
    },
    [onImpression]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!impressionFired.current) {
        impressionFired.current = true;
        onImpression?.();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [onImpression]);

  const handlePress = useCallback(async () => {
    const safeLink = getSafeHttpsUrl(banner.link);
    if (safeLink) {
      onClick?.();
      await WebBrowser.openBrowserAsync(safeLink, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        toolbarColor:      "#0A0A0A",
        controlsColor:     "#FFFFFF",
      });
    }
  }, [banner.link, onClick]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.88}
      accessibilityRole="link"
      accessibilityLabel={`Banner publicitário`}
      onLayout={handleLayout}
      style={styles.fill}
    >
      <View style={styles.fill}>
        <Image
          source={{ uri: banner.image_url }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={300}
        />
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
  },
});
