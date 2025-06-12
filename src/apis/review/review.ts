import axios from '../axios';
import {
  BookReviewsResponse,
  Comment,
  CommentsResponse,
  CreateCommentDto,
  CreateReviewDto,
  Review,
  ReviewResponseDto,
  ReviewsResponse,
  ReviewType,
  UpdateCommentDto,
  UpdateReviewDto,
} from './types';

/**
 * 모든 리뷰 조회 (페이지네이션, 필터링 지원)
 */
export const getAllReviews = async (
  page: number = 1,
  limit: number = 10,
  type?: ReviewType
): Promise<ReviewsResponse> => {
  const params: Record<string, string | number> = {
    page,
    limit,
  };

  if (type) {
    params.type = type;
  }

  const response = await axios.get<ReviewsResponse>('/review', { params });
  return response.data;
};

/**
 * 리뷰 상세 조회
 */
export const getReviewById = async (id: number): Promise<ReviewResponseDto> => {
  const response = await axios.get<ReviewResponseDto>(`/review/${id}`);
  return response.data;
};

/**
 * 리뷰 생성
 */
export const createReview = async (data: CreateReviewDto): Promise<ReviewResponseDto> => {
  const payload: {
    content: string;
    type: ReviewType;
    bookId?: number;
    isbn?: string;
  } = {
    content: data.content,
    type: data.type,
  };

  if (data.bookId) {
    payload.bookId = parseInt(String(data.bookId), 10);
  }

  // ISBN이 제공된 경우(특히 bookId가 -1인 경우) 포함
  if (data.isbn) {
    payload.isbn = data.isbn;
  }

  const response = await axios.post<any>('/review', payload);
  return response.data;
};

/**
 * 이미지와 함께 리뷰 생성
 */
export const createReviewWithImages = async (
  data: CreateReviewDto,
  images: File[]
): Promise<ReviewResponseDto> => {
  const formData = new FormData();
  formData.append('content', data.content);
  formData.append('type', data.type);

  if (data.bookId) {
    const bookIdNumber = parseInt(String(data.bookId), 10);
    formData.append('bookId', bookIdNumber.toString());
  }

  // ISBN이 제공된 경우(특히 bookId가 -1인 경우) 포함
  if (data.isbn) {
    formData.append('isbn', data.isbn);
  }

  images.forEach(image => {
    formData.append('images', image);
  });

  const response = await axios.post<ReviewResponseDto>('/review', formData);
  return response.data;
};

/**
 * 리뷰 수정
 */
export const updateReview = async (
  id: number,
  data: UpdateReviewDto
): Promise<ReviewResponseDto> => {
  // 요청 본문 준비
  const payload: Record<string, any> = {};

  // 필수 필드 복사
  if (data.content !== undefined) payload.content = data.content;
  if (data.type !== undefined) payload.type = data.type;

  // bookId 처리
  if (data.bookId !== undefined) {
    payload.bookId = data.bookId;

    // bookId가 음수인 경우에만 isbn 포함
    if (data.bookId < 0 && data.isbn) {
      payload.isbn = data.isbn;
    }
    // 양수인 경우 isbn 속성 제외
  }

  const response = await axios.put<ReviewResponseDto>(`/review/${id}`, payload);
  return response.data;
};

/**
 * 리뷰 삭제
 */
export const deleteReview = async (id: number): Promise<void> => {
  await axios.delete(`/review/${id}`);
};

/**
 * 리뷰 좋아요
 */
export const likeReview = async (reviewId: number): Promise<void> => {
  await axios.post(`/review/${reviewId}/like`);
};

/**
 * 리뷰 좋아요 취소
 */
export const unlikeReview = async (reviewId: number): Promise<void> => {
  await axios.delete(`/review/${reviewId}/like`);
};

/**
 * 리뷰의 댓글 목록 조회
 */
export const getReviewComments = async (reviewId: number): Promise<CommentsResponse> => {
  const response = await axios.get<any>(`/review/${reviewId}/comment`);

  // 백엔드 API 응답 구조에 맞게 처리
  return {
    comments: response.data?.comments || response.data || [],
  };
};

/**
 * 댓글 작성
 */
export const createComment = async (reviewId: number, data: CreateCommentDto): Promise<Comment> => {
  const response = await axios.post<any>(`/review/${reviewId}/comment`, data);
  return response.data;
};

/**
 * 댓글 삭제
 */
export const deleteComment = async (commentId: number): Promise<void> => {
  await axios.delete(`/review/comment/${commentId}`);
};

/**
 * 홈화면용 인기 리뷰 조회
 */
export const getPopularReviewsForHome = async (limit: number = 4): Promise<ReviewsResponse> => {
  const response = await axios.get<ReviewsResponse>('/review/popular/home', {
    params: { limit },
  });
  return response.data;
};

/**
 * 특정 책에 대한 리뷰 목록 조회
 */
export const getBookReviews = async (
  bookId: number,
  page: number = 1,
  limit: number = 10,
  sort: 'likes' | 'comments' | 'recent' = 'likes',
  isbn?: string
): Promise<BookReviewsResponse> => {
  // 추가 파라미터 설정
  const additionalParams: Record<string, string | number> = {
    bookId,
  };

  // ISBN이 있는 경우 추가
  if (isbn) {
    additionalParams.isbn = isbn;
  }

  const response = await axios.get<BookReviewsResponse>(`/review/book/${bookId}`, {
    params: { page, limit, sort, isbn },
  });
  return response.data;
};

/**
 * 리뷰에 댓글 추가
 */
export const addReviewComment = async (
  reviewId: number,
  data: CreateCommentDto
): Promise<Review> => {
  const response = await axios.post<any>(`/review/${reviewId}/comment`, data);
  return response.data;
};

/**
 * 댓글 수정
 */
export const updateComment = async (
  commentId: number,
  data: UpdateCommentDto
): Promise<Comment> => {
  const response = await axios.put<Comment>(`/review/comment/${commentId}`, data);
  return response.data;
};

/**
 * 댓글 좋아요
 */
export const likeComment = async (commentId: number): Promise<void> => {
  await axios.post(`/review/comment/${commentId}/like`);
};

/**
 * 댓글 좋아요 취소
 */
export const unlikeComment = async (commentId: number): Promise<void> => {
  await axios.delete(`/review/comment/${commentId}/like`);
};

/**
 * 리뷰 목록 조회 (다양한 필터 지원)
 */
export const getReviews = async (
  page: number = 1,
  limit: number = 10,
  filter: 'popular' | 'recent' | 'following' = 'recent',
  type?: ReviewType,
  additionalParams?: Record<string, string | number>
): Promise<ReviewsResponse> => {
  const params: Record<string, string | number> = {
    page,
    limit,
    filter,
  };

  if (type) params.type = type;
  if (additionalParams) {
    Object.assign(params, additionalParams);
  }

  const response = await axios.get<ReviewsResponse>('/review', { params });
  return response.data;
};
