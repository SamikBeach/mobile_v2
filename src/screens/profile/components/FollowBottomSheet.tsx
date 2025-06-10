import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { UserPlus, Check } from 'lucide-react-native';
import { getFollowers, getFollowing, followUser, unfollowUser } from '../../../apis/user/user';
import { FollowerResponseDto } from '../../../apis/user/types';
import { useAtomValue } from 'jotai';
import { userAtom } from '../../../atoms/user';
import Toast from 'react-native-toast-message';
import { LoadingSpinner } from '../../../components';

interface FollowBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  userId: number;
  type: 'followers' | 'following' | null;
  username: string;
}

// 팔로워 목록 Hook
const useFollowersInfinite = (userId: number) => {
  return useSuspenseInfiniteQuery({
    queryKey: ['followers', userId],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getFollowers(userId, pageParam, 20);
      return result;
    },
    getNextPageParam: lastPage => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// 팔로잉 목록 Hook
const useFollowingInfinite = (userId: number) => {
  return useSuspenseInfiniteQuery({
    queryKey: ['following', userId],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getFollowing(userId, pageParam, 20);
      return result;
    },
    getNextPageParam: lastPage => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// 팔로우 상태 관리 Hook
const useFollowToggle = () => {
  const [loadingUsers, setLoadingUsers] = useState<Set<number>>(new Set());

  const toggleFollow = async (targetUserId: number, username: string, isFollowing: boolean) => {
    setLoadingUsers(prev => new Set(prev).add(targetUserId));

    try {
      if (isFollowing) {
        await unfollowUser(targetUserId);
        Toast.show({
          type: 'success',
          text1: `${username}님을 언팔로우했습니다`,
        });
      } else {
        await followUser(targetUserId);
        Toast.show({
          type: 'success',
          text1: `${username}님을 팔로우했습니다`,
        });
      }
      return !isFollowing;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '오류가 발생했습니다',
        text2: '잠시 후 다시 시도해주세요',
      });
      return isFollowing;
    } finally {
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    }
  };

  return {
    toggleFollow,
    isLoading: (userId: number) => loadingUsers.has(userId),
  };
};

// 사용자 아이템 컴포넌트
interface UserItemProps {
  user: FollowerResponseDto;
  currentUserId?: number;
  onUserPress: (userId: number) => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, currentUserId, onUserPress }) => {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  const { toggleFollow, isLoading } = useFollowToggle();

  const isMyself = currentUserId === user.id;
  const loading = isLoading(user.id);

  const handleFollowPress = async (e: any) => {
    e.stopPropagation();
    const newFollowState = await toggleFollow(user.id, user.username, isFollowing);
    setIsFollowing(newFollowState);
  };

  const displayName = user.username || `사용자${user.id}`;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => onUserPress(user.id)}
      activeOpacity={0.7}
    >
      <View style={styles.userInfo}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userDetails}>
          <Text style={styles.username} numberOfLines={1}>
            {displayName}
          </Text>
          {user.bio && (
            <Text style={styles.userBio} numberOfLines={1}>
              {user.bio}
            </Text>
          )}
        </View>
      </View>

      {/* Follow Button */}
      {!isMyself && (
        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowing ? styles.followingButton : styles.notFollowingButton,
          ]}
          onPress={handleFollowPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size='small' color={isFollowing ? '#374151' : 'white'} />
          ) : isFollowing ? (
            <>
              <Check size={14} color='#374151' />
              <Text style={styles.followingButtonText}>팔로잉</Text>
            </>
          ) : (
            <>
              <UserPlus size={14} color='white' />
              <Text style={styles.notFollowingButtonText}>팔로우</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// 메인 컴포넌트
export const FollowBottomSheet: React.FC<FollowBottomSheetProps> = ({
  isVisible,
  onClose,
  userId,
  type,
  username,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const currentUser = useAtomValue(userAtom);
  const navigation = useNavigation();

  // BottomSheet 설정
  const snapPoints = useMemo(() => ['75%'], []);

  // 조건부 렌더링으로 변경
  if (!type) return null;

  const followersQuery = type === 'followers' ? useFollowersInfinite(userId) : null;
  const followingQuery = type === 'following' ? useFollowingInfinite(userId) : null;

  const activeQuery = type === 'followers' ? followersQuery : followingQuery;
  const users =
    activeQuery?.data?.pages.flatMap(page =>
      type === 'followers' ? page.followers : page.following
    ) || [];

  // BottomSheet 표시/숨김 처리
  useEffect(() => {
    if (isVisible && type) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible, type]);

  // 자동으로 모든 페이지 로드
  useEffect(() => {
    if (activeQuery?.hasNextPage && !activeQuery?.isFetchingNextPage) {
      activeQuery?.fetchNextPage();
    }
  }, [activeQuery?.hasNextPage, activeQuery?.isFetchingNextPage, activeQuery?.fetchNextPage]);

  const handleUserPress = (targetUserId: number) => {
    onClose();
    navigation.navigate('Profile' as never, { userId: targetUserId } as never);
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const renderUserItem = ({ item }: { item: FollowerResponseDto }) => (
    <UserItem user={item} currentUserId={currentUser?.id} onUserPress={handleUserPress} />
  );

  const renderLoadingFooter = () => {
    if (!activeQuery?.isFetchingNextPage) return null;

    return (
      <View style={styles.loadingFooter}>
        <LoadingSpinner />
      </View>
    );
  };

  const title = type === 'followers' ? '팔로워' : '팔로잉';
  const emptyMessage = type === 'followers' ? '팔로워가 없습니다' : '팔로잉하는 사용자가 없습니다';

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 36, height: 4 }}
      backgroundStyle={{
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
    >
      <BottomSheetView style={styles.container}>
        {/* User List */}
        {users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListFooterComponent={renderLoadingFooter}
          />
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  listContainer: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  defaultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  userBio: {
    fontSize: 14,
    color: '#6B7280',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    justifyContent: 'center',
  },
  notFollowingButton: {
    backgroundColor: '#2563EB',
  },
  followingButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notFollowingButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginLeft: 4,
  },
  followingButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
