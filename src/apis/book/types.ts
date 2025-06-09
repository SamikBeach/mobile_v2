import { Category as CategoryType, SubCategory as SubCategoryType } from '../category';

// Re-export for backward compatibility
export type Category = CategoryType;
export type SubCategory = SubCategoryType;

// 기본 책 정보 인터페이스
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  isbn13?: string;
  description: string;
  coverImage: string;
  coverImageWidth?: number;
  coverImageHeight?: number;
  rating: number;
  reviews: number;
  publisher: string;
  publishDate: Date;
  category: CategoryType;
  subcategory?: SubCategoryType;
  isFeatured?: boolean;
  isDiscovered?: boolean;
  totalRatings?: number;
  libraryAdds?: number;
  readingStats?: {
    currentReaders: number;
    completedReaders: number;
    averageReadingTime: string;
    difficulty: string;
    readingStatusCounts: {
      WANT_TO_READ: number;
      READING: number;
      READ: number;
    };
  };
}

// 책 상세 정보 인터페이스 (Book + 사용자별 추가 정보)
export interface BookDetails extends Book {
  userRating?: number | null;
  userReadingStatus?: string | null;
  authorInfo?: string;
}

// 홈화면용 책 미리보기 인터페이스
export interface HomeBookPreview {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  coverImageWidth?: number;
  coverImageHeight?: number;
  rating: number;
  reviews: number;
  isbn: string;
  isbn13?: string;
  category?: {
    id: number;
    name: string;
  };
  publisher?: string;
}

// 책 검색 응답 인터페이스
export interface BookSearchResponse {
  books: Book[];
  total: number;
  page: number;
  totalPages: number;
}

// 홈화면용 발견 책 응답 인터페이스 - 실제 API 응답에 맞춰 수정
export interface HomeDiscoverBooksResponse {
  categoryId: number;
  categoryName: string;
  books: HomeBookPreview[];
}

// Popular Books 관련 타입들
export enum PopularBooksSortOptions {
  RATING_DESC = 'rating-desc',
  REVIEWS_DESC = 'reviews-desc',
  LIBRARY_COUNT_DESC = 'library-desc',
  PUBLISH_DATE_DESC = 'publishDate-desc',
  TITLE_ASC = 'title-asc',
}

export enum TimeRangeOptions {
  ALL = 'all',
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export type SortOption =
  | PopularBooksSortOptions.RATING_DESC
  | PopularBooksSortOptions.REVIEWS_DESC
  | PopularBooksSortOptions.LIBRARY_COUNT_DESC
  | PopularBooksSortOptions.PUBLISH_DATE_DESC
  | PopularBooksSortOptions.TITLE_ASC;

export type TimeRange =
  | TimeRangeOptions.ALL
  | TimeRangeOptions.TODAY
  | TimeRangeOptions.WEEK
  | TimeRangeOptions.MONTH
  | TimeRangeOptions.YEAR;

export interface PopularBooksParams {
  categoryId?: number;
  subcategoryId?: number;
  sort?: SortOption | PopularBooksSortOptions;
  timeRange?: TimeRange | TimeRangeOptions;
  page?: number;
  limit?: number;
}

// Category 타입들은 ../category/types에서 import됩니다.

export interface CreateBookDto {
  title: string;
  author: string;
  isbn: string;
  isbn13?: string;
  description: string;
  coverImage: string;
  coverImageWidth?: number;
  coverImageHeight?: number;
  publisher: string;
  publishDate: Date;
  categoryId: number;
  subcategoryId?: number;
  isFeatured?: boolean;
}

export interface UpdateBookDto {
  title?: string;
  author?: string;
  description?: string;
  coverImage?: string;
  coverImageWidth?: number;
  coverImageHeight?: number;
  rating?: number;
  reviews?: number;
  categoryId?: number;
  subcategoryId?: number;
  isFeatured?: boolean;
}

export interface DiscoverBooksParams {
  discoverCategoryId?: number;
  discoverSubCategoryId?: number;
  sort?: SortOption | PopularBooksSortOptions;
  timeRange?: TimeRange | TimeRangeOptions;
  page?: number;
  limit?: number;
}

export interface HomePopularBooksResponse {
  books: HomeBookPreview[];
}

export interface BookResponse {
  id: number;
  title: string;
  author: string;
  isbn: string;
  isbn13?: string;
  description: string;
  coverImage: string;
  coverImageWidth?: number;
  coverImageHeight?: number;
  rating: number;
  reviews: number;
  publisher: string;
  publishDate: Date;
  category: CategoryType;
  subcategory?: SubCategoryType;
  isFeatured?: boolean;
  isDiscovered?: boolean;
  totalRatings?: number;
  libraryAdds?: number;
  searchId?: number;
  bookId?: number;
  readingStats?: {
    currentReaders: number;
    completedReaders: number;
    averageReadingTime: string;
    difficulty: string;
    readingStatusCounts: Record<string, number>;
  };
  userReadingStatus?: string;
  userRating?: {
    bookId: number;
    rating: number;
    comment?: string;
  };
  searchTerm?: string;
  searchedAt?: Date;
}
