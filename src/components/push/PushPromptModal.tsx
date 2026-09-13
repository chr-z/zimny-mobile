/**
 * PushPromptModal — pedido contextual de notificação no 1º launch da 1.1.
 *
 * Design "Quiet Luxury": card escuro, kicker ZIMNY, sino com anel dourado e
 * pulso sutil, título Georgia, CTA verde (View colorido com texto centralizado
 * e Pressable de toque em camada própria — robusto a bug de esticar filho) e
 * link secundário discreto. Aparece UMA única vez (usePushStore.askedOnce).
 */
import Feather from "@expo/vector-icons/Feather";
import { useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTranslation } from "@/src/i18n";

type Props = {
  visible: boolean;
  busy?: boolean;
  onAllow: () => void;
  onSkip: () => void;
};

// ─── Pulso suave ao redor do sino ────────────────────────────────────────────

function PulseRing() {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = 0;
    p.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    return () => {
      p.value = 0;
    };
  }, [p]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - p.value),
    transform: [{ scale: 1 + p.value * 0.5 }],
  }));

  return <Animated.View pointerEvents="none" style={[styles.pulseRing, ringStyle]} />;
}

// ─── Modal ───────────────────────────────────────────────────────────────────

export function PushPromptModal({ visible, busy, onAllow, onSkip }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onSkip}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Animated.View
          entering={FadeInDown.delay(60).duration(380)}
          style={[styles.card, { paddingBottom: Math.max(insets.bottom, 18) + 10 }]}
        >
          {/* Kicker editorial */}
          <Text style={styles.kicker}>ZIMNY</Text>

          {/* Ícone: anel dourado + sino + pulso */}
          <View style={styles.iconStage}>
            <PulseRing />
            <View style={styles.iconRing}>
              <View style={styles.iconDisc}>
                <Feather name="bell" size={24} color="#0A0A0A" />
              </View>
            </View>
          </View>

          {/* Título */}
          <Text style={styles.title}>{t("push.prompt_titulo")}</Text>

          {/* Mensagem */}
          <Text style={styles.message}>{t("push.prompt_msg")}</Text>

          {/* CTA primário — View verde; Pressable cobre tudo e CONTÉM o texto
              (texto como filho do Pressable garante toque em qualquer ponto) */}
          <View style={[styles.allowOuter, busy && styles.busy]}>
            <Pressable
              onPress={onAllow}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={t("push.prompt_permitir")}
              style={({ pressed }) => [
                StyleSheet.absoluteFill,
                styles.allowTouch,
                pressed && !busy && styles.pressedAllow,
              ]}
            >
              <Text style={styles.allowText}>{t("push.prompt_permitir")}</Text>
            </Pressable>
          </View>

          {/* CTA secundário — link discreto, com separador explícito */}
          <View style={styles.skipSpacer} />
          <Pressable
            onPress={onSkip}
            disabled={busy}
            hitSlop={10}
            style={({ pressed }) => [styles.skipBtn, pressed && !busy && styles.pressedSkip]}
          >
            <Text style={styles.skipText}>{t("push.prompt_fora")}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
  },
  card: {
    width: "100%",
    maxWidth: 348,
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "#131316",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 26,
    paddingTop: 24,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 24,
  },

  kicker: {
    fontSize: 9,
    letterSpacing: 5,
    fontWeight: "800",
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
    marginBottom: 18,
  },

  // Palco do ícone (posição relativa p/ o pulso)
  iconStage: {
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  pulseRing: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: "#C9A84C",
  },
  iconRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconDisc: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#C9A84C",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontFamily: "Georgia",
    fontSize: 23,
    lineHeight: 30,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    marginBottom: 26,
    maxWidth: 290,
  },

  // CTA primário: View verde centraliza o texto; Pressable absoluteFill = toque
  allowOuter: {
    width: "100%",
    backgroundColor: "#16C748",
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  allowTouch: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressedAllow: { opacity: 0.85 },
  allowText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: "#FFFFFF",
    textAlign: "center",
  },

  skipSpacer: {
    width: "70%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginTop: 22,
    marginBottom: 8,
    alignSelf: "center",
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 12.5,
    letterSpacing: 0.3,
    color: "rgba(255,255,255,0.42)",
    textAlign: "center",
  },

  pressedSkip: { opacity: 0.55 },
  busy: { opacity: 0.6 },
});
