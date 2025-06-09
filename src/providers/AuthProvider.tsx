import React, { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { userAtom } from '../atoms/user';
import { authUtils } from '../apis/axios';
import { getCurrentUser } from '../apis/user';
import { UserStatus } from '../apis/auth/types';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const setUser = useSetAtom(userAtom);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('[AuthProvider] 토큰 상태 확인 시작...');
        const isAuthenticated = await authUtils.isAuthenticated();
        console.log('[AuthProvider] 토큰 존재 여부:', isAuthenticated);

        if (isAuthenticated) {
          console.log('[AuthProvider] 사용자 정보 조회 중...');
          try {
            // 토큰이 있으면 사용자 정보 조회
            const userResponse = await getCurrentUser();
            console.log('[AuthProvider] API 응답 전체:', JSON.stringify(userResponse, null, 2));

            // API 응답 구조 확인 및 안전한 접근
            let userData;
            if ('user' in userResponse && userResponse.user) {
              userData = userResponse.user;
              console.log('[AuthProvider] userResponse.user 사용');
            } else if ('id' in userResponse) {
              // userResponse 자체가 사용자 데이터인 경우
              userData = userResponse as any;
              console.log('[AuthProvider] userResponse 직접 사용');
            } else {
              console.error('[AuthProvider] 알 수 없는 응답 구조:', userResponse);
              throw new Error('사용자 데이터 형식이 올바르지 않습니다');
            }

            console.log('[AuthProvider] 추출된 사용자 데이터:', JSON.stringify(userData, null, 2));

            if (!userData || !userData.id) {
              throw new Error('사용자 데이터가 올바르지 않습니다');
            }

            // UserDetailDto를 User 타입으로 변환
            const user = {
              id: userData.id,
              email: userData.email || '',
              username: userData.username,
              profileImage: userData.profileImage,
              bio: userData.bio,
              provider: userData.provider,
              status: UserStatus.ACTIVE,
              isEmailVerified: true,
              marketingConsent: false,
              createdAt: userData.createdAt || new Date(),
              updatedAt: new Date(),
            };
            setUser(user);
            console.log('[AuthProvider] 로그인 상태 복원 완료');
          } catch (getUserError) {
            console.error('[AuthProvider] 사용자 정보 조회 실패:', getUserError);
            // 사용자 정보 조회 실패시 토큰 제거하고 로그아웃 상태
            await authUtils.removeTokens();
            setUser(null);
          }
        } else {
          // 토큰이 없으면 null로 설정
          console.log('[AuthProvider] 토큰이 없음. 로그아웃 상태로 설정');
          setUser(null);
        }
      } catch (error) {
        console.error('[AuthProvider] 인증 초기화 오류:', error);
        // 에러 발생 시 토큰 제거하고 로그아웃 상태로 설정
        console.log('[AuthProvider] 토큰 제거 후 로그아웃 상태로 설정');
        await authUtils.removeTokens();
        setUser(null);
      } finally {
        setIsInitialized(true);
        console.log('[AuthProvider] 인증 초기화 완료');
      }
    };

    initializeAuth();
  }, [setUser]);

  // 초기화가 완료될 때까지 children을 렌더링하지 않음
  // 이렇게 하면 로그인 상태가 확정되기 전에 화면이 깜빡이는 것을 방지
  if (!isInitialized) {
    return null; // 또는 로딩 스피너 컴포넌트
  }

  return <>{children}</>;
};
