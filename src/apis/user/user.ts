import axios from '../axios';
import {
  UpdateUserInfoRequest,
  UpdateUserInfoResponse,
  UploadProfileImageResponse,
  AccountActionResponse,
  UserDetailResponseDto,
  UserLibrariesResponseDto,
  UserReviewsResponseDto,
  FollowersListResponseDto,
  FollowingListResponseDto,
  UserBooksResponseDto,
  UserReadingStatusCountsDto,
  UserReviewTypeCountsDto,
  UpdateStatisticsSettingRequest,
  StatisticsSettingResponse,
  ReadingStatusStatsResponse,
  RecentPopularSearchResponse,
} from './types';

/**
 * 현재 사용자 정보 조회
 */
export const getCurrentUser = async (): Promise<UserDetailResponseDto> => {
  const response = await axios.get('/users/me');
  return response.data;
};

/**
 * 사용자 정보 업데이트
 */
export const updateUserInfo = async (
  data: UpdateUserInfoRequest
): Promise<UpdateUserInfoResponse> => {
  const response = await axios.patch('/users/me', data);
  return response.data;
};

/**
 * 프로필 이미지 업로드
 */
export const uploadProfileImage = async (file: FormData): Promise<UploadProfileImageResponse> => {
  const response = await axios.post('/users/me/profile-image', file, {
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
  const response = await axios.get(`/users/${userId}`);
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
  const response = await axios.get(`/users/${userId}/libraries`, {
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
  const response = await axios.get(`/users/${userId}/reviews`, {
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
  const response = await axios.get(`/users/${userId}/followers`, {
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
  const response = await axios.get(`/users/${userId}/following`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * 사용자 팔로우
 */
export const followUser = async (userId: number): Promise<{ message: string }> => {
  const response = await axios.post(`/users/${userId}/follow`);
  return response.data;
};

/**
 * 사용자 언팔로우
 */
export const unfollowUser = async (userId: number): Promise<{ message: string }> => {
  const response = await axios.delete(`/users/${userId}/follow`);
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
  const response = await axios.get(`/users/${userId}/books`, {
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
  const response = await axios.get(`/users/${userId}/reading-status-counts`);
  return response.data;
};

/**
 * 사용자 리뷰 타입별 수 조회
 */
export const getUserReviewTypeCounts = async (userId: number): Promise<UserReviewTypeCountsDto> => {
  const response = await axios.get(`/users/${userId}/review-type-counts`);
  return response.data;
};

/**
 * 통계 설정 업데이트
 */
export const updateStatisticsSetting = async (
  data: UpdateStatisticsSettingRequest
): Promise<StatisticsSettingResponse> => {
  const response = await axios.patch('/users/me/statistics-settings', data);
  return response.data;
};

/**
 * 통계 설정 조회
 */
export const getStatisticsSetting = async (): Promise<StatisticsSettingResponse> => {
  const response = await axios.get('/users/me/statistics-settings');
  return response.data;
};

/**
 * 독서 상태 통계 조회
 */
export const getReadingStatusStats = async (
  userId: number
): Promise<ReadingStatusStatsResponse> => {
  const response = await axios.get(`/users/${userId}/statistics/reading-status`);
  return response.data;
};

/**
 * 인기 검색어 조회
 */
export const getRecentPopularSearches = async (): Promise<RecentPopularSearchResponse[]> => {
  const response = await axios.get('/users/recent-popular-searches');
  return response.data;
};

/**
 * 계정 비활성화
 */
export const deactivateAccount = async (): Promise<AccountActionResponse> => {
  const response = await axios.post('/users/me/deactivate');
  return response.data;
};

/**
 * 계정 삭제
 */
export const deleteAccount = async (): Promise<AccountActionResponse> => {
  const response = await axios.delete('/users/me');
  return response.data;
};
