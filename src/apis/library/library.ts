import axios from '../axios';
import {
  HomePopularLibrariesResponse,
  CreateLibraryDto,
  CreateLibraryResponse,
  UserLibrariesResponse,
  AddBookToLibraryDto,
  AddBookToLibraryResponse,
  LibraryTagResponseDto,
  LibraryTagListResponseDto,
} from './types';

/**
 * 홈화면용 인기 서재 조회
 */
export const getPopularLibrariesForHome = async (
  limit: number = 3
): Promise<HomePopularLibrariesResponse> => {
  console.log('[API REQUEST] getPopularLibrariesForHome:', { limit });

  const response = await axios.get<HomePopularLibrariesResponse>('/library/popular/home', {
    params: { limit },
  });

  console.log('[API RESPONSE] getPopularLibrariesForHome:', response.data);
  return response.data;
};

/**
 * 특정 사용자의 서재 목록 조회
 */
export const getLibrariesByUser = async (
  userId: number,
  requestingUserId?: number
): Promise<UserLibrariesResponse> => {
  console.log('[API REQUEST] getLibrariesByUser:', { userId, requestingUserId });

  const params: Record<string, string> = {};
  if (requestingUserId) {
    params.requestingUserId = requestingUserId.toString();
  }

  const response = await axios.get<UserLibrariesResponse>(`/library/user/${userId}`, {
    params,
  });

  console.log('[API RESPONSE] getLibrariesByUser:', response.data);
  return response.data;
};

/**
 * 현재 로그인한 사용자의 서재 목록 조회
 * 임시로 하드코딩된 사용자 ID 사용 (TODO: 실제 사용자 정보 API에서 가져오기)
 */
export const getUserLibraries = async (): Promise<UserLibrariesResponse> => {
  console.log('[API REQUEST] getUserLibraries (current user)');

  // TODO: 실제 구현에서는 현재 로그인한 사용자 정보를 가져와서 사용자 ID 추출
  const currentUserId = 1; // 임시 하드코딩

  const response = await getLibrariesByUser(currentUserId);

  console.log('[API RESPONSE] getUserLibraries:', response);
  return response;
};

/**
 * 새 서재 생성
 */
export const createLibrary = async (data: CreateLibraryDto): Promise<CreateLibraryResponse> => {
  console.log('[API REQUEST] createLibrary:', data);

  const response = await axios.post<CreateLibraryResponse>('/library', data);

  console.log('[API RESPONSE] createLibrary:', response.data);
  return response.data;
};

/**
 * 서재에 책 추가
 */
export const addBookToLibrary = async (
  libraryId: number,
  data: AddBookToLibraryDto
): Promise<AddBookToLibraryResponse> => {
  console.log('[API REQUEST] addBookToLibrary:', { libraryId, data });

  const response = await axios.post<AddBookToLibraryResponse>(`/library/${libraryId}/books`, data);

  console.log('[API RESPONSE] addBookToLibrary:', response.data);
  return response.data;
};

/**
 * 모든 라이브러리 태그 조회
 */
export const getAllLibraryTags = async (
  page?: number,
  limit?: number,
  search?: string
): Promise<LibraryTagListResponseDto> => {
  console.log('[API REQUEST] getAllLibraryTags:', { page, limit, search });

  const params: Record<string, string> = {};
  if (page) params.page = page.toString();
  if (limit) params.limit = limit.toString();
  if (search) params.search = search;

  const response = await axios.get<LibraryTagListResponseDto>('/library-tag', {
    params,
  });

  console.log('[API RESPONSE] getAllLibraryTags:', response.data);
  return response.data;
};

/**
 * 인기 라이브러리 태그 조회
 */
export const getPopularLibraryTags = async (limit?: number): Promise<LibraryTagResponseDto[]> => {
  console.log('[API REQUEST] getPopularLibraryTags:', { limit });

  const params = limit ? { limit: limit.toString() } : undefined;
  const response = await axios.get<LibraryTagResponseDto[]>('/library-tag/popular', { params });

  console.log('[API RESPONSE] getPopularLibraryTags:', response.data);
  return response.data;
};
