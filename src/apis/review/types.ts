// 리뷰 타입
export type ReviewType = 'general' | 'discussion' | 'review' | 'question' | 'meetup';

// 사용자 정보 인터페이스
export interface ReviewUser {
  id: number;
  username: string;
  email?: string;
  profile_image?: string | null;
}

// 리뷰에 연결된 책 정보 인터페이스
export interface ReviewBook {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  publisher: string;
  isbn?: string;
  isbn13?: string;
}

// 리뷰 이미지 인터페이스
export interface ReviewImage {
  id: number;
  url: string;
  caption?: string;
}

// 홈화면용 리뷰 미리보기 인터페이스
export interface HomeReviewPreview {
  id: number;
  content: string;
  type: ReviewType;
  author: ReviewUser;
  book?: ReviewBook;
  books?: ReviewBook[];
  images?: ReviewImage[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 홈화면용 인기 리뷰 응답 인터페이스
export interface HomePopularReviewsResponse {
  reviews: HomeReviewPreview[];
}
