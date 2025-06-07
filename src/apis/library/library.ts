import axios from '../axios';
import {
  AddBookResponse,
  AddBooksToLibraryDto,
  AddBookToLibraryDto,
  AddTagToLibraryDto,
  CreateLibraryDto,
  Library,
  LibraryBook,
  LibrarySortOption,
  LibraryTag,
  PaginatedLibraryResponse,
  TimeRangeOptions,
  UpdateHistoryItem,
  UpdateLibraryDto,
  UserInfo,
} from './types';

/**
 * 홈화면용 인기 서재 조회
 */
export const getPopularLibrariesForHome = async (
  limit: number = 3
): Promise<PaginatedLibraryResponse> => {
  const response = await axios.get<PaginatedLibraryResponse>('/library/popular/home', {
    params: { limit },
  });
  return response.data;
};

/**
 * 사용자 서재 목록 조회
 */
export const getUserLibraries = async (userId: number): Promise<Library[]> => {
  const response = await axios.get<Library[]>(`/users/${userId}/libraries`);
  return response.data;
};

/**
 * 현재 사용자의 서재 목록 조회
 */
export const getMyLibraries = async (): Promise<Library[]> => {
  const response = await axios.get<Library[]>('/library/my');
  return response.data;
};

/**
 * 서재 생성
 */
export const createLibrary = async (data: CreateLibraryDto): Promise<Library> => {
  const response = await axios.post<Library>('/library', data);
  return response.data;
};

/**
 * 서재에 책 추가
 */
export const addBookToLibrary = async (
  libraryId: number,
  data: AddBookToLibraryDto
): Promise<LibraryBook> => {
  const response = await axios.post<LibraryBook>(`/library/${libraryId}/books`, data);
  return response.data;
};

/**
 * 모든 서재 목록 조회 (공개된 서재만) - 페이지네이션, 검색, 정렬, 태그 필터링 지원
 */
export const getAllLibraries = async (
  page: number = 1,
  limit: number = 10,
  sort?: LibrarySortOption,
  query?: string,
  tagId?: number,
  timeRange?: TimeRangeOptions
): Promise<PaginatedLibraryResponse> => {
  const params: Record<string, string> = {};

  if (page) params.page = page.toString();
  if (limit) params.limit = limit.toString();
  if (sort) params.sort = sort;
  if (query && query.trim() !== '') params.query = query;
  if (tagId) params.tagId = tagId.toString();
  if (timeRange) params.timeRange = timeRange;

  const response = await axios.get<PaginatedLibraryResponse>('/library', {
    params,
  });
  return response.data;
};

/**
 * 특정 사용자의 서재 목록 조회
 */
export const getLibrariesByUser = async (
  userId: number,
  requestingUserId?: number,
  sort?: LibrarySortOption,
  timeRange?: TimeRangeOptions
): Promise<Library[]> => {
  const params: Record<string, string> = {};

  if (requestingUserId) params.requestingUserId = requestingUserId.toString();
  if (sort) params.sort = sort;
  if (timeRange) params.timeRange = timeRange;

  const response = await axios.get<Library[]>(`/library/user/${userId}`, {
    params,
  });
  return response.data;
};

/**
 * 사용자가 구독한 서재 목록 조회
 */
export const getSubscribedLibraries = async (sort?: LibrarySortOption): Promise<Library[]> => {
  const params: Record<string, string> = {};

  if (sort) params.sort = sort;

  const response = await axios.get<Library[]>('/library/subscribed', {
    params,
  });
  return response.data;
};

/**
 * 특정 서재 상세 조회
 */
export const getLibraryById = async (id: number): Promise<Library> => {
  const response = await axios.get<Library>(`/library/${id}`);
  return response.data;
};

/**
 * 서재 수정
 */
export const updateLibrary = async (
  id: number,
  updateLibraryDto: UpdateLibraryDto
): Promise<Library> => {
  const response = await axios.patch<Library>(`/library/${id}`, updateLibraryDto);
  return response.data;
};

/**
 * 서재 삭제
 */
export const deleteLibrary = async (id: number): Promise<void> => {
  await axios.delete(`/library/${id}`);
};

/**
 * 서재에서 책 제거
 */
export const removeBookFromLibrary = async (libraryId: number, bookId: number): Promise<void> => {
  await axios.delete(`/library/${libraryId}/book/${bookId}`);
};

/**
 * 서재에 태그 추가
 */
export const addTagToLibrary = async (
  libraryId: number,
  addTagToLibraryDto: AddTagToLibraryDto
): Promise<LibraryTag> => {
  const response = await axios.post<LibraryTag>(`/library/${libraryId}/tag`, addTagToLibraryDto);
  return response.data;
};

/**
 * 서재에서 태그 제거
 */
export const removeTagFromLibrary = async (libraryId: number, tagId: number): Promise<void> => {
  await axios.delete(`/library/${libraryId}/tag/${tagId}`);
};

/**
 * 서재 구독하기
 */
export const subscribeToLibrary = async (libraryId: number): Promise<void> => {
  await axios.post(`/library/${libraryId}/subscribe`);
};

/**
 * 서재 구독 취소하기
 */
export const unsubscribeFromLibrary = async (libraryId: number): Promise<void> => {
  await axios.delete(`/library/${libraryId}/subscribe`);
};

/**
 * 서재의 구독자 목록 조회
 */
export const getLibrarySubscribers = async (libraryId: number): Promise<UserInfo[]> => {
  const response = await axios.get<UserInfo[]>(`/library/${libraryId}/subscribers`);
  return response.data;
};

/**
 * 서재의 최근 업데이트 이력 조회
 */
export const getLibraryUpdates = async (
  libraryId: number,
  limit?: number
): Promise<UpdateHistoryItem[]> => {
  const params = limit ? { limit: limit.toString() } : undefined;
  const response = await axios.get<UpdateHistoryItem[]>(`/library/${libraryId}/updates`, {
    params,
  });
  return response.data;
};

/**
 * 서재에 책 추가 (ISBN 사용)
 */
export const addBookToLibraryWithIsbn = async ({
  libraryId,
  bookId,
  isbn,
}: {
  libraryId: number;
  bookId: number;
  isbn: string;
}): Promise<LibraryBook> => {
  const response = await axios.post<LibraryBook>(`/library/${libraryId}/books/isbn`, {
    bookId,
    isbn,
  });
  return response.data;
};

/**
 * 특정 책을 담은 서재 목록 조회
 */
export const getLibrariesByBookId = async (
  bookId: number,
  page: number = 1,
  limit: number = 10,
  isbn?: string,
  sort?: LibrarySortOption,
  timeRange?: TimeRangeOptions
): Promise<PaginatedLibraryResponse> => {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };

  if (isbn) params.isbn = isbn;
  if (sort) params.sort = sort;
  if (timeRange) params.timeRange = timeRange;

  const response = await axios.get<PaginatedLibraryResponse>(`/library/book/${bookId}`, { params });
  return response.data;
};

/**
 * 서재에 여러 책 추가
 */
export const addBooksToLibrary = async (
  libraryId: number,
  addBooksToLibraryDto: AddBooksToLibraryDto
): Promise<AddBookResponse> => {
  const response = await axios.post<AddBookResponse>(
    `/library/${libraryId}/books/batch`,
    addBooksToLibraryDto
  );
  return response.data;
};
