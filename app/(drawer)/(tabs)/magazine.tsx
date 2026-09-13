/**
 * Revista — Estante de edições da Zimny Magazine.
 *
 * Exibe grid 3 colunas com todas as edições disponíveis.
 * Usa useEditionStore() para dados (com fallback mock).
 */
import { DrawerActions } from "expo-router/build/react-navigation/routers";
import { useNavigation } from "expo-router";
import { useCallback, useState } from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState } from "@/src/components/common/ErrorState";
import { CompactHeader } from "@/src/components/home/CompactHeader";
import { HEADER_COMPACT_H } from "@/src/components/home/SmartHeader";
import { MagazineShelf } from "@/src/components/magazine/MagazineShelf";
import { useTranslation } from "@/src/i18n";
import { useEditionStore } from "@/src/store/useEditionStore";

export default function MagazineScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { editions, loading, error, refresh } = useEditionStore();
  const [refreshing, setRefreshing] = useState(false);

  const openDrawer = () => {
    navigation.getParent()?.dispatch(DrawerActions.openDrawer());
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <View style={styles.shell}>
      <CompactHeader onOpenDrawer={openDrawer} insetTop={insets.top} />
      <View style={{ flex: 1, paddingTop: insets.top + HEADER_COMPACT_H }}>
        {error && !loading && editions.length === 0 ? (
          <ErrorState
            title={t("magazine.indisponivel_titulo")}
            message={t("magazine.indisponivel_msg")}
          />
        ) : (
          <MagazineShelf editions={editions} loading={loading} />
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
});