import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ThumbsUp, MessageCircle } from 'lucide-react-native';
import { HomeReviewPreview } from '../../apis';

interface ReviewCardProps {
  review: HomeReviewPreview;
  onPress?: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onPress }) => {
  const formatDate = (date: Date | string) => {
    const reviewDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '오늘';
    if (diffDays <= 7) return `${diffDays}일 전`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}주 전`;
    return `${Math.ceil(diffDays / 30)}개월 전`;
  };

  // 첫 번째 책을 기본 책으로 사용 (book 또는 books 배열의 첫 번째)
  const displayBook = review.book || (review.books && review.books[0]);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            {review.author.profile_image ? (
              <Image
                source={{ uri: review.author.profile_image }}
                style={styles.avatar}
                resizeMode='cover'
              />
            ) : (
              <View style={[styles.avatar, styles.defaultAvatar]}>
                <Text style={styles.avatarText}>
                  {review.author.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>{review.author.username}</Text>
            <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.content} numberOfLines={3}>
        {review.content}
      </Text>

      {displayBook && (
        <View style={styles.bookInfo}>
          <Image
            source={{ uri: displayBook.coverImage }}
            style={styles.bookCover}
            resizeMode='cover'
          />
          <View style={styles.bookDetails}>
            <Text style={styles.bookTitle} numberOfLines={1}>
              {displayBook.title}
            </Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {displayBook.author}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <ThumbsUp size={14} color='#6B7280' />
            <Text style={styles.statText}>{review.likeCount}</Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle size={14} color='#6B7280' />
            <Text style={styles.statText}>{review.commentCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
  },
  content: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  bookCover: {
    width: 40,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  bookDetails: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
  },
});
