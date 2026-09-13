import 'react-native-gesture-handler';

import '../global.css';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AppIntroVideo } from '@/src/components/AppIntroVideo';
import { prefetchAllEvents } from '@/src/components/events/EventGalleryScreen';
import { PushPromptModal } from '@/src/components/push/PushPromptModal';
import { AuthProvider } from '@/src/context/AuthContext';
import { MagazinePrefetcher } from '@/src/hooks/useMagazinePrefetch';
import { PrefetchProvider } from '@/src/hooks/usePrefetch';
import { useTheme } from '@/src/hooks/useTheme';
import { useTranslation } from '@/src/i18n';
import { usePushStore } from '@/src/store/usePushStore';
import { useLanguageStore } from '@/src/stores/useLanguageStore';
import {
  registerForPush,
  setupPushListeners,
  syncPushToken,
} from '@/src/services/pushService';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

export {
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(drawer)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    PlayfairDisplay: require('../assets/fonts/PlayfairDisplay-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Vídeo de abertura: esconde o splash nativo somente quando o 1º frame do
  // overlay já está pronto, e revela o app quando o vídeo termina.
  const [introReady, setIntroReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && introReady) {
      SplashScreen.hideAsync();
      // Prefetch events in background (lazy loading)
      prefetchAllEvents();
    }
  }, [loaded, introReady]);

  // ── Push notifications (1.0.4) ──────────────────────────────────────────
  const router = useRouter();
  const pushEnabled = usePushStore((s) => s.enabled);

  useEffect(() => {
    // Listener de toque em notificação → abre o post (global, 1x).
    const cleanup = setupPushListeners((postId) => {
      router.push(`/post/${postId}` as never);
    });
    return cleanup;
  }, [router]);

  useEffect(() => {
    if (!loaded) return;
    if (pushEnabled) {
      // Opt-in ativo: garante permissão/token e re-sincroniza com o server.
      registerForPush().then((res) => {
        if (res.ok) syncPushToken();
      });
    }
  }, [pushEnabled, loaded]);

  // Troca manual de idioma com push ativo → atualiza a língua do device no
  // servidor (sem esperar o próximo app open). Device locale é estável, então
  // só o override dispara.
  const langOverride = useLanguageStore((s) => s.language);
  useEffect(() => {
    if (!loaded || !pushEnabled || !langOverride) return;
    const t = setTimeout(() => {
      syncPushToken();
    }, 800);
    return () => clearTimeout(t);
  }, [pushEnabled, langOverride, loaded]);

  // ── Prompt contextual de push (1ª execução, após o intro) ──────────────
  // Só aparece UMA vez e apenas se o SO ainda não foi perguntado
  // (status "undetermined"): quem já ativou, já negou ou já escolheu
  // "ficar de fora" nunca mais vê.
  // Em DEV (Expo Go/__DEV__) a flag é ignorada para permitir re-testar o
  // visual; em build de produção o one-time vale.
  const pushAsked = usePushStore((s) => s.askedOnce);
  const markPushAsked = usePushStore((s) => s.markAsked);
  const setPushEnabled = usePushStore((s) => s.setEnabled);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    if (!loaded || !introDone || pushEnabled) return;
    if (pushAsked && !__DEV__) return;
    let active = true;
    (async () => {
      try {
        if (__DEV__) {
          // Em dev: mostra sempre (ignora permissão do SO) p/ validar o visual.
          markPushAsked();
          if (active) setShowPushPrompt(true);
          return;
        }
        const perm = await Notifications.getPermissionsAsync();
        if (!active) return;
        markPushAsked(); // uma tentativa só — decidiu, não insiste
        if (perm.status === 'undetermined') {
          setShowPushPrompt(true);
        }
      } catch {
        markPushAsked();
      }
    })();
    return () => {
      active = false;
    };
  }, [loaded, introDone, pushEnabled, pushAsked, markPushAsked]);

  const allowPush = useMemo(
    () => async () => {
      if (pushBusy) return;
      setPushBusy(true);
      try {
        const ask = await Notifications.requestPermissionsAsync();
        if (ask.status === 'granted') {
          const res = await registerForPush();
          if (res.ok) {
            setPushEnabled(true);
            syncPushToken();
          } else if (res.reason !== 'permission') {
            setPushEnabled(true); // token falhou agora; efeito re-tenta depois
          }
        }
      } catch {
        // sem crash se o SO recusar estranhamente
      } finally {
        setPushBusy(false);
        setShowPushPrompt(false);
      }
    },
    [pushBusy, setPushEnabled]
  );

  const skipPush = useMemo(
    () => () => setShowPushPrompt(false),
    []
  );

  if (!loaded) {
    return null;
  }

  return (
    <>
      <RootLayoutNav />
      {!introDone && (
        <AppIntroVideo
          onReady={() => setIntroReady(true)}
          onFinish={() => setIntroDone(true)}
        />
      )}
      <PushPromptModal
        visible={showPushPrompt}
        busy={pushBusy}
        onAllow={allowPush}
        onSkip={skipPush}
      />
    </>
  );
}

function RootLayoutNav() {
  const { t } = useTranslation();
  const { isDark, colors } = useTheme();
  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      dark: isDark,
      colors: {
        ...DefaultTheme.colors,
        background: colors.surface,
        card: colors.surfaceAlt,
        text: colors.text,
        border: colors.border,
        primary: colors.text,
        notification: colors.text,
      },
    }),
    [isDark, colors]
  );

  const headerStyle = useMemo(
    () => ({ backgroundColor: colors.surfaceAlt }),
    [colors.surfaceAlt]
  );
  const headerTint = colors.text;
  const headerTitleStyle = useMemo(
    () => ({ fontFamily: 'Georgia', color: colors.text }),
    [colors.text]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.surface }}>
      <PrefetchProvider />
      <MagazinePrefetcher />
      <AuthProvider>
        <ThemeProvider value={navTheme}>
          <Stack
            screenOptions={{
              animation: 'fade',
              animationDuration: 250,
            }}
          >
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen
              name="anuncie-conosco"
              options={{
                title: 'Anuncie Conosco',
                headerStyle,
                headerTintColor: headerTint,
                headerTitleStyle,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="contato"
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="about"
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="modal"
              options={{
                presentation: 'modal',
                animation: 'fade_from_bottom',
              }}
            />
            <Stack.Screen
              name="post/[id]"
              options={{
                headerShown: false,
                // 'none' lets Reanimated drive the shared-element transition
                animation: 'none',
              }}
            />
            <Stack.Screen
              name="magazine/[id]"
              options={{
                headerShown: false,
                animation: 'fade',
                // Dark background bleeds through during the fade transition
                contentStyle: { backgroundColor: '#0A0A0A' },
              }}
            />
            <Stack.Screen
              name="author/[id]"
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: '#0A0A0A' },
              }}
            />
            <Stack.Screen
              name="category/[id]"
              options={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: '#0A0A0A' },
              }}
            />
            <Stack.Screen
              name="event/[id]"
              options={{
                headerShown: false,
                animation: 'fade',
                contentStyle: { backgroundColor: '#0A0A0A' },
              }}
            />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
