// 기본 사용자 정보 타입
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  profileImage?: string;
}

// 책 미리보기 정보 타입
export interface BookPreview {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  isbn?: string;
  publisher?: string;
}

// 홈화면용 라이브러리 프리뷰 인터페이스
export interface HomeLibraryPreview {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  subscriberCount: number;
  bookCount: number;
  owner: UserInfo;
  previewBooks?: BookPreview[];
  isSubscribed?: boolean;
  tags?: any[];
  createdAt: string;
  updatedAt?: string;
}

// 홈화면용 인기 라이브러리 응답 인터페이스
export interface HomePopularLibrariesResponse {
  data: HomeLibraryPreview[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    sort: string;
  };
}

// 서재 생성 요청 타입
export interface CreateLibraryDto {
  name: string;
  description?: string;
  isPublic: boolean;
  tagIds?: number[];
}

// 서재 생성 응답 타입
export interface CreateLibraryResponse {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  tags?: string[];
  bookCount: number;
  subscriberCount: number;
  owner: UserInfo;
  createdAt: string;
}

// 사용자 서재 목록 타입
export interface UserLibrary {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  bookCount: number;
  subscriberCount: number;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

// 사용자 서재 목록 응답 타입
export interface UserLibrariesResponse {
  data: UserLibrary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// 서재에 책 추가 요청 타입
export interface AddBookToLibraryDto {
  isbn: string;
  note?: string;
}

// 서재에 책 추가 응답 타입
export interface AddBookToLibraryResponse {
  success: boolean;
  message: string;
}

// 라이브러리 태그 응답 타입
export interface LibraryTagResponseDto {
  id: number;
  tagName: string;
  description?: string;
  usageCount: number;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

// 라이브러리 태그 목록 응답 타입
export interface LibraryTagListResponseDto {
  tags: LibraryTagResponseDto[];
  totalCount: number;
}
