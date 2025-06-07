import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';

interface SocialLoginButtonsProps {
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ onSuccess, onError }) => {
  // Google 로그인 핸들러
  const handleGoogleLogin = async () => {
    try {
      // TODO: 실제 Google 로그인 로직 구현
      console.log('Google 로그인 시도');
      onError('Google 로그인은 아직 구현되지 않았습니다.');
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      onError('Google 로그인에 실패했습니다.');
    }
  };

  // Apple 로그인 핸들러
  const handleAppleLogin = async () => {
    try {
      // TODO: 실제 Apple 로그인 로직 구현
      console.log('Apple 로그인 시도');
      onError('Apple 로그인은 아직 구현되지 않았습니다.');
    } catch (error) {
      console.error('Apple 로그인 오류:', error);
      onError('Apple 로그인에 실패했습니다.');
    }
  };

  // Naver 로그인 핸들러
  const handleNaverLogin = async () => {
    try {
      // TODO: 실제 Naver 로그인 로직 구현
      console.log('Naver 로그인 시도');
      onError('Naver 로그인은 아직 구현되지 않았습니다.');
    } catch (error) {
      console.error('Naver 로그인 오류:', error);
      onError('Naver 로그인에 실패했습니다.');
    }
  };

  // Kakao 로그인 핸들러
  const handleKakaoLogin = async () => {
    try {
      // TODO: 실제 Kakao 로그인 로직 구현
      console.log('Kakao 로그인 시도');
      onError('Kakao 로그인은 아직 구현되지 않았습니다.');
    } catch (error) {
      console.error('Kakao 로그인 오류:', error);
      onError('Kakao 로그인에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        {/* Google */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleGoogleLogin}
          accessibilityLabel='Google로 로그인'
        >
          <Image
            source={require('../../assets/images/google.png')}
            style={styles.socialIcon}
            resizeMode='contain'
          />
        </TouchableOpacity>

        {/* Apple */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleAppleLogin}
          accessibilityLabel='Apple로 로그인'
        >
          <Image
            source={require('../../assets/images/apple.png')}
            style={styles.socialIcon}
            resizeMode='contain'
          />
        </TouchableOpacity>

        {/* Naver */}
        <TouchableOpacity
          style={[styles.socialButton, styles.naverButton]}
          onPress={handleNaverLogin}
          accessibilityLabel='네이버로 로그인'
        >
          <View style={styles.naverIcon}>
            <View style={styles.naverIconInner} />
          </View>
        </TouchableOpacity>

        {/* Kakao */}
        <TouchableOpacity
          style={[styles.socialButton, styles.kakaoButton]}
          onPress={handleKakaoLogin}
          accessibilityLabel='카카오로 로그인'
        >
          <View style={styles.kakaoIcon}>
            <View style={styles.kakaoIconInner} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  naverButton: {
    backgroundColor: '#03C75A',
    borderColor: '#03C75A',
  },
  naverIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  naverIconInner: {
    width: 12,
    height: 12,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    borderColor: '#FEE500',
  },
  kakaoIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kakaoIconInner: {
    width: 12,
    height: 12,
    backgroundColor: '#3A1D1C',
    borderRadius: 6,
  },
});
