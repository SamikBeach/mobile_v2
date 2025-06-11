import React, { Suspense } from 'react';
import { View, Text } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationBadgeProps } from '../../types/notification';

function NotificationBadgeContent({ count }: NotificationBadgeProps) {
  // 항상 읽지 않은 알림 수는 확인해야 함 (드롭다운 상태와 무관하게)
  const { unreadCount } = useNotifications();
  const badgeCount = count !== undefined ? count : unreadCount;

  return (
    <>
      <Bell size={18} color='#6B7280' />
      {badgeCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#ef4444',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: '500',
              color: 'white',
              textAlign: 'center',
            }}
          >
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
    </>
  );
}

function NotificationBadgeLoading() {
  return <Bell size={18} color='#6B7280' />;
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
  return (
    <Suspense fallback={<NotificationBadgeLoading />}>
      <NotificationBadgeContent count={count} />
    </Suspense>
  );
}
