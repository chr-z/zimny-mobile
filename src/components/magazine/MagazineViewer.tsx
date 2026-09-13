/**
 * MagazineViewer
 *
 * Renderiza a página WordPress do 3D FlipBook via react-native-webview.
 *
 * Funcionamento:
 * 1. Carrega a URL da edição (ex: /zimny-magazine-edicao-07/)
 * 2. Injeta JavaScript no onLoadEnd para:
 *    a) Forçar document.documentElement.lang = '{language}' → aciona MutationObserver
 *    b) Ocultar header/footer/sidebar do tema WordPress
 *    c) Disparar resize para o WebGL recalcular o Canvas
 * 3. Escuta mudanças de idioma e re-injeta JS sem recarregar a página
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import type { AppLanguage } from "@/src/stores/useLanguageStore";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MagazineViewerProps = {
  /** URL completa da página WordPress da edição */
  uri: string;
  /** Idioma atual do app ("pt" | "en" | "es") */
  language: AppLanguage;
  /** Callback quando a WebView terminar o carregamento inicial */
  onLoadEnd?: () => void;
  /** Callback quando o 3D FlipBook confirmar que está pronto (via postMessage) */
  onFlipBookReady?: () => void;
  /** Callback em caso de erro de carregamento */
  onError?: (error: string) => void;
  /** Estilos adicionais para o container */
  style?: ViewStyle;
};

// ─── JavaScript de injeção ────────────────────────────────────────────────────

/**
 * Monta o bloco JS que será injetado na WebView.
 *
 * A limpeza do tema WordPress (header, footer, etc.) é feita no servidor
 * via o parâmetro `?app=true` na URL. Este script apenas:
 * 1. Força o atributo lang no <html> para acionar o MutationObserver do WordPress
 * 2. Dispara resize para o WebGL recalcular o Canvas
 */
function buildInjectionJs(language: AppLanguage): string {
  return `
(function() {
  if (document.documentElement.lang !== '${language}') {
    document.documentElement.lang = '${language}';
  }
  setTimeout(function() {
    window.dispatchEvent(new Event('resize'));
    try {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FLIPBOOK_READY' }));
    } catch(e) {}
  }, 300);
})();
true;
`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MagazineViewer({
  uri,
  language,
  onLoadEnd,
  onFlipBookReady,
  onError,
  style,
}: MagazineViewerProps) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const prevLanguageRef = useRef<AppLanguage>(language);

  // ── Handle messages from WebView (postMessage) ──────────────────────────
  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "FLIPBOOK_READY") {
          setIsLoading(false);
          onFlipBookReady?.();
        }
      } catch {
        // Ignore non-JSON messages
      }
    },
    [onFlipBookReady],
  );

  // ── Handle load end ─────────────────────────────────────────────────────
  const handleLoadEnd = useCallback(() => {
    onLoadEnd?.();
  }, [onLoadEnd]);

  // ── Handle error ────────────────────────────────────────────────────────
  const handleError = useCallback(
    (syntheticEvent: { nativeEvent: { description: string } }) => {
      setHasError(true);
      setIsLoading(false);
      onError?.(syntheticEvent.nativeEvent.description);
    },
    [onError],
  );

  // ── Re-inject JS when language changes (without reloading) ──────────────
  useEffect(() => {
    if (prevLanguageRef.current !== language && webViewRef.current) {
      prevLanguageRef.current = language;
      const js = buildInjectionJs(language);
      webViewRef.current.injectJavaScript(js);
    }
  }, [language]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ uri }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled
        bounces={false}
        overScrollMode="never"
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onMessage={handleMessage}
        injectedJavaScript={buildInjectionJs(language)}
        // Impede que o usuário selecione texto acidentalmente
        textInteractionEnabled={false}
        // Garante que o WebGL funcione corretamente
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        // Reusa o cache HTTP aquecido pelo MagazinePrefetcher (flipbooks rápidos)
        cacheEnabled
        incognito={false}
        cacheMode="LOAD_DEFAULT"
        originWhitelist={[
          "https://zimnymagazine.com",
          "https://*.zimnymagazine.com",
        ]}
        mixedContentMode="never"
        allowFileAccess={false}
        allowUniversalAccessFromFileURLs={false}
      />

      {/* Loading overlay */}
      {isLoading && !hasError && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#C9A84C" />
        </View>
      )}

      {/* Error overlay */}
      {hasError && (
        <View style={styles.errorOverlay}>
          <ActivityIndicator size="large" color="#C9A84C" />
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0A0A",
    zIndex: 10,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0A0A",
    zIndex: 10,
  },
});
