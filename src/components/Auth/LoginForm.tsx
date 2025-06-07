import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { login as loginApi } from '../../apis/auth';
import { AuthProvider } from '../../apis/auth/types';
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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  // 로그인 API 뮤테이션
  const loginMutation = useMutation({
    mutationFn: (data: FormData) => loginApi(data),
    onSuccess: () => {
      Alert.alert('성공', '로그인에 성공했습니다.');
      onSuccess?.();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || '로그인에 실패했습니다. 다시 시도해주세요.');
    },
  });

  // 폼 제출 핸들러
  const onSubmit = (data: FormData) => {
    setError(null);
    loginMutation.mutate(data);
  };

  // 소셜 로그인 성공 핸들러
  const handleSocialLoginSuccess = (_user: any) => {
    onSuccess?.();
  };

  // 소셜 로그인 에러 핸들러
  const handleSocialLoginError = (error: string) => {
    setError(error);
  };

  // 로딩 상태 확인
  const isLoading = loginMutation.isPending;

  return (
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
                minLength: {
                  value: 8,
                  message: '비밀번호는 8자 이상이어야 합니다',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                  placeholder='비밀번호'
                  placeholderTextColor='#9CA3AF'
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showPassword}
                  autoCapitalize='none'
                  autoComplete='current-password'
                  autoCorrect={false}
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

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='small' color='white' />
              <Text style={styles.buttonText}>로그인</Text>
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

      <SocialLoginButtons onSuccess={handleSocialLoginSuccess} onError={handleSocialLoginError} />

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpQuestion}>계정이 없으신가요? </Text>
        <TouchableOpacity onPress={onClickSignUp}>
          <Text style={styles.signUpLink}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
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
    paddingRight: 40,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    bottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 16,
    height: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444',
  },
  loginButton: {
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
  },
});
