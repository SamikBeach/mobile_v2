import axios from '../axios';
import {
  Feedback,
  CreateFeedbackDto,
  UpdateFeedbackDto,
  FeedbackDto,
  FeedbackResponseDto,
} from './types';

/**
 * 피드백 목록 조회
 */
export const getFeedbacks = async (): Promise<Feedback[]> => {
  const response = await axios.get<Feedback[]>('/feedback');
  return response.data;
};

/**
 * 피드백 생성
 */
export const createFeedback = async (data: CreateFeedbackDto): Promise<Feedback> => {
  const response = await axios.post<Feedback>('/feedback', data);
  return response.data;
};

/**
 * 피드백 수정
 */
export const updateFeedback = async (id: number, data: UpdateFeedbackDto): Promise<Feedback> => {
  const response = await axios.patch<Feedback>(`/feedback/${id}`, data);
  return response.data;
};

/**
 * 피드백 삭제
 */
export const deleteFeedback = async (id: number): Promise<void> => {
  await axios.delete(`/feedback/${id}`);
};

/**
 * 피드백을 제출하는 API 함수 (src_frontend 호환)
 */
export const submitFeedback = async (feedbackData: FeedbackDto): Promise<FeedbackResponseDto> => {
  const response = await axios.post<FeedbackResponseDto>('/feedback', feedbackData);
  return response.data;
};
