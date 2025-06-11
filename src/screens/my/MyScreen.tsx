import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAtomValue } from 'jotai';
import { userAtom } from '../../atoms/user';
import { ProfileScreen } from '../profile/ProfileScreen';

export const MyScreen: React.FC = () => {
  const user = useAtomValue(userAtom);

  // 로그인하지 않은 경우 처리
  if (!user) {
    return (
      <View style={styles.container}>
        {/* TODO: 로그인 필요 화면 또는 로그인 화면으로 리다이렉트 */}
      </View>
    );
  }

  // 자신의 프로필을 보여주기 위해 userId를 전달
  // React Navigation의 route params를 시뮬레이션
  // 실제로는 navigation.navigate('Profile', { userId: user.id })로 이동해야 함
  return (
    <View style={styles.container}>
      <ProfileScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingVertical: 16,
    gap: 20,
  },
});
