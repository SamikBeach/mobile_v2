import React from 'react';
import { View, Text } from 'react-native';
import { Bell, BookOpen, MessageSquare, ThumbsUp, User } from 'lucide-react-native';
import { NotificationTypeBadgeProps } from '../../types/notification';
import { AppColors } from '../../constants';

export function NotificationTypeBadge({ type }: NotificationTypeBadgeProps) {
  const getIcon = () => {
    const iconSize = 14;
    switch (type) {
      case 'like':
        return <ThumbsUp size={iconSize} color='#ec4899' />;
      case 'comment_like':
        return <ThumbsUp size={iconSize} color='#ef4444' />;
      case 'comment':
        return <MessageSquare size={iconSize} color='#a855f7' />;
      case 'follow':
        return <User size={iconSize} color='#d97706' />;
      case 'library_update':
        return <BookOpen size={iconSize} color='#16a34a' />;
      case 'library_subscribe':
        return <BookOpen size={iconSize} color='#2563eb' />;
      default:
        return <Bell size={iconSize} color='#6b7280' />;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'like':
        return '좋아요';
      case 'comment_like':
        return '댓글 좋아요';
      case 'comment':
        return '댓글';
      case 'follow':
        return '팔로우';
      case 'library_update':
        return '서재 업데이트';
      case 'library_subscribe':
        return '서재 구독';
      case 'system':
        return '시스템';
      default:
        return '알림';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'like':
        return '#fce7f3';
      case 'comment_like':
        return '#fee2e2';
      case 'comment':
        return '#f3e8ff';
      case 'follow':
        return '#fef3c7';
      case 'library_update':
        return AppColors.backgroundMedium;
      case 'library_subscribe':
        return '#dbeafe';
      default:
        return '#f3f4f6';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'like':
        return '#ec4899';
      case 'comment_like':
        return '#ef4444';
      case 'comment':
        return '#a855f7';
      case 'follow':
        return '#d97706';
      case 'library_update':
        return '#16a34a';
      case 'library_subscribe':
        return '#2563eb';
      default:
        return '#6b7280';
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: getBgColor(),
      }}
    >
      {getIcon()}
      <Text
        style={{
          fontSize: 10,
          color: getTextColor(),
          fontWeight: '500',
        }}
      >
        {getLabel()}
      </Text>
    </View>
  );
}
