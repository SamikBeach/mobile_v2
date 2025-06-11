import React from 'react';
import { View, Text } from 'react-native';
import { BookOpen, Hash, MessageSquare, User } from 'lucide-react-native';
import { PostTypeBadgeProps } from '../../types/notification';

export function PostTypeBadge({ sourceType }: PostTypeBadgeProps) {
  if (!sourceType) return null;

  const getIcon = () => {
    const iconSize = 12;
    switch (sourceType) {
      case 'review':
        return <BookOpen size={iconSize} />;
      case 'comment':
        return <MessageSquare size={iconSize} />;
      case 'library':
        return <Hash size={iconSize} />;
      case 'user':
        return <User size={iconSize} />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (sourceType) {
      case 'review':
        return '리뷰';
      case 'comment':
        return '댓글';
      case 'library':
        return '서재';
      case 'user':
        return '프로필';
      default:
        return '';
    }
  };

  const getColor = () => {
    switch (sourceType) {
      case 'review':
        return { bg: '#dbeafe', text: '#2563eb' };
      case 'comment':
        return { bg: '#f3e8ff', text: '#a855f7' };
      case 'library':
        return { bg: '#dcfce7', text: '#16a34a' };
      case 'user':
        return { bg: '#fef3c7', text: '#d97706' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const color = getColor();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: color.bg,
      }}
    >
      {getIcon()}
      <Text
        style={{
          fontSize: 10,
          color: color.text,
          fontWeight: '500',
        }}
      >
        {getLabel()}
      </Text>
    </View>
  );
}
