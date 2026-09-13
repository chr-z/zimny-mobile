/**
 * Tab Layout — Barra de navegação inferior com 5 abas.
 *
 * Abas: Home · Revista · Podcast · Eventos · Ao Vivo
 *
 * Ícones Feather (finos, premium) — evitando ícones genéricos.
 * Estética Quiet Luxury: preto, tipografia Georgia, letter-spacing editorial.
 */
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { DrawerMenuButton } from "@/src/components/DrawerMenuButton";
import { TAB_BAR_HEIGHT } from "@/src/constants/designTokens";
import { useTheme } from "@/src/hooks/useTheme";
import { useTranslation } from "@/src/i18n";

// ─── Tab icon map ─────────────────────────────────────────────────────────────

type TabName =
  | "index"
  | "noticias"
  | "magazine"
  | "podcast"
  | "cobertura-eventos"
  | "tv"
  | "events"
  | "marketing-digital"
  | "colunistas";

const TAB_ICON: Record<TabName, keyof typeof Feather.glyphMap> = {
  index:             "home",
  noticias:          "file-text",
  magazine:          "book-open",
  podcast:           "headphones",
  "cobertura-eventos": "video",
  tv:                "tv",
  events:            "calendar",
  "marketing-digital": "trending-up",
  colunistas:        "users",
};

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { display: "none" }, // hidden — rendered inside drawer
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
        headerShown: useClientOnlyValue(false, true),
        headerStyle: [styles.header, { backgroundColor: colors.surface }],
        headerTintColor: colors.text,
        headerTitleStyle: styles.headerTitle,
        headerLeft: () => <DrawerMenuButton />,
      }}
    >
      {/* ── Home ─────────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="index"
        options={{
          title: t("tab.home"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name={TAB_ICON.index} size={size} color={color} />
          ),
        }}
      />

      {/* ── Notícias ─────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="noticias"
        options={{
          title: t("tab.noticias"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name={TAB_ICON.noticias} size={size} color={color} />
          ),
        }}
      />

      {/* ── Revista ──────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="magazine"
        options={{
          title: t("tab.revista"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name={TAB_ICON.magazine} size={size} color={color} />
          ),
        }}
      />

      {/* ── Podcast ──────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="podcast"
        options={{
          title: t("tab.podcast"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name={TAB_ICON.podcast} size={size} color={color} />
          ),
        }}
      />

      {/* ── Cobertura de Eventos ─────────────────────────────────────────── */}
      <Tabs.Screen
        name="cobertura-eventos"
        options={{
          title: t("tab.cobertura"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name={TAB_ICON["cobertura-eventos"]} size={size} color={color} />
          ),
        }}
      />

      {/* ── Ao Vivo ──────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="tv"
        options={{
          title: t("tab.ao_vivo"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name={TAB_ICON.tv} size={size} color={color} />
          ),
        }}
      />

      {/* ── Eventos ──────────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="events"
        options={{
          title: t("tab.eventos"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name={TAB_ICON.events} size={size} color={color} />
          ),
        }}
      />

      {/* ── Marketing Digital ────────────────────────────────────────────── */}
      <Tabs.Screen
        name="marketing-digital"
        options={{
          title: t("tab.marketing"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name={TAB_ICON["marketing-digital"]} size={size} color={color} />
          ),
        }}
      />

      {/* ── Colunistas ──────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="colunistas"
        options={{
          title: t("tab.colunistas"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name={TAB_ICON.colunistas} size={size} color={color} />
          ),
        }}
      />

      {/* ── Hidden screens (still exist, not in tab bar) ─────────────────── */}
      <Tabs.Screen
        name="categories"
        options={{
          title: t("tab.explorar"),
          headerShown: false,
          href: null, // accessed via search overlay
        }}
      />
      <Tabs.Screen
        name="login"
        options={{ href: null }} // accessed via drawer
      />
    </Tabs>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    height: TAB_BAR_HEIGHT + (Platform.OS === "ios" ? 20 : 0),
    paddingTop: 4,
  },
  tabLabel: {
    fontFamily: "Georgia",
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: Platform.OS === "ios" ? 0 : 4,
  },
  tabIcon: {
    marginBottom: -2,
  },
  header: {
    backgroundColor: "#0A0A0A",
  },
  headerTitle: {
    fontFamily: "Georgia",
    letterSpacing: 3,
    fontSize: 16,
  },
});
