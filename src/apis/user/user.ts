import axios from '../axios';
import {
  UpdateUserInfoRequest,
  UpdateUserInfoResponse,
  UploadProfileImageResponse,
  AccountActionResponse,
  UserDetailResponseDto,
  UserLibrariesResponseDto,
  UserSubscribedLibrariesResponseDto,
  UserReviewsResponseDto,
  FollowersListResponseDto,
  FollowingListResponseDto,
  UserBooksResponseDto,
  UserReadingStatusCountsDto,
  UserReviewTypeCountsDto,
  UpdateStatisticsSettingRequest,
  StatisticsSettingResponse,
  ReadingStatusStatsResponse,
  GenreAnalysisResponse,
  RatingStatsResponse,
  ReviewStatsResponse,
  ActivityFrequencyResponse,
  UserInteractionResponse,
  FollowerStatsResponse,
} from './types';

/**
 * 현재 사용자 정보 조회
 */
export const getCurrentUser = async (): Promise<UserDetailResponseDto> => {
  const response = await axios.get('/user/me');
  return response.data;
};

/**
 * 사용자 정보 업데이트 (텍스트만)
 */
export const updateUserInfo = async (
  data: UpdateUserInfoRequest
): Promise<UpdateUserInfoResponse> => {
  const response = await axios.patch('/user/me', data);
  return response.data;
};

/**
 * 프로필 이미지 업로드
 */
export const uploadProfileImage = async (file: FormData): Promise<UploadProfileImageResponse> => {
  const response = await axios.post('/user/me/profile-image', file, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * 프로필 업데이트 (이미지 포함) - src_frontend와 완전히 동일한 방식
 */
export const updateUserInfoWithImage = async (
  data: UpdateUserInfoRequest & { removeProfileImage?: boolean },
  file?: { uri: string; type: string; name: string }
): Promise<UpdateUserInfoResponse> => {
  // FormData 생성 (src_frontend와 동일한 방식)
  const formData = new FormData();

  // 텍스트 데이터 추가
  if (data.username) formData.append('username', data.username);
  if (data.bio !== undefined) formData.append('bio', data.bio);

  // 프로필 이미지 처리 (src_frontend와 정확히 동일)
  if (data.removeProfileImage) {
    // 프로필 이미지 제거 요청
    formData.append('removeProfileImage', 'true');
    formData.append('profileImage', ''); // 빈 문자열로 profileImage 필드 명시
  } else if (file) {
    // 새 이미지 업로드
    formData.append('profileImage', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);
  } else {
    // 변경 없음 - profileImage 필드를 빈 문자열로 명시 (백엔드에서 무시)
    formData.append('profileImage', '');
  }

  // src_frontend와 동일한 엔드포인트와 방식 사용
  const response = await axios.put('/user/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * 사용자 상세 정보 조회 (ID로)
 */
export const getUserById = async (userId: number): Promise<UserDetailResponseDto> => {
  const response = await axios.get(`/user/${userId}`);
  return response.data;
};

/**
 * 사용자 프로필 정보 조회 (프론트엔드와 동일한 경로)
 */
export const getUserProfile = async (userId: number): Promise<UserDetailResponseDto> => {
  const response = await axios.get(`/user/${userId}/profile`);
  return response.data;
};

/**
 * 사용자 서재 목록 조회
 */
export const getUserLibraries = async (
  userId: number,
  page: number = 1,
  limit: number = 10
): Promise<UserLibrariesResponseDto> => {
  const response = await axios.get(`/user/${userId}/libraries`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * 사용자 구독한 서재 목록 조회
 */
export const getUserSubscribedLibraries = async (
  userId: number,
  page: number = 1,
  limit: number = 10
): Promise<UserSubscribedLibrariesResponseDto> => {
  const response = await axios.get(`/user/${userId}/libraries/subscribed`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * 사용자 리뷰 목록 조회
 */
export const getUserReviews = async (
  userId: number,
  page: number = 1,
  limit: number = 10
): Promise<UserReviewsResponseDto> => {
  const response = await axios.get(`/user/${userId}/reviews`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * 팔로워 목록 조회
 */
export const getFollowers = async (
  userId: number,
  page: number = 1,
  limit: number = 10
): Promise<FollowersListResponseDto> => {
  const response = await axios.get(`/user/${userId}/followers`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * 팔로잉 목록 조회
 */
export const getFollowing = async (
  userId: number,
  page: number = 1,
  limit: number = 10
): Promise<FollowingListResponseDto> => {
  const response = await axios.get(`/user/${userId}/following`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * 사용자 팔로우
 */
export const followUser = async (userId: number): Promise<{ message: string }> => {
  const response = await axios.post(`/user/${userId}/follow`);
  return response.data;
};

/**
 * 사용자 언팔로우
 */
export const unfollowUser = async (userId: number): Promise<{ message: string }> => {
  const response = await axios.delete(`/user/${userId}/follow`);
  return response.data;
};

/**
 * 사용자 책 목록 조회
 */
export const getUserBooks = async (
  userId: number,
  status?: string,
  page: number = 1,
  limit: number = 10
): Promise<UserBooksResponseDto> => {
  const response = await axios.get(`/user/${userId}/books`, {
    params: { status, page, limit },
  });
  return response.data;
};

/**
 * 사용자 독서 상태별 책 수 조회
 */
export const getUserReadingStatusCounts = async (
  userId: number
): Promise<UserReadingStatusCountsDto> => {
  const response = await axios.get(`/user/${userId}/reading-status-counts`);
  return response.data;
};

/**
 * 사용자 리뷰 타입별 수 조회
 */
export const getUserReviewTypeCounts = async (userId: number): Promise<UserReviewTypeCountsDto> => {
  const response = await axios.get(`/user/${userId}/review-type-counts`);
  return response.data;
};

/**
 * 통계 설정 업데이트
 */
export const updateStatisticsSetting = async (
  data: UpdateStatisticsSettingRequest
): Promise<StatisticsSettingResponse> => {
  const response = await axios.patch('/user/me/statistics-settings', data);
  return response.data;
};

/**
 * 통계 설정 조회
 */
export const getStatisticsSetting = async (): Promise<StatisticsSettingResponse> => {
  const response = await axios.get('/user/me/statistics-settings');
  return response.data;
};

/**
 * 독서 상태 통계 조회
 */
export const getReadingStatusStats = async (
  userId: number
): Promise<ReadingStatusStatsResponse> => {
  const response = await axios.get(`/user/${userId}/statistics/reading-status`);
  return response.data;
};

/**
 * 장르 분석 통계 조회
 */
export const getGenreAnalysis = async (userId: number): Promise<GenreAnalysisResponse> => {
  const response = await axios.get(`/user/${userId}/statistics/genre-analysis`);
  return response.data;
};

/**
 * 평점 통계 조회
 */
export const getRatingStats = async (userId: number): Promise<RatingStatsResponse> => {
  const response = await axios.get(`/user/${userId}/statistics/rating-stats`);
  return response.data;
};

/**
 * 리뷰 통계 조회
 */
export const getReviewStats = async (userId: number): Promise<ReviewStatsResponse> => {
  const response = await axios.get(`/user/${userId}/statistics/review-stats`);
  return response.data;
};

/**
 * 활동 빈도 통계 조회
 */
export const getActivityFrequency = async (userId: number): Promise<ActivityFrequencyResponse> => {
  const response = await axios.get(`/user/${userId}/statistics/activity-frequency`);
  return response.data;
};

/**
 * 사용자 상호작용 통계 조회
 */
export const getUserInteraction = async (userId: number): Promise<UserInteractionResponse> => {
  const response = await axios.get(`/user/${userId}/statistics/user-interaction`);
  return response.data;
};

/**
 * 팔로워 통계 조회
 */
export const getFollowerStats = async (userId: number): Promise<FollowerStatsResponse> => {
  const response = await axios.get(`/user/${userId}/statistics/follower-stats`);
  return response.data;
};

/**
 * 계정 비활성화
 */
export const deactivateAccount = async (): Promise<AccountActionResponse> => {
  const response = await axios.post('/user/me/deactivate');
  return response.data;
};

/**
 * 계정 삭제
 */
export const deleteAccount = async (): Promise<AccountActionResponse> => {
  const response = await axios.delete('/user/me');
  return response.data;
};
