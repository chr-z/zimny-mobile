/**
 * pushService.ts — Registro e recebimento de notificações push (Expo).
 *
 * Fluxo:
 *  1. App inicia → se usuário aceitou push (store), pede permissão do SO e
 *     registra o device no Expo → token ExponentPushToken[...]
 *  2. Token é enviado ao WordPress: POST /wp-json/zimny/v1/push/register
 *  3. Quando o WP dispara (editor publicou post), o app recebe a notificação.
 *  4. Toque na notificação → deep link para o post (/post/{id}).
 *  5. Toggle off nas Configurações → POST /push/disable (opt-out server) e
 *     token local descartado.
 *
 * Importante: push NÃO funciona em Expo Go a partir do SDK 53 — só em builds
 * de dev client / production (EXPO_PUBLIC_* usados quando disponível).
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { resolveAppLanguage } from "@/src/hooks/useLanguage";

const TOKEN_KEY = "zimny.push.expoToken";
const SENT_KEY = "zimny.push.registeredFor";

/** Android: canal de notícias (importância alta, som padrão). */
const ANDROID_CHANNEL_ID = "zimny-news";

/** Handler: mostrar alerta mesmo com app aberto. */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type PushRegistrationResult =
  | { ok: true; token: string }
  | { ok: false; reason: string };

/** Base da API (mesma origem do WP). */
function wpBase(): string {
  return "https://zimnymagazine.com";
}

/**
 * Registra o device para push (idempotente).
 * Retorna o token quando ok; motivo quando não.
 */
export async function registerForPush(): Promise<PushRegistrationResult> {
  // Push exige build nativa (dev client ou produção).
  // SDK 57: expo-constants removeu o helper executionEnvironmentIs — comparar
  // a propriedade direto (storeClient = Expo Go; standalone = build EAS).
  if (Constants.executionEnvironment !== ExecutionEnvironment.Standalone) {
    return { ok: false, reason: "expo-go" };
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Notícias ZIMNY",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FFFFFF",
    });
  }

  // Permissão do SO.
  const current = await Notifications.getPermissionsAsync();
  let finalStatus = current.status;
  if (finalStatus !== "granted") {
    const ask = await Notifications.requestPermissionsAsync();
    finalStatus = ask.status;
  }
  if (finalStatus !== "granted") {
    return { ok: false, reason: "permission" };
  }

  // Credenciais do projeto (FCM/APNs) — configuradas no app.json eas projectId.
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    return { ok: false, reason: "no-project" };
  }

  try {
    const { data: expoToken } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    if (!expoToken || !expoToken.startsWith("ExponentPushToken[")) {
      return { ok: false, reason: "invalid-token" };
    }

    await persistAndSend(expoToken);
    return { ok: true, token: expoToken };
  } catch {
    return { ok: false, reason: "error" };
  }
}

/** Salva o token local e envia ao WP (uma vez por token). */
async function persistAndSend(token: string): Promise<void> {
  const previous = await AsyncStorage.getItem(TOKEN_KEY);
  await AsyncStorage.setItem(TOKEN_KEY, token);

  if (previous === token) {
    const sentFor = await AsyncStorage.getItem(SENT_KEY);
    if (sentFor === token) return; // já registrado no servidor
  }

  const platform = Platform.OS === "ios" ? "ios" : "android";
  const appVersion = Constants.expoConfig?.version ?? "";
  // Língua da UI (override manual ou locale do device): o servidor usa para
  // escolher o título/corpo da notificação (pt/en/es; fallback pt).
  const language = resolveAppLanguage();

  try {
    const res = await fetch(`${wpBase()}/wp-json/zimny/v1/push/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, platform, app_version: appVersion, language }),
    });
    if (res.ok) {
      await AsyncStorage.setItem(SENT_KEY, token);
    }
  } catch {
    // retry no próximo app open (persistAndSend roda de novo)
  }
}

/** Re-envia o token ao servidor (chamar no app open — cobre falha antiga). */
export async function syncPushToken(): Promise<void> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (!token) return;
  await AsyncStorage.removeItem(SENT_KEY);
  await persistAndSend(token);
}

/** Opt-out: desliga no servidor e limpa local. */
export async function disablePush(): Promise<void> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    try {
      await fetch(`${wpBase()}/wp-json/zimny/v1/push/disable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch {
      // silencioso — server cai no cleanup de tokens mortos
    }
  }
  await AsyncStorage.multiRemove([TOKEN_KEY, SENT_KEY]);
}

/** Estado do registro (para a UI de Configurações). */
export async function getPushState(): Promise<{
  registered: boolean;
  token?: string;
}> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return { registered: Boolean(token), token: token ?? undefined };
}

/** Listener de toque em notificação → deep link para o post. */
export function usePushNotificationResponse(): void {
  // Implementado via helper de evento — evita hook fora de componente:
  // este módulo registra o listener no bootstrap (ver setupPushListeners).
}

let responseListenerAttached = false;

/**
 * Instala listeners globais (chamar 1x no _layout):
 *  - toque na notificação → navega pro post
 */
export function setupPushListeners(
  navigate: (postId: number) => void,
): () => void {
  if (responseListenerAttached) {
    return () => undefined;
  }
  responseListenerAttached = true;

  const sub = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data as {
        type?: string;
        postId?: number;
      };
      if (data?.type === "new_post" && data.postId) {
        navigate(Number(data.postId));
      }
    },
  );

  return () => {
    sub.remove();
    responseListenerAttached = false;
  };
}
