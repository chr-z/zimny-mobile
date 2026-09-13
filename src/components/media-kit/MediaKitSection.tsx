/**
 * MediaKitSection
 *
 * Displays all Media Kit slides in a seamless vertical stack.
 * Supports scale + translate transforms for pinch-to-zoom and pan.
 */
import { StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated from "react-native-reanimated";

import { useLanguage } from "@/src/hooks/useLanguage";
import { MediaKitSlide } from "./MediaKitSlide";
import { MEDIA_KIT_SLIDES } from "./mediaKitSlides";

type Props = {
  animatedScale: SharedValue<number>;
  animatedTranslateX: SharedValue<number>;
  animatedTranslateY: SharedValue<number>;
};

export function MediaKitSection({
  animatedScale,
  animatedTranslateX,
  animatedTranslateY,
}: Props) {
  const { language } = useLanguage();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: animatedTranslateX },
            { translateY: animatedTranslateY },
            { scale: animatedScale },
          ],
        },
      ]}
    >
      {MEDIA_KIT_SLIDES.map((slide) => (
        <MediaKitSlide
          key={slide.id}
          id={slide.id}
          pt={slide.pt}
          en={slide.en}
          es={slide.es}
          language={language}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "center",
    backgroundColor: "transparent",
    // Shadow applied to the whole container
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 12,
  },
});