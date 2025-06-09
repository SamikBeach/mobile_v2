import { useState, useCallback } from 'react';
import { followUser, unfollowUser } from '../apis/user/user';
import Toast from 'react-native-toast-message';

interface UseUserFollowResult {
  isFollowing: boolean;
  setIsFollowing: (following: boolean) => void;
  toggleFollow: (userId: number, username?: string) => Promise<void>;
  isLoading: boolean;
}

/**
 * 사용자 팔로우/언팔로우 기능을 제공하는 훅
 * @param initialIsFollowing 초기 팔로우 상태
 * @returns 팔로우 상태와 토글 함수
 */
export function useUserFollow(initialIsFollowing: boolean): UseUserFollowResult {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFollow = useCallback(
    async (userId: number, username?: string) => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        if (isFollowing) {
          // 언팔로우
          const result = await unfollowUser(userId);
          setIsFollowing(false);
          Toast.show({
            type: 'success',
            text1: '언팔로우 완료',
            text2: username
              ? `${username}님을 언팔로우했습니다.`
              : result.message || '언팔로우했습니다.',
            position: 'top',
            visibilityTime: 2000,
          });
        } else {
          // 팔로우
          const result = await followUser(userId);
          setIsFollowing(true);
          Toast.show({
            type: 'success',
            text1: '팔로우 완료',
            text2: username
              ? `${username}님을 팔로우했습니다.`
              : result.message || '팔로우했습니다.',
            position: 'top',
            visibilityTime: 2000,
          });
        }
      } catch (error) {
        console.error('Follow/unfollow error:', error);
        Toast.show({
          type: 'error',
          text1: '오류 발생',
          text2: '팔로우 상태를 변경할 수 없습니다.',
          position: 'top',
          visibilityTime: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isFollowing, isLoading]
  );

  return {
    isFollowing,
    setIsFollowing,
    toggleFollow,
    isLoading,
  };
}
