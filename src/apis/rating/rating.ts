import axios from '../axios';
import { RatingDto, RatingResponseDto, UpdateRatingDto } from './types';

/**
 * 책에 대한 평점 생성 또는 업데이트
 * @param bookId 책 ID (음수인 경우 isbn과 함께 제공 필요)
 * @param ratingData 평점 정보
 * @param isbn 책 ISBN (bookId가 -1인 경우 사용)
 */
export const createOrUpdateRating = async (
  bookId: number,
  ratingData: RatingDto,
  isbn?: string
): Promise<RatingResponseDto> => {
  // bookId가 음수이고 isbn이 제공된 경우 isbn 포함
  const payload = isbn && bookId < 0 ? { ...ratingData, isbn } : ratingData;

  const response = await axios.post<RatingResponseDto>(`/rating/book/${bookId}`, payload);
  return response.data;
};

/**
 * 특정 사용자의 책에 대한 평점 조회
 */
export const getUserBookRating = async (bookId: number): Promise<RatingResponseDto> => {
  const response = await axios.get<RatingResponseDto>(`/rating/book/${bookId}/user`);
  return response.data;
};

/**
 * 책에 대한 모든 평점 조회
 */
export const getBookRatings = async (bookId: number): Promise<RatingResponseDto[]> => {
  const response = await axios.get<RatingResponseDto[]>(`/rating/book/${bookId}`);
  return response.data;
};

/**
 * 평점 삭제
 */
export const deleteRating = async (ratingId: number): Promise<void> => {
  await axios.delete(`/rating/${ratingId}`);
};

/**
 * 현재 사용자의 모든 평점 조회
 */
export const getUserRatings = async (): Promise<RatingResponseDto[]> => {
  const response = await axios.get<RatingResponseDto[]>(`/rating/user`);
  return response.data;
};

/**
 * 평점 업데이트
 */
export const updateRating = async (
  ratingId: number,
  ratingData: UpdateRatingDto
): Promise<RatingResponseDto> => {
  const response = await axios.patch<RatingResponseDto>(`/rating/${ratingId}`, ratingData);
  return response.data;
};
