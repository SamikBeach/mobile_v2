import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Star, MessageCircle } from 'lucide-react-native';
import { HomeBookPreview } from '../../apis';

interface BookCardProps {
  book: HomeBookPreview;
  onPress?: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onPress }) => {
  // rating을 안전하게 숫자로 변환
  const rating =
    typeof book.rating === 'string' ? parseFloat(book.rating) || 0 : (book.rating ?? 0);

  // 디버깅 로그 추가
  console.log('[BookCard] rendering book:', book.title, 'rating:', rating);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: book.coverImage }}
          style={styles.image}
          resizeMode='cover'
          onLoad={() => console.log('[BookCard] Image loaded:', book.title)}
          onError={() => console.log('[BookCard] Image error:', book.title)}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.author}
        </Text>
        <View style={styles.ratingContainer}>
          <View style={styles.ratingItem}>
            <Star size={14} color='#EAB308' fill='#EAB308' />
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
          </View>
          {book.reviews !== undefined && (
            <View style={styles.ratingItem}>
              <MessageCircle size={14} color='#6B7280' />
              <Text style={styles.reviews}>{book.reviews}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 6,
    overflow: 'hidden',
    width: '100%',
  },
  imageContainer: {
    aspectRatio: 3 / 4.5,
    backgroundColor: '#F9FAFB',
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
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
    paddingTop: 2,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
  },
  reviews: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
  },
});
