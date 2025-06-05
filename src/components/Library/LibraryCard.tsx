import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { BookOpen, Users } from 'lucide-react-native';
import { HomeLibraryPreview } from '../../apis';

interface LibraryCardProps {
  library: HomeLibraryPreview;
  onPress?: () => void;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({ library, onPress }) => {
  // 책 표시용 데이터 준비 (최대 3권)
  const displayBooks = library.previewBooks?.slice(0, 3) || [];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.ownerInfo}>
          <View style={styles.avatarContainer}>
            {library.owner.profileImage ? (
              <Image
                source={{ uri: library.owner.profileImage }}
                style={styles.avatar}
                resizeMode='cover'
              />
            ) : (
              <View style={[styles.avatar, styles.defaultAvatar]}>
                <Text style={styles.avatarText}>
                  {library.owner.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.ownerDetails}>
            <Text style={styles.libraryName} numberOfLines={1}>
              {library.name}
            </Text>
            <Text style={styles.ownerName}>{library.owner.username}</Text>
          </View>
        </View>
        {library.isPublic && (
          <View style={styles.publicBadge}>
            <Text style={styles.publicBadgeText}>공개</Text>
          </View>
        )}
      </View>

      {library.description && (
        <Text style={styles.description} numberOfLines={1}>
          {library.description}
        </Text>
      )}

      {/* 책 이미지 영역 */}
      <View style={styles.booksContainer}>
        {displayBooks && displayBooks.length > 0 ? (
          <View style={styles.booksGrid}>
            {displayBooks.map((book: any) => (
              <View key={book.id} style={styles.bookImageContainer}>
                <Image
                  source={{ uri: book.coverImage }}
                  style={styles.bookImage}
                  resizeMode='cover'
                  onError={() => {
                    console.log('[LibraryCard] Image error for book:', book.title);
                  }}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyBooksContainer}>
            <Text style={styles.emptyBooksText}>아직 등록된 책이 없어요.</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <BookOpen size={14} color='#9CA3AF' />
            <Text style={styles.statText}>{library.bookCount || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Users size={14} color='#9CA3AF' />
            <Text style={styles.statText}>{library.subscriberCount || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12, // rounded-xl과 비슷
    borderWidth: 1,
    borderColor: '#E5E7EB', // border-gray-200
    overflow: 'hidden',
    minHeight: 300, // min-h-[300px]
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12, // p-3
    paddingBottom: 8, // pb-2
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8, // gap-2
  },
  avatarContainer: {
    // marginRight 제거, gap으로 대체
  },
  avatar: {
    width: 32, // h-8 w-8
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F9FAFB', // border-gray-50
  },
  defaultAvatar: {
    backgroundColor: '#F9FAFB', // bg-gray-50
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#374151', // text-gray-700
  },
  ownerDetails: {
    flex: 1,
    minWidth: 0, // min-w-0
  },
  libraryName: {
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    color: '#111827', // text-gray-900
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 12, // text-xs
    color: '#6B7280', // text-gray-500
  },
  publicBadge: {
    backgroundColor: '#DBEAFE', // bg-blue-50과 비슷
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB', // border-gray-300
  },
  publicBadgeText: {
    fontSize: 10, // text-xs
    color: '#6B7280', // text-gray-500
    fontWeight: '500', // font-medium
  },
  description: {
    fontSize: 14, // text-sm
    color: '#4B5563', // text-gray-600
    paddingHorizontal: 12,
    marginBottom: 12, // mb-3
  },
  booksContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  booksGrid: {
    flexDirection: 'row',
    gap: 6, // gap-1.5
  },
  bookImageContainer: {
    flex: 1,
    aspectRatio: 5 / 7, // aspect-[5/7]
    borderRadius: 8, // rounded-lg
    borderWidth: 1,
    borderColor: '#F3F4F6', // border-gray-100
    overflow: 'hidden',
  },
  bookImage: {
    width: '100%',
    height: '100%',
  },
  emptyBooksContainer: {
    flex: 1,
    minHeight: 120, // min-h-[120px]
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB', // bg-gray-50
    borderRadius: 8, // rounded-lg
    borderWidth: 1,
    borderColor: '#F3F4F6', // border-gray-100
  },
  emptyBooksText: {
    fontSize: 12, // text-xs
    color: '#9CA3AF', // text-gray-400
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB', // border-gray-50
    paddingHorizontal: 12,
    paddingVertical: 8, // py-2
  },
  stats: {
    flexDirection: 'row',
    gap: 12, // gap-3
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // gap-1
  },
  statText: {
    fontSize: 12, // text-xs
    color: '#6B7280', // text-gray-500
  },
});
