/**
 * MagazinePrefetcher — pré-carrega o flipbook da edição mais recente em segundo
 * plano, aquecendo o cache HTTP da WebView (WKWebView/WebView compartilhado).
 * Resultado: abrir a revista fica rápido ("pré-carregar mesmo sem a página aberta").
 *
 * Comportamento:
 * - Prefetcha apenas a edição mais recente, no idioma atual do app.
 * - Dispara após o app ficar ocioso (~4s) para não competir com o startup.
 * - Respeita um marcador de frescor: não repete o mesmo edição+idioma por 6h.
 * - Reage a mudanças de idioma: se o usuário trocar o idioma, prefetcha a
 *   mesma edição no novo idioma.
 * - Desmonta a WebView oculta logo após carregar (ou após um timeout de segurança).
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { useLanguage } from "@/src/hooks/useLanguage";
import { fetchEditions } from "@/src/services/api";
import { getMagazineUrl } from "@/src/services/magazineUrl";
import { getCachedEditions } from "@/src/store/useEditionStore";
import type { AppLanguage } from "@/src/stores/useLanguageStore";

// ─── Config ────────────────────────────────────────────────────────────────

const IDLE_DELAY_MS = 4000;             // espera o app ficar ocioso
const FRESH_MS = 6 * 60 * 60 * 1000;    // 6h — não repete o mesmo edição+idioma
const UNMOUNT_AFTER_LOAD_MS = 2000;     // desmonta logo após carregar
const MAX_WAIT_MS = 30_000;             // timeout de segurança
const MARKER_KEY = "zimny-magazine-prefetch-v1";

/** Chaves em andamento para evitar prefetch duplicado de edição+idioma. */
const _inflight = new Set<string>();

type PrefetchMarker = {
  editionId: string;
  lang: string;
  ts: number;
};

// ─── JS de injeção (mesmo padrão do MagazineViewer) ────────────────────────

function buildInjectionJs(language: AppLanguage): string {
  return `(function() {
  if (document.documentElement.lang !== '${language}') {
    document.documentElement.lang = '${language}';
  }
  setTimeout(function() {
    window.dispatchEvent(new Event('resize'));
  }, 300);
})();
true;
`;
}

// ─── Component ─────────────────────────────────────────────────────────────

type PrefetchState = {
  uri: string;
  lang: AppLanguage;
  editionId: string;
};

export function MagazinePrefetcher() {
  const { language } = useLanguage();
  const [prefetch, setPrefetch] = useState<PrefetchState | null>(null);

  // ── Dispara o prefetch quando o app fica ocioso; reage ao idioma ────────
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const editions = getCachedEditions() ?? (await fetchEditions());
        const latest = editions?.[0];
        if (cancelled || !latest) return;

        const uri = getMagazineUrl(latest.number);
        const editionId = String(latest.id);
        const key = `${editionId}:${language}`;

        if (_inflight.has(key)) return;

        // Frescor: não repete o mesmo edição+idioma dentro de 6h.
        let marker: PrefetchMarker | null = null;
        try {
          const raw = await AsyncStorage.getItem(MARKER_KEY);
          if (raw) marker = JSON.parse(raw) as PrefetchMarker;
        } catch {
          /* ignore */
        }
        if (
          marker &&
          marker.editionId === editionId &&
          marker.lang === language &&
          Date.now() - marker.ts < FRESH_MS
        ) {
          console.log(`[Perf] Magazine prefetch skipped (fresh): ${key}`);
          return;
        }

        _inflight.add(key);
        console.log(`[Perf] Magazine prefetch START: ${key}`);
        if (!cancelled) {
          setPrefetch({ uri, lang: language, editionId });
          // Aquece também a capa da edição no cache de imagens.
          if (latest.coverImage) {
            Image.prefetch(latest.coverImage).catch(() => {});
          }
        }
      } catch {
        // Best-effort: falha silenciosa.
      }
    }, IDLE_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [language]);

  // ── Conclusão: marca como feito e desmonta a WebView ────────────────────
  const finishPrefetch = useCallback(() => {
    if (!prefetch) return;
    const key = `${prefetch.editionId}:${prefetch.lang}`;
    const marker: PrefetchMarker = {
      editionId: prefetch.editionId,
      lang: prefetch.lang,
      ts: Date.now(),
    };
    AsyncStorage.setItem(MARKER_KEY, JSON.stringify(marker)).catch(() => {});
    _inflight.delete(key);
    console.log(`[Perf] Magazine prefetch DONE: ${key}`);
    setTimeout(() => setPrefetch(null), UNMOUNT_AFTER_LOAD_MS);
  }, [prefetch]);

  const handleError = useCallback(() => {
    if (!prefetch) return;
    _inflight.delete(`${prefetch.editionId}:${prefetch.lang}`);
    setPrefetch(null);
  }, [prefetch]);

  // ── Timeout de segurança para nunca manter uma WebView pesada montada ───
  useEffect(() => {
    if (!prefetch) return;
    const t = setTimeout(() => {
      _inflight.delete(`${prefetch.editionId}:${prefetch.lang}`);
      setPrefetch(null);
    }, MAX_WAIT_MS);
    return () => clearTimeout(t);
  }, [prefetch]);

  if (!prefetch) return null;

  return (
    <View pointerEvents="none" style={styles.hidden}>
      <WebView
        source={{ uri: prefetch.uri }}
        style={styles.hiddenWebview}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
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
        injectedJavaScript={buildInjectionJs(prefetch.lang)}
        onLoadEnd={finishPrefetch}
        onError={handleError}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  hidden: {
    position: "absolute",
    left: -340,
    top: 0,
    width: 320,
    height: 480,
    opacity: 0,
    zIndex: -1,
  },
  hiddenWebview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
