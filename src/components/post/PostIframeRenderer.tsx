import type { CustomBlockRenderer } from "react-native-render-html";
import { useContentWidth } from "react-native-render-html";
import { Dimensions, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { getSafeHttpsUrl } from "@/src/utils/security";

/**
 * iframes (YouTube, etc.) via WebView — necessário para embeds no meio da matéria.
 */
export const PostIframeRenderer: CustomBlockRenderer = function PostIframeRenderer({
  tnode,
}) {
  const ambientW = useContentWidth();
  const src = tnode.attributes.src;
  const uri = getSafeHttpsUrl(src);
  if (!uri) {
    return null;
  }

  const w = ambientW ?? Dimensions.get("window").width;
  const height = Math.round((w * 9) / 16);

  return (
    <View style={[styles.wrap, { width: w }]}>
      <WebView
        source={{ uri }}
        style={{ width: "100%", height }}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["https://*"]}
        mixedContentMode="never"
        allowFileAccess={false}
        allowUniversalAccessFromFileURLs={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginVertical: 12,
    overflow: "hidden",
    borderRadius: 2,
    backgroundColor: "#E8E8EA",
  },
});
