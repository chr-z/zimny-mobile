import { Drawer } from "expo-router/drawer";

import { MenuDrawerContent } from "@/src/components/MenuDrawerContent";
import { useTheme } from "@/src/hooks/useTheme";
import { useTranslation } from "@/src/i18n";

export default function DrawerLayout() {
  const { isDark, colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Drawer
      drawerContent={(props) => <MenuDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: "transparent",
          width: "82%",
        },
        drawerActiveTintColor: colors.text,
        drawerInactiveTintColor: colors.textSecondary,
        overlayColor: isDark ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.45)",
        drawerType: "slide",
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: t("drawer.home"),
          title: "Zimny",
        }}
      />
    </Drawer>
  );
}
