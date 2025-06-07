import axios from '../axios';
import { BookReadingStatsDto, ReadingStatusDto, ReadingStatusResponseDto } from './types';

/**
 * 독서 상태 생성 또는 업데이트
 * @param bookId 책 ID (음수인 경우 isbn과 함께 제공 필요)
 * @param readingStatus 독서 상태 정보
 * @param isbn 책 ISBN (bookId가 -1인 경우 사용)
 */
export const createOrUpdateReadingStatus = async (
  bookId: number,
  readingStatus: ReadingStatusDto,
  isbn?: string
): Promise<ReadingStatusResponseDto> => {
  // bookId가 음수이고 isbn이 제공된 경우 isbn 포함
  const payload = isbn && bookId < 0 ? { ...readingStatus, isbn } : readingStatus;

  const response = await axios.post<ReadingStatusResponseDto>(
    `/reading-status/book/${bookId}`,
    payload
  );
  return response.data;
};

/**
 * 특정 책에 대한 사용자의 독서 상태 조회
 */
export const getUserBookReadingStatus = async (
  bookId: number
): Promise<ReadingStatusResponseDto> => {
  const response = await axios.get<ReadingStatusResponseDto>(`/reading-status/book/${bookId}/user`);
  return response.data;
};

/**
 * 책의 독서 상태 통계 조회
 */
export const getBookReadingStats = async (bookId: number): Promise<BookReadingStatsDto> => {
  const response = await axios.get<BookReadingStatsDto>(`/reading-status/book/${bookId}/stats`);
  return response.data;
};

/**
 * 읽기 상태 ID를 통한 삭제
 */
export const deleteReadingStatus = async (readingStatusId: number): Promise<void> => {
  await axios.delete(`/reading-status/${readingStatusId}`);
};

/**
 * 책 ID로 해당 책의 읽기 상태 직접 삭제
 * @param bookId 책 ID
 */
export const deleteReadingStatusByBookId = async (bookId: number): Promise<void> => {
  await axios.delete(`/reading-status/book/${bookId}`);
};
