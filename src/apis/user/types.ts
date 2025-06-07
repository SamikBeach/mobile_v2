import { AuthProvider, UserStatus } from '../auth/types';

/**
 * 사용자 정보 인터페이스
 */
export interface User {
  id: number;
  email: string;
  username?: string;
  avatar?: string;
  bio?: string;
  profileImage?: string;
  provider: AuthProvider;
  providerId?: string;
  status: UserStatus;
  isEmailVerified: boolean;
  marketingConsent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 사용자 정보 업데이트 요청 인터페이스
 */
export interface UpdateUserInfoRequest {
  username?: string;
  bio?: string;
}

/**
 * 사용자 정보 업데이트 응답
 */
export interface UpdateUserInfoResponse {
  id: string;
  email: string;
  username?: string;
}

/**
 * 프로필 이미지 업로드 응답
 */
export interface UploadProfileImageResponse {
  url: string;
}

/**
 * 계정 비활성화/삭제 응답
 */
export interface AccountActionResponse {
  message: string;
}

/**
 * 사용자 기본 정보 DTO
 */
export interface UserDetailDto {
  id: number;
  username: string;
  email?: string;
  bio?: string;
  profileImage?: string;
  provider: AuthProvider;
  createdAt: Date;
}

/**
 * 서재 소유자 DTO
 */
export interface LibraryOwnerDto {
  id: number;
  username: string;
  email: string;
}

/**
 * 서재 태그 DTO
 */
export interface LibraryTagDto {
  id: number;
  tagId: number;
  tagName: string;
  usageCount: number;
  libraryId: number;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 서재 미리보기 DTO
 */
export interface LibraryPreviewDto {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  subscriberCount: number;
  owner: LibraryOwnerDto;
  tags: LibraryTagDto[];
  bookCount: number;
  previewBooks: BookPreviewDto[];
  isSubscribed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 책 미리보기 DTO
 */
export interface BookPreviewDto {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  isbn: string;
  publisher: string;
}

/**
 * 이미지 미리보기 DTO
 */
export interface ImagePreviewDto {
  id: number;
  url: string;
}

/**
 * 리뷰 미리보기 DTO
 */
export interface ReviewPreviewDto {
  id: number;
  content: string;
  type: string;
  previewImage: ImagePreviewDto;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
}

/**
 * 카테고리별 독서 통계 DTO
 */
export interface ReadingCategoryStatDto {
  category: string;
  count: number;
}

/**
 * 리뷰 카운트 DTO
 */
export interface ReviewCountsDto {
  total: number;
  general: number;
  discussion: number;
  review: number;
  question: number;
  meetup: number;
}

/**
 * 사용자 상세 정보 응답 DTO
 */
export interface UserDetailResponseDto {
  user: UserDetailDto;
  libraryCount: number;
  readCount: number;
  subscribedLibraryCount: number;
  reviewCount: ReviewCountsDto;
  followers: number;
  following: number;
  isEditable: boolean;
  isFollowing?: boolean;
  libraries?: LibraryPreviewDto[];
  averageRating?: number | null;
  ratingCount: number;
  reviewAndRatingCount?: number;
}

/**
 * 사용자 서재 목록 응답
 */
export interface UserLibrariesResponseDto {
  items: LibraryPreviewDto[];
  total: number;
}

/**
 * 사용자 리뷰 목록 응답
 */
export interface UserReviewsResponseDto {
  reviews: any[]; // Match actual server response
  total: number;
  page: number;
  totalPages: number;
}

/**
 * 팔로워/팔로잉 사용자 응답 DTO
 */
export interface FollowerResponseDto {
  id: number;
  username: string;
  bio?: string;
  profileImage?: string;
  isFollowing: boolean;
}

/**
 * 팔로워 목록 응답 DTO
 */
export interface FollowersListResponseDto {
  followers: FollowerResponseDto[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
}

/**
 * 팔로잉 목록 응답 DTO
 */
export interface FollowingListResponseDto {
  following: FollowerResponseDto[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
}

/**
 * 사용자 책 목록 응답 DTO
 */
export interface UserBooksResponseDto {
  items: ExtendedReadingStatusResponseDto[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
}

/**
 * 기존 ReadingStatusResponseDto는 계속 유지
 */
export interface ReadingStatusResponseDto {
  id: number;
  status: string; // 서버에서 "READ", "READING", "WANT_TO_READ" 형식으로 반환됨
  currentPage?: number;
  startDate?: Date;
  finishDate?: Date;
  readingMemo?: string;
  createdAt: Date;
  updatedAt: Date;
  book: {
    id: number;
    title: string;
    author: string;
    coverImage: string;
    isbn: string;
  };
}

/**
 * 확장된 책 정보 DTO
 */
export interface ExtendedBookInfoDto {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  isbn: string;
  publisher: string;
  isbn13?: string;
  translator?: string;
  pageCount?: number;
  publishDate?: Date;
  rating?: number;
  reviews?: number;
  totalRatings?: number;
  description?: string;
  tags?: string[];
  categoryId?: number;
  subcategoryId?: number;
  priceSales?: number;
  priceStandard?: number;
  isFeatured?: boolean;
  isDiscovered?: boolean;
}

/**
 * 확장된 독서 상태 응답 DTO
 */
export interface ExtendedReadingStatusResponseDto {
  id: number;
  status: string; // 서버에서 "READ", "READING", "WANT_TO_READ" 형식으로 반환됨
  currentPage?: number;
  startDate?: Date;
  finishDate?: Date;
  readingMemo?: string;
  createdAt: Date;
  updatedAt: Date;
  book: ExtendedBookInfoDto;
}

/**
 * 사용자의 읽기 상태별 책 수 응답 타입
 */
export interface UserReadingStatusCountsDto {
  WANT_TO_READ: number;
  READING: number;
  READ: number;
  total: number;
}

/**
 * 사용자의 리뷰 타입별 수 응답 타입
 */
export interface UserReviewTypeCountsDto {
  general: number;
  discussion: number;
  review: number;
  question: number;
  meetup: number;
  total: number;
}

/**
 * 사용자 도서 목록 정렬 옵션
 */
export enum UserBooksSortOptions {
  RATING_DESC = 'rating-desc',
  REVIEWS_DESC = 'reviews-desc',
  LIBRARY_COUNT_DESC = 'library-desc',
  PUBLISH_DATE_DESC = 'publishDate-desc',
  TITLE_ASC = 'title-asc',
  CREATED_AT_DESC = 'createdAt-desc', // 등록 최신순 (기본값)
}

/**
 * 기간 필터 옵션
 */
export enum TimeRangeOptions {
  ALL = 'all',
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

// 통계 관련 인터페이스들 (간소화)
export interface UpdateStatisticsSettingRequest {
  isReadingStatusPublic?: boolean;
  isReadingTimePatternPublic?: boolean;
  isReadingStatusByPeriodPublic?: boolean;
  isGenreAnalysisPublic?: boolean;
  isAuthorPublisherStatsPublic?: boolean;
  isReviewStatsPublic?: boolean;
  isRatingStatsPublic?: boolean;
  isActivityFrequencyPublic?: boolean;
  isRatingHabitsPublic?: boolean;
  isUserInteractionPublic?: boolean;
  isFollowerStatsPublic?: boolean;
  isCommunityActivityPublic?: boolean;
  isReviewInfluencePublic?: boolean;
  isLibraryCompositionPublic?: boolean;
  isLibraryPopularityPublic?: boolean;
  isLibraryUpdatePatternPublic?: boolean;
  isSearchActivityPublic?: boolean;
  isBookMetadataStatsPublic?: boolean;
}

export interface StatisticsSettingResponse {
  isReadingStatusPublic: boolean;
  isReadingTimePatternPublic: boolean;
  isReadingStatusByPeriodPublic: boolean;
  isGenreAnalysisPublic: boolean;
  isAuthorPublisherStatsPublic: boolean;
  isReviewStatsPublic: boolean;
  isRatingStatsPublic: boolean;
  isActivityFrequencyPublic: boolean;
  isRatingHabitsPublic: boolean;
  isUserInteractionPublic: boolean;
  isFollowerStatsPublic: boolean;
  isCommunityActivityPublic: boolean;
  isReviewInfluencePublic: boolean;
  isLibraryCompositionPublic: boolean;
  isLibraryPopularityPublic: boolean;
  isLibraryUpdatePatternPublic: boolean;
  isSearchActivityPublic: boolean;
  isBookMetadataStatsPublic: boolean;
}

export interface ReadingStatusStatsResponse {
  wantToReadCount: number;
  readingCount: number;
  readCount: number;
  completionRate: number;
  isPublic: boolean;
}

export interface RecentPopularSearchResponse {
  term: string;
  count: number;
}
