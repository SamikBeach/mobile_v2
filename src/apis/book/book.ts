import axios from '../axios';
import {
  Book,
  BookSearchResponse,
  CreateBookDto,
  DiscoverBooksParams,
  HomeDiscoverBooksResponse,
  PopularBooksParams,
  UpdateBookDto,
  BookDetails,
  Category,
} from './types';

/**
 * 홈화면용 인기 도서 조회
 */
export const getPopularBooksForHome = async (limit: number = 4): Promise<BookSearchResponse> => {
  console.log('[API REQUEST] getPopularBooksForHome:', { limit });

  const response = await axios.get<BookSearchResponse>('/book/popular/home', {
    params: { limit },
  });

  console.log('[API RESPONSE] getPopularBooksForHome:', response.data);
  return response.data;
};

/**
 * 홈화면용 오늘의 발견 도서 조회
 */
export const getDiscoverBooksForHome = async (
  limit: number = 4
): Promise<HomeDiscoverBooksResponse[]> => {
  console.log('[API REQUEST] getDiscoverBooksForHome:', { limit });

  try {
    const response = await axios.get<BookSearchResponse>('/book/discover/home', {
      params: { limit },
    });

    console.log('[API RESPONSE] getDiscoverBooksForHome:', response.data);

    // API 응답을 HomeDiscoverBooksResponse 형태로 변환
    return [
      {
        categoryId: 999,
        categoryName: '오늘의 발견',
        books: response.data.books.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          coverImage: book.coverImage,
          coverImageWidth: book.coverImageWidth,
          coverImageHeight: book.coverImageHeight,
          rating: book.rating,
          reviews: book.reviews,
          isbn: book.isbn,
          isbn13: book.isbn13,
          category: book.category,
          publisher: book.publisher,
        })),
      },
    ];
  } catch {
    console.warn('[API FALLBACK] getDiscoverBooksForHome using popular books as fallback');

    // 발견하기 API가 실패하면 인기 도서를 대체 데이터로 사용
    const fallbackResponse = await getPopularBooksForHome(limit);

    return [
      {
        categoryId: 999,
        categoryName: '오늘의 발견',
        books: fallbackResponse.books.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          coverImage: book.coverImage,
          coverImageWidth: book.coverImageWidth,
          coverImageHeight: book.coverImageHeight,
          rating: book.rating,
          reviews: book.reviews,
          isbn: book.isbn,
          isbn13: book.isbn13,
          category: book.category,
          publisher: book.publisher,
        })),
      },
    ];
  }
};

/**
 * ID로 도서 조회
 */
export const getBookById = async (id: number): Promise<BookDetails> => {
  console.log('[API REQUEST] getBookById:', { id });

  const response = await axios.get<BookDetails>(`/book/${id}`);

  console.log('[API RESPONSE] getBookById:', response.data);
  return response.data;
};

/**
 * ISBN 또는 ID로 도서 조회
 * 입력값이 숫자만으로 이루어져 있고 길이가 짧다면 ID로 간주하고,
 * 그 외의 경우에는 ISBN으로 간주함
 */
export const getBookByIsbn = async (value: string): Promise<BookDetails> => {
  console.log('[API REQUEST] getBookByIsbn:', { value });

  // 숫자만으로 이루어져 있고 길이가 짧은 경우(10자 미만) ID로 간주
  if (/^\d+$/.test(value) && value.length < 10) {
    return getBookById(parseInt(value));
  }

  // 그 외의 경우 ISBN으로 간주
  const response = await axios.get<BookDetails>(`/book/isbn/${value}`);

  console.log('[API RESPONSE] getBookByIsbn:', response.data);
  return response.data;
};

/**
 * 인기 도서 조회 (무한 스크롤 지원)
 * 카테고리, 서브카테고리, 정렬, 기간 필터링 지원
 */
export const getPopularBooks = async (params: PopularBooksParams): Promise<BookSearchResponse> => {
  console.log('[API REQUEST] getPopularBooks:', params);

  const response = await axios.get<BookSearchResponse>('/book/popular', {
    params,
  });

  console.log('[API RESPONSE] getPopularBooks:', response.data);
  return response.data;
};

/**
 * 모든 카테고리 조회
 */
export const getCategories = async (): Promise<Category[]> => {
  console.log('[API REQUEST] getCategories');

  const response = await axios.get<Category[]>('/categories');

  console.log('[API RESPONSE] getCategories:', response.data);
  return response.data;
};

/**
 * 모든 도서 조회
 */
export const getAllBooks = async (): Promise<Book[]> => {
  const response = await axios.get<Book[]>('/book');
  return response.data;
};

/**
 * 추천 도서 조회
 */
export const getFeaturedBooks = async (): Promise<Book[]> => {
  const response = await axios.get<Book[]>('/book/featured');
  return response.data;
};

/**
 * 특정 카테고리의 도서 조회
 */
export const getBooksByCategoryId = async (categoryId: number): Promise<Book[]> => {
  const response = await axios.get<Book[]>(`/book/category/${categoryId}`);
  return response.data;
};

/**
 * 특정 서브카테고리의 도서 조회
 */
export const getBooksBySubcategoryId = async (subcategoryId: number): Promise<Book[]> => {
  const response = await axios.get<Book[]>(`/book/subcategory/${subcategoryId}`);
  return response.data;
};

/**
 * 새 도서 생성
 */
export const createBook = async (bookData: CreateBookDto): Promise<Book> => {
  const response = await axios.post<Book>('/book', bookData);
  return response.data;
};

/**
 * 도서 업데이트
 */
export const updateBook = async (id: number, bookData: UpdateBookDto): Promise<Book> => {
  const response = await axios.patch<Book>(`/book/${id}`, bookData);
  return response.data;
};

/**
 * 도서 삭제
 */
export const deleteBook = async (id: number): Promise<void> => {
  await axios.delete(`/book/${id}`);
};

/**
 * 도서를 발견하기 카테고리에 추가
 */
export const addBookToDiscoverCategory = async (
  bookId: number | undefined,
  discoverCategoryId: number,
  discoverSubCategoryId?: number,
  isbn?: string
): Promise<Book> => {
  const response = await axios.post<Book>(
    '/book/discover/add',
    {},
    {
      params: {
        bookId: bookId && bookId > 0 ? bookId : undefined,
        isbn: (!bookId || bookId <= 0) && isbn ? isbn : undefined,
        discoverCategoryId,
        discoverSubCategoryId,
      },
    }
  );
  return response.data;
};

/**
 * 도서를 발견하기 카테고리에서 제거
 */
export const removeBookFromDiscoverCategory = async (bookId: number): Promise<Book> => {
  const response = await axios.post<Book>(
    '/book/discover/remove',
    {},
    {
      params: { bookId },
    }
  );
  return response.data;
};

/**
 * 발견하기 도서 조회 (무한 스크롤 지원)
 * 발견하기 카테고리, 서브카테고리, 정렬, 기간 필터링 지원
 */
export const getDiscoverBooks = async (
  params: DiscoverBooksParams
): Promise<BookSearchResponse> => {
  const response = await axios.get<BookSearchResponse>('/book/discover', {
    params,
  });
  return response.data;
};

/**
 * 발견하기 카테고리 통계 조회 (단순 모의 데이터 반환)
 */
export const getDiscoverBooksStats = async (): Promise<any> => {
  // 간단한 모의 데이터 반환
  return {
    categories: [],
    stats: {
      totalBooks: 0,
    },
  };
};
