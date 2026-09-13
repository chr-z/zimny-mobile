import { useCallback } from "react";
import { FlatList, Text, View } from "react-native";

import type { WPPost } from "@/src/services/api";

import { NewsCard } from "./NewsCard";

type MaisLidasCarouselProps = {
  posts: WPPost[];
};

export function MaisLidasCarousel({ posts }: MaisLidasCarouselProps) {
  const renderItem = useCallback(
    ({ item }: { item: WPPost }) => (
      <View style={{ width: 300, marginRight: 16 }}>
        <NewsCard post={item} variant="carousel" />
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: WPPost) => String(item.id), []);

  if (posts.length === 0) return null;

  return (
    <View className="mt-4 pb-4">
      <Text className="px-6 pb-4 font-serif text-xl text-luxury-black tracking-editorial">
        NOVIDADES
      </Text>
      <FlatList
        horizontal
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
        snapToInterval={316}
        decelerationRate="fast"
        removeClippedSubviews
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={5}
      />
    </View>
  );
}
