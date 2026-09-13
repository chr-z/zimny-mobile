import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getFeaturedImageUrl,
  postTitlePlain,
  type WPPost,
} from "@/src/services/api";

const { height: SCREEN_H } = Dimensions.get("window");
const HERO_MIN = 420;
const heroHeight = Math.min(SCREEN_H * 0.62, Math.max(HERO_MIN, SCREEN_H * 0.52));

type HeroPostProps = {
  post: WPPost;
};

export function HeroPost({ post }: HeroPostProps) {
  const insets = useSafeAreaInsets();
  const uri = getFeaturedImageUrl(post);
  const title = postTitlePlain(post);

  return (
    <View className="relative w-full overflow-hidden bg-luxury-gray" style={{ height: heroHeight }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={320}
        />
      ) : (
        <View className="h-full w-full items-center justify-center bg-luxury-gray">
          <Text className="text-xs uppercase text-black/40 tracking-editorial">ZIMNY</Text>
        </View>
      )}

      <View className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-3xl">
        <BlurView
          intensity={80}
          tint="dark"
          style={[
            styles.blurInner,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
        >
          <Text className="mb-3 text-[10px] uppercase text-white/90 tracking-editorial">
            Capa
          </Text>
          <Text className="font-serif text-3xl leading-tight text-white tracking-editorial">
            {title}
          </Text>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blurInner: {
    paddingHorizontal: 24,
    paddingTop: 20,
    overflow: "hidden",
  },
});
