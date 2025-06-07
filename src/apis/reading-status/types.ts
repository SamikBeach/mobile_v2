export enum ReadingStatusType {
  WANT_TO_READ = 'WANT_TO_READ',
  READING = 'READING',
  READ = 'READ',
}

export interface ReadingStatusDto {
  status?: ReadingStatusType;
  currentPage?: number;
  startDate?: Date;
  finishDate?: Date;
  readingMemo?: string;
  isbn?: string;
}

export interface BookReadingStatsDto {
  bookId: number;
  title: string;
  author: string;
  coverImage: string;
  readingStatusCounts: Record<ReadingStatusType, number>;
  userReadingStatus?: ReadingStatusType;
  currentReaders: number;
  completedReaders: number;
  averageReadingTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ReadingStatusResponseDto {
  id: number;
  status: string; // 서버에서 "READ", "READING", "WANT_TO_READ" 형식으로 반환됨
  currentPage?: number;
  startDate?: Date;
  finishDate?: Date;
  readingMemo?: string;
  createdAt: Date;
  updatedAt: Date;
  book: {
    id: number;
    title: string;
    author: string;
    coverImage: string;
    isbn: string;
  };
}
