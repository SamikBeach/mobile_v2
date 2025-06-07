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
import { checkEmail } from '../../apis/auth';
import { SocialLoginButtons } from './SocialLoginButtons';

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
        onEmailVerified(watch('email'));
      } else {
        setError(data.message || '이메일을 사용할 수 없습니다.');
      }
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || '이메일 확인에 실패했습니다. 다시 시도해주세요.');
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
    setError(null);
    checkEmailMutation.mutate(data.email);
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
        <SocialLoginButtons onSuccess={handleSocialLoginSuccess} onError={handleSocialLoginError} />

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
  termsContainer: {
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    padding: 14,
    gap: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxContainer: {
    // 체크박스 터치 영역만을 위한 컨테이너
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  checkboxLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  checkboxContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  requiredText: {
    fontSize: 12,
    color: '#EF4444',
  },
  optionalText: {
    fontSize: 12,
    color: '#6B7280',
  },
  viewButton: {
    paddingLeft: 4,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444',
    marginTop: 4,
  },
  signUpButton: {
    height: 40,
    borderRadius: 12,
    backgroundColor: '#16A34A',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginQuestion: {
    fontSize: 12,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
});
