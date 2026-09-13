/**
 * LoadingSkeleton — Reusable skeleton pulse component.
 *
 * Use for loading states across the app. Provides a pulsing opacity animation
 * that can wrap any placeholder shape.
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';

type SkeletonProps = {
  /** Width of the skeleton (default: 100%) */
  width?: number | string;
  /** Height of the skeleton (default: 20) */
  height?: number;
  /** Border radius (default: 4) */
  borderRadius?: number;
  /** Additional style overrides */
  style?: ViewStyle;
};

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * SkeletonCard — Pre-built card skeleton for news/post items.
 */
type SkeletonCardProps = {
  /** Card height (default: 200 for image area) */
  imageHeight?: number;
  /** Number of text lines (default: 3) */
  lines?: number;
};

export function SkeletonCard({ imageHeight = 200, lines = 3 }: SkeletonCardProps) {
  return (
    <View style={styles.card}>
      <Skeleton width="100%" height={imageHeight} borderRadius={12} />
      <View style={styles.cardBody}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            width={i === lines - 1 ? '60%' : '100%'}
            height={14}
            borderRadius={4}
            style={{ marginBottom: 8 }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#D0D0D2',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardBody: {
    padding: 16,
  },
});