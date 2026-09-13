/**
 * MediaKitSlide
 *
 * Renders a single media-kit image for the currently active language.
 * Uses each image's NATURAL aspect ratio (loaded via onLoad) so that
 * no image overlaps or crops — they connect perfectly edge-to-edge.
 */
import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import type { AppLanguage } from "@/src/stores/useLanguageStore";
import type { MediaKitSlideData } from "./mediaKitSlides";

type Props = MediaKitSlideData & {
  language: AppLanguage;
};

const DEFAULT_ASPECT = 16 / 9;

export function MediaKitSlide({ id, pt, en, es, language }: Props) {
  const imageUrl = language === "en" ? en : language === "es" ? es : pt;

  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  return (
    <View style={styles.slide}>
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          { aspectRatio: aspectRatio ?? DEFAULT_ASPECT },
        ]}
        contentFit="contain"
        cachePolicy="memory-disk"
        transition={400}
        onLoad={(e) => {
          const { width, height } = e.source;
          if (width && height) {
            setAspectRatio(width / height);
          }
        }}
        accessibilityLabel={`Media Kit slide ${id} — ${language.toUpperCase()}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    margin: 0,
    padding: 0,
    // Critical: no extra space so the next image touches perfectly
  },
  image: {
    width: "100%",
    // aspectRatio is dynamic — set per-image from onLoad
  },
});