import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { register } from '../../apis/auth';

interface UserInfoFormProps {
  email: string;
  onSuccess: () => void;
}

export const UserInfoForm: React.FC<UserInfoFormProps> = ({ email, onSuccess }) => {
  // 상태 관리
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signupMutation = useMutation({
    mutationFn: () =>
      register({
        email,
        password,
        username,
        marketingConsent: false,
      }),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: '회원 정보 등록 완료',
        text2: '이메일 인증을 진행해주세요.',
        position: 'top',
        visibilityTime: 3000,
      });
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해주세요.';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: '회원 정보 등록 실패',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
    },
  });

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    setError(null);

    // 유효성 검사
    if (!username) {
      setError('사용자 이름을 입력해주세요.');
      return;
    }

    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    signupMutation.mutate();
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>회원 정보 입력</Text>
        <Text style={styles.subtitle}>미역서점에서 사용할 정보를 입력해주세요</Text>
      </View>

      <View style={styles.formContainer}>
        {/* 이메일 (비활성화) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>이메일</Text>
          <TextInput style={[styles.input, styles.disabledInput]} value={email} editable={false} />
        </View>

        {/* 사용자 이름 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>사용자 이름</Text>
          <TextInput
            style={styles.input}
            placeholder='사용자 이름'
            placeholderTextColor='#9CA3AF'
            value={username}
            onChangeText={text => {
              setUsername(text);
              setError(null);
            }}
            autoCapitalize='none'
            autoComplete='name'
            autoCorrect={false}
          />
        </View>

        {/* 비밀번호 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>비밀번호</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder='비밀번호 (8자 이상)'
              placeholderTextColor='#9CA3AF'
              value={password}
              onChangeText={text => {
                setPassword(text);
                setError(null);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize='none'
              autoComplete='new-password'
              autoCorrect={false}
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
        </View>

        {/* 비밀번호 확인 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>비밀번호 확인</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder='비밀번호 확인'
              placeholderTextColor='#9CA3AF'
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                setError(null);
              }}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize='none'
              autoComplete='new-password'
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={16} color='#9CA3AF' />
              ) : (
                <Eye size={16} color='#9CA3AF' />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 에러 메시지 */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* 다음 단계 버튼 */}
        <TouchableOpacity
          style={[styles.submitButton, signupMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={signupMutation.isPending}
        >
          {signupMutation.isPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='small' color='white' />
              <Text style={styles.buttonText}>처리 중...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>다음 단계로</Text>
          )}
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
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.025,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  formContainer: {
    gap: 12,
  },
  inputContainer: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
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
  disabledInput: {
    backgroundColor: '#F3F4F6',
    opacity: 0.8,
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
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444',
  },
  submitButton: {
    height: 40,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonDisabled: {
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
});
