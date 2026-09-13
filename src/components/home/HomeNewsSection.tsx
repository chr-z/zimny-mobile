import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  getFeaturedImageUrl,
  postExcerptPlain,
  postTitlePlain,
  type WPPost,
} from "@/src/services/api";

const THUMB = 88;

type HomeNewsSectionProps = {
  posts: WPPost[];
};

export function HomeNewsSection({ posts }: HomeNewsSectionProps) {
  if (posts.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.list}>
        {posts.map((post) => (
          <HomeNewsRow key={post.id} post={post} />
        ))}
      </View>
    </View>
  );
}

function HomeNewsRow({ post }: { post: WPPost }) {
  const router = useRouter();
  const uri = getFeaturedImageUrl(post);
  const title = postTitlePlain(post);
  const excerpt = postExcerptPlain(post);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.row}
      onPress={() =>
        router.push({ pathname: "/post/[id]", params: { id: String(post.id) } })
      }
    >
      <View style={styles.thumbWrap}>
        {uri ? (
          <Image
            source={{ uri }}
            style={styles.thumb}
            contentFit="cover"
            transition={160}
          />
        ) : (
          <View style={[styles.thumb, styles.ph]} />
        )}
      </View>
      <View style={styles.textCol}>
        <Text style={styles.rowTitle} numberOfLines={3}>
          {title}
        </Text>
        {excerpt.length > 0 ? (
          <Text style={styles.rowExcerpt} numberOfLines={3}>
            {excerpt}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  section: {
  },
  list: {
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.12)",
  },
  thumbWrap: {
    marginRight: 12,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    backgroundColor: "#E8E8EA",
    borderRadius: 2,
  },
  ph: {
    backgroundColor: "#E8E8EA",
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  rowTitle: {
    fontFamily: "Georgia",
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 0.2,
    color: "#000000",
  },
  rowExcerpt: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: "rgba(0,0,0,0.55)",
  },
});
