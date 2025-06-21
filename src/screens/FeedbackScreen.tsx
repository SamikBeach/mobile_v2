import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Send } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../navigation/types';
import { submitFeedback, FeedbackDto } from '../apis/feedback';
import { AppColors } from '../constants';

export function FeedbackScreen() {
  const navigation = useNavigation();
  const [content, setContent] = useState('');

  // 피드백 제출 mutation
  const { mutate, isPending } = useMutation({
    mutationFn: (values: { content: string }) => {
      const feedbackData: FeedbackDto = {
        content: values.content,
      };
      return submitFeedback(feedbackData);
    },
    onSuccess: data => {
      // 성공 시 토스트 표시 및 화면 닫기
      Toast.show({
        type: 'success',
        text1: '피드백 제출 완료',
        text2: data.message || '피드백이 제출되었습니다. 소중한 의견 감사합니다!',
      });

      setContent('');
      navigation.goBack();
    },
    onError: error => {
      console.error('피드백 제출 오류:', error);
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '피드백 제출 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    },
  });

  // 폼 제출 핸들러
  const handleSubmit = () => {
    // 내용이 비어있는지 확인
    if (!content.trim()) {
      Toast.show({
        type: 'info',
        text1: '알림',
        text2: '피드백 내용을 입력해주세요.',
      });
      return;
    }

    mutate({ content });
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* 상단 핸들바 */}
      <View
        style={{
          alignItems: 'center',
          paddingTop: 10,
          paddingBottom: 8,
        }}
      >
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#d1d5db',
          }}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 헤더 */}
        <View
          style={{
            height: 56,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            paddingHorizontal: 20,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              color: '#111827',
            }}
          >
            피드백 보내기
          </Text>
        </View>

        {/* 콘텐츠 */}
        <ScrollView
          style={{
            flex: 1,
            paddingHorizontal: 20,
          }}
          contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 34 : 20 }}
        >
          <Text
            style={{
              marginBottom: 12,
              marginTop: 12,
              fontSize: 14,
              color: '#6b7280',
              lineHeight: 20,
            }}
          >
            서비스 개선을 위한 의견이나 문제점을 알려주세요.
          </Text>

          <View style={{ marginBottom: 16 }}>
            <TextInput
              multiline
              numberOfLines={8}
              placeholder='피드백 내용을 자세히 입력해주세요'
              placeholderTextColor='#9ca3af'
              value={content}
              onChangeText={setContent}
              editable={!isPending}
              style={{
                minHeight: 180,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                padding: 16,
                fontSize: 14,
                color: '#111827',
                textAlignVertical: 'top',
                backgroundColor: 'white',
                fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
              }}
            />
          </View>

          {/* 버튼들 */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              disabled={isPending}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: 'white',
                opacity: isPending ? 0.5 : 1,
                minHeight: 36,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: '#374151',
                  fontWeight: '500',
                }}
              >
                취소
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isPending}
              style={{
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: isPending ? AppColors.backgroundMedium : AppColors.primary,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                minHeight: 36,
                justifyContent: 'center',
              }}
            >
              {isPending ? (
                <>
                  <ActivityIndicator size='small' color={AppColors.primary} />
                  <Text
                    style={{
                      fontSize: 14,
                      color: AppColors.primary,
                      fontWeight: '500',
                    }}
                  >
                    제출 중...
                  </Text>
                </>
              ) : (
                <>
                  <Send size={16} color='white' />
                  <Text
                    style={{
                      fontSize: 14,
                      color: 'white',
                      fontWeight: '500',
                    }}
                  >
                    제출하기
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
