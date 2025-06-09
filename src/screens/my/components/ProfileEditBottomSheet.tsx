import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, Camera } from 'lucide-react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../../../apis/user/types';

interface ProfileEditBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  profileData: User;
}

export const ProfileEditBottomSheet: React.FC<ProfileEditBottomSheetProps> = ({
  isVisible,
  onClose,
  profileData,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    username: profileData.username || '',
    bio: profileData.bio || '',
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
  React.useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  const handleClose = () => {
    setFormData({
      username: profileData.username || '',
      bio: profileData.bio || '',
    });
    bottomSheetModalRef.current?.dismiss();
  };

  const handleSave = () => {
    // TODO: API 호출로 프로필 업데이트
    Alert.alert('성공', '프로필이 업데이트되었습니다.');
    handleClose();
  };

  const handleProfileImageChange = () => {
    // TODO: 이미지 선택 및 업로드 기능
    Alert.alert('준비 중', '프로필 이미지 변경 기능은 준비 중입니다.');
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
        <Text style={styles.title}>프로필 편집</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color='#6B7280' />
        </TouchableOpacity>
      </View>

      {/* 프로필 이미지 */}
      <View style={styles.imageSection}>
        <View style={styles.imageContainer}>
          <View style={styles.defaultImage}>
            <Text style={styles.imageText}>
              {(formData.username || profileData.email?.split('@')[0] || '')
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity style={styles.cameraButton} onPress={handleProfileImageChange}>
            <Camera size={16} color='white' />
          </TouchableOpacity>
        </View>
      </View>

      {/* 폼 */}
      <View style={styles.formContainer}>
        {/* 사용자명 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>사용자명</Text>
          <TextInput
            style={styles.textInput}
            value={formData.username}
            onChangeText={text => setFormData(prev => ({ ...prev, username: text }))}
            placeholder='사용자명을 입력하세요'
            maxLength={30}
          />
        </View>

        {/* 자기소개 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>자기소개</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.bio}
            onChangeText={text => setFormData(prev => ({ ...prev, bio: text }))}
            placeholder='자기소개를 입력하세요'
            multiline
            numberOfLines={4}
            textAlignVertical='top'
            maxLength={150}
          />
        </View>
      </View>

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose}>
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장</Text>
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
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
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
    backgroundColor: '#16A34A',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
