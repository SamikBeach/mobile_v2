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
  rating: string | number;
  reviews: number;
  publisher: string;
  publishDate: Date;
  category?: {
    id: number;
    name: string;
  };
  totalRatings?: number;
  libraryAdds?: number;
}

// 홈화면용 책 미리보기 인터페이스
export interface HomeBookPreview {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  coverImageWidth?: number;
  coverImageHeight?: number;
  rating: string | number;
  isbn: string;
  isbn13?: string;
  category?: {
    id: number;
    name: string;
  };
  publisher?: string;
  totalRatings?: number;
  reviews?: number;
}

// 책 검색 응답 인터페이스
export interface BookSearchResponse {
  books: HomeBookPreview[];
  total: number;
  page: number;
  totalPages: number;
}

// 홈화면용 발견 책 응답 인터페이스 - 실제 API 응답에 맞춰 수정
export interface HomeDiscoverBooksResponse {
  books: HomeBookPreview[];
  total: number;
  page: number;
  totalPages: number;
}
