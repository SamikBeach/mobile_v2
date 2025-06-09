import * as WebBrowser from 'expo-web-browser';
import { AuthProvider } from '../apis/auth/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_SERVER_URL;

if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL 또는 EXPO_PUBLIC_SERVER_URL이 설정되지 않았습니다.');
}

// WebBrowser 완료 후 앱으로 돌아가도록 설정
WebBrowser.maybeCompleteAuthSession();

/**
 * 시스템 브라우저를 사용한 소셜 로그인
 * 이제 Deep Link를 통해 결과를 처리하므로 Promise를 반환하지 않습니다.
 */
export const openSocialLoginPopup = async (provider: AuthProvider): Promise<void> => {
  try {
    // 제공자별 경로 설정
    const getProviderPath = (provider: AuthProvider) => {
      switch (provider) {
        case AuthProvider.GOOGLE:
          return 'google';
        case AuthProvider.APPLE:
          return 'apple';
        case AuthProvider.NAVER:
          return 'naver';
        case AuthProvider.KAKAO:
          return 'kakao';
        default:
          throw new Error('지원하지 않는 로그인 방식입니다.');
      }
    };

    // 백엔드 OAuth URL
    const authUrl = `${API_URL}/auth/${getProviderPath(provider)}`;

    // 리다이렉트 URI 생성 (앱으로 돌아올 URL)
    const redirectUri = 'miyuk-books://auth/callback';

    // 시스템 브라우저에서 OAuth 시작 (모든 파라미터를 쿼리로 전송)
    const params = new URLSearchParams({
      platform: 'app',
      redirect_uri: redirectUri,
      client_type: 'mobile',
      app_scheme: 'miyuk-books',
    });

    const fullAuthUrl = `${authUrl}?${params.toString()}`;

    console.log('OAuth 시작:', {
      provider,
      baseAuthUrl: authUrl,
      fullAuthUrl: fullAuthUrl,
      redirectUri,
      params: params.toString(),
    });

    const result = await WebBrowser.openAuthSessionAsync(fullAuthUrl, redirectUri);

    console.log('OAuth 브라우저 결과:', result);

    // WebBrowser 결과에서 URL이 반환된 경우 수동으로 Deep Link 처리
    if (result.type === 'success' && result.url) {
      console.log('📱 WebBrowser에서 반환된 URL, 수동으로 Deep Link 이벤트 발생:', result.url);

      // DeviceEventEmitter를 사용하여 URL 이벤트 발생
      setTimeout(() => {
        const { DeviceEventEmitter } = require('react-native');
        const eventData = { url: result.url };

        // URL 이벤트 발생
        DeviceEventEmitter.emit('url', eventData);

        console.log('🚀 수동 Deep Link 이벤트 발생 완료');
      }, 100);
    } else if (result.type === 'cancel') {
      throw new Error('로그인이 취소되었습니다.');
    }
  } catch (error) {
    console.error('소셜 로그인 오류:', error);
    throw error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.');
  }
};
