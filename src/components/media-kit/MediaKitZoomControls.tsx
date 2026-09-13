/**
 * MediaKitZoomControls
 *
 * Floating control panel with +/- zoom buttons and a reset button.
 * Shows current zoom level as a percentage.
 * Hidden on narrow screens (< 480dp).
 */
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useCallback, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import type { SharedValue } from "react-native-reanimated";

type Props = {
  scale: SharedValue<number>;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

const BREAKPOINT = 480;

export function MediaKitZoomControls({ scale, onZoomIn, onZoomOut, onReset }: Props) {
  const { width } = useWindowDimensions();
  const [displayLevel, setDisplayLevel] = useState("100%");

  // Update the display label from any zoom change (called via runOnJS)
  const syncDisplay = useCallback(() => {
    // Read the shared value on the JS thread via .value
    setDisplayLevel(`${Math.round(scale.value * 100)}%`);
  }, [scale]);

  const handleIn = useCallback(() => {
    onZoomIn();
    // Give the spring a frame to settle, then sync
    requestAnimationFrame(syncDisplay);
  }, [onZoomIn, syncDisplay]);

  const handleOut = useCallback(() => {
    onZoomOut();
    requestAnimationFrame(syncDisplay);
  }, [onZoomOut, syncDisplay]);

  const handleReset = useCallback(() => {
    onReset();
    requestAnimationFrame(() => setDisplayLevel("100%"));
  }, [onReset]);

  if (width < BREAKPOINT) return null;

  return (
    <View style={styles.root}>
      {/* Zoom level indicator */}
      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>{displayLevel}</Text>
      </View>

      {/* Zoom in */}
      <Pressable
        onPress={handleIn}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        accessibilityLabel="Aumentar zoom"
      >
        <FontAwesome name="plus" size={18} color="#FFFFFF" />
      </Pressable>

      {/* Zoom out */}
      <Pressable
        onPress={handleOut}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        accessibilityLabel="Diminuir zoom"
      >
        <FontAwesome name="minus" size={18} color="#FFFFFF" />
      </Pressable>

      {/* Reset */}
      <Pressable
        onPress={handleReset}
        style={({ pressed }) => [styles.btn, styles.btnReset, pressed && styles.btnPressed]}
        accessibilityLabel="Resetar zoom"
      >
        <FontAwesome name="expand" size={14} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 9999,
    alignItems: "center",
    gap: 8,
  },
  levelBadge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  levelText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Georgia",
    fontWeight: "bold",
    textAlign: "center",
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#b5985a",
    alignItems: "center",
    justifyContent: "center",
    // Shadow
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnReset: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  btnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
});