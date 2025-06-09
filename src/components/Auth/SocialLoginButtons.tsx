import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { GoogleIcon, AppleIcon, NaverIcon, KakaoIcon } from './icons';
import { AuthProvider } from '../../apis/auth/types';
import { openSocialLoginPopup } from '../../utils/oauth';

interface SocialLoginButtonsProps {
  onGoogleLogin?: () => void | Promise<void>;
  onAppleLogin?: () => void | Promise<void>;
  onNaverLogin?: () => void | Promise<void>;
  onKakaoLogin?: () => void | Promise<void>;
  onSuccess?: () => void;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGoogleLogin,
  onAppleLogin,
  onNaverLogin,
  onKakaoLogin,
  onSuccess,
}) => {
  const handleSocialLogin = async (
    provider: AuthProvider,
    customHandler?: () => void | Promise<void>
  ) => {
    try {
      if (customHandler) {
        await customHandler();
      } else {
        const result = await openSocialLoginPopup(provider);
        console.log('소셜 로그인 성공:', result);
        onSuccess?.();
      }
    } catch (error) {
      console.error('소셜 로그인 실패:', error);
      Alert.alert('로그인 실패', '소셜 로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        {/* Google 로그인 */}
        <TouchableOpacity
          style={[styles.socialButton, styles.defaultButton]}
          onPress={() => handleSocialLogin(AuthProvider.GOOGLE, onGoogleLogin)}
        >
          <GoogleIcon size={20} color='#374151' />
        </TouchableOpacity>

        {/* Apple 로그인 */}
        <TouchableOpacity
          style={[styles.socialButton, styles.defaultButton]}
          onPress={() => handleSocialLogin(AuthProvider.APPLE, onAppleLogin)}
        >
          <AppleIcon size={20} color='#374151' />
        </TouchableOpacity>

        {/* Naver 로그인 */}
        <TouchableOpacity
          style={[styles.socialButton, styles.naverButton]}
          onPress={() => handleSocialLogin(AuthProvider.NAVER, onNaverLogin)}
        >
          <NaverIcon size={20} color='white' />
        </TouchableOpacity>

        {/* Kakao 로그인 */}
        <TouchableOpacity
          style={[styles.socialButton, styles.kakaoButton]}
          onPress={() => handleSocialLogin(AuthProvider.KAKAO, onKakaoLogin)}
        >
          <KakaoIcon size={20} color='#3A1D1C' />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16, // 웹의 gap-4 (16px)
  },
  socialButton: {
    width: 48, // 웹의 h-12 w-12 (48px)
    height: 48,
    borderRadius: 24, // rounded-full
    borderWidth: 1,
    borderColor: '#E5E7EB', // border-gray-200
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  defaultButton: {
    // Google, Apple 기본 스타일
  },
  naverButton: {
    backgroundColor: '#03C75A', // 네이버 브랜드 색상
    borderColor: '#03C75A',
  },
  kakaoButton: {
    backgroundColor: '#FEE500', // 카카오 브랜드 색상
    borderColor: '#FEE500',
  },
});
