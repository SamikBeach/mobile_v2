import React from 'react';
import { Text } from 'react-native';
import { Notification } from '../types/notification';

export function renderNotificationContent(notification: Notification) {
  // 액터 이름 (알림 주체)
  const actorName = notification.actor?.username || notification.user?.username || '누군가';

  // 콘텐츠 정보 추출
  const reviewContent = notification.review?.content || '';

  // 서재 업데이트인 경우 책 제목 추출
  let bookTitle = '';
  let bookCover = '';

  if (notification.type === 'library_update') {
    // book 속성이 있으면 직접 사용
    if (notification.book) {
      bookTitle = notification.book.title || '';
      bookCover = notification.book.coverImage || '';
    }
    // content에서 책 제목 추출
    else if (notification.content) {
      const contentMatch = notification.content.match(/'([^']+)'/);
      if (contentMatch && contentMatch[1]) {
        bookTitle = contentMatch[1];
      }
    }
  } else {
    // 다른 타입의 알림은 기존 로직 사용
    bookTitle = notification.review?.books?.[0]?.title || '';
    bookCover = notification.review?.books?.[0]?.coverImage || '';
  }

  const commentContent = notification.comment?.content || '';
  const libraryName = notification.library?.name || '';

  // 리뷰 내용 요약
  const shortReviewContent = reviewContent
    ? reviewContent.length > 30
      ? `${reviewContent.substring(0, 30)}...`
      : reviewContent
    : '';

  // 댓글 내용 요약
  const shortCommentContent = commentContent
    ? commentContent.length > 30
      ? `${commentContent.substring(0, 30)}...`
      : commentContent
    : '';

  // 알림 타입에 따라 다른 컨텐츠 렌더링
  switch (notification.type) {
    case 'comment':
      if (notification.sourceType === 'review') {
        return (
          <Text style={{ fontSize: 14, lineHeight: 20, color: '#374151' }}>
            <Text style={{ fontWeight: '600' }}>{actorName}</Text>님이{' '}
            {bookTitle ? (
              <>
                <Text style={{ fontWeight: '600' }}>{bookTitle}</Text>에 대한 리뷰
              </>
            ) : (
              '리뷰'
            )}
            에 댓글을 남겼습니다.
            {commentContent && (
              <>
                {' '}
                <Text style={{ fontWeight: '600', color: '#374151' }}>"{shortCommentContent}"</Text>
              </>
            )}
          </Text>
        );
      } else {
        return (
          <Text style={{ fontSize: 14, lineHeight: 20, color: '#374151' }}>
            <Text style={{ fontWeight: '600' }}>{actorName}</Text>님이 회원님의 게시글에 댓글을
            남겼습니다.
            {commentContent && (
              <>
                {' '}
                <Text style={{ fontWeight: '600', color: '#374151' }}>"{shortCommentContent}"</Text>
              </>
            )}
          </Text>
        );
      }

    case 'comment_like':
      return (
        <Text style={{ fontSize: 14, lineHeight: 20, color: '#374151' }}>
          <Text style={{ fontWeight: '600' }}>{actorName}</Text>님이{' '}
          {commentContent ? (
            <>
              회원님의 댓글{' '}
              <Text style={{ fontWeight: '600', color: '#374151' }}>"{shortCommentContent}"</Text>을
            </>
          ) : (
            <>회원님의 댓글을</>
          )}{' '}
          좋아합니다.
        </Text>
      );

    case 'like':
      if (notification.sourceType === 'review') {
        return (
          <Text style={{ fontSize: 14, lineHeight: 20, color: '#374151' }}>
            <Text style={{ fontWeight: '600' }}>{actorName}</Text>님이{' '}
            {bookTitle ? (
              <>
                <Text style={{ fontWeight: '600' }}>{bookTitle}</Text>에 대한
                {reviewContent && (
                  <>
                    게시글{' '}
                    <Text style={{ fontWeight: '600', color: '#374151' }}>
                      "{shortReviewContent}"
                    </Text>
                    를
                  </>
                )}
                {!reviewContent && <>게시글을</>}
              </>
            ) : (
              <>
                {reviewContent ? (
                  <>
                    게시글{' '}
                    <Text style={{ fontWeight: '600', color: '#374151' }}>
                      "{shortReviewContent}"
                    </Text>
                    를
                  </>
                ) : (
                  <>게시글을</>
                )}
              </>
            )}{' '}
            좋아합니다.
          </Text>
        );
      } else if (notification.sourceType === 'comment') {
        return (
          <Text style={{ fontSize: 14, lineHeight: 20, color: '#374151' }}>
            <Text style={{ fontWeight: '600' }}>{actorName}</Text>님이{' '}
            {commentContent ? (
              <>
                댓글{' '}
                <Text style={{ fontWeight: '600', color: '#374151' }}>"{shortCommentContent}"</Text>
                을
              </>
            ) : (
              <>회원님의 댓글을</>
            )}{' '}
            좋아합니다.
          </Text>
        );
      } else {
        return (
          <Text style={{ fontSize: 14, lineHeight: 20, color: '#374151' }}>
            <Text style={{ fontWeight: '600' }}>{actorName}</Text>님이{' '}
            {reviewContent ? (
              <>
                게시글{' '}
                <Text style={{ fontWeight: '600', color: '#374151' }}>"{shortReviewContent}"</Text>
                를
              </>
            ) : (
              <>회원님의 게시글을</>
            )}{' '}
            좋아합니다.
          </Text>
        );
      }

    case 'follow':
      return (
        <Text style={{ fontSize: 14, lineHeight: 20, color: '#374151' }}>
          <Text style={{ fontWeight: '600' }}>{actorName}</Text>님이 회원님을 팔로우하기
          시작했습니다.
        </Text>
      );

    case 'library_update':
      return (
        <Text style={{ fontSize: 14, lineHeight: 20, color: '#374151' }}>
          <Text style={{ fontWeight: '600' }}>{actorName}</Text>님이{' '}
          {libraryName ? (
            <>
              <Text style={{ fontWeight: '600' }}>{libraryName}</Text> 서재에
            </>
          ) : (
            '서재에'
          )}{' '}
          {bookTitle ? (
            <>
              <Text style={{ fontWeight: '600' }}>{bookTitle}</Text>을(를)
            </>
          ) : (
            '새 책을'
          )}{' '}
          추가했습니다.
        </Text>
      );

    case 'library_subscribe':
      return (
        <Text style={{ fontSize: 14, lineHeight: 20, color: '#374151' }}>
          <Text style={{ fontWeight: '600' }}>{actorName}</Text>님이{' '}
          {libraryName ? (
            <>
              <Text style={{ fontWeight: '600' }}>{libraryName}</Text> 서재를
            </>
          ) : (
            '회원님의 서재를'
          )}{' '}
          구독하기 시작했습니다.
        </Text>
      );

    case 'system':
      return (
        <Text style={{ fontSize: 14, lineHeight: 20, color: '#374151' }}>
          {notification.content || notification.title}
        </Text>
      );

    default:
      return (
        <Text style={{ fontSize: 14, lineHeight: 20, color: '#374151' }}>
          {notification.content || notification.title}
        </Text>
      );
  }
}
