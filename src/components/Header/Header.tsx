import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings, Bell, Send } from 'lucide-react-native';
import { Logo } from '../Logo/Logo';
import { SearchBar } from '../SearchBar/SearchBar';

interface HeaderProps {
  onSearchPress?: () => void;
  onSendPress?: () => void;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchPress,
  onSendPress,
  onNotificationPress,
  onSettingsPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* Left Section - Logo */}
        <View style={styles.leftSection}>
          <TouchableOpacity>
            <Logo size='md' />
          </TouchableOpacity>
        </View>

        {/* Right Section - Icons */}
        <View style={styles.rightSection}>
          <SearchBar onPress={onSearchPress} />

          <TouchableOpacity style={styles.iconButton} onPress={onSendPress}>
            <Send size={18} color='#6B7280' />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
            <Bell size={18} color='#6B7280' />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
            <Settings size={18} color='#6B7280' />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(229, 231, 235, 0.5)', // border-gray-200/50
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, // 좀 더 넓은 패딩
    paddingVertical: 8,
    minHeight: 56,
  },
  leftSection: {
    flex: 0,
    alignItems: 'flex-start',
  },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // 첨부 이미지에 맞게 간격 조정
    flex: 1,
    justifyContent: 'flex-end',
  },

  iconButton: {
    width: 36, // 첨부 이미지에 맞게 크기 조정
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
