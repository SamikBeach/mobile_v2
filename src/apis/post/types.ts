export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  author: {
    id: number;
    username: string;
    profileImage?: string;
  };
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostDto {
  title: string;
  content: string;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
}

export interface PostComment {
  id: number;
  content: string;
  authorId: number;
  author: {
    id: number;
    username: string;
    profileImage?: string;
  };
  postId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostCommentDto {
  content: string;
}
