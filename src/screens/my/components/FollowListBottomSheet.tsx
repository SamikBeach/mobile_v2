import React, { useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { X, UserPlus, UserCheck } from 'lucide-react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

interface FollowUser {
  id: number;
  username: string;
  email?: string;
  profileImage?: string;
  bio?: string;
  isFollowing?: boolean;
}

interface FollowListBottomSheetProps {
  userId: number;
  type: 'followers' | 'following';
  isVisible: boolean;
  onClose: () => void;
}

export const FollowListBottomSheet: React.FC<FollowListBottomSheetProps> = ({
  userId,
  type,
  isVisible,
  onClose,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // 팔로우 목록 조회 (실제 API 호출로 대체 예정)
  const followUsers: FollowUser[] = [];

  // Handle bottom sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  // Present modal when isVisible becomes true
  React.useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  const handleClose = () => {
    bottomSheetModalRef.current?.dismiss();
  };

  const handleFollowToggle = (user: FollowUser) => {
    // TODO: 팔로우/언팔로우 API 호출
    console.log('Toggle follow for user:', user.id);
  };

  // Backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        enableTouchThrough={false}
      />
    ),
    []
  );

  const renderUserItem = ({ item: user }: { item: FollowUser }) => {
    const displayName = user.username || user.email?.split('@')[0] || '';
    const initial = displayName.charAt(0).toUpperCase();

    return (
      <View style={styles.userItem}>
        <View style={styles.userLeft}>
          <View style={styles.userAvatar}>
            {user.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{displayName}</Text>
            {user.bio && <Text style={styles.userBio}>{user.bio}</Text>}
          </View>
        </View>

        {type === 'followers' && (
          <TouchableOpacity
            style={[styles.followButton, user.isFollowing && styles.followingButton]}
            onPress={() => handleFollowToggle(user)}
          >
            {user.isFollowing ? (
              <>
                <UserCheck size={14} color='#374151' />
                <Text style={styles.followingText}>팔로잉</Text>
              </>
            ) : (
              <>
                <UserPlus size={14} color='white' />
                <Text style={styles.followText}>팔로우</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>{type === 'followers' ? '👥' : '🤝'}</Text>
      <Text style={styles.emptyStateTitle}>
        {type === 'followers' ? '팔로워가 없습니다' : '팔로잉이 없습니다'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {type === 'followers'
          ? '다른 사용자들과 소통해보세요!'
          : '관심있는 사용자를 팔로우해보세요!'}
      </Text>
    </View>
  );

  const renderContent = () => (
    <BottomSheetView style={styles.contentContainer}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>{type === 'followers' ? '팔로워' : '팔로잉'}</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color='#6B7280' />
        </TouchableOpacity>
      </View>

      {/* 사용자 리스트 */}
      <FlatList
        data={followUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
      />
    </BottomSheetView>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={['50%', '80%']}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.dragHandle}
      backgroundStyle={styles.modalContainer}
    >
      {renderContent()}
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dragHandle: {
    backgroundColor: '#D1D5DB',
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  defaultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userBio: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#111827',
  },
  followingButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  followText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  followingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
