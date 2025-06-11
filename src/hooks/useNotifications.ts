import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useState, useMemo, useEffect } from 'react';
import {
  getExtendedNotifications,
  getUnreadNotificationCount,
  updateNotification,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../apis/notification';
import { ExtendedNotificationResponse, ExtendedNotification } from '../apis/notification/types';
import { Notification } from '../types/notification';

/**
 * 알림 기능을 위한 커스텀 훅
 * Suspense와 함께 사용하며, 알림 목록, 읽지 않은 알림 수, 그리고 관련 액션을 제공합니다.
 * 무한 스크롤을 지원합니다.
 */
export function useNotifications(initialLimit = 10, isOpen = false) {
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  // 알림 목록 가져오기 (무한 스크롤)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    error: queryError,
  } = useInfiniteQuery<ExtendedNotificationResponse>({
    queryKey: ['notifications-infinite'],
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      try {
        const result = await getExtendedNotifications(page, initialLimit);
        return result;
      } catch (err) {
        console.error('[알림 API] 알림 목록 오류:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // API 에러 시 빈 데이터 반환
        return {
          notifications: [],
          total: 0,
        };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.notifications.length, 0);
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    enabled: isOpen,
  });

  // 모든 페이지의 알림을 합쳐서 단일 배열로 만듦
  const notifications = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => page.notifications);
  }, [data]);

  // 총 알림 개수
  const total = useMemo(() => {
    if (!data || data.pages.length === 0) return 0;
    return data.pages[0].total;
  }, [data]);

  // 읽지 않은 알림 수 가져오기
  const {
    data: unreadCount,
    refetch: refetchUnreadCount,
    error: unreadCountError,
  } = useSuspenseQuery<number>({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      try {
        const count = await getUnreadNotificationCount();
        return count;
      } catch (err) {
        console.error('[알림 API] 읽지 않은 알림 수 오류:', err);
        return 0;
      }
    },
    retry: 1,
  });

  // 오류 로깅
  useEffect(() => {
    if (queryError) {
      console.error('[알림 API] 알림 목록 쿼리 오류:', queryError);
    }
    if (unreadCountError) {
      console.error('[알림 API] 읽지 않은 알림 수 쿼리 오류:', unreadCountError);
    }
  }, [queryError, unreadCountError]);

  // 알림 읽음 처리 mutation
  const { mutate: markAsRead, error: markAsReadError } = useMutation({
    mutationFn: async (id: number) => {
      try {
        return await updateNotification(id, true);
      } catch (err) {
        console.error(`[알림 API] 알림 읽음 처리 오류: ID ${id}`, err);
        throw err;
      }
    },
    onSuccess: () => {
      refetch();
      refetchUnreadCount();
    },
  });

  // 모든 알림 읽음 처리 mutation
  const { mutate: markAllAsReadMutation, error: markAllAsReadError } = useMutation({
    mutationFn: async () => {
      try {
        return await markAllAsRead();
      } catch (err) {
        console.error('[알림 API] 모든 알림 읽음 처리 오류:', err);
        throw err;
      }
    },
    onSuccess: () => {
      refetch();
      refetchUnreadCount();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // 알림 삭제 mutation
  const { mutate: deleteNotificationMutation, error: deleteNotificationError } = useMutation({
    mutationFn: async (id: number) => {
      try {
        return await deleteNotification(id);
      } catch (err) {
        console.error(`[알림 API] 알림 삭제 오류: ID ${id}`, err);
        throw err;
      }
    },
    onSuccess: () => {
      refetch();
      refetchUnreadCount();
    },
  });

  // 모든 알림 삭제 mutation
  const { mutate: deleteAllNotificationsMutation, error: deleteAllNotificationsError } =
    useMutation({
      mutationFn: async () => {
        try {
          return await deleteAllNotifications();
        } catch (err) {
          console.error('[알림 API] 모든 알림 삭제 오류:', err);
          throw err;
        }
      },
      onSuccess: () => {
        refetch();
        refetchUnreadCount();
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
    });

  // 알림 시간 포매팅 (상대적 시간으로 변환)
  const formatNotificationTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) {
        return '방금 전';
      } else if (diffMinutes < 60) {
        return `${diffMinutes}분 전`;
      } else if (diffHours < 24) {
        return `${diffHours}시간 전`;
      } else if (diffDays < 7) {
        return `${diffDays}일 전`;
      } else {
        return date.toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric',
        });
      }
    } catch (err) {
      console.error('[알림] 시간 포매팅 오류:', err);
      return '알 수 없음';
    }
  };

  // 알림 링크 생성
  const getNotificationLink = (notification: Notification): string => {
    if (notification.linkUrl) {
      return notification.linkUrl;
    }

    // sourceType과 sourceId를 기반으로 링크 생성
    if (notification.sourceType && notification.sourceId) {
      switch (notification.sourceType) {
        case 'review':
          return `/reviews/${notification.sourceId}`;
        case 'library':
          return `/libraries/${notification.sourceId}`;
        case 'user':
          return `/users/${notification.sourceId}`;
        case 'book':
          return `/books/${notification.sourceId}`;
        default:
          return '/';
      }
    }

    return '/';
  };

  return {
    notifications,
    unreadCount: unreadCount || 0,
    total,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    markAsRead,
    markAllAsReadMutation,
    deleteNotification: deleteNotificationMutation,
    deleteAllNotifications: deleteAllNotificationsMutation,
    formatNotificationTime,
    getNotificationLink,
    error:
      error ||
      markAsReadError ||
      markAllAsReadError ||
      deleteNotificationError ||
      deleteAllNotificationsError,
    queryError,
  };
}
