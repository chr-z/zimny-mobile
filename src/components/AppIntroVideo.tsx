/**
 * AppIntroVideo — Vídeo de abertura exibido ao abrir o aplicativo.
 *
 * Reproduz um vídeo local (embutido no bundle) em tela cheia usando
 * contentFit cover: para vídeos horizontais (16:9), o vídeo é ampliado
 * para preencher toda a tela do celular, cortando as laterais (zoom).
 *
 * Fluxo:
 *   - onReady  → chamado quando o 1º frame está pronto (esconde o splash nativo)
 *   - onFinish → chamado após o vídeo terminar ou ao tocar em "Pular" (revela o app)
 *
 * Arquivo esperado: assets/videos/intro.mp4
 */
import { setAudioModeAsync } from "expo-audio";
import { useCallback, useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";

import { useTranslation } from "@/src/i18n";
import { NativeVideo } from "@/src/components/common/NativeVideo";

// Ativa a sessão de áudio para tocar com som no iOS (inclusive modo silencioso).
setAudioModeAsync({
  playsInSilentMode: true,
  shouldPlayInBackground: false,
  interruptionMode: "duckOthers",
}).catch(() => {});

// ⚠️ Coloque o vídeo de abertura (horizontal, ~7s) em assets/videos/intro.mp4
const VIDEO_SOURCE = require("../../assets/videos/intro.mp4");

const FADE_DURATION_MS = 400;
// Garantia: mesmo se o vídeo demorar para ficar pronto, o splash nativo é
// escondido e o app nunca fica travado em uma tela preta.
const MAX_WAIT_FOR_READY_MS = 2000;
// Corta o primeiro segundo do vídeo de abertura: a reprodução começa aqui,
// evitando a parte inicial (logo/ruído) que deveria ser removida.
const CUT_FIRST_MS = 1000;

type Props = {
  /** Chamado quando o primeiro frame do vídeo está pronto para exibição. */
  onReady?: () => void;
  /** Chamado ao fim do vídeo (ou ao pular), após o fade-out. */
  onFinish: () => void;
};

export function AppIntroVideo({ onReady, onFinish }: Props) {
  const { t } = useTranslation();
  const opacity = useRef(new Animated.Value(1)).current;
  // Overlay preto usado no "fade-in": some suavemente quando o vídeo fica
  // pronto, disfarçando o corte do primeiro segundo (sem parecer corte seco).
  const fadeInOverlay = useRef(new Animated.Value(1)).current;
  const finishedRef = useRef(false);
  const readyCalledRef = useRef(false);

  // Garante que o overlay nunca "trave" o app:
  // esconde o splash nativo mesmo se o vídeo demorar para ficar pronto.
  const callReady = useCallback(() => {
    if (readyCalledRef.current) return;
    readyCalledRef.current = true;
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    const timer = setTimeout(callReady, MAX_WAIT_FOR_READY_MS);
    return () => clearTimeout(timer);
  }, [callReady]);

  // Fade-in: quando o 1º frame do vídeo (já no segundo 1, cortado) fica
  // pronto, o overlay preto desaparece suavemente, disfarçando o corte.
  const fadeIn = useCallback(() => {
    Animated.timing(fadeInOverlay, {
      toValue: 0,
      duration: FADE_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, [fadeInOverlay]);

  // Finaliza com fade-out (executa apenas uma vez por montagem).
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    fadeIn();
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_DURATION_MS,
      useNativeDriver: true,
    }).start(() => onFinish());
  }, [opacity, fadeIn, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <NativeVideo
        source={VIDEO_SOURCE}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        autoPlay
        startAtMillis={CUT_FIRST_MS}
        loop={false}
        nativeControls={false}
        muted={false}
        onReady={() => {
          callReady();
          fadeIn();
        }}
        onEnd={finish}
        onError={finish}
      />
      {/* Overlay preto que desfaz o "corte" do 1º segundo via fade-in */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.fadeInOverlay,
          { opacity: fadeInOverlay },
        ]}
      />
      <Pressable style={styles.skipButton} onPress={finish} hitSlop={8}>
        <Text style={styles.skipText}>{t("intro.skip")}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000",
    zIndex: 1000,
  },
  fadeInOverlay: {
    backgroundColor: "#000",
  },
  skipButton: {
    position: "absolute",
    top: 56,
    right: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.55)",
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
