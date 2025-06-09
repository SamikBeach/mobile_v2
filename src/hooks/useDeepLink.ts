import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useSetAtom } from 'jotai';
import Toast from 'react-native-toast-message';
import { userAtom } from '../atoms/user';
import { authUtils } from '../apis/axios';

export const useDeepLink = () => {
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    // 앱이 실행 중일 때 Deep Link 처리
    const handleDeepLink = async (url: string) => {
      console.log('Deep Link 수신:', url);

      try {
        const urlObject = new URL(url);
        console.log('Deep Link 파싱 결과:', {
          href: urlObject.href,
          pathname: urlObject.pathname,
          search: urlObject.search,
          searchParams: Object.fromEntries(urlObject.searchParams.entries()),
        });

        // OAuth 콜백 처리
        if (urlObject.pathname === '/auth/callback') {
          const accessToken = urlObject.searchParams.get('token');
          const refreshToken = urlObject.searchParams.get('refreshToken');
          const userParam = urlObject.searchParams.get('user');
          const error = urlObject.searchParams.get('error');

          console.log('OAuth 콜백 파라미터 상세:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            hasUserParam: !!userParam,
            error,
            accessTokenPreview: accessToken ? `${accessToken.substring(0, 10)}...` : null,
            refreshTokenPreview: refreshToken ? `${refreshToken.substring(0, 10)}...` : null,
          });

          if (error) {
            const errorMessage = decodeURIComponent(error);
            console.error('OAuth Deep Link 오류:', errorMessage);
            Toast.show({
              type: 'error',
              text1: '로그인 실패',
              text2: errorMessage,
              position: 'top',
              visibilityTime: 4000,
            });
            return;
          }

          if (accessToken && refreshToken) {
            let user = null;

            // 사용자 정보 처리
            if (userParam) {
              try {
                user = JSON.parse(decodeURIComponent(userParam));
              } catch (parseError) {
                console.error('Deep Link 사용자 정보 파싱 오류:', parseError);
              }
            }

            // 토큰 저장
            await authUtils.setTokens(accessToken, refreshToken);

            if (user) {
              setUser(user);
            }

            // 성공 토스트
            Toast.show({
              type: 'success',
              text1: '로그인 성공',
              text2: `${user?.username || '사용자'}님, 환영합니다!`,
              position: 'top',
              visibilityTime: 3000,
            });

            console.log('Deep Link OAuth 성공:', { user });

            // TODO: 로그인 성공 시 추가 처리 필요한 경우 여기에 작성
            // 예: 모달 닫기, 페이지 이동 등
          }
        }
      } catch (error) {
        console.error('Deep Link 처리 오류:', error);
        Toast.show({
          type: 'error',
          text1: '링크 처리 오류',
          text2: '링크를 처리하는 중 오류가 발생했습니다.',
          position: 'top',
          visibilityTime: 4000,
        });
      }
    };

    // 앱이 실행 중일 때 수신되는 링크 처리
    const subscription = Linking.addEventListener('url', event => {
      handleDeepLink(event.url);
    });

    // 앱이 종료된 상태에서 링크로 실행된 경우 처리
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => subscription?.remove();
  }, [setUser]);
};
