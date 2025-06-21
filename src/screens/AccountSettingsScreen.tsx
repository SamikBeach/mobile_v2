import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import Toast from 'react-native-toast-message';
import { userAtom } from '../atoms/user';
import { changePassword, deleteAccount } from '../apis/auth';
import { AuthProvider } from '../apis/auth/types';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';

type AccountSettingsNavigationProp = NavigationProp<RootStackParamList>;

// 비밀번호 변경 폼 데이터 타입
interface PasswordChangeFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 계정 삭제 폼 데이터 타입
interface AccountDeleteFormValues {
  password: string;
}

export const AccountSettingsScreen: React.FC = () => {
  const navigation = useNavigation<AccountSettingsNavigationProp>();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useAtom(userAtom);
  const [isLocalProvider, setIsLocalProvider] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [deleteServerError, setDeleteServerError] = useState<string | null>(null);

  // 비밀번호 변경 폼 상태
  const [passwordForm, setPasswordForm] = useState<PasswordChangeFormValues>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordChangeFormValues>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 계정 삭제 폼 상태
  const [deleteForm, setDeleteForm] = useState<AccountDeleteFormValues>({
    password: '',
  });
  const [deleteErrors, setDeleteErrors] = useState<Partial<AccountDeleteFormValues>>({});
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 사용자 정보 로드 시 provider 체크
  useEffect(() => {
    if (user) {
      setIsLocalProvider(user.provider === AuthProvider.LOCAL);
    }
  }, [user]);

  // 비밀번호 변경 mutation
  const { mutate: changePasswordMutation, isPending: isChangingPassword } = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => {
      return changePassword(data);
    },
    onSuccess: () => {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
      setServerError(null);
      Toast.show({
        type: 'success',
        text1: '비밀번호가 성공적으로 변경되었습니다.',
      });
    },
    onError: (error: any) => {
      // 서버 오류 메시지 처리
      if (error.response?.data) {
        const errorData = error.response.data;
        setServerError(errorData.message || '비밀번호 변경 중 오류가 발생했습니다.');
      } else {
        setServerError('비밀번호 변경 중 오류가 발생했습니다.');
      }
    },
  });

  // 계정 삭제 mutation
  const { mutate: deleteAccountMutation, isPending: isDeletingAccount } = useMutation({
    mutationFn: (data: AccountDeleteFormValues) => {
      // 소셜 로그인 사용자는 빈 객체, 로컬 사용자는 비밀번호 포함
      return deleteAccount(isLocalProvider ? data : {});
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: '계정이 성공적으로 삭제되었습니다.',
      });
      setShowDeleteDialog(false);
      setUser(null);
      navigation.goBack();
    },
    onError: (error: any) => {
      // 서버 오류 메시지 처리
      if (error.response?.data) {
        const errorData = error.response.data;
        setDeleteServerError(errorData.message || '계정 삭제 중 오류가 발생했습니다.');
      } else {
        setDeleteServerError('계정 삭제 중 오류가 발생했습니다.');
      }
    },
  });

  // 비밀번호 변경 유효성 검사
  const validatePasswordForm = (): boolean => {
    const errors: Partial<PasswordChangeFormValues> = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = '현재 비밀번호를 입력해주세요';
    } else if (passwordForm.currentPassword.length < 8) {
      errors.currentPassword = '비밀번호는 최소 8자 이상이어야 합니다';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = '새 비밀번호를 입력해주세요';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = '새 비밀번호는 최소 8자 이상이어야 합니다';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = '새 비밀번호 확인을 입력해주세요';
    } else if (passwordForm.confirmPassword.length < 8) {
      errors.confirmPassword = '비밀번호는 최소 8자 이상이어야 합니다';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = '새 비밀번호가 일치하지 않습니다';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 계정 삭제 유효성 검사
  const validateDeleteForm = (): boolean => {
    const errors: Partial<AccountDeleteFormValues> = {};

    if (isLocalProvider) {
      if (!deleteForm.password) {
        errors.password = '비밀번호를 입력해주세요';
      } else if (deleteForm.password.length < 8) {
        errors.password = '비밀번호는 최소 8자 이상이어야 합니다';
      }
    }

    setDeleteErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 비밀번호 변경 제출
  const handlePasswordChangeSubmit = () => {
    if (!validatePasswordForm()) {
      return;
    }

    setServerError(null);

    changePasswordMutation({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  // 계정 삭제 다이얼로그 표시
  const handleDeleteAccountPress = () => {
    setShowDeleteDialog(true);
    setDeleteForm({ password: '' });
    setDeleteErrors({});
    setDeleteServerError(null);
  };

  // 계정 삭제 제출
  const handleDeleteAccountSubmit = () => {
    if (!validateDeleteForm()) {
      return;
    }

    setDeleteServerError(null);

    Alert.alert(
      '계정을 정말 삭제하시겠습니까?',
      '이 작업은 되돌릴 수 없습니다. 계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.',
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => setShowDeleteDialog(false),
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            deleteAccountMutation(deleteForm);
          },
        },
      ]
    );
  };

  // 소셜 로그인 사용자의 경우 바로 계정 삭제 진행
  const handleSocialDeleteAccount = () => {
    setDeleteServerError(null);

    Alert.alert(
      '계정을 정말 삭제하시겠습니까?',
      '이 작업은 되돌릴 수 없습니다. 계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            deleteAccountMutation({ password: '' });
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>사용자 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color='#111827' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>계정 설정</Text>
        <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 비밀번호 변경 섹션 */}
        {isLocalProvider && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>비밀번호 변경</Text>
              <Text style={styles.sectionDescription}>안전한 비밀번호로 계정을 보호하세요.</Text>
            </View>

            <View style={styles.sectionContent}>
              {/* 현재 비밀번호 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>현재 비밀번호</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.textInput, styles.passwordInput]}
                    placeholder='현재 비밀번호'
                    placeholderTextColor='#9CA3AF'
                    value={passwordForm.currentPassword}
                    onChangeText={text => {
                      setPasswordForm(prev => ({ ...prev, currentPassword: text }));
                      setServerError(null);
                    }}
                    secureTextEntry={!showCurrentPassword}
                    autoCapitalize='none'
                    autoComplete='current-password'
                    autoCorrect={false}
                    editable={!isChangingPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={16} color='#9CA3AF' />
                    ) : (
                      <Eye size={16} color='#9CA3AF' />
                    )}
                  </TouchableOpacity>
                </View>
                {passwordErrors.currentPassword && (
                  <Text style={styles.errorText}>{passwordErrors.currentPassword}</Text>
                )}
              </View>

              {/* 새 비밀번호 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>새 비밀번호</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.textInput, styles.passwordInput]}
                    placeholder='새 비밀번호'
                    placeholderTextColor='#9CA3AF'
                    value={passwordForm.newPassword}
                    onChangeText={text => {
                      setPasswordForm(prev => ({ ...prev, newPassword: text }));
                      setServerError(null);
                    }}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize='none'
                    autoComplete='new-password'
                    autoCorrect={false}
                    editable={!isChangingPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff size={16} color='#9CA3AF' />
                    ) : (
                      <Eye size={16} color='#9CA3AF' />
                    )}
                  </TouchableOpacity>
                </View>
                {passwordErrors.newPassword && (
                  <Text style={styles.errorText}>{passwordErrors.newPassword}</Text>
                )}
                <Text style={styles.hintText}>새 비밀번호는 최소 8자 이상이어야 합니다.</Text>
              </View>

              {/* 새 비밀번호 확인 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>새 비밀번호 확인</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.textInput, styles.passwordInput]}
                    placeholder='새 비밀번호 확인'
                    placeholderTextColor='#9CA3AF'
                    value={passwordForm.confirmPassword}
                    onChangeText={text => {
                      setPasswordForm(prev => ({ ...prev, confirmPassword: text }));
                      setServerError(null);
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize='none'
                    autoComplete='new-password'
                    autoCorrect={false}
                    editable={!isChangingPassword}
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
                {passwordErrors.confirmPassword && (
                  <Text style={styles.errorText}>{passwordErrors.confirmPassword}</Text>
                )}
              </View>

              {serverError && (
                <View style={styles.serverErrorContainer}>
                  <Text style={styles.serverErrorText}>{serverError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  isChangingPassword && styles.disabledButton,
                ]}
                onPress={handlePasswordChangeSubmit}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size='small' color='white' />
                    <Text style={styles.buttonText}>변경 중...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>비밀번호 변경</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 계정 삭제 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>계정 삭제</Text>
            <Text style={styles.sectionDescription}>
              계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </Text>
          </View>

          <View style={styles.sectionContent}>
            {showDeleteDialog && (
              <View style={styles.deleteDialogContainer}>
                <Text style={styles.deleteDialogTitle}>계정을 정말 삭제하시겠습니까?</Text>
                <Text style={styles.deleteDialogDescription}>
                  이 작업은 되돌릴 수 없습니다. 계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                </Text>

                {isLocalProvider && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>비밀번호 확인</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={[styles.textInput, styles.passwordInput]}
                        placeholder='비밀번호를 입력하세요'
                        placeholderTextColor='#9CA3AF'
                        value={deleteForm.password}
                        onChangeText={text => {
                          setDeleteForm(prev => ({ ...prev, password: text }));
                          setDeleteServerError(null);
                        }}
                        secureTextEntry={!showDeletePassword}
                        autoCapitalize='none'
                        autoComplete='current-password'
                        autoCorrect={false}
                        editable={!isDeletingAccount}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowDeletePassword(!showDeletePassword)}
                      >
                        {showDeletePassword ? (
                          <EyeOff size={16} color='#9CA3AF' />
                        ) : (
                          <Eye size={16} color='#9CA3AF' />
                        )}
                      </TouchableOpacity>
                    </View>
                    {deleteErrors.password && (
                      <Text style={styles.errorText}>{deleteErrors.password}</Text>
                    )}
                  </View>
                )}

                {deleteServerError && (
                  <View style={styles.serverErrorContainer}>
                    <Text style={styles.serverErrorText}>{deleteServerError}</Text>
                  </View>
                )}

                <View style={styles.deleteDialogButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setShowDeleteDialog(false)}
                    disabled={isDeletingAccount}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.deleteButton,
                      isDeletingAccount && styles.disabledButton,
                    ]}
                    onPress={handleDeleteAccountSubmit}
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size='small' color='white' />
                        <Text style={styles.deleteButtonText}>삭제 중...</Text>
                      </View>
                    ) : (
                      <Text style={styles.deleteButtonText}>삭제</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!showDeleteDialog && (
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={isLocalProvider ? handleDeleteAccountPress : handleSocialDeleteAccount}
              >
                <Text style={styles.deleteButtonText}>계정 삭제</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(229, 231, 235, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 56,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  serverErrorContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    padding: 12,
    marginBottom: 16,
  },
  serverErrorText: {
    fontSize: 14,
    color: '#DC2626',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  primaryButton: {
    backgroundColor: '#111827',
  },
  cancelButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    flex: 1,
    marginRight: 6,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    flex: 1,
    marginLeft: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteDialogContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  deleteDialogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  deleteDialogDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  deleteDialogButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
