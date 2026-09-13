/**
 * AdBlockSection — Bloco de publicidade da Home.
 *
 * Cada instância deste componente usa o hook `useAd("home")`, que consome a
 * rotação compartilhada de anúncios. Assim, quando a Home possui mais de um
 * bloco de publicidade, cada um exibe um anúncio diferente (sem repetição
 * consecutiva do mesmo anúncio).
 */
import React from "react";
import { StyleSheet, View } from "react-native";

import { PremiumAdBlock } from "@/src/components/ads/PremiumAdBlock";
import { useAd } from "@/src/hooks/useAds";

export function AdBlockSection() {
  const { ad, trackImpression, trackClick } = useAd("home");

  if (!ad) return null;

  return (
    <View style={styles.wrap}>
      <PremiumAdBlock
        ad={ad}
        onImpression={trackImpression}
        onClick={trackClick}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "85%",
    alignSelf: "center",
    marginTop:        20,
    marginBottom:     8,
  },
});
