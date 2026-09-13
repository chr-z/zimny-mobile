/**
 * Colunistas — Catálogo de streaming de leitura dos colunistas.
 *
 * Design: catálogo premium estilo streaming (Netflix/Apple TV+)
 * - Grid 2 colunas com cards dos colunistas
 * - Cada card: foto 4:5, dia da semana, nome da coluna, nome do autor, @instagram
 * - Ao clicar, navega para o perfil do colunista
 */
import { DrawerActions } from "expo-router/build/react-navigation/routers";
import { useNavigation } from "expo-router";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedExpoImage } from "@/src/components/common/AnimatedExpoImage";
import { CompactHeader } from "@/src/components/home/CompactHeader";
import { HEADER_COMPACT_H } from "@/src/components/home/SmartHeader";
import { useAuthors } from "@/src/hooks/useAuthors";
import { useColunistasConfig } from "@/src/hooks/useColunistasConfig";
import { useTranslation } from "@/src/i18n";
import { translateColumnName } from "@/src/i18n/columns";
import { getDayLabel } from "@/src/i18n/days";
import type { Colunista } from "@/src/services/zimnyPlay";

const SCREEN_W = Dimensions.get("window").width;
const GAP = 12;
const PADDING = 16;
const CARD_W = (SCREEN_W - PADDING * 2 - GAP) / 2;
const CARD_H = CARD_W * 1.25; // 4:5

export default function ColunistasScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { authors, loading, error, refresh } = useAuthors();
  const { config } = useColunistasConfig();
  const { t, language } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleColunistaPress = useCallback(
    (author: Colunista) => {
      router.push(`/author/${author.id}` as any);
    },
    [router]
  );

  const sortedAuthors = useMemo(() => {
    return [...authors].sort((a, b) => {
      let aDay = 999;
      let bDay = 999;
      if (config?.day_assignments) {
        for (const [day, uid] of Object.entries(config.day_assignments)) {
          if (uid === a.id) aDay = Number(day);
          if (uid === b.id) bDay = Number(day);
        }
      }
      if (aDay !== bDay) return aDay - bDay;
      return a.order - b.order;
    });
  }, [authors, config]);

  return (
    <View style={styles.shell}>
      <CompactHeader onOpenDrawer={openDrawer} insetTop={insets.top} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + HEADER_COMPACT_H + 16,
          paddingBottom: Math.max(insets.bottom, 24) + 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
            colors={["#FFFFFF"]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>{t("colunistas.titulo")}</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {t("colunistas.subtitulo", { count: sortedAuthors.length, fixed: config?.day_assignments ? Object.keys(config.day_assignments).length : 0 })}
          </Text>
        </View>

        {/* Grid */}
        {sortedAuthors.length > 0 ? (
          <View style={styles.grid}>
            {sortedAuthors.map((author) => {
              let dayNumber: number | undefined;
              if (config?.day_assignments) {
                for (const [day, uid] of Object.entries(config.day_assignments)) {
                  if (uid === author.id) {
                    dayNumber = Number(day);
                    break;
                  }
                }
              }
              const dayLabel = getDayLabel(dayNumber, t);
              const colName = translateColumnName(
                config?.column_names?.[author.id] || "",
                language,
              );
              const colColor = config?.column_colors?.[author.id] || "#8E8E93";
              const instagramHandle = config?.instagram_handles?.[author.id];

              return (
                <Pressable
                  key={author.id}
                  onPress={() => handleColunistaPress(author)}
                  style={styles.card}
                >
                  <View style={styles.cardPhotoWrap}>
                    {author.avatar_url ? (
                      <AnimatedExpoImage
                        source={{ uri: author.avatar_url }}
                        style={styles.cardPhoto}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={200}
                      />
                    ) : (
                      <View style={[styles.cardPhoto, styles.cardPhotoPlaceholder]} />
                    )}
                  </View>
                  <View style={styles.cardInfo}>
                    {dayNumber ? (
                      <Text style={styles.cardDay}>{dayLabel}</Text>
                    ) : null}
                    {colName ? (
                      <Text style={[styles.cardColName, { color: colColor }]} numberOfLines={1}>
                        {colName}
                      </Text>
                    ) : null}
                    <Text style={styles.cardAuthor} numberOfLines={1}>
                      {author.name}
                    </Text>
                    {instagramHandle ? (
                      <Text style={styles.cardInstagram}>@{instagramHandle}</Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : loading ? (
          <View style={styles.grid}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.card}>
                <View style={[styles.cardPhotoWrap, { backgroundColor: "#2C2C2E" }]} />
                <View style={styles.cardInfo}>
                  <View style={styles.skelDay} />
                  <View style={styles.skelName} />
                  <View style={styles.skelAuthor} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t("colunistas.sem_colunistas")}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  scroll: {
    flex: 1,
  },
  header: {
    paddingHorizontal: PADDING,
    marginBottom: 20,
    marginTop: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#8E8E93",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: PADDING,
    gap: GAP,
  },
  card: {
    width: CARD_W,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    marginBottom: 4,
  },
  cardPhotoWrap: {
    width: "100%",
    height: CARD_H,
    backgroundColor: "#2C2C2E",
  },
  cardPhoto: {
    width: "100%",
    height: "100%",
  },
  cardPhotoPlaceholder: {
    backgroundColor: "#2C2C2E",
  },
  cardInfo: {
    padding: 10,
    gap: 2,
  },
  cardDay: {
    fontSize: 8,
    letterSpacing: 1.5,
    fontWeight: "700",
    color: "#555557",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  cardColName: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  cardAuthor: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  cardInstagram: {
    fontSize: 10,
    color: "#8E8E93",
    fontWeight: "500",
    letterSpacing: 0.3,
    marginTop: 2,
  },
  empty: {
    paddingHorizontal: PADDING,
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#8E8E93",
    letterSpacing: 1,
  },
  skelDay: {
    height: 8,
    width: "30%",
    backgroundColor: "#3A3A3C",
    borderRadius: 3,
  },
  skelName: {
    height: 10,
    width: "60%",
    backgroundColor: "#3A3A3C",
    borderRadius: 3,
    marginTop: 4,
  },
  skelAuthor: {
    height: 12,
    width: "50%",
    backgroundColor: "#3A3A3C",
    borderRadius: 3,
    marginTop: 4,
  },
});