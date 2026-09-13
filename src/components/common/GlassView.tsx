/**
 * GlassView — Android-safe BlurView wrapper.
 *
 * iOS  → renders native <BlurView> (full glassmorphism).
 * Android → renders a <View> with a high-opacity semi-solid tint.
 *           BlurView on Android can crash when inside overflow:'hidden' containers
 *           or when combined with Reanimated transforms — this fallback eliminates
 *           that entire class of crashes while preserving the visual intent.
 *
 * API is identical to BlurView so it can be used as a drop-in replacement.
 */
import { BlurView, type BlurViewProps } from "expo-blur";
import { Platform, View } from "react-native";

const ANDROID_BG: Record<string, string> = {
  light:   "rgba(242,242,244,0.97)",
  dark:    "rgba(10,10,12,0.92)",
  default: "rgba(242,242,244,0.94)",
  extraLight: "rgba(250,250,252,0.97)",
  prominent:  "rgba(30,30,32,0.94)",
  regular:    "rgba(242,242,244,0.94)",
  systemUltraThinMaterial:      "rgba(248,248,248,0.82)",
  systemThinMaterial:           "rgba(248,248,248,0.88)",
  systemMaterial:               "rgba(248,248,248,0.92)",
  systemThickMaterial:          "rgba(248,248,248,0.96)",
  systemChromeMaterial:         "rgba(248,248,248,0.98)",
  systemUltraThinMaterialDark:  "rgba(18,18,20,0.80)",
  systemThinMaterialDark:       "rgba(18,18,20,0.86)",
  systemMaterialDark:           "rgba(18,18,20,0.90)",
  systemThickMaterialDark:      "rgba(18,18,20,0.94)",
  systemChromeMaterialDark:     "rgba(18,18,20,0.97)",
};

export function GlassView({
  intensity,
  tint = "default",
  style,
  children,
  ...rest
}: BlurViewProps) {
  if (Platform.OS === "android") {
    const bg = ANDROID_BG[tint] ?? ANDROID_BG.default;
    return (
      // Spread rest but omit BlurView-only props that View doesn't accept
      <View style={[{ backgroundColor: bg }, style]} {...(rest as object)}>
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={intensity} tint={tint} style={style} {...rest}>
      {children}
    </BlurView>
  );
}
