import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { X, Camera } from 'lucide-react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { UserDetailResponseDto, UpdateUserInfoRequest } from '../../../apis/user/types';
import { updateUserInfoWithImage } from '../../../apis/user/user';
import { AppColors } from '../../../constants';

interface ProfileEditBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  profileData: UserDetailResponseDto;
}

export const ProfileEditBottomSheet: React.FC<ProfileEditBottomSheetProps> = ({
  isVisible,
  onClose,
  profileData,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const usernameInputRef = useRef<TextInput>(null);
  const bioInputRef = useRef<TextInput>(null);
  const queryClient = useQueryClient();

  const { user } = profileData;
  const displayName = user.username || user.email?.split('@')[0] || '';

  const [usernameText, setUsernameText] = useState(displayName);
  const [bioText, setBioText] = useState(user.bio || '');
  const [profileImage, setProfileImage] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(
    user.profileImage && user.profileImage.length > 0 ? user.profileImage : null
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 프로필 업데이트 mutation (src_frontend와 완전히 동일한 방식)
  const { mutateAsync: updateProfile } = useMutation({
    mutationFn: async ({
      userData,
      file,
    }: {
      userData: UpdateUserInfoRequest & { removeProfileImage?: boolean };
      file?: { uri: string; type: string; name: string };
    }) => {
      return updateUserInfoWithImage(userData, file);
    },
    onSuccess: () => {
      // 프로필 정보 업데이트
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-libraries'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });

      handleClose();
      Toast.show({
        type: 'success',
        text1: '프로필이 성공적으로 업데이트되었습니다.',
      });
    },
    onError: (error: any) => {
      console.error('프로필 업데이트 오류:', error);
      Toast.show({
        type: 'error',
        text1: '프로필 업데이트에 실패했습니다.',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Handle bottom sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  // Present modal when isVisible becomes true
  useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  // 프로필 데이터가 변경되면 폼 데이터 업데이트
  useEffect(() => {
    const displayName = user.username || user.email?.split('@')[0] || '';
    setUsernameText(displayName);
    setBioText(user.bio || '');
    setProfileImage(null);
    setRemoveProfileImage(false);
    setImagePreview(user.profileImage && user.profileImage.length > 0 ? user.profileImage : null);
  }, [user]);

  const handleClose = () => {
    const displayName = user.username || user.email?.split('@')[0] || '';
    setUsernameText(displayName);
    setBioText(user.bio || '');
    setProfileImage(null);
    setRemoveProfileImage(false);
    setImagePreview(user.profileImage && user.profileImage.length > 0 ? user.profileImage : null);

    bottomSheetModalRef.current?.dismiss();
  };

  // src_frontend와 완전히 동일한 handleSubmit 함수
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // 프로필 정보 및 이미지 업데이트 (src_frontend와 완전히 동일)
      await updateProfile({
        userData: {
          username: usernameText,
          bio: bioText,
          // removeProfileImage가 true인 경우에만 이미지 삭제 요청
          ...(removeProfileImage && { removeProfileImage: true }),
        },
        // 파일이 제공된 경우에만 전달 (undefined는 기존 이미지 유지)
        file: profileImage instanceof Object ? profileImage : undefined,
      });
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      setIsSubmitting(false);
    }
  };

  const handleSave = () => {
    handleSubmit();
  };

  const handleProfileImageChange = async () => {
    try {
      // 권한 요청
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('권한 필요', '사진 라이브러리에 접근하려면 권한이 필요합니다.');
        return;
      }

      // 이미지 선택 옵션
      Alert.alert('프로필 사진 변경', '옵션을 선택하세요', [
        {
          text: '사진 선택',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              const imageData = {
                uri: asset.uri,
                type: asset.mimeType || 'image/jpeg',
                name: `profile_${Date.now()}.jpg`,
              };

              setProfileImage(imageData);
              setRemoveProfileImage(false);
              setImagePreview(asset.uri);
            }
          },
        },
        ...(imagePreview
          ? [
              {
                text: '사진 삭제',
                style: 'destructive' as const,
                onPress: () => {
                  setProfileImage(null);
                  setRemoveProfileImage(true);
                  setImagePreview(null);
                },
              },
            ]
          : []),
        {
          text: '취소',
          style: 'cancel' as const,
        },
      ]);
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Toast.show({
        type: 'error',
        text1: '이미지 선택에 실패했습니다.',
      });
    }
  };

  // Backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        enableTouchThrough={false}
      />
    ),
    []
  );

  const renderContent = () => (
    <BottomSheetView style={styles.contentContainer}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>프로필 수정</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton} disabled={isSubmitting}>
          <X size={24} color='#6B7280' />
        </TouchableOpacity>
      </View>

      {/* 프로필 이미지 */}
      <View style={styles.imageSection}>
        <View style={styles.imageContainer}>
          {imagePreview ? (
            <Image source={{ uri: imagePreview }} style={styles.profileImage} />
          ) : (
            <View style={styles.defaultImage}>
              <Text style={styles.imageText}>{usernameText.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleProfileImageChange}
            disabled={isSubmitting}
          >
            <Camera size={16} color='white' />
          </TouchableOpacity>
        </View>
        <Text style={styles.imageHint}>20MB 이하의 이미지 파일만 업로드 가능합니다</Text>
      </View>

      {/* 폼 */}
      <View style={styles.formContainer}>
        {/* 닉네임 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            key={`username-${user.id}-${user.username}`}
            ref={usernameInputRef}
            style={[styles.textInput, isSubmitting && styles.disabledInput]}
            defaultValue={displayName}
            onChangeText={setUsernameText}
            placeholder='변경할 닉네임을 입력하세요'
            placeholderTextColor='#9CA3AF'
            maxLength={30}
            editable={!isSubmitting}
          />
        </View>

        {/* 자기소개 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>자기소개</Text>
          <TextInput
            key={`bio-${user.id}-${user.bio}`}
            ref={bioInputRef}
            style={[styles.textInput, styles.textArea, isSubmitting && styles.disabledInput]}
            defaultValue={user.bio || ''}
            onChangeText={setBioText}
            placeholder='자기소개를 입력하세요 (최대 200자)'
            placeholderTextColor='#9CA3AF'
            multiline
            numberOfLines={4}
            textAlignVertical='top'
            maxLength={200}
            editable={!isSubmitting}
          />
          <View style={styles.charCount}>
            <Text style={styles.charCountText}>{bioText.length}/200</Text>
          </View>
        </View>
      </View>

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleClose}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton, isSubmitting && styles.disabledButton]}
          onPress={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size='small' color='#FFFFFF' />
          ) : (
            <Text style={styles.saveButtonText}>저장</Text>
          )}
        </TouchableOpacity>
      </View>
    </BottomSheetView>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      enableDynamicSizing={true}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.dragHandle}
      backgroundStyle={styles.modalContainer}
    >
      {renderContent()}
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dragHandle: {
    backgroundColor: '#D1D5DB',
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
  },
  defaultImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#6B7280',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  imageHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 20,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    minHeight: 48, // 최소 높이 고정으로 레이아웃 시프트 방지
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  charCount: {
    alignItems: 'flex-end',
  },
  charCountText: {
    fontSize: 12,
    color: '#6B7280',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  saveButton: {
    backgroundColor: AppColors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledInput: {
    backgroundColor: '#F9FAFB',
    color: '#9CA3AF',
  },
});
