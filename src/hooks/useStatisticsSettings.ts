import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getUserStatisticsSettings, updateUserStatisticsSettings } from '../apis/user';
import { UpdateStatisticsSettingRequest } from '../apis/user/types';

/**
 * 사용자 통계 설정을 조회하고 관리하는 훅
 * @param userId 사용자 ID
 */
export const useStatisticsSettings = (userId: number) => {
  const queryClient = useQueryClient();

  // 통계 설정 조회
  const { data: settings } = useSuspenseQuery({
    queryKey: ['user-statistics-settings', userId],
    queryFn: () => getUserStatisticsSettings(userId),
  });

  // 통계 설정 업데이트
  const { mutate: updateSettings, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdateStatisticsSettingRequest) =>
      updateUserStatisticsSettings(userId, data),
    onMutate: async updatedSettings => {
      // 기존 쿼리 캐시 데이터 백업
      const previousSettings = queryClient.getQueryData(['user-statistics-settings', userId]);

      // 낙관적 업데이트 적용
      queryClient.setQueryData(['user-statistics-settings', userId], (old: any) => ({
        ...old,
        ...updatedSettings,
      }));

      return { previousSettings };
    },
    onError: (_, __, context) => {
      // 에러 발생 시 이전 설정으로 롤백
      if (context?.previousSettings) {
        queryClient.setQueryData(['user-statistics-settings', userId], context.previousSettings);
      }
    },
    onSuccess: (newSettings, variables) => {
      // 성공 시 설정 데이터 업데이트
      queryClient.setQueryData(['user-statistics-settings', userId], newSettings);

      // variables에 포함된 설정 키와 관련된 통계 데이터 업데이트
      // 각 설정 키와 관련된 통계 데이터 매핑
      const settingToStatKey: Record<string, string | undefined> = {
        isReadingStatusStatsPublic: 'readingStatusStats',
        isReadingStatusByPeriodPublic: 'readingStatusByPeriod',
        isGenreAnalysisPublic: 'genreAnalysis',
        isAuthorPublisherStatsPublic: 'authorPublisherStats',
        isReviewStatsPublic: 'reviewStats',
        isRatingStatsPublic: 'ratingStats',
        isActivityFrequencyPublic: 'activityFrequency',
        isRatingHabitsPublic: 'ratingHabits',
        isUserInteractionPublic: 'userInteraction',
        isFollowerStatsPublic: 'followerStats',
        isCommunityActivityPublic: 'communityActivity',
        isReviewInfluencePublic: 'reviewInfluence',
        isLibraryCompositionPublic: 'libraryComposition',
        isLibraryPopularityPublic: 'libraryPopularity',
        isLibraryUpdatePatternPublic: 'libraryUpdatePattern',
        isSearchActivityPublic: 'searchActivity',
      };

      // 변경된 설정과 관련된 통계 데이터 업데이트
      for (const [key, value] of Object.entries(variables)) {
        const statKey = settingToStatKey[key];
        if (statKey) {
          queryClient.setQueryData([statKey, userId], (oldData: any) => {
            if (oldData) {
              return {
                ...oldData,
                isPublic: value,
              };
            }
            return oldData;
          });
        }
      }
    },
  });

  const handleUpdateSetting = useCallback(
    (key: keyof UpdateStatisticsSettingRequest, value: boolean) => {
      updateSettings({ [key]: value });
    },
    [updateSettings]
  );

  return {
    settings,
    updateSettings,
    handleUpdateSetting,
    isUpdating,
  };
};
