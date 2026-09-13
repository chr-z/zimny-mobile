/**
 * PressableScale — Reusable pressable with subtle scale + optional haptics.
 *
 * Wraps any content with a clean, non-bouncy animated scale transform
 * on press-in/press-out, with optional haptic feedback via expo-haptics.
 */
import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type PressableScaleProps = PressableProps & {
  /** Scale factor when pressed (default: 0.97). Use 0.92 for icon buttons. */
  scaleTo?: number;
  /** Enable haptic feedback on press-in (default: false). */
  haptics?: boolean;
  /** Haptic type (default: impactLight). */
  hapticType?: Haptics.ImpactFeedbackStyle;
  /** Optional style applied to the animated wrapper. */
  containerStyle?: StyleProp<ViewStyle>;
};

export function PressableScale({
  scaleTo = 0.97,
  haptics: enableHaptics = false,
  hapticType = Haptics.ImpactFeedbackStyle.Light,
  onPressIn,
  onPressOut,
  containerStyle,
  children,
  ...rest
}: PressableScaleProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.timing(scaleAnim, {
      toValue: scaleTo,
      duration: 80,
      useNativeDriver: true,
    }).start();
    if (enableHaptics) {
      Haptics.impactAsync(hapticType);
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
    onPressOut?.(e);
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, containerStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}