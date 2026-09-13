/**
 * CompactHeader — Versão simplificada do SmartHeader para telas que não são a Home.
 *
 * Renderiza a barra de navegação compacta: [☰] [tab icons] [search]
 * Sem splash, sem brand, sem animação de scroll.
 */
import { useSharedValue } from "react-native-reanimated";

import { HEADER_ROW_H, SmartHeader } from "@/src/components/home/SmartHeader";

type Props = {
  onOpenDrawer: () => void;
  onSearchPress?: () => void;
  insetTop: number;
};

export function CompactHeader({ onOpenDrawer, onSearchPress, insetTop }: Props) {
  const animHeight = useSharedValue(insetTop + HEADER_ROW_H);
  const scrollY = useSharedValue(999); // always past threshold → brand hidden

  return (
    <SmartHeader
      onOpenDrawer={onOpenDrawer}
      onSearchPress={onSearchPress}
      isContentLoaded={true}
      insetTop={insetTop}
      animHeight={animHeight}
      scrollY={scrollY}
      showBrand={false}
    />
  );
}