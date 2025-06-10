import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Send } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { submitFeedback } from '../apis/feedback';
import { FeedbackDto } from '../apis/feedback/types';
import { useFeedback } from '../contexts/FeedbackContext';

// 폼 데이터 타입
interface FeedbackFormValues {
  content: string;
}

export function FeedbackBottomSheet() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);
  const { isVisible, closeFeedback } = useFeedback();

  // 폼 초기값 설정
  const { control, handleSubmit, reset } = useForm<FeedbackFormValues>({
    defaultValues: {
      content: '',
    },
  });

  // 피드백 제출 mutation
  const { mutate, isPending } = useMutation({
    mutationFn: (values: FeedbackFormValues) => {
      const feedbackData: FeedbackDto = {
        content: values.content,
      };
      return submitFeedback(feedbackData);
    },
    onSuccess: data => {
      Toast.show({
        type: 'success',
        text1: data.message || '피드백이 제출되었습니다. 소중한 의견 감사합니다!',
      });
      reset();
      closeFeedback();
    },
    onError: error => {
      console.error('피드백 제출 오류:', error);
      Toast.show({
        type: 'error',
        text1: '피드백 제출 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    },
  });

  // 폼 제출 핸들러
  const onSubmit = (values: FeedbackFormValues) => {
    if (!values.content.trim()) {
      Toast.show({
        type: 'error',
        text1: '피드백 내용을 입력해주세요.',
      });
      return;
    }

    mutate(values);
  };

  // callbacks
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        closeFeedback();
      }
    },
    [closeFeedback]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior='close'
      />
    ),
    []
  );

  // isVisible 변경 시 bottom sheet 열기/닫기
  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      enableDynamicSizing
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={styles.bottomSheetBackground}
      enablePanDownToClose
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>피드백 보내기</Text>
        </View>

        {/* 내용 */}
        <View style={styles.content}>
          <Text style={styles.description}>서비스 개선을 위한 의견이나 문제점을 알려주세요.</Text>

          <View style={styles.formContainer}>
            <Controller
              control={control}
              name='content'
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.textInput, isTextInputFocused && styles.textInputFocused]}
                  placeholder='피드백 내용을 자세히 입력해주세요'
                  placeholderTextColor='#9ca3af'
                  multiline
                  textAlignVertical='top'
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => setIsTextInputFocused(true)}
                  onBlur={() => setIsTextInputFocused(false)}
                  editable={!isPending}
                />
              )}
            />
          </View>

          {/* 푸터 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={closeFeedback}
              disabled={isPending}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton, isPending && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            >
              {isPending ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size='small' color='white' />
                  <Text style={styles.submitButtonText}>제출 중...</Text>
                </View>
              ) : (
                <View style={styles.submitContainer}>
                  <Send size={16} color='white' />
                  <Text style={styles.submitButtonText}>제출하기</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: '#d1d5db',
    width: 40,
    height: 4,
  },
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  contentContainer: {
    backgroundColor: 'white',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 24,
  },
  textInput: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'white',
    textAlignVertical: 'top',
  },
  textInputFocused: {
    borderColor: '#bfdbfe',
    backgroundColor: 'white',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#16a34a',
  },
  submitButtonDisabled: {
    backgroundColor: '#bbf7d0',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
