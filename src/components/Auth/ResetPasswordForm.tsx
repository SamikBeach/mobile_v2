import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { requestPasswordReset } from '../../apis/auth';

interface ResetPasswordFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSuccess, onClose }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const resetMutation = useMutation({
    mutationFn: () => requestPasswordReset({ email }),
    onSuccess: () => {
      setIsEmailSent(true);
      Toast.show({
        type: 'success',
        text1: '이메일 전송 완료',
        text2: '비밀번호 재설정 링크를 전송했습니다.',
        position: 'top',
        visibilityTime: 3000,
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || '비밀번호 재설정 요청에 실패했습니다. 다시 시도해주세요.';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: '전송 실패',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
    },
  });

  const handleSubmit = () => {
    setError(null);

    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    resetMutation.mutate();
  };

  if (isEmailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>이메일을 확인해주세요</Text>
          <Text style={styles.subtitle}>{email}로 비밀번호 재설정 링크를 전송했습니다.</Text>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={onSuccess}>
          <Text style={styles.buttonText}>로그인으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>비밀번호 재설정</Text>
        <Text style={styles.subtitle}>
          가입하신 이메일 주소를 입력해주세요. 비밀번호 재설정 링크를 전송해드립니다.
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder='이메일'
            placeholderTextColor='#9CA3AF'
            value={email}
            onChangeText={text => {
              setEmail(text);
              setError(null);
            }}
            keyboardType='email-address'
            autoCapitalize='none'
            autoComplete='email'
            autoCorrect={false}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.submitButton, resetMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={resetMutation.isPending}
        >
          {resetMutation.isPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='small' color='white' />
              <Text style={styles.buttonText}>전송 중...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>재설정 링크 전송</Text>
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
    lineHeight: 16,
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
  inputError: {
    borderColor: '#EF4444',
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
