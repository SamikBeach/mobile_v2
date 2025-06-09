import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useAtom } from 'jotai';
import { userAtom } from '../atoms/user';
import { authUtils } from '../apis/axios';
import Toast from 'react-native-toast-message';

export const useDeepLink = () => {
  const [, setUser] = useAtom(userAtom);

  useEffect(() => {
    console.log('🔧 useDeepLink 훅 초기화됨');

    // 앱이 시작될 때 초기 URL 확인
    const getInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        console.log('🚀 앱 시작시 초기 URL:', initialUrl);
        if (initialUrl) {
          // 약간의 지연을 두고 처리 (앱 초기화 완료 후)
          setTimeout(() => {
            handleDeepLink(initialUrl);
          }, 500);
        }
      } catch (error) {
        console.error('❌ 초기 URL 가져오기 실패:', error);
      }
    };

    // URL 변경 리스너 등록
    const subscription = Linking.addEventListener('url', event => {
      console.log('📲 URL 이벤트 수신:', event);
      handleDeepLink(event.url);
    });

    console.log('🎧 Deep Link 리스너 등록됨');

    getInitialURL();

    return () => {
      console.log('🔧 useDeepLink 정리됨');
      subscription?.remove();
    };
  }, []);

  const handleDeepLink = async (url: string) => {
    console.log('🔗 Deep Link 수신:', url);

    // OAuth 콜백 URL인지 확인
    if (url.startsWith('miyuk-books://auth/callback')) {
      console.log('✅ OAuth 콜백 Deep Link 감지됨');

      // URL 파싱 결과도 로깅
      const parsedUrl = new URL(url);
      console.log('📝 파싱된 URL 정보:', {
        href: parsedUrl.href,
        searchParams: Object.fromEntries(parsedUrl.searchParams.entries()),
      });
      try {
        const parsedUrl = new URL(url);

        // 에러 체크
        const error = parsedUrl.searchParams.get('error');
        if (error) {
          const errorMessage = decodeURIComponent(error);
          console.error('OAuth 에러:', errorMessage);
          Toast.show({
            type: 'error',
            text1: '로그인 실패',
            text2: errorMessage,
            position: 'top',
            visibilityTime: 4000,
          });
          return;
        }

        // 토큰 추출
        const accessToken = parsedUrl.searchParams.get('token');
        const refreshToken = parsedUrl.searchParams.get('refreshToken');
        const userParam = parsedUrl.searchParams.get('user');

        if (!accessToken || !refreshToken) {
          throw new Error('인증 토큰을 받지 못했습니다.');
        }

        // 토큰 저장
        await authUtils.setTokens(accessToken, refreshToken);

        // 사용자 정보 파싱 및 설정
        if (userParam) {
          try {
            const user = JSON.parse(decodeURIComponent(userParam));
            setUser(user);
            console.log('사용자 정보 설정 완료:', user);
          } catch (parseError) {
            console.warn('사용자 정보 파싱 실패:', parseError);
          }
        }

        Toast.show({
          type: 'success',
          text1: '로그인 성공',
          text2: '환영합니다!',
          position: 'top',
          visibilityTime: 2000,
        });

        console.log('OAuth 로그인 완료');
      } catch (error) {
        console.error('Deep Link 처리 오류:', error);
        Toast.show({
          type: 'error',
          text1: '로그인 처리 실패',
          text2: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
          position: 'top',
          visibilityTime: 4000,
        });
      }
    }
  };

  return { handleDeepLink };
};
