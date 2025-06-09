import { UserDetailResponseDto } from '@/apis/user/types';
import { getUserProfile } from '@/apis/user/user';
import { useSuspenseQuery } from '@tanstack/react-query';

interface UseUserProfileResult {
  profileData: UserDetailResponseDto;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<UserDetailResponseDto>;
}

/**
 * 사용자 프로필 정보를 가져오는 훅
 * @param userId 사용자 ID
 * @returns 사용자 프로필 정보와 관련 상태
 */
export function useUserProfile(userId: number): UseUserProfileResult {
  const { data, isLoading, error, refetch } = useSuspenseQuery<UserDetailResponseDto, Error>({
    queryKey: ['profile', userId],
    queryFn: () => getUserProfile(userId),
  });

  return {
    profileData: data as UserDetailResponseDto,
    isLoading,
    error,
    refetch: async () => {
      const { data } = await refetch();
      return data as UserDetailResponseDto;
    },
  };
}
