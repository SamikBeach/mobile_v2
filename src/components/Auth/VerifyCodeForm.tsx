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
import { completeRegistration } from '../../apis/auth';

interface VerifyCodeFormProps {
  email: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const VerifyCodeForm: React.FC<VerifyCodeFormProps> = ({ email, onSuccess, onClose }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const verifyMutation = useMutation({
    mutationFn: () => completeRegistration({ email, code }),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: '회원가입 완료',
        text2: '미역서점에 오신 것을 환영합니다!',
        position: 'top',
        visibilityTime: 3000,
      });
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || '인증에 실패했습니다. 다시 시도해주세요.';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: '인증 실패',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
    },
  });

  const handleSubmit = () => {
    setError(null);

    if (!code) {
      setError('인증 코드를 입력해주세요.');
      return;
    }

    if (code.length !== 6) {
      setError('인증 코드는 6자리여야 합니다.');
      return;
    }

    verifyMutation.mutate();
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>인증 코드 확인</Text>
        <Text style={styles.subtitle}>{email}로 전송된 인증 코드를 입력해주세요</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>인증 코드</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder='6자리 인증 코드'
            placeholderTextColor='#9CA3AF'
            value={code}
            onChangeText={text => {
              setCode(text.replace(/[^0-9]/g, '').slice(0, 6));
              setError(null);
            }}
            keyboardType='number-pad'
            maxLength={6}
            autoComplete='one-time-code'
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.submitButton, verifyMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={verifyMutation.isPending}
        >
          {verifyMutation.isPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='small' color='white' />
              <Text style={styles.buttonText}>확인 중...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>인증 완료</Text>
          )}
        </TouchableOpacity>

        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>인증 코드가 오지 않았나요?</Text>
          <TouchableOpacity>
            <Text style={styles.resendText}>다시 전송</Text>
          </TouchableOpacity>
        </View>
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
    textAlign: 'center',
    letterSpacing: 2,
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
  helpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
  },
  resendText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textDecorationLine: 'underline',
  },
});
