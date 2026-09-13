/**
 * Settings — Configurações (Preferências de Leitura).
 *
 * Tela-fina: apenas monta o SettingsScreen dentro do header nativo do Stack.
 * O conteúdo completo vive em src/components/settings/SettingsScreen.tsx.
 */
import { SettingsScreen } from "@/src/components/settings/SettingsScreen";

export default function SettingsPage() {
  return <SettingsScreen />;
}
