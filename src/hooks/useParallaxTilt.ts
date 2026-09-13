/**
 * Singleton accelerometer subscription — one hardware read shared by all consumers.
 * Returns tiltX / tiltY SharedValues (±18 / ±12 px) that drive parallax transforms.
 */
import { Accelerometer } from "expo-sensors";
import { useEffect } from "react";
import { makeMutable, withSpring } from "react-native-reanimated";

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

// Module-level singletons: one subscription, N consumers
const tiltX = makeMutable(0);
const tiltY = makeMutable(0);
let _refCount = 0;
let _sub: ReturnType<typeof Accelerometer.addListener> | null = null;

const SPRING = { damping: 22, stiffness: 160 } as const;
const UPDATE_MS = 50;

export function useParallaxTilt() {
  useEffect(() => {
    _refCount++;

    if (_refCount === 1) {
      Accelerometer.setUpdateInterval(UPDATE_MS);
      _sub = Accelerometer.addListener(({ x, y }) => {
        // x: left-right, y: top-bottom device tilt
        tiltX.value = withSpring(clamp(x * 18, -18, 18), SPRING);
        tiltY.value = withSpring(clamp(y * 12, -12, 12), SPRING);
      });
    }

    return () => {
      _refCount--;
      if (_refCount === 0 && _sub) {
        _sub.remove();
        _sub = null;
      }
    };
  }, []);

  return { tiltX, tiltY };
}
