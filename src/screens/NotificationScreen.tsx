import React, { Suspense, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Bell } from 'lucide-react-native';
import { RootStackParamList } from '../navigation/types';
import { useNotifications } from '../hooks/useNotifications';
import { renderNotificationIcon } from '../utils/notificationIcon';
import { renderNotificationContent } from '../utils/notificationRenderer';
import { NotificationTypeBadge } from '../components/notification/NotificationTypeBadge';
import { PostTypeBadge } from '../components/notification/PostTypeBadge';
import { ExtendedNotification } from '../apis/notification/types';
import { Notification } from '../types/notification';

type NotificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Notification'>;

function NotificationContent() {
  const navigation = useNavigation<NotificationScreenNavigationProp>();
  const {
    notifications,
    unreadCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    markAsRead,
    markAllAsReadMutation,
    deleteAllNotifications,
    formatNotificationTime,
    getNotificationLink,
    error,
    queryError,
  } = useNotifications(10, true);

  // 오류가 있는 경우 오류 메시지 표시
  if (error || queryError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#fee2e2',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <Bell size={32} color='#f87171' />
        </View>
        <Text style={{ fontSize: 14, color: '#ef4444', textAlign: 'center', marginBottom: 12 }}>
          알림을 불러오는 중 오류가 발생했습니다
        </Text>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: '#f87171',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: '#fef2f2',
          }}
          onPress={() => refetch()}
        >
          <Text style={{ fontSize: 12, color: '#dc2626' }}>새로고침</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // UI에 필요한 추가 정보 설정
  const enhancedNotifications = useMemo(() => {
    return notifications.map(notification => ({
      ...notification,
      timestamp: formatNotificationTime(notification.createdAt),
      user: notification.actor || notification.user,
    }));
  }, [notifications, formatNotificationTime]);

  // 알림 클릭 핸들러
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    // 실제 앱에서는 해당 화면으로 이동
    if (notification.linkUrl) {
      // router.push(notification.linkUrl);
    } else if (notification.sourceType && notification.sourceId) {
      const link = getNotificationLink(notification);
      // router.push(link);
    }
  };

  // 무한 스크롤 로드
  const loadMoreNotifications = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* 헤더 */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
          backgroundColor: 'white',
          paddingHorizontal: 12,
          paddingVertical: 12,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>알림</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={{
                height: 28,
                borderRadius: 14,
                paddingHorizontal: 8,
                backgroundColor: 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => markAllAsReadMutation()}
            >
              <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '500' }}>모두 읽음</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity
              style={{
                height: 28,
                borderRadius: 14,
                paddingHorizontal: 8,
                backgroundColor: 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                Alert.alert(
                  '알림 삭제',
                  '모든 알림을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
                  [
                    { text: '취소', style: 'cancel' },
                    {
                      text: '삭제',
                      style: 'destructive',
                      onPress: () => deleteAllNotifications(),
                    },
                  ]
                );
              }}
            >
              <Text style={{ fontSize: 12, color: '#dc2626', fontWeight: '500' }}>전체 삭제</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {enhancedNotifications.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#f9fafb',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Bell size={32} color='#d1d5db' />
          </View>
          <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
            알림이 없습니다
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          onMomentumScrollEnd={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 20;
            if (
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom
            ) {
              loadMoreNotifications();
            }
          }}
        >
          {enhancedNotifications.map((notification, index) => (
            <TouchableOpacity
              key={notification.id}
              style={{
                flexDirection: 'column',
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: !notification.isRead ? '#eff6ff' : 'white',
                borderBottomWidth: index < enhancedNotifications.length - 1 ? 1 : 0,
                borderBottomColor: '#f9fafb',
              }}
              onPress={() => handleNotificationClick(notification)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                {/* 아바타 또는 아이콘 */}
                {renderNotificationIcon(notification)}

                <View style={{ flex: 1, minWidth: 0 }}>
                  {/* 태그와 메시지 */}
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}
                  >
                    <NotificationTypeBadge type={notification.type} />

                    {notification.sourceType && (
                      <PostTypeBadge sourceType={notification.sourceType} />
                    )}

                    {/* 읽지 않음 표시 */}
                    {!notification.isRead && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#3b82f6',
                          marginLeft: 'auto',
                        }}
                      />
                    )}
                  </View>

                  {/* 알림 메시지 */}
                  <View style={{ marginBottom: 6 }}>{renderNotificationContent(notification)}</View>

                  {/* 타임스탬프 */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ fontSize: 11, color: '#9ca3af' }}>{notification.timestamp}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* 무한 스크롤 로더 */}
          {isFetchingNextPage && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
              }}
            >
              <ActivityIndicator size='small' color='#60a5fa' />
            </View>
          )}

          {/* 모든 알림 로드 완료 메시지 */}
          {!hasNextPage && notifications.length > 0 && (
            <View style={{ paddingVertical: 16 }}>
              <Text style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
                모든 알림을 불러왔습니다
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// 로딩 컴포넌트
function NotificationLoading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size='large' color='#3b82f6' />
    </View>
  );
}

export function NotificationScreen() {
  return (
    <Suspense fallback={<NotificationLoading />}>
      <NotificationContent />
    </Suspense>
  );
}
