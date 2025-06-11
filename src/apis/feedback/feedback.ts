import axios from '../axios';
import {
  FeedbackDetailDto,
  FeedbackDto,
  FeedbackListResponseDto,
  FeedbackResponseDto,
} from './types';

/**
 * 피드백을 제출하는 API 함수
 * @param feedbackData 피드백 데이터
 * @returns 피드백 응답 객체
 */
export const submitFeedback = async (feedbackData: FeedbackDto): Promise<FeedbackResponseDto> => {
  const response = await axios.post<FeedbackResponseDto>('/feedback', feedbackData);
  return response.data;
};

/**
 * 모든 피드백을 조회하는 API 함수 (관리자용)
 * @param page 페이지 번호 (기본값: 1)
 * @param limit 페이지당 항목 수 (기본값: 10)
 * @returns 피드백 목록과 페이지네이션 정보
 */
export const getAllFeedback = async (
  page: number = 1,
  limit: number = 10
): Promise<FeedbackListResponseDto> => {
  const response = await axios.get<FeedbackListResponseDto>(
    `/feedback?page=${page}&limit=${limit}`
  );
  return response.data;
};

/**
 * 특정 피드백을 ID로 조회하는 API 함수 (관리자용)
 * @param id 피드백 ID
 * @returns 피드백 상세 정보
 */
export const getFeedbackById = async (id: number): Promise<FeedbackDetailDto> => {
  const response = await axios.get<FeedbackDetailDto>(`/feedback/${id}`);
  return response.data;
};

/**
 * 피드백의 해결 상태를 업데이트하는 API 함수 (관리자용)
 * @param id 피드백 ID
 * @param isResolved 해결 상태
 * @returns 업데이트된 피드백 정보
 */
export const updateFeedbackResolutionStatus = async (
  id: number,
  isResolved: boolean
): Promise<FeedbackDetailDto> => {
  const response = await axios.patch<FeedbackDetailDto>(`/feedback/${id}/resolve`, { isResolved });
  return response.data;
};

/**
 * 피드백을 삭제하는 API 함수 (관리자용)
 * @param id 피드백 ID
 * @returns 삭제 결과 메시지
 */
export const deleteFeedback = async (id: number): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(`/feedback/${id}`);
  return response.data;
};
