/**
 * Anuncie Conosco — Media Kit Screen
 *
 * Industry-standard touch zoom:
 *  - Pinch to zoom centered on focal point (2 fingers)
 *  - Two-finger pan to drag when zoomed in
 *  - Single-finger scroll (native, handled by ScrollView)
 *  - Double-tap to zoom in/out
 *  - +/- zoom buttons
 *  - Reset zoom
 */
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
    Gesture,
    GestureDetector,
    ScrollView,
} from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    MediaKitSection,
    MediaKitZoomControls,
} from "@/src/components/media-kit";
import { useTranslation } from "@/src/i18n";

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.25;
const SPRING_CONFIG = { damping: 20, stiffness: 200 };

export default function AnuncieConoscoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();

  // ── Shared values ─────────────────────────────────────────────────
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // ── Pinch → zoom (2 fingers) ──────────────────────────────────────
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      // e.scale is relative to gesture start (= 1.0 when fingers place)
      const newScale = Math.min(
        Math.max(savedScale.value * e.scale, MIN_SCALE),
        MAX_SCALE,
      );
      scale.value = newScale;

      // Keep focal point (midpoint between fingers) stationary
      const ratio = newScale / Math.max(savedScale.value, 0.01);
      translateX.value =
        e.focalX - (e.focalX - savedTranslateX.value) * ratio;
      translateY.value =
        e.focalY - (e.focalY - savedTranslateY.value) * ratio;
    })
    .onEnd(() => {
      scale.value = withSpring(scale.value, SPRING_CONFIG);
      if (scale.value <= 1.02) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // ── Pan → drag when zoomed in (2 fingers, avoids ScrollView clash) ─
  const panGesture = Gesture.Pan()
    .minPointers(2)
    .maxPointers(2)
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (scale.value > 1.02) {
        // Divide by scale so drag feels 1:1 with the content
        translateX.value =
          savedTranslateX.value + e.translationX / scale.value;
        translateY.value =
          savedTranslateY.value + e.translationY / scale.value;
      }
    });

  // ── Double-tap → toggle zoom ──────────────────────────────────────
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      if (scale.value > 1.1) {
        // Reset to 1×
        scale.value = withSpring(1, SPRING_CONFIG);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else {
        // Zoom to 2.5× centered on tap point
        const target = 2.5;
        scale.value = withSpring(target, SPRING_CONFIG);
        translateX.value = withSpring(
          e.absoluteX - e.absoluteX * target,
          SPRING_CONFIG,
        );
        translateY.value = withSpring(
          e.absoluteY - e.absoluteY * target,
          SPRING_CONFIG,
        );
      }
    });

  // ── All gestures together ─────────────────────────────────────────
  const composed = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture,
  );

  // ── Manual zoom controls ──────────────────────────────────────────
  const handleZoomIn = useCallback(() => {
    "worklet";
    scale.value = withSpring(
      Math.min(Math.max(scale.value + ZOOM_STEP, MIN_SCALE), MAX_SCALE),
      SPRING_CONFIG,
    );
  }, []);

  const handleZoomOut = useCallback(() => {
    "worklet";
    scale.value = withSpring(
      Math.min(Math.max(scale.value - ZOOM_STEP, MIN_SCALE), MAX_SCALE),
      SPRING_CONFIG,
    );
  }, []);

  const handleReset = useCallback(() => {
    "worklet";
    scale.value = withSpring(1, SPRING_CONFIG);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  }, []);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.shell, { paddingTop: insets.top }]}>
        {/* RNGH ScrollView coordinates properly with GestureDetector */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <MediaKitSection
            animatedScale={scale}
            animatedTranslateX={translateX}
            animatedTranslateY={translateY}
          />

          {/* CTA → página de contato com todos os canais */}
          <View style={styles.contactWrap}>
            <Pressable
              onPress={() => router.push("/contato")}
              style={({ pressed }) => [
                styles.contactCta,
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <FontAwesome name="whatsapp" size={16} color="#FFFFFF" />
              <Text style={styles.contactCtaText}>
                {t("contact.fale_conosco")}
              </Text>
              <FontAwesome name="chevron-right" size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        </ScrollView>

        <MediaKitZoomControls
          scale={scale}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
  },

  // ── CTA de contato ──────────────────────────────────────────────────────
  contactWrap: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 32,
  },
  contactCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#25D366",
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  contactCtaText: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});