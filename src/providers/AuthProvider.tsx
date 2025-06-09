import React, { useEffect } from 'react';
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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuthenticated = await authUtils.isAuthenticated();

        if (isAuthenticated) {
          // 토큰이 있으면 사용자 정보 조회
          const userResponse = await getCurrentUser();
          // UserDetailDto를 User 타입으로 변환
          const user = {
            ...userResponse.user,
            email: userResponse.user.email || '',
            status: UserStatus.ACTIVE,
            isEmailVerified: true,
            marketingConsent: false,
            updatedAt: new Date(),
          };
          setUser(user);
        } else {
          // 토큰이 없으면 null로 설정
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // 에러 발생 시 토큰 제거하고 로그아웃 상태로 설정
        await authUtils.removeTokens();
        setUser(null);
      }
    };

    initializeAuth();
  }, [setUser]);

  return <>{children}</>;
};
