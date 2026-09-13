import type { ReactNode } from "react";
import { View } from "react-native";

type ScreenProps = {
  children: ReactNode;
};

/** Fundo cinza luxo editorial. */
export function Screen({ children }: ScreenProps) {
  return <View className="flex-1 bg-luxury-gray">{children}</View>;
}
