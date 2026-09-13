/**
 * Animated wrapper de expo-image com suporte explícito a sharedTransitionTag.
 *
 * O tipo AnimatedProps<ImageProps> do Reanimated 4 não inclui sharedTransitionTag
 * na sua declaração de tipos, mas o prop é suportado em runtime.
 * Usamos um cast controlado para preservar a DX sem sacrificar a funcionalidade.
 */
import { Image, type ImageProps } from "expo-image";
import React from "react";
import Animated from "react-native-reanimated";

type AnimatedImageProps = ImageProps & {
  style?: any; // animated style from useAnimatedStyle
  sharedTransitionTag?: string;
  entering?: unknown;
  exiting?: unknown;
};

const _AnimatedBase = Animated.createAnimatedComponent(Image);

export const AnimatedExpoImage: React.ComponentType<AnimatedImageProps> =
  _AnimatedBase as unknown as React.ComponentType<AnimatedImageProps>;
