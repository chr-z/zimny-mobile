/**
 * Zimny TV 24/7 — Tela de transmissão linear (acessível pela tab "AO VIVO").
 *
 * Adaptado para navegação por tab: sem botão close, com header consistente.
 * Grade de programação oculta por ora — exibe apenas o player + info bar
 * com tag elegante "Termina às HH:MM".
 */
import { DrawerActions } from "expo-router/build/react-navigation/routers";
import { useIsFocused } from "expo-router";
import { useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { AppState, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState } from "@/src/components/common/ErrorState";
import { Skeleton } from "@/src/components/common/LoadingSkeleton";
import { CompactHeader } from "@/src/components/home/CompactHeader";
import { HEADER_COMPACT_H } from "@/src/components/home/SmartHeader";
import { AdvertiseCta } from "@/src/components/tv/AdvertiseCta";
import { ZimnyTvPlayer } from "@/src/components/tv/ZimnyTvPlayer";
import { font, spacing } from "@/src/constants/designTokens";
import { useZimnyTv } from "@/src/hooks/useZimnyTv";
import { useTranslation } from "@/src/i18n";

export default function TvScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [appActive, setAppActive] = useState(true);
  const appStateRef = useRef(AppState.currentState);

  // Monitora se o app está em foreground (quando volta do background, muta)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      console.log(`[ZimnyTV] AppState change -> ${nextState} (prev=${appStateRef.current})`);
      if (appStateRef.current.match(/inactive|background/) && nextState === "active") {
        setAppActive(true);
      } else if (nextState.match(/inactive|background/)) {
        setAppActive(false);
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    console.log(`[ZimnyTV] screen isFocused=${isFocused}`);
  }, [isFocused]);

  useEffect(() => {
    console.log(`[ZimnyTV] screen appActive=${appActive} shouldMute=${!isFocused || !appActive}`);
  }, [appActive, isFocused]);

  // Muta quando: não está focado OU app está em background
  const shouldMute = !isFocused || !appActive;

  const {
    data,
    loading,
    error,
    isPlaying,
    play,
    pause,
    syncToLive,
    advanceToNext,
  } = useZimnyTv(isFocused);

  // Ao voltar do background, re-sincroniza com o AO VIVO (busca o horário novo
  // da grade + play), garantindo que segue a programação.
  const prevAppActiveRef = useRef(appActive);
  useEffect(() => {
    if (appActive && !prevAppActiveRef.current) {
      console.log(`[ZimnyTV] app resumed -> syncToLive`);
      syncToLive();
    }
    prevAppActiveRef.current = appActive;
  }, [appActive, syncToLive]);

  const openDrawer = () => {
    navigation.getParent()?.dispatch(DrawerActions.openDrawer());
  };

  const headerPadding = { paddingTop: insets.top + HEADER_COMPACT_H };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.shell}>
        <CompactHeader onOpenDrawer={openDrawer} insetTop={insets.top} />
        <View style={[styles.inner, headerPadding]}>
          <Skeleton height={300} borderRadius={0} />
        </View>
      </View>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  // Só mostra a tela de 'indisponível' se NUNCA carregamos dados (falha real
  // na primeira carga). Falha transitória de refresh mantém o player ativo.
  if (error && !data) {
    return (
      <View style={styles.shell}>
        <CompactHeader onOpenDrawer={openDrawer} insetTop={insets.top} />
        <View style={[styles.inner, headerPadding]}>
          <ErrorState
            title={t("tv.indisponivel_titulo")}
            message={t("tv.indisponivel_msg")}
          />
        </View>
      </View>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!data) {
    return (
      <View style={styles.shell}>
        <CompactHeader onOpenDrawer={openDrawer} insetTop={insets.top} />
        <View style={[styles.inner, headerPadding]}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>{t("tv.zimny")}</Text>
            <Text style={styles.emptySubtitle}>
              {t("tv.sem_transmissao")}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.shell}>
      <CompactHeader onOpenDrawer={openDrawer} insetTop={insets.top} />
      <View style={[styles.inner, headerPadding]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {/* Player */}
          {/* upcoming: fila de próximos (programas + vinhetas). Fallback defensivo
              para o caso de o servidor ainda não devolver `upcoming`. */}
          <ZimnyTvPlayer
            videoId={data.now_playing.video_id}
            videoUrl={data.now_playing.video_url}
            upcoming={data.upcoming ?? (data.next_playing ? [data.next_playing] : undefined)}
            seekToSeconds={data.now_playing.seek_to_seconds}
            serverTimestamp={data.now_playing.server_timestamp}
            duration={data.now_playing.duration}
            isPlaying={isPlaying}
            muted={shouldMute}
            onPlayPress={play}
            onPausePress={pause}
            onLivePress={syncToLive}
            onVideoEnded={advanceToNext}
          />

          {/* Info bar — só o indicador AO VIVO (sem nome do vídeo) */}
          <View style={styles.infoBar}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTag}>{t("tv.ao_vivo_tag")}</Text>
          </View>

          {/* CTA Anuncie Conosco */}
          <AdvertiseCta />
        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#0A0A0A" },
  inner: { flex: 1 },
  scrollContent: {
    paddingBottom: 32,
  },
  infoBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
  },
  liveTag: {
    fontFamily: font.serif,
    fontSize: font.size.caption,
    letterSpacing: font.tracking.wider as unknown as number,
    color: "#FF3B30",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontFamily: font.serif,
    fontSize: font.size.headline,
    letterSpacing: font.tracking.widest as unknown as number,
    color: "#FFFFFF",
    marginBottom: spacing.md,
  },
  emptySubtitle: {
    fontFamily: font.serif,
    fontSize: font.size.body,
    color: "#8E8E93",
    textAlign: "center",
  },
});