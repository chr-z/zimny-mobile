import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DrawerActions } from "expo-router/build/react-navigation/routers";
import { useNavigation } from "expo-router";
import { Pressable } from "react-native";

export function DrawerMenuButton() {
  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => navigation.getParent()?.dispatch(DrawerActions.openDrawer())}
      className="ml-1 px-2 py-2"
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Abrir menu"
    >
      <FontAwesome name="bars" size={22} color="#FFFFFF" />
    </Pressable>
  );
}
