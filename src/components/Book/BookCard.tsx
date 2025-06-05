import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Star, MessageSquare } from 'lucide-react-native';
import { HomeBookPreview } from '../../apis';

interface BookCardProps {
  book: HomeBookPreview;
  onPress?: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onPress }) => {
  const [aspectRatio, setAspectRatio] = useState<number>(3 / 4.5);

  // rating을 안전하게 숫자로 변환
  const rating =
    typeof book.rating === 'string' ? parseFloat(book.rating) || 0 : (book.rating ?? 0);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: book.coverImage }}
          style={[styles.image, { aspectRatio }]}
          resizeMode='contain'
          onLoad={event => {
            const { width, height } = event.nativeEvent.source;
            const ratio = width / height;
            setAspectRatio(ratio);
          }}
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
            <Star size={14} color='#FFAB00' fill='#FFAB00' />
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
          </View>
          {book.reviews !== undefined && (
            <View style={styles.ratingItem}>
              <MessageSquare size={14} color='#4B5563' />
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
    paddingTop: 4,
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
