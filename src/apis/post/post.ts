import axios from '../axios';
import { Post, CreatePostDto, UpdatePostDto, PostComment, CreatePostCommentDto } from './types';

/**
 * 게시글 목록 조회
 */
export const getPosts = async (
  page: number = 1,
  limit: number = 10
): Promise<{
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const response = await axios.get('/posts', {
    params: { page, limit },
  });
  return response.data;
};

/**
 * 게시글 상세 조회
 */
export const getPostById = async (id: number): Promise<Post> => {
  const response = await axios.get<Post>(`/posts/${id}`);
  return response.data;
};

/**
 * 게시글 생성
 */
export const createPost = async (data: CreatePostDto): Promise<Post> => {
  const response = await axios.post<Post>('/posts', data);
  return response.data;
};

/**
 * 게시글 수정
 */
export const updatePost = async (id: number, data: UpdatePostDto): Promise<Post> => {
  const response = await axios.patch<Post>(`/posts/${id}`, data);
  return response.data;
};

/**
 * 게시글 삭제
 */
export const deletePost = async (id: number): Promise<void> => {
  await axios.delete(`/posts/${id}`);
};

/**
 * 게시글 좋아요
 */
export const likePost = async (postId: number): Promise<void> => {
  await axios.post(`/posts/${postId}/like`);
};

/**
 * 게시글 좋아요 취소
 */
export const unlikePost = async (postId: number): Promise<void> => {
  await axios.delete(`/posts/${postId}/like`);
};

/**
 * 게시글 댓글 목록 조회
 */
export const getPostComments = async (postId: number): Promise<PostComment[]> => {
  const response = await axios.get<PostComment[]>(`/posts/${postId}/comments`);
  return response.data;
};

/**
 * 게시글 댓글 작성
 */
export const createPostComment = async (
  postId: number,
  data: CreatePostCommentDto
): Promise<PostComment> => {
  const response = await axios.post<PostComment>(`/posts/${postId}/comments`, data);
  return response.data;
};

/**
 * 게시글 댓글 삭제
 */
export const deletePostComment = async (commentId: number): Promise<void> => {
  await axios.delete(`/posts/comments/${commentId}`);
};
