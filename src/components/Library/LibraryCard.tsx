import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { BookOpen, Users, Eye, EyeOff } from 'lucide-react-native';
import { HomeLibraryPreview, LibraryListItem } from '../../apis/library';

interface LibraryCardProps {
  library: HomeLibraryPreview | LibraryListItem;
  onPress?: () => void;
  onOwnerPress?: (ownerId: number) => void;
  hidePublicTag?: boolean;
  currentUserId?: number;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({
  library,
  onPress,
  onOwnerPress,
  hidePublicTag = true, // 프론트엔드에서 기본값이 true
  currentUserId,
}) => {
  // 사용자가 서재의 소유자인지 확인
  const isOwner = currentUserId === library.owner?.id;

  // 책 표시용 데이터 준비 (최대 3권)
  const displayBooks = library.previewBooks?.slice(0, 3) || [];

  // 서재 태그들
  const libraryTags = (library as LibraryListItem).tags || [];

  // 태그 색상 생성 함수 (서재 필터와 동일한 파스텔 색상)
  const getTagColor = (index: number) => {
    const colors = [
      '#FFF8E2', // 파스텔 옐로우
      '#F2E2FF', // 파스텔 퍼플
      '#FFE2EC', // 파스텔 코럴
      '#E2FFFC', // 파스텔 민트
      '#E2F0FF', // 파스텔 블루
      '#FFECDA', // 파스텔 오렌지
      '#ECFFE2', // 파스텔 그린
      '#FFE2F7', // 파스텔 핑크
    ];
    return colors[index % colors.length];
  };

  // 소유자 이름
  const ownerName = library.owner?.username || 'Unknown';

  // 책 개수
  const booksCount = library.bookCount ?? displayBooks.length;

  const handleOwnerPress = (event: any) => {
    event.stopPropagation();
    if (onOwnerPress && library.owner?.id) {
      onOwnerPress(library.owner.id);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Header with Avatar and Library Info */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.ownerInfo} onPress={handleOwnerPress} activeOpacity={0.7}>
          <View style={styles.avatarContainer}>
            {library.owner?.profileImage ? (
              <Image
                source={{ uri: library.owner.profileImage }}
                style={styles.avatar}
                resizeMode='cover'
              />
            ) : (
              <View style={[styles.avatar, styles.defaultAvatar]}>
                <Text style={styles.avatarText}>{ownerName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </View>
          <View style={styles.ownerDetails}>
            {/* Library Name and Tags Row */}
            <View style={styles.nameAndTagsRow}>
              <Text style={styles.libraryName} numberOfLines={1}>
                {library.name}
              </Text>

              {/* 태그들 */}
              <View style={styles.tagsContainer}>
                {libraryTags.map((tag, index) => (
                  <View key={tag.id} style={[styles.tag, { backgroundColor: getTagColor(index) }]}>
                    <Text style={styles.tagText}>{tag.tagName}</Text>
                  </View>
                ))}

                {/* 공개/비공개 태그 - 내 서재인 경우에만 표시 */}
                {isOwner && !hidePublicTag && (
                  <View style={styles.publicTag}>
                    {library.isPublic ? (
                      <>
                        <Eye size={8} color='#6B7280' />
                        <Text style={styles.publicTagText}>공개</Text>
                      </>
                    ) : (
                      <>
                        <EyeOff size={8} color='#6B7280' />
                        <Text style={styles.publicTagText}>비공개</Text>
                      </>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Owner Name */}
            <Text style={styles.ownerName}>{ownerName}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Description */}
      {library.description && (
        <Text style={styles.description} numberOfLines={1}>
          {library.description}
        </Text>
      )}

      {/* Books Grid */}
      <View style={styles.booksContainer}>
        {displayBooks && displayBooks.length > 0 ? (
          <View style={styles.booksGrid}>
            {Array.from({ length: 3 }).map((_, index) => {
              const book = displayBooks[index];
              return (
                <View
                  key={index}
                  style={[styles.bookImageContainer, !book && styles.emptySlotContainer]}
                >
                  {book ? (
                    <Image
                      source={{ uri: book.coverImage }}
                      style={styles.bookImage}
                      resizeMode='cover'
                    />
                  ) : (
                    <View style={styles.emptyBookSlot} />
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyBooksContainer}>
            <Text style={styles.emptyBooksText}>아직 등록된 책이 없어요.</Text>
          </View>
        )}
      </View>

      {/* Footer with Stats */}
      <View style={styles.footer}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <BookOpen size={14} color='#9CA3AF' />
            <Text style={styles.statText}>{booksCount.toLocaleString()}</Text>
          </View>
          <View style={styles.statItem}>
            <Users size={14} color='#9CA3AF' />
            <Text style={styles.statText}>{(library.subscriberCount ?? 0).toLocaleString()}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12, // rounded-xl
    borderWidth: 1,
    borderColor: '#E5E7EB', // border-gray-200
    overflow: 'hidden',
    shadowColor: 'transparent', // shadow-none
    marginBottom: 16, // gap between cards
  },
  header: {
    padding: 12, // p-3 on mobile, p-5 on sm
    paddingBottom: 8, // pb-2 on mobile, pb-3 on sm
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // gap-2 on mobile, gap-3 on sm
  },
  avatarContainer: {
    // flex-shrink-0
  },
  avatar: {
    width: 32, // h-8 w-8 on mobile, h-10 w-10 on sm
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
  nameAndTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6, // gap-1.5 on mobile, gap-2 on sm
    marginBottom: 4,
  },
  libraryName: {
    fontSize: 14, // text-sm on mobile, text-base on sm
    fontWeight: '500', // font-medium
    color: '#111827', // text-gray-900
    maxWidth: '70%', // max-w-full truncate
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4, // gap-1 on mobile, gap-1.5 on sm
  },
  tag: {
    paddingHorizontal: 8, // px-2 on mobile, px-2.5 on sm
    paddingVertical: 4, // py-1
    borderRadius: 12, // rounded-full
    flexShrink: 0, // flex-shrink-0
  },
  tagText: {
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
    color: '#374151', // text-gray-700
  },
  publicTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6, // px-1.5 on mobile, px-2 on sm
    paddingVertical: 2, // py-0.5
    borderRadius: 12, // rounded-full
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB', // border-gray-300
    gap: 2, // mr-0.5 on mobile, mr-1 on sm
    flexShrink: 0,
  },
  publicTagText: {
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
    color: '#6B7280', // text-gray-500
  },
  ownerName: {
    fontSize: 12, // text-xs on mobile, text-sm on sm
    color: '#6B7280', // text-gray-500
  },
  description: {
    fontSize: 14, // text-sm
    color: '#6B7280', // text-gray-600
    paddingHorizontal: 12, // px-3 on mobile, px-5 on sm
    paddingTop: 0, // pt-0
    paddingBottom: 8, // pb-2 on mobile, pb-3 on sm
    marginBottom: 12, // mb-3 on mobile, mb-4 on sm
  },
  booksContainer: {
    paddingHorizontal: 12, // px-3 on mobile, px-5 on sm
    paddingBottom: 12, // pb-3 for proper spacing
    gap: 6, // gap-1.5 on mobile, gap-2 on sm
  },
  booksGrid: {
    flexDirection: 'row',
    gap: 6, // gap-1.5 on mobile, gap-2 on sm
    alignItems: 'flex-end', // items-end
  },
  bookImageContainer: {
    flex: 1,
    aspectRatio: 5 / 7, // aspect-[5/7]
    borderRadius: 8, // rounded-lg
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6', // border-gray-100
  },
  bookImage: {
    width: '100%',
    height: '100%',
  },
  emptyBookSlot: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  emptySlotContainer: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  emptyBooksContainer: {
    minHeight: 100, // reduced min height for empty state
    backgroundColor: '#F9FAFB', // bg-gray-50
    borderRadius: 8, // rounded-lg
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6', // border-gray-100
  },
  emptyBooksText: {
    fontSize: 12, // text-xs on mobile, text-sm on sm
    color: '#9CA3AF', // text-gray-400
  },
  footer: {
    marginTop: 0, // mt-0
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB', // border-gray-50
    paddingHorizontal: 12, // px-3 on mobile, px-5 on sm
    paddingTop: 8, // pt-2
    paddingBottom: 12, // pb-3 reduced from py-3
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // gap-3 on mobile, gap-4 on sm
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // gap-1 on mobile, gap-1.5 on sm
  },
  statText: {
    fontSize: 12, // text-xs on mobile, text-sm on sm
    color: '#6B7280', // text-gray-500
  },
});
