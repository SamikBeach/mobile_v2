import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Star, MessageSquare } from 'lucide-react-native';
import { HomeBookPreview } from '@/apis/book';

interface BookCardProps {
  book: HomeBookPreview;
  onPress?: () => void;
  horizontal?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onPress, horizontal = false }) => {
  const [aspectRatio, setAspectRatio] = useState<number>(3 / 4.5);
  const [horizontalAspectRatio, setHorizontalAspectRatio] = useState<number>(3 / 4.5);

  // 모든 값들을 안전하게 처리하는 헬퍼 함수들
  const safeString = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    return String(value);
  };

  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) {
      return 0;
    }
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // 안전하게 값들을 처리
  const title = safeString(book?.title) || '제목 없음';
  const author = safeString(book?.author) || '저자 미상';
  const rating = safeNumber(book?.rating);
  const reviews = safeNumber(book?.reviews);
  const coverImage = safeString(book?.coverImage) || '';

  if (horizontal) {
    // Horizontal layout (for list view)
    return (
      <TouchableOpacity style={styles.horizontalCard} onPress={onPress}>
        <View style={styles.horizontalImageContainer}>
          {coverImage ? (
            <Image
              source={{ uri: coverImage }}
              style={[styles.horizontalImage, { aspectRatio: horizontalAspectRatio }]}
              resizeMode='contain'
              onLoad={event => {
                const { width, height } = event.nativeEvent.source;
                const ratio = width / height;
                setHorizontalAspectRatio(ratio);
              }}
            />
          ) : (
            <View
              style={[
                styles.horizontalImage,
                styles.placeholderImage,
                { aspectRatio: horizontalAspectRatio },
              ]}
            />
          )}
        </View>

        <View style={styles.horizontalContent}>
          <Text style={styles.horizontalTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.horizontalAuthor} numberOfLines={2}>
            {author}
          </Text>

          <View style={styles.horizontalRatingContainer}>
            <View style={styles.ratingItem}>
              <Star size={14} color='#FFAB00' fill='#FFAB00' />
              <Text style={styles.rating}>{rating.toFixed(1)}</Text>
            </View>
            <View style={styles.ratingItem}>
              <MessageSquare size={14} color='#4B5563' />
              <Text style={styles.reviews}>{reviews.toString()}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Vertical layout (for grid view)
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        {coverImage ? (
          <Image
            source={{ uri: coverImage }}
            style={[styles.image, { aspectRatio }]}
            resizeMode='contain'
            onLoad={event => {
              const { width, height } = event.nativeEvent.source;
              const ratio = width / height;
              setAspectRatio(ratio);
            }}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage, { aspectRatio }]} />
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {author}
        </Text>
        <View style={styles.ratingContainer}>
          <View style={styles.ratingItem}>
            <Star size={14} color='#FFAB00' fill='#FFAB00' />
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
          </View>
          <View style={styles.ratingItem}>
            <MessageSquare size={14} color='#4B5563' />
            <Text style={styles.reviews}>{reviews.toString()}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Vertical layout styles (default)
  container: {
    backgroundColor: 'white',
    overflow: 'hidden',
    width: '100%',
    flexDirection: 'column',
  },
  imageContainer: {
    backgroundColor: 'white',
    width: '100%',
    height: 280,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    maxHeight: '100%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
    lineHeight: 20,
  },
  author: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },

  // Horizontal layout styles
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginVertical: 0,
  },
  horizontalImageContainer: {
    width: 130,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalImage: {
    width: '100%',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  horizontalContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  horizontalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
    lineHeight: 22,
  },
  horizontalAuthor: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 18,
  },
  horizontalRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },

  // Common styles
  placeholderImage: {
    backgroundColor: '#F3F4F6',
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '400',
    color: '#4B5563',
  },
  reviews: {
    fontSize: 13,
    fontWeight: '400',
    color: '#4B5563',
  },
});
