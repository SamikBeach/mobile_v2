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
