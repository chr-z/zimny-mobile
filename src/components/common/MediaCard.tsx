/**
 * MediaCard — Componente inline para exibir foto/vídeo em grids.
 *
 * - Fotos: exibe a imagem com contentFit="cover"
 * - Vídeos: exibe a thumbnail com um overlay de play
 */
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { CoberturaMediaItem } from "@/src/services/zimnyCoberturas";

type MediaCardProps = {
  item: CoberturaMediaItem;
  style?: any;
  onPress?: () => void;
};

export function MediaCard({ item, style, onPress }: MediaCardProps) {
  const isVideo = item.type === "video";
  const imageUrl = item.thumbnail || item.url;

  return (
    <Pressable onPress={onPress} style={[styles.base, style]} disabled={!onPress}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
      />
      {isVideo && (
        <View style={styles.playOverlay}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  playIcon: {
    fontSize: 28,
    color: "#FFFFFF",
  },
});