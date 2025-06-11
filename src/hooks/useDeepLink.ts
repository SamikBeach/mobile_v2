import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useAtom } from 'jotai';
import { userAtom } from '../atoms/user';
import { authUtils } from '../apis/axios';
import Toast from 'react-native-toast-message';
import { getCurrentUser } from '../apis/user';
import { UserStatus } from '../apis/auth/types';

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

        if (!accessToken || !refreshToken) {
          throw new Error('인증 토큰을 받지 못했습니다.');
        }

        // 토큰 저장
        await authUtils.setTokens(accessToken, refreshToken);

        // 사용자 정보 API 호출
        try {
          const userResponse = await getCurrentUser();
          const userDetailDto = 'user' in userResponse ? userResponse.user : userResponse;

          // UserDetailDto를 User 타입으로 변환
          const userData = {
            ...userDetailDto,
            email: userDetailDto.email || '',
            status: UserStatus.ACTIVE,
            isEmailVerified: true,
            marketingConsent: false,
            updatedAt: new Date(),
          };

          setUser(userData);
          console.log('사용자 정보 설정 완료:', userData);
        } catch (getUserError) {
          console.error('사용자 정보 조회 실패:', getUserError);
          throw new Error('사용자 정보를 가져오는데 실패했습니다.');
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
