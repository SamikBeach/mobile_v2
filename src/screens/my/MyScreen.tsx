import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useAtomValue } from 'jotai';
import { userAtom } from '../../atoms/user';
import { ProfileScreen } from '../profile/ProfileScreen';

export const MyScreen: React.FC = () => {
  const user = useAtomValue(userAtom);

  // 로그인하지 않은 경우 처리
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.loginRequiredContainer}>
          <Text style={styles.loginRequiredText}>로그인이 필요합니다</Text>
        </View>
      </View>
    );
  }

  // 현재 사용자의 프로필을 보여주기 위해 ProfileScreen을 렌더링
  return (
    <View style={styles.container}>
      <ProfileScreen userId={user.id} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loginRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginRequiredText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
