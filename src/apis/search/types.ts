import { ReadingStatusType } from '../reading-status/types';

export interface UserRating {
  id: number;
  userId: number;
  bookId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
}

export interface SearchResult {
  id: number;
  bookId?: number;
  type: string;
  title: string;
  subtitle?: string;
  author?: string;
  image?: string;
  coverImage?: string;
  coverImageWidth?: number;
  coverImageHeight?: number;
  highlight?: string;
  totalRatings?: number;
  rating?: number;
  reviews?: number;
  isbn?: string;
  isbn13?: string;
  publisher?: string;
  translator?: string | null;
  pageCount?: number | null;
  publishDate?: string;
  description?: string;
  priceSales?: number;
  priceStandard?: number;
  isFeatured?: boolean;
  isDiscovered?: boolean;
  createdAt?: string;
  updatedAt?: string;
  category?: Category;
  subcategory?: SubCategory | null;
  readingStats?: {
    currentReaders: number;
    completedReaders: number;
    averageReadingTime: string;
    difficulty: 'easy' | 'medium' | 'hard';
    readingStatusCounts?: Record<ReadingStatusType, number>;
  };
  userReadingStatus?: ReadingStatusType | null;
  userRating?: UserRating | null;
}

export interface SearchBook extends SearchResult {
  category?: Category;
  description?: string;
  publishDate?: string;
  publisher?: string;
  pages?: number;
}

export interface BookSearchResult {
  books: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RecentSearch {
  id: number;
  term: string;
  bookId?: number;
  title?: string;
  author?: string;
  coverImage?: string;
  coverImageWidth?: number;
  coverImageHeight?: number;
  publisher?: string;
  description?: string;
  isbn?: string;
  isbn13?: string;
  createdAt: string;
  rating?: number;
  reviews?: number;
  totalRatings?: number;
  readingStats?: {
    currentReaders: number;
    completedReaders: number;
    averageReadingTime: string;
    difficulty: 'easy' | 'medium' | 'hard';
    readingStatusCounts?: Record<ReadingStatusType, number>;
  };
  userReadingStatus?: ReadingStatusType | null;
  userRating?: UserRating | null;
}

export interface PopularSearch {
  term: string;
  count: number;
}

export interface SaveSearchTermRequest {
  term: string;
  bookId?: number;
  title?: string;
  author?: string;
  coverImage?: string;
  publisher?: string;
  description?: string;
}
