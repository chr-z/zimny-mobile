/**
 * LiquidIconButton — circular Liquid Glass button (Apple style).
 * BlurView fills a perfect circle; icon floats on frosted glass.
 */
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet, type PressableProps } from "react-native";

import { GlassView } from "@/src/components/common/GlassView";

type IconName = React.ComponentProps<typeof FontAwesome>["name"];

type LiquidIconButtonProps = PressableProps & {
  icon: IconName;
  size?: number;
  iconSize?: number;
  iconColor?: string;
  tint?: "light" | "dark" | "default";
  intensity?: number;
};

export function LiquidIconButton({
  icon,
  size = 44,
  iconSize = 18,
  iconColor = "#FFFFFF",
  tint = "dark",
  intensity = 80,
  style,
  ...rest
}: LiquidIconButtonProps) {
  const baseStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: "hidden" as const,
  };

  return (
    <Pressable
      {...rest}
      hitSlop={10}
      style={
        typeof style === "function"
          ? (state) => [baseStyle, style(state)]
          : [baseStyle, style]
      }
    >
      <GlassView
        intensity={intensity}
        tint={tint}
        style={[styles.blur, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <FontAwesome name={icon} size={iconSize} color={iconColor} />
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  blur: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
