import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { BookOpen, CheckCircle2, Clock, MessageSquare, Star, X } from 'lucide-react-native';
import { ReadingStatusType } from '../apis/reading-status/types';
import { UserRating } from '../apis/search/types';
import { AppColors } from '../constants';

interface SearchItemProps {
  item: {
    id: number;
    bookId?: number;
    type: string;
    title: string;
    subtitle?: string;
    image?: string;
    coverImage?: string;
    coverImageWidth?: number;
    coverImageHeight?: number;
    author?: string;
    highlight?: string;
    rating?: number;
    reviews?: number;
    totalRatings?: number;
    isbn?: string;
    isbn13?: string;
    readingStats?: {
      currentReaders: number;
      completedReaders: number;
      averageReadingTime: string;
      difficulty: 'easy' | 'medium' | 'hard';
      readingStatusCounts?: Record<ReadingStatusType, number>;
    };
    userReadingStatus?: ReadingStatusType | null;
    userRating?: UserRating | null;
  };
  onPress: () => void;
  onDelete?: () => void;
  size?: 'sm' | 'md' | 'lg';
  query?: string;
}

export function SearchItem({ item, onPress, onDelete, query }: SearchItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number>(3 / 4.5);

  // 하이라이트 텍스트 처리
  const highlightText = (text: string, highlight?: string) => {
    if (!highlight) return <Text>{text}</Text>;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <Text>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight?.toLowerCase() ? (
            <Text key={index} style={styles.highlightText}>
              {part}
            </Text>
          ) : (
            <Text key={index}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  // 평점 형식화 함수
  const formatRating = (rating: any): string => {
    if (typeof rating === 'number') {
      return rating.toFixed(1);
    }

    if (typeof rating === 'string') {
      const parsedRating = parseFloat(rating);
      return Number.isNaN(parsedRating) ? rating : parsedRating.toFixed(1);
    }

    return String(rating);
  };

  // 주어진 평점에 따라 채워진 별과 빈 별을 렌더링하는 함수
  const renderStarRating = (rating?: number) => {
    const ratingValue = rating === undefined || rating === null ? 0 : rating;

    return (
      <View style={styles.starsContainer}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            color={i < Math.floor(ratingValue) ? '#FFAB00' : '#D1D5DB'}
            fill={i < Math.floor(ratingValue) ? '#FFAB00' : 'transparent'}
          />
        ))}
      </View>
    );
  };

  // 사용자의 읽기 상태 태그 렌더링
  const renderUserReadingStatus = () => {
    if (!item.userReadingStatus) return null;

    const statusConfig = {
      [ReadingStatusType.WANT_TO_READ]: {
        icon: <Clock size={10} color='#8B5CF6' />,
        text: '읽고 싶어요',
        bgColor: '#F3F0FF',
        textColor: '#7C3AED',
      },
      [ReadingStatusType.READING]: {
        icon: <BookOpen size={10} color='#3B82F6' />,
        text: '읽는 중',
        bgColor: '#EFF6FF',
        textColor: '#2563EB',
      },
      [ReadingStatusType.READ]: {
        icon: <CheckCircle2 size={10} color={AppColors.success} />,
        text: '읽었어요',
        bgColor: '#F0FDF4',
        textColor: '#059669',
      },
    };

    const status = statusConfig[item.userReadingStatus];
    const count = item.readingStats?.readingStatusCounts?.[item.userReadingStatus] || 0;

    return (
      <View style={styles.userStatusContainer}>
        <View
          style={[
            styles.statusTag,
            {
              backgroundColor: status.bgColor,
              paddingHorizontal: 6,
              paddingVertical: 2,
            },
          ]}
        >
          <View style={styles.statusContent}>
            {status.icon}
            <Text
              style={[
                styles.statusText,
                {
                  color: status.textColor,
                  fontSize: 10,
                  marginLeft: 4,
                },
              ]}
            >
              {status.text} {count > 0 ? count : ''}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // 읽기 상태 태그 렌더링
  const renderReadingStatusTags = () => {
    if (item.userReadingStatus) return null;

    if (!item.readingStats || !item.readingStats.readingStatusCounts) return null;

    const statusCounts = item.readingStats.readingStatusCounts;
    const statuses = [];

    if (
      statusCounts[ReadingStatusType.WANT_TO_READ] &&
      statusCounts[ReadingStatusType.WANT_TO_READ] > 0
    ) {
      statuses.push(
        <View
          key='want'
          style={[
            styles.statusTag,
            {
              backgroundColor: '#F3F0FF',
              paddingHorizontal: 6,
              paddingVertical: 2,
            },
          ]}
        >
          <View style={styles.statusContent}>
            <Clock size={10} color='#8B5CF6' />
            <Text
              style={[
                styles.statusText,
                {
                  color: '#7C3AED',
                  fontSize: 10,
                  marginLeft: 4,
                },
              ]}
            >
              읽고 싶어요 {statusCounts[ReadingStatusType.WANT_TO_READ]}
            </Text>
          </View>
        </View>
      );
    }

    if (statusCounts[ReadingStatusType.READING] && statusCounts[ReadingStatusType.READING] > 0) {
      statuses.push(
        <View
          key='reading'
          style={[
            styles.statusTag,
            {
              backgroundColor: '#EFF6FF',
              paddingHorizontal: 6,
              paddingVertical: 2,
            },
          ]}
        >
          <View style={styles.statusContent}>
            <BookOpen size={10} color='#3B82F6' />
            <Text
              style={[
                styles.statusText,
                {
                  color: '#2563EB',
                  fontSize: 10,
                  marginLeft: 4,
                },
              ]}
            >
              읽는 중 {statusCounts[ReadingStatusType.READING]}
            </Text>
          </View>
        </View>
      );
    }

    if (statusCounts[ReadingStatusType.READ] && statusCounts[ReadingStatusType.READ] > 0) {
      statuses.push(
        <View
          key='read'
          style={[
            styles.statusTag,
            {
              backgroundColor: '#F0FDF4',
              paddingHorizontal: 6,
              paddingVertical: 2,
            },
          ]}
        >
          <View style={styles.statusContent}>
            <CheckCircle2 size={10} color={AppColors.success} />
            <Text
              style={[
                styles.statusText,
                {
                  color: '#059669',
                  fontSize: 10,
                  marginLeft: 4,
                },
              ]}
            >
              읽었어요 {statusCounts[ReadingStatusType.READ]}
            </Text>
          </View>
        </View>
      );
    }

    return statuses.length > 0 ? <View style={styles.statusTagsContainer}>{statuses}</View> : null;
  };

  // 이미지 URL 선택 로직
  const imageUrl = item.coverImage || item.image;

  // 평점과 리뷰 정보 렌더링
  const renderRatingAndReviews = () => {
    const hasRating = item.rating !== undefined;
    const hasReviews = item.reviews !== undefined;
    const hasTotalRatings = item.totalRatings !== undefined;

    if (!hasRating && !hasReviews) return null;

    return (
      <View style={styles.ratingContainer}>
        {/* 별점 */}
        {hasRating && (
          <View style={styles.ratingSection}>
            {renderStarRating(item.rating || 0)}
            <Text style={styles.ratingScore}>{formatRating(item.rating || 0)}</Text>
            {hasTotalRatings && <Text style={styles.ratingCount}>({item.totalRatings || 0})</Text>}
          </View>
        )}

        {/* 리뷰 수 */}
        {hasReviews && (
          <View style={styles.reviewSection}>
            <View style={styles.reviewDivider} />
            <MessageSquare size={14} color='#4B5563' />
            <Text style={styles.reviewCount}>
              {item.reviews !== undefined && item.reviews > 999
                ? `${Math.floor(item.reviews / 1000)}k`
                : item.reviews || 0}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* 이미지 섬네일 */}
      <View style={styles.imageContainer}>
        {!imageLoaded && <View style={styles.imageSkeleton} />}
        <Image
          source={{
            uri:
              imageUrl ||
              `https://placehold.co/240x360/f3f4f6/9ca3af?text=${encodeURIComponent(item.title.slice(0, 10))}`,
          }}
          style={[styles.image, { aspectRatio }]}
          resizeMode='contain'
          onLoad={event => {
            const { width, height } = event.nativeEvent.source;
            const ratio = width / height;
            setAspectRatio(ratio);
            setImageLoaded(true);
          }}
          onError={() => setImageLoaded(true)}
        />
      </View>

      {/* 도서 정보 */}
      <View style={styles.bookInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {highlightText(item.title, query)}
        </Text>
        {item.author && (
          <Text style={styles.author} numberOfLines={2}>
            {item.author}
          </Text>
        )}

        {/* 평점 및 리뷰 정보 */}
        {renderRatingAndReviews()}

        {/* 사용자 읽기 상태 */}
        {renderUserReadingStatus()}

        {/* 읽기 상태 태그 */}
        {renderReadingStatusTags()}
      </View>

      {/* 삭제 버튼 (최근 검색어에만 표시) */}
      {onDelete && (
        <View style={styles.deleteButtonContainer}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.6}
          >
            <X size={18} color='#6B7280' />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginVertical: 0,
  },
  imageContainer: {
    width: 130,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSkeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
    lineHeight: 22,
  },
  highlightText: {
    fontWeight: '500',
    color: '#374151',
  },
  author: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingScore: {
    fontSize: 13,
    fontWeight: '400',
    color: '#4B5563',
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 13,
    fontWeight: '400',
    color: '#4B5563',
  },
  reviewSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  reviewCount: {
    fontSize: 13,
    fontWeight: '400',
    color: '#4B5563',
    marginLeft: 4,
  },
  userStatusContainer: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  statusTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  statusTag: {
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontWeight: '500',
    lineHeight: 14,
  },
  deleteButtonContainer: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
