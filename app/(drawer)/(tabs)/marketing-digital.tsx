/**
 * Marketing Digital — Planos de marketing digital.
 *
 * Renders the MarketingDigitalScreen component inside a safe area shell
 * with a compact global header.
 */
import { DrawerActions } from "expo-router/build/react-navigation/routers";
import { useNavigation } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CompactHeader } from "@/src/components/home/CompactHeader";
import { HEADER_COMPACT_H } from "@/src/components/home/SmartHeader";
import { MarketingDigitalScreen } from "@/src/components/marketing";

export default function MarketingDigitalPage() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.getParent()?.dispatch(DrawerActions.openDrawer());
  };

  const headerPadding = { paddingTop: insets.top + HEADER_COMPACT_H };

  return (
    <View style={styles.shell}>
      <CompactHeader onOpenDrawer={openDrawer} insetTop={insets.top} />
      <View style={[styles.inner, headerPadding]}>
        <MarketingDigitalScreen />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  inner: {
    flex: 1,
  },
});