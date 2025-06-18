import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { X } from 'lucide-react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLibrary, CreateLibraryDto, getLibraryTags } from '../apis/library';
import { getTagColor } from '../utils/tags';
import Toast from 'react-native-toast-message';

interface CreateLibraryBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: (libraryId: number) => void;
}

export const CreateLibraryBottomSheet: React.FC<CreateLibraryBottomSheetProps> = ({
  isVisible,
  onClose,
  onSuccess,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const nameInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  const queryClient = useQueryClient();

  const [isPublic, setIsPublic] = useState(true);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [nameText, setNameText] = useState('');
  const [descriptionText, setDescriptionText] = useState('');

  // 라이브러리 태그 조회
  const {
    data: popularTags,
    isLoading: isLoadingTags,
    error: tagsError,
  } = useQuery({
    queryKey: ['library-tags'],
    queryFn: () => getLibraryTags(20),
    enabled: isVisible,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 서재 생성 mutation
  const { mutate: createLibraryMutation, isPending } = useMutation({
    mutationFn: createLibrary,
    onSuccess: response => {
      console.log('서재 생성 성공:', response); // 디버깅용

      // 서재 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['user-libraries'] });

      // onSuccess 콜백 먼저 실행
      if (onSuccess) {
        onSuccess(response.id);
      }

      // bottomsheet 닫기
      handleClose();

      // 약간의 지연 후 토스트 표시 (bottomsheet이 닫힌 후)
      setTimeout(() => {
        console.log('토스트 표시 시도'); // 디버깅용
        Toast.show({
          type: 'success',
          text1: '새 서재가 생성되었습니다.',
        });
      }, 300);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || '서재 생성에 실패했습니다.';
      Toast.show({
        type: 'error',
        text1: errorMessage,
      });
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
  React.useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  const handleClose = () => {
    // TextInput 내용 초기화
    nameInputRef.current?.clear();
    descriptionInputRef.current?.clear();
    setNameText('');
    setDescriptionText('');
    setIsPublic(true);
    setSelectedTagIds([]);
    bottomSheetModalRef.current?.dismiss();
    onClose(); // 부모 컴포넌트에 닫힘을 알림
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        if (prev.length >= 5) {
          Toast.show({
            type: 'info',
            text1: '태그는 최대 5개까지 선택할 수 있습니다.',
          });
          return prev;
        }
        return [...prev, tagId];
      }
    });
  };

  const handleSubmit = () => {
    if (!nameText.trim()) {
      Toast.show({
        type: 'info',
        text1: '서재 이름을 입력해주세요.',
      });
      return;
    }

    const createData: CreateLibraryDto = {
      name: nameText.trim(),
      description: descriptionText.trim() || undefined,
      isPublic: isPublic,
      tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
    };

    createLibraryMutation(createData);
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

  const renderTagSection = () => {
    if (isLoadingTags) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='small' color='#6B7280' />
          <Text style={styles.loadingText}>태그를 불러오는 중...</Text>
        </View>
      );
    }

    if (tagsError) {
      console.error('태그 조회 오류:', tagsError);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.noTagsText}>태그를 불러올 수 없습니다</Text>
          <Text style={styles.errorSubText}>네트워크 연결을 확인해주세요</Text>
        </View>
      );
    }

    if (!popularTags || popularTags.length === 0) {
      return <Text style={styles.noTagsText}>사용 가능한 태그가 없습니다</Text>;
    }

    return (
      <View style={styles.tagContainer}>
        {popularTags.map((tag, index) => {
          const isSelected = selectedTagIds.includes(tag.id);
          const tagColor = getTagColor(index % 8);

          return (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagButton,
                {
                  backgroundColor: isSelected ? '#1F2937' : tagColor,
                },
                isSelected && styles.tagButtonSelected,
              ]}
              onPress={() => handleTagToggle(tag.id)}
            >
              <Text
                style={[
                  styles.tagButtonText,
                  {
                    color: isSelected ? '#FFFFFF' : '#374151',
                  },
                ]}
              >
                {tag.tagName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderContent = () => (
    <BottomSheetView style={styles.contentContainer}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>새 서재 만들기</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color='#6B7280' />
        </TouchableOpacity>
      </View>

      {/* 폼 내용 */}
      <View style={styles.formContainer}>
        {/* 서재 이름 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>서재 이름</Text>
          <TextInput
            ref={nameInputRef}
            style={styles.textInput}
            onChangeText={setNameText}
            placeholder='서재 이름을 입력하세요'
            placeholderTextColor='#9CA3AF'
            maxLength={50}
          />
        </View>

        {/* 서재 설명 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>서재 설명</Text>
          <TextInput
            ref={descriptionInputRef}
            style={[styles.textInput, styles.textArea]}
            onChangeText={setDescriptionText}
            placeholder='서재에 대한 간단한 설명을 입력하세요'
            placeholderTextColor='#9CA3AF'
            multiline
            numberOfLines={4}
            textAlignVertical='top'
            maxLength={200}
          />
        </View>

        {/* 태그 선택 (최대 5개) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>태그 선택 (최대 5개)</Text>
          {renderTagSection()}
        </View>

        {/* 서재를 공개로 설정 */}
        <View style={styles.switchGroup}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabel}>서재를 공개로 설정</Text>
            <Text style={styles.switchDescription}>공개 서재는 모든 사용자가 볼 수 있습니다</Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: '#F3F4F6', true: '#10B981' }}
            thumbColor={isPublic ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleClose}
          disabled={isPending}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton, isPending && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isPending || !nameText.trim()}
        >
          <Text style={styles.submitButtonText}>{isPending ? '생성 중...' : '생성'}</Text>
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
    height: 100,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  noTagsText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  errorSubText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 0,
  },
  tagButtonSelected: {
    // 선택된 태그는 backgroundColor가 동적으로 설정됨
  },
  tagButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 14,
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
  submitButton: {
    backgroundColor: '#10B981',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
});
