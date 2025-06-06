// Axios 인스턴스 및 유틸리티
export { default as api, authUtils } from './axios';

// 각 모듈별 API 함수들
export * from './book/book';
export * from './review/review';
export * from './library/library';

// 타입들은 각 모듈에서 직접 가져오기
export type {
  Book,
  HomeBookPreview,
  BookSearchResponse,
  HomeDiscoverBooksResponse,
} from './book/types';

export type {
  ReviewType,
  ReviewUser,
  ReviewBook,
  ReviewImage,
  HomeReviewPreview,
  HomePopularReviewsResponse,
} from './review/types';

export type {
  UserInfo,
  BookPreview,
  HomeLibraryPreview,
  HomePopularLibrariesResponse,
  CreateLibraryDto,
  CreateLibraryResponse,
  UserLibrary,
  UserLibrariesResponse,
  AddBookToLibraryDto,
  AddBookToLibraryResponse,
} from './library/types';
