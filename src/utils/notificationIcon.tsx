import React from 'react';
import { View, Text, Image } from 'react-native';
import { Bell, BookOpen, MessageSquare, ThumbsUp, User } from 'lucide-react-native';
import { Notification } from '../types/notification';

export function renderNotificationIcon(notification: Notification) {
  // 사용자가 있는 경우 항상 아바타 표시
  if (notification.actor) {
    return (
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#f3f4f6',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {notification.actor.profileImage ? (
          <Image
            source={{ uri: notification.actor.profileImage }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <Text style={{ color: '#6b7280', fontSize: 16, fontWeight: '600' }}>
            {notification.actor.username.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
    );
  } else if (notification.user) {
    // 이전 방식 호환성 유지
    return (
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#f3f4f6',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {notification.user.profileImage ? (
          <Image
            source={{ uri: notification.user.profileImage }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <Text style={{ color: '#6b7280', fontSize: 16, fontWeight: '600' }}>
            {notification.user.username.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
    );
  }

  // 사용자 정보가 없는 경우 타입별 아이콘 표시
  const iconSize = 20;

  switch (notification.type) {
    case 'library_update':
      return (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#dcfce7',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BookOpen size={iconSize} color='#16a34a' />
        </View>
      );
    case 'library_subscribe':
      return (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#dbeafe',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BookOpen size={iconSize} color='#2563eb' />
        </View>
      );
    case 'follow':
      return (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#fef3c7',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <User size={iconSize} color='#d97706' />
        </View>
      );
    case 'like':
      return (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#fce7f3',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ThumbsUp size={iconSize} color='#ec4899' />
        </View>
      );
    case 'comment_like':
      return (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#fee2e2',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ThumbsUp size={iconSize} color='#ef4444' />
        </View>
      );
    case 'comment':
      return (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#f3e8ff',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MessageSquare size={iconSize} color='#a855f7' />
        </View>
      );
    case 'system':
    default:
      return (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#f3f4f6',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bell size={iconSize} color='#6b7280' />
        </View>
      );
  }
}
