/**
 * NewsCard — Modern editorial card with consistent design tokens.
 *
 * Variants:
 *   "default"  → Full-width card with image + title + excerpt
 *   "carousel" → Compact horizontal card for sliders
 */
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { radius, shadow } from '@/src/constants/designTokens';
import {
  getFeaturedImageUrl,
  postExcerptPlain,
  postTitlePlain,
  type WPPost,
} from '@/src/services/api';

type NewsCardProps = {
  post: WPPost;
  /** Carrossel horizontal: cartão mais estreito. */
  variant?: 'default' | 'carousel';
};

export function NewsCard({ post, variant = 'default' }: NewsCardProps) {
  const imageUrl = getFeaturedImageUrl(post);
  const title = postTitlePlain(post);
  const excerpt = postExcerptPlain(post);

  const isCarousel = variant === 'carousel';

  return (
    <TouchableOpacity activeOpacity={0.88}>
      <View style={[styles.card, isCarousel && styles.cardCarousel]}>
        {/* Image */}
        <View style={[styles.imageWrap, isCarousel ? styles.imageCarousel : styles.imageDefault]}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={220}
              recyclingKey={`cover-${post.id}`}
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>ZIMNY</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={[styles.content, isCarousel ? styles.contentCarousel : styles.contentDefault]}>
          <Text
            style={[styles.title, isCarousel ? styles.titleCarousel : styles.titleDefault]}
            numberOfLines={isCarousel ? 2 : 3}
          >
            {title}
          </Text>

          {excerpt.length > 0 && (
            <Text
              style={[styles.excerpt, isCarousel ? styles.excerptCarousel : styles.excerptDefault]}
              numberOfLines={isCarousel ? 2 : 3}
            >
              {excerpt}
            </Text>
          )}

          {/* Gold divider for default variant */}
          {!isCarousel && <View style={styles.divider} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadow.md,
  },
  cardCarousel: {
    width: 280,
    ...shadow.sm,
  },
  imageWrap: {
    overflow: 'hidden',
    backgroundColor: '#D0D0D2',
  },
  imageDefault: {
    height: 200,
  },
  imageCarousel: {
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 4,
    color: 'rgba(0,0,0,0.3)',
  },
  content: {
    paddingHorizontal: 16,
  },
  contentDefault: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  contentCarousel: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'Georgia',
    letterSpacing: 0.2,
    color: '#000000',
  },
  titleDefault: {
    fontSize: 20,
    lineHeight: 26,
  },
  titleCarousel: {
    fontSize: 15,
    lineHeight: 20,
  },
  excerpt: {
    fontFamily: 'Georgia',
    color: 'rgba(0,0,0,0.55)',
  },
  excerptDefault: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  excerptCarousel: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.10)',
    marginTop: 16,
    opacity: 0.5,
  },
});
