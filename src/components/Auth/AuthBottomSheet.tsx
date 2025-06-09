import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ArrowLeft } from 'lucide-react-native';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { UserInfoForm } from './UserInfoForm';
import { VerifyCodeForm } from './VerifyCodeForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { PolicyDialogs } from './PolicyDialogs';

// 인증 모드 타입
export type AuthMode =
  | 'login' // 로그인
  | 'signup' // 회원가입 (이메일 입력)
  | 'userInfo' // 회원가입 (사용자 정보 입력)
  | 'verifyCode' // 인증 코드 확인
  | 'resetPassword'; // 비밀번호 재설정

interface AuthBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export const AuthBottomSheet: React.FC<AuthBottomSheetProps> = ({
  isVisible,
  onClose,
  initialMode = 'login',
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  // 현재 인증 모드 상태
  const [mode, setMode] = useState<AuthMode>(initialMode);
  // 회원가입 이메일 저장
  const [email, setEmail] = useState<string>('');
  // 이전 모드 저장용 히스토리
  const [modeHistory, setModeHistory] = useState<AuthMode[]>([]);

  // Bottom sheet snap points
  const snapPoints = useMemo(() => {
    switch (mode) {
      case 'signup':
        return ['95%'];
      case 'userInfo':
      case 'verifyCode':
      case 'resetPassword':
        return ['90%'];
      default:
        return ['75%'];
    }
  }, [mode]);

  // Handle bottom sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  // Backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  // 모드 변경 함수 (히스토리 추적)
  const changeMode = useCallback(
    (newMode: AuthMode) => {
      setModeHistory(prev => [...prev, mode]);
      setMode(newMode);
    },
    [mode]
  );

  // 뒤로가기 함수
  const goBack = useCallback(() => {
    if (modeHistory.length > 0) {
      const prevMode = modeHistory[modeHistory.length - 1];
      setMode(prevMode);
      setModeHistory(prev => prev.slice(0, -1));
    }
  }, [modeHistory]);

  // 이메일 인증 완료 핸들러
  const handleEmailVerified = useCallback(
    (verifiedEmail: string) => {
      setEmail(verifiedEmail);
      changeMode('userInfo');
    },
    [changeMode]
  );

  // 사용자 정보 입력 완료 핸들러
  const handleUserInfoCompleted = useCallback(() => {
    changeMode('verifyCode');
  }, [changeMode]);

  // 회원가입 완료 핸들러
  const handleSignUpSuccess = useCallback(() => {
    onClose();
    // 상태 초기화
    setTimeout(() => {
      setMode(initialMode);
      setEmail('');
      setModeHistory([]);
    }, 200);
  }, [onClose, initialMode]);

  // 로그인 성공 핸들러
  const handleLoginSuccess = useCallback(() => {
    onClose();
    // 상태 초기화
    setTimeout(() => {
      setMode(initialMode);
      setEmail('');
      setModeHistory([]);
    }, 200);
  }, [onClose, initialMode]);

  // 비밀번호 재설정 성공 핸들러
  const handleResetPasswordSuccess = useCallback(() => {
    changeMode('login');
  }, [changeMode]);

  // 현재 모드가 로그인이 아닌지 확인
  const showBackButton = mode !== 'login';

  // BottomSheet가 visible 상태가 변경될 때 처리
  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
      // 상태 초기화
      setTimeout(() => {
        setMode(initialMode);
        setEmail('');
        setModeHistory([]);
      }, 200);
    }
  }, [isVisible, initialMode]);

  const getHeaderTitle = () => {
    switch (mode) {
      case 'login':
        return '로그인';
      case 'signup':
        return '회원가입';
      case 'userInfo':
        return '회원가입';
      case 'verifyCode':
        return '인증 코드 확인';
      case 'resetPassword':
        return '비밀번호 재설정';
      default:
        return '로그인';
    }
  };

  return (
    <GestureHandlerRootView
      style={StyleSheet.absoluteFill}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <BottomSheet
        ref={bottomSheetRef}
        index={isVisible ? 0 : -1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={mode === 'login'}
        handleIndicatorStyle={styles.handleIndicator}
        handleStyle={styles.handle}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/* 헤더 - 로고와 뒤로가기 버튼 */}
          <View style={styles.header}>
            {showBackButton && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={goBack}
                accessible={true}
                accessibilityLabel='뒤로 가기'
              >
                <ArrowLeft size={20} color='#374151' />
              </TouchableOpacity>
            )}
            <View style={styles.logoContainer}>
              <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
            </View>
          </View>

          {/* 폼 컨테이너 */}
          <View style={styles.formContainer}>
            {/* 로그인 폼 */}
            {mode === 'login' && (
              <LoginForm
                onClickSignUp={() => changeMode('signup')}
                onClickResetPassword={() => changeMode('resetPassword')}
                onSuccess={handleLoginSuccess}
              />
            )}

            {/* 회원가입 폼 (이메일 입력) */}
            {mode === 'signup' && (
              <SignUpForm
                onClickLogin={() => changeMode('login')}
                onEmailVerified={handleEmailVerified}
                onSuccess={handleSignUpSuccess}
              />
            )}

            {/* 회원가입 폼 (사용자 정보 입력) */}
            {mode === 'userInfo' && (
              <UserInfoForm email={email} onSuccess={handleUserInfoCompleted} />
            )}

            {/* 인증 코드 확인 */}
            {mode === 'verifyCode' && (
              <VerifyCodeForm
                email={email}
                onSuccess={handleSignUpSuccess}
                onClose={() => changeMode('login')}
              />
            )}

            {/* 비밀번호 재설정 */}
            {mode === 'resetPassword' && (
              <ResetPasswordForm
                onSuccess={handleResetPasswordSuccess}
                onClose={() => changeMode('login')}
              />
            )}
          </View>

          {/* 약관 및 개인정보처리방침 링크 */}
          <PolicyDialogs />
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  handleIndicator: {
    backgroundColor: '#E5E7EB',
  },
  handle: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 24,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 18,
    bottom: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
});
