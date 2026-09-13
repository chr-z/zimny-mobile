/**
 * Eventos — Lista de eventos de produção da Zimny.
 *
 * Layout:
 * - Compact global header com navegação
 * - Lista vertical 1 coluna com EventCards
 * - Pull-to-refresh
 *
 * Dados: API WordPress (zimny/v1/events) filtrada por categoria "producao"
 * As coberturas foram movidas para a aba "Cobertura de Eventos".
 */
import { useTranslation } from "@/src/i18n";
import { DrawerActions } from "expo-router/build/react-navigation/routers";
import { useNavigation } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EventCard } from "@/src/components/events";
import { CompactHeader } from "@/src/components/home/CompactHeader";
import { HEADER_COMPACT_H } from "@/src/components/home/SmartHeader";
import { spacing } from "@/src/constants/designTokens";
import { useEvents } from "@/src/hooks/useZimnyEvents";

// ─── Constants ──────────────────────────────────────────────────────────────

const H_PADDING = spacing.lg;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EventsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const navigation = useNavigation();
  const { events, loading, error, refresh } = useEvents({ category: "producao" });
  const [refreshing, setRefreshing] = useState(false);

  const openDrawer = () => {
    navigation.getParent()?.dispatch(DrawerActions.openDrawer());
  };

  const cardWidth = screenW - H_PADDING * 2;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const headerPadding = { paddingTop: insets.top + HEADER_COMPACT_H };

  return (
    <View style={styles.shell}>
      <CompactHeader onOpenDrawer={openDrawer} insetTop={insets.top} />
      <View style={[styles.inner, headerPadding]}>
        {loading && events.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : error && events.length === 0 ? (
          <View style={styles.error}>
            <Text style={styles.errorText}>{t("events.erro_carregar")}</Text>
            <Pressable onPress={refresh} style={styles.retryButton}>
              <Text style={styles.retryText}>{t("common.tentar_novamente")}</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#FFFFFF"
                colors={["#FFFFFF"]}
              />
            }
          >
            {events.length > 0 ? (
              <View style={styles.section}>
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    width={cardWidth}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>{t("events.sem_eventos")}</Text>
              </View>
            )}
          </ScrollView>
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
  inner: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    color: "#8E8E93",
    fontSize: 14,
    fontFamily: "Georgia",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: 40,
    paddingHorizontal: H_PADDING,
  },
  section: {
    gap: spacing.md,
  },
  empty: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    color: "#8E8E93",
    fontSize: 13,
    fontFamily: "Georgia",
    letterSpacing: 0.5,
  },
});