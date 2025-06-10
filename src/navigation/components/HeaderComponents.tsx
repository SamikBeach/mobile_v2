import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, Send, Settings } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Logo } from '../../components/Logo/Logo';
import { NotificationBadge } from '../../components/notification/NotificationBadge';
import { useFeedback } from '../../contexts/FeedbackContext';

export const HeaderLeft = () => (
  <View style={styles.headerLeft}>
    <Logo size='md' />
  </View>
);

export const HeaderRight = () => {
  const navigation = useNavigation();
  const { openFeedback } = useFeedback();

  const handleSearchPress = () => {
    navigation.navigate('Search' as never);
  };

  const handleSendPress = () => {
    openFeedback();
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification' as never);
  };

  const handleSettingsPress = () => {
    console.log('Settings pressed');
  };

  return (
    <View style={styles.headerRight}>
      <TouchableOpacity style={styles.iconButton} onPress={handleSearchPress}>
        <Search size={20} color='#6B7280' />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconButton} onPress={handleSendPress}>
        <Send size={20} color='#6B7280' />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconButton} onPress={handleNotificationPress}>
        <NotificationBadge />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconButton} onPress={handleSettingsPress}>
        <Settings size={20} color='#6B7280' />
      </TouchableOpacity>
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
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
