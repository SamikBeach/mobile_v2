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
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Check } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { checkEmail } from '../../apis/auth';
import { openSocialLoginPopup } from '../../utils/oauth';
import { AuthProvider } from '../../apis/auth/types';
import { SocialLoginButtons } from './SocialLoginButtons';
import { AppColors } from '../../constants';

interface SignUpFormProps {
  onClickLogin: () => void;
  onEmailVerified: (email: string) => void;
  onSuccess?: () => void;
}

interface FormData {
  email: string;
  termsAgreed: boolean;
  privacyAgreed: boolean;
  marketingAgreed: boolean;
}

// 커스텀 CheckBox 컴포넌트
const CustomCheckBox: React.FC<{
  checked: boolean;
  onPress: () => void;
  children: React.ReactNode;
}> = ({ checked, onPress, children }) => (
  <View style={styles.checkboxRow}>
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Check size={12} color='white' />}
      </View>
    </TouchableOpacity>
    {children}
  </View>
);

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onClickLogin,
  onEmailVerified,
  onSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    clearErrors,
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      termsAgreed: false,
      privacyAgreed: false,
      marketingAgreed: false,
    },
    mode: 'onSubmit',
  });

  // 현재 체크박스 상태 가져오기
  const termsAgreed = watch('termsAgreed');
  const privacyAgreed = watch('privacyAgreed');
  const marketingAgreed = watch('marketingAgreed');

  // 모든 약관에 동의했는지 확인
  const allAgreed = termsAgreed && privacyAgreed && marketingAgreed;

  // 이메일 확인 API 뮤테이션 (회원가입 1단계)
  const checkEmailMutation = useMutation({
    mutationFn: (email: string) => checkEmail(email),
    onSuccess: data => {
      // 이메일 사용 가능한 경우 다음 단계로 이동
      if (data.isAvailable) {
        Toast.show({
          type: 'success',
          text1: '이메일 확인 완료',
          text2: '사용 가능한 이메일입니다.',
          visibilityTime: 2000,
        });
        onEmailVerified(watch('email'));
      } else {
        const errorMessage = data.message || '이메일을 사용할 수 없습니다.';
        setError(errorMessage);
        Toast.show({
          type: 'error',
          text1: '이메일 사용 불가',
          text2: errorMessage,
          visibilityTime: 4000,
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || '이메일 확인에 실패했습니다. 다시 시도해주세요.';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: '이메일 확인 실패',
        text2: errorMessage,
        visibilityTime: 4000,
      });
    },
  });

  // 모든 약관 동의 핸들러
  const handleAgreeAll = (checked: boolean) => {
    setValue('termsAgreed', checked);
    setValue('privacyAgreed', checked);
    setValue('marketingAgreed', checked);
  };

  // 폼 제출 핸들러
  const onSubmit = (data: FormData) => {
    clearErrors();
    setError(null);
    checkEmailMutation.mutate(data.email);
  };

  // 구글 로그인 핸들러
  const handleGoogleSignUp = async () => {
    clearErrors();
    setError(null);

    try {
      // 브라우저에서 OAuth 프로세스 시작
      // 결과는 Deep Link를 통해 처리됩니다
      await openSocialLoginPopup(AuthProvider.GOOGLE);

      // 성공 콜백 (Deep Link에서 처리하므로 여기서는 브라우저가 열리는 것만 확인)
      console.log('구글 로그인 브라우저 열림');
    } catch (err) {
      console.error('구글 로그인 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '구글 로그인에 실패했습니다.';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: '구글 로그인 실패',
        text2: errorMessage,
        visibilityTime: 4000,
      });
    }
  };

  // 애플 로그인 핸들러
  const handleAppleSignUp = async () => {
    clearErrors();
    setError(null);

    try {
      await openSocialLoginPopup(AuthProvider.APPLE);
      console.log('애플 로그인 브라우저 열림');
    } catch (err) {
      console.error('애플 로그인 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '애플 로그인에 실패했습니다.';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: '애플 로그인 실패',
        text2: errorMessage,
        visibilityTime: 4000,
      });
    }
  };

  // 네이버 로그인 핸들러
  const handleNaverSignUp = async () => {
    clearErrors();
    setError(null);

    try {
      await openSocialLoginPopup(AuthProvider.NAVER);
      console.log('네이버 로그인 브라우저 열림');
    } catch (err) {
      console.error('네이버 로그인 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '네이버 로그인에 실패했습니다.';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: '네이버 로그인 실패',
        text2: errorMessage,
        visibilityTime: 4000,
      });
    }
  };

  // 카카오 로그인 핸들러
  const handleKakaoSignUp = async () => {
    clearErrors();
    setError(null);

    try {
      await openSocialLoginPopup(AuthProvider.KAKAO);
      console.log('카카오 로그인 브라우저 열림');
    } catch (err) {
      console.error('카카오 로그인 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '카카오 로그인에 실패했습니다.';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: '카카오 로그인 실패',
        text2: errorMessage,
        visibilityTime: 4000,
      });
    }
  };

  // 로딩 상태 확인
  const isLoading = checkEmailMutation.isPending;

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>회원가입</Text>
        </View>

        <View style={styles.formContainer}>
          {/* 이메일 입력 */}
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

          {/* 약관 동의 */}
          <View style={styles.termsContainer}>
            {/* 모든 약관 동의 */}
            <CustomCheckBox checked={allAgreed} onPress={() => handleAgreeAll(!allAgreed)}>
              <Text style={styles.checkboxLabel}>모든 약관에 동의합니다</Text>
            </CustomCheckBox>

            <View style={styles.separator} />

            {/* 이용약관 동의 */}
            <Controller
              control={control}
              name='termsAgreed'
              rules={{
                required: '이용약관에 동의해주세요',
                validate: value => value === true || '이용약관에 동의해주세요',
              }}
              render={({ field: { onChange, value } }) => (
                <CustomCheckBox checked={value} onPress={() => onChange(!value)}>
                  <View style={styles.checkboxContent}>
                    <Text style={styles.checkboxLabel}>이용약관 동의</Text>
                    <Text style={styles.requiredText}>(필수)</Text>
                    <TouchableOpacity style={styles.viewButton}>
                      <Text style={styles.viewButtonText}>보기</Text>
                    </TouchableOpacity>
                  </View>
                </CustomCheckBox>
              )}
            />
            {errors.termsAgreed && (
              <Text style={styles.errorText}>{errors.termsAgreed.message}</Text>
            )}

            {/* 개인정보 수집 및 이용 동의 */}
            <Controller
              control={control}
              name='privacyAgreed'
              rules={{
                required: '개인정보 수집 및 이용에 동의해주세요',
                validate: value => value === true || '개인정보 수집 및 이용에 동의해주세요',
              }}
              render={({ field: { onChange, value } }) => (
                <CustomCheckBox checked={value} onPress={() => onChange(!value)}>
                  <View style={styles.checkboxContent}>
                    <Text style={styles.checkboxLabel}>개인정보 수집 및 이용 동의</Text>
                    <Text style={styles.requiredText}>(필수)</Text>
                    <TouchableOpacity style={styles.viewButton}>
                      <Text style={styles.viewButtonText}>보기</Text>
                    </TouchableOpacity>
                  </View>
                </CustomCheckBox>
              )}
            />
            {errors.privacyAgreed && (
              <Text style={styles.errorText}>{errors.privacyAgreed.message}</Text>
            )}

            {/* 마케팅 정보 수신 동의 */}
            <Controller
              control={control}
              name='marketingAgreed'
              render={({ field: { onChange, value } }) => (
                <CustomCheckBox checked={value} onPress={() => onChange(!value)}>
                  <View style={styles.checkboxContent}>
                    <Text style={styles.checkboxLabel}>마케팅 정보 수신 동의</Text>
                    <Text style={styles.optionalText}>(선택)</Text>
                  </View>
                </CustomCheckBox>
              )}
            />
          </View>

          {/* 에러 메시지 */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* 회원가입 버튼 */}
          <TouchableOpacity
            style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size='small' color='white' />
                <Text style={styles.buttonText}>처리 중...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>이메일로 회원가입</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 구분선 */}
        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>또는</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* 소셜 로그인 */}
        <SocialLoginButtons
          onGoogleLogin={handleGoogleSignUp}
          onAppleLogin={handleAppleSignUp}
          onNaverLogin={handleNaverSignUp}
          onKakaoLogin={handleKakaoSignUp}
          onSuccess={onSuccess}
        />

        {/* 로그인 링크 */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginQuestion}>이미 계정이 있으신가요? </Text>
          <TouchableOpacity onPress={onClickLogin}>
            <Text style={styles.loginLink}>로그인</Text>
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
    gap: 20, // 웹의 space-y-5 (20px)
    paddingBottom: 20,
  },
  titleContainer: {
    marginBottom: 4, // 웹의 space-y-1
  },
  title: {
    fontSize: 20, // 웹의 text-xl
    fontWeight: '600', // 웹의 font-semibold
    color: '#111827', // 웹의 text-gray-900
    letterSpacing: -0.025, // 웹의 tracking-tight
  },
  formContainer: {
    gap: 12, // 웹의 space-y-3
  },
  inputContainer: {
    gap: 6, // 웹의 space-y-1.5
  },
  input: {
    height: 40, // 웹의 h-10
    borderRadius: 12, // 웹의 rounded-xl
    borderWidth: 1,
    borderColor: '#E5E7EB', // 웹의 border-gray-200
    backgroundColor: '#F9FAFB', // 웹의 bg-gray-50/50
    paddingHorizontal: 16, // 웹의 px-4
    paddingVertical: 8, // 웹의 py-2
    fontSize: 15,
    color: '#374151',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  termsContainer: {
    borderRadius: 12, // 웹의 rounded-xl
    backgroundColor: '#F9FAFB', // 웹의 bg-gray-50/70
    padding: 14, // 웹의 p-3.5
    gap: 10, // 웹의 space-y-2.5
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // 웹의 space-x-2
  },
  checkboxContainer: {
    // 체크박스 터치 영역만을 위한 컨테이너
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB', // 웹의 border-gray-300
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#111827', // 웹의 bg-gray-900
    borderColor: '#111827',
  },
  checkboxLabel: {
    fontSize: 12, // 웹의 text-xs
    fontWeight: '500', // 웹의 font-medium
    color: '#374151', // 웹의 text-gray-700
  },
  checkboxContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  requiredText: {
    fontSize: 12, // 웹의 text-xs
    color: '#EF4444', // 웹의 text-red-500
    marginLeft: 4, // 웹의 ml-1
  },
  optionalText: {
    fontSize: 12, // 웹의 text-xs
    color: '#6B7280', // 웹의 text-gray-500
    marginLeft: 4, // 웹의 ml-1
  },
  viewButton: {
    paddingLeft: 4, // 웹의 pl-1
  },
  viewButtonText: {
    fontSize: 12, // 웹의 text-xs
    fontWeight: '500', // 웹의 font-medium
    color: '#6B7280', // 웹의 text-gray-500
    textDecorationLine: 'underline',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB', // 웹의 bg-gray-200
    marginVertical: 8, // 웹의 my-2
  },
  errorText: {
    fontSize: 12, // 웹의 text-xs
    fontWeight: '500', // 웹의 font-medium
    color: '#EF4444', // 웹의 text-red-500
    marginTop: 4,
  },
  signUpButton: {
    width: '100%', // 웹의 w-full
    height: 40,
    borderRadius: 12, // 웹의 rounded-xl
    backgroundColor: AppColors.primary, // Tailwind green-600
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500', // 웹의 font-medium
    color: 'white', // 웹의 text-white
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
    paddingHorizontal: 8, // 웹의 px-2
    fontSize: 12, // 웹의 text-xs
    color: '#6B7280', // 웹의 text-gray-500
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginQuestion: {
    fontSize: 12, // 웹의 text-xs
    color: '#6B7280', // 웹의 text-gray-500
  },
  loginLink: {
    fontSize: 12, // 웹의 text-xs
    fontWeight: '500', // 웹의 font-medium
    color: '#374151', // 웹의 text-gray-700
    textDecorationLine: 'underline',
  },
});
