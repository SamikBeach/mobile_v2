export interface RatingDto {
  rating: number;
  comment?: string;
  isbn?: string;
}

export interface UpdateRatingDto {
  rating?: number;
  comment?: string;
}

export interface RatingResponseDto {
  id: number;
  userId: number;
  bookId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}
