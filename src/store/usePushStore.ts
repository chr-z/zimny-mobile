/**
 * usePushStore — preferência de notificações push do usuário.
 *
 * `enabled` é o opt-in do usuário (default OFF — nada de permissão surpresa).
 * `askedOnce` marca se já mostramos o pedido pelo menos uma vez.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PushState {
  enabled: boolean;
  askedOnce: boolean;
  setEnabled: (enabled: boolean) => void;
  markAsked: () => void;
}

export const usePushStore = create<PushState>()(
  persist(
    (set) => ({
      enabled: false,
      askedOnce: false,
      setEnabled: (enabled) => set({ enabled }),
      markAsked: () => set({ askedOnce: true }),
    }),
    {
      name: "zimny-push",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
