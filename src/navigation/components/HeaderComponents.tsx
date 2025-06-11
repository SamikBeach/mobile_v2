import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Send, Search, Settings } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAtom } from 'jotai';
import { Logo } from '../../components/Logo/Logo';
import { NotificationBadge } from '../../components/notification/NotificationBadge';
import { userAtom } from '../../atoms/user';

export const HeaderLeft = () => (
  <View style={styles.headerLeft}>
    <Logo size='md' />
  </View>
);

export const HeaderRight = () => {
  const navigation = useNavigation();
  const [user] = useAtom(userAtom);

  const handleSearchPress = () => {
    navigation.navigate('Search' as never);
  };

  const handleSendPress = () => {
    navigation.navigate('Feedback' as never);
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification' as never);
  };

  const handleSettingsPress = () => {
    navigation.navigate('User' as never);
  };

  return (
    <View style={styles.headerRight}>
      <TouchableOpacity style={styles.iconButton} onPress={handleSearchPress}>
        <Search size={20} color='#6B7280' />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.iconButton, styles.iconButtonSpacing]}
        onPress={handleSendPress}
      >
        <Send size={20} color='#6B7280' />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.iconButton, styles.iconButtonSpacing]}
        onPress={handleNotificationPress}
      >
        <NotificationBadge />
      </TouchableOpacity>

      {user && (
        <TouchableOpacity
          style={[styles.iconButton, styles.iconButtonSpacing]}
          onPress={handleSettingsPress}
        >
          <Settings size={20} color='#6B7280' />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerLeft: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonSpacing: {
    marginLeft: 8,
  },
});
