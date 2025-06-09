import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import Toast from 'react-native-toast-message';
import { login } from '../../apis/auth';
import { AuthProvider } from '../../apis/auth/types';
import { authUtils } from '../../apis/axios';
import { userAtom } from '../../atoms/user';
import { openSocialLoginPopup } from '../../utils/oauth';
import { SocialLoginButtons } from './SocialLoginButtons';

interface LoginFormProps {
  onClickSignUp: () => void;
  onClickResetPassword: () => void;
  onSuccess?: () => void;
}

interface FormData {
  email: string;
  password: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onClickSignUp,
  onClickResetPassword,
  onSuccess,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useSetAtom(userAtom);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    clearErrors,
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  // 로그인 API 뮤테이션
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: FormData) => {
      return login({ email, password });
    },
    onSuccess: async response => {
      try {
        // 사용자 정보 atom에 저장
        setUser(response.user);
        // 토큰 저장
        await authUtils.setTokens(response.accessToken, response.refreshToken);

        // 성공 Toast 메시지
        Toast.show({
          type: 'success',
          text1: '로그인 성공',
          text2: `${response.user.username}님, 환영합니다!`,
          position: 'top',
          visibilityTime: 3000,
        });

        onSuccess?.();
      } catch (error) {
        console.error('Login context update failed:', error);
        setError('로그인 처리 중 오류가 발생했습니다.');
        Toast.show({
          type: 'error',
          text1: '로그인 오류',
          text2: '로그인 처리 중 오류가 발생했습니다.',
          position: 'top',
          visibilityTime: 4000,
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
      setFormError('root', {
        type: 'manual',
        message: errorMessage,
      });
      Toast.show({
        type: 'error',
        text1: '로그인 실패',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
    },
  });

  // 폼 제출 핸들러
  const onSubmit = (data: FormData) => {
    clearErrors();
    setError(null);
    loginMutation.mutate(data);
  };

  // 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    clearErrors();
    setError(null);

    try {
      const { accessToken, refreshToken, user } = await openSocialLoginPopup(AuthProvider.GOOGLE);

      // 토큰 및 사용자 정보 저장
      await authUtils.setTokens(accessToken, refreshToken);
      setUser(user);

      // 성공 Toast 메시지
      Toast.show({
        type: 'success',
        text1: '로그인 성공',
        text2: `${user.username}님, 환영합니다!`,
        position: 'top',
        visibilityTime: 3000,
      });

      // 성공 콜백
      onSuccess?.();
    } catch (err) {
      console.error('구글 로그인 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '구글 로그인에 실패했습니다.';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: '구글 로그인 실패',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  // 애플 로그인 핸들러
  const handleAppleLogin = async () => {
    clearErrors();
    setError(null);

    try {
      const { accessToken, refreshToken, user } = await openSocialLoginPopup(AuthProvider.APPLE);

      // 토큰 및 사용자 정보 저장
      await authUtils.setTokens(accessToken, refreshToken);
      setUser(user);

      // 성공 Toast 메시지
      Toast.show({
        type: 'success',
        text1: '로그인 성공',
        text2: `${user.username}님, 환영합니다!`,
        position: 'top',
        visibilityTime: 3000,
      });

      // 성공 콜백
      onSuccess?.();
    } catch (err) {
      console.error('애플 로그인 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '애플 로그인에 실패했습니다.';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: '애플 로그인 실패',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  // 네이버 로그인 핸들러
  const handleNaverLogin = async () => {
    clearErrors();
    setError(null);

    try {
      const { accessToken, refreshToken, user } = await openSocialLoginPopup(AuthProvider.NAVER);

      // 토큰 및 사용자 정보 저장
      await authUtils.setTokens(accessToken, refreshToken);
      setUser(user);

      // 성공 Toast 메시지
      Toast.show({
        type: 'success',
        text1: '로그인 성공',
        text2: `${user.username}님, 환영합니다!`,
        position: 'top',
        visibilityTime: 3000,
      });

      // 성공 콜백
      onSuccess?.();
    } catch (err) {
      console.error('네이버 로그인 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '네이버 로그인에 실패했습니다.';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: '네이버 로그인 실패',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  // 카카오 로그인 핸들러
  const handleKakaoLogin = async () => {
    clearErrors();
    setError(null);

    try {
      const { accessToken, refreshToken, user } = await openSocialLoginPopup(AuthProvider.KAKAO);

      // 토큰 및 사용자 정보 저장
      await authUtils.setTokens(accessToken, refreshToken);
      setUser(user);

      // 성공 Toast 메시지
      Toast.show({
        type: 'success',
        text1: '로그인 성공',
        text2: `${user.username}님, 환영합니다!`,
        position: 'top',
        visibilityTime: 3000,
      });

      // 성공 콜백
      onSuccess?.();
    } catch (err) {
      console.error('카카오 로그인 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '카카오 로그인에 실패했습니다.';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: '카카오 로그인 실패',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  // 로딩 상태 확인
  const isLoading = loginMutation.isPending;

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>로그인</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Controller
              control={control}
              name='email'
              rules={{
                required: '이메일을 입력해주세요',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: '올바른 이메일 형식이 아닙니다',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder='이메일'
                  placeholderTextColor='#9CA3AF'
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoComplete='email'
                  autoCorrect={false}
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <Controller
                control={control}
                name='password'
                rules={{
                  required: '비밀번호를 입력해주세요',
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.passwordInput, errors.password && styles.inputError]}
                    placeholder='비밀번호'
                    placeholderTextColor='#9CA3AF'
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPassword}
                    autoComplete='current-password'
                  />
                )}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={16} color='#9CA3AF' />
                ) : (
                  <Eye size={16} color='#9CA3AF' />
                )}
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>

          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity onPress={onClickResetPassword}>
              <Text style={styles.forgotPasswordText}>비밀번호를 잊으셨나요?</Text>
            </TouchableOpacity>
          </View>

          {(error || errors.root) && (
            <Text style={styles.errorText}>{error || errors.root?.message}</Text>
          )}

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size='small' color='white' />
                <Text style={styles.buttonText}>로그인 중...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>로그인</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>또는</Text>
          <View style={styles.separatorLine} />
        </View>

        <SocialLoginButtons
          onGoogleLogin={handleGoogleLogin}
          onAppleLogin={handleAppleLogin}
          onNaverLogin={handleNaverLogin}
          onKakaoLogin={handleKakaoLogin}
          onSuccess={onSuccess}
        />

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpQuestion}>계정이 없으신가요? </Text>
          <TouchableOpacity onPress={onClickSignUp}>
            <Text style={styles.signUpLink}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    gap: 20,
    paddingBottom: 20,
  },
  titleContainer: {
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.025,
  },
  formContainer: {
    gap: 12,
  },
  inputContainer: {
    gap: 6,
  },
  input: {
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    color: '#374151',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 40,
    fontSize: 15,
    color: '#374151',
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444',
    marginTop: 4,
  },
  loginButton: {
    width: '100%',
    height: 40,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  separatorText: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpQuestion: {
    fontSize: 12,
    color: '#6B7280',
  },
  signUpLink: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textDecorationLine: 'underline',
  },
});
