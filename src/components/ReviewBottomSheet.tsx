import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { Star, X, ChevronDown, Trash2, PenLine } from 'lucide-react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { ReadingStatusType, StatusTexts, AppColors } from '../constants';

interface ReviewBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  bookTitle: string;
  onSubmit: (rating: number, content: string, readingStatus?: ReadingStatusType | null) => void;
  initialRating?: number;
  initialContent?: string;
  isEditMode?: boolean;
  isSubmitting?: boolean;
  onCancel?: () => void;
  userReadingStatus?: ReadingStatusType | null;
}

export const ReviewBottomSheet: React.FC<ReviewBottomSheetProps> = ({
  isVisible,
  onClose,
  bookTitle,
  onSubmit,
  initialRating = 0,
  initialContent = '',
  isEditMode = false,
  isSubmitting = false,
  onCancel,
  userReadingStatus = null,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const textInputRef = useRef<TextInput>(null);

  // State 관리
  const [rating, setRating] = useState(initialRating);
  const [content, setContent] = useState(initialContent);
  const [readingStatus, setReadingStatus] = useState<ReadingStatusType | null>(
    userReadingStatus || ReadingStatusType.READ
  );
  const [isReadingStatusModalVisible, setIsReadingStatusModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  // 모드 결정 로직
  const isDeleteMode = isEditMode && initialContent && !content.trim();
  const isCreateMode = !isEditMode || (isEditMode && !initialContent);

  // Handle bottom sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        // 드래그로 닫을 때는 바로 닫기 (backdrop은 커스텀으로 처리)
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
      if (isReadingStatusModalVisible) {
        closeReadingStatusModal();
      }
    }
  }, [isVisible]);

  // 다이얼로그가 열릴 때 초기 데이터 설정
  useEffect(() => {
    if (isVisible) {
      // 다이얼로그가 열릴 때마다 초기값으로 설정
      setRating(initialRating);

      if (isEditMode) {
        // 수정 모드일 때는 항상 초기값 설정 (내용이 빈 문자열이어도)
        setContent(initialContent);
      } else {
        // 새로 작성하는 경우 내용 초기화
        setContent('');
      }
    }
  }, [isVisible, initialRating, isEditMode, initialContent]);

  // initialRating이 변경되면 즉시 반영 (다이얼로그가 열려있는 상태에서도)
  useEffect(() => {
    if (isVisible) {
      setRating(initialRating);
    }
  }, [initialRating, isVisible]);

  // Dialog가 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isVisible) {
      // 다이얼로그가 닫히면 작성하던 내용 모두 제거
      setContent('');
      setRating(0);
      setReadingStatus(userReadingStatus || ReadingStatusType.READ);
    }
  }, [isVisible, userReadingStatus]);

  // 모달이 열릴 때 현재 읽기 상태 설정 (수정 모드가 아닐 때만)
  useEffect(() => {
    if (isVisible && isCreateMode && !isEditMode) {
      setReadingStatus(userReadingStatus || ReadingStatusType.READ);
    }
  }, [isVisible, isCreateMode, isEditMode, userReadingStatus]);

  const handleResetRating = () => {
    setRating(0);
  };

  // TextInput의 현재 값을 가져오는 함수
  const getCurrentTextContent = (): string => {
    return content;
  };

  // TextInput 변경 핸들러
  const handleTextChange = (text: string) => {
    setContent(text);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('별점 필요', '리뷰를 등록하기 위해서는 별점을 입력해주세요.');
      return;
    }

    const currentContent = getCurrentTextContent();

    if (isCreateMode) {
      onSubmit(rating, currentContent, readingStatus);
    } else {
      onSubmit(rating, currentContent);
    }
  };

  // 리뷰 내용이 있는지 확인하는 함수 (내용만 체크)
  const hasContent = () => {
    return getCurrentTextContent().trim().length > 0;
  };

  const handleClose = () => {
    // 리뷰 내용이 있으면 확인 알림
    if (hasContent()) {
      Alert.alert(
        '작성 중인 리뷰가 있습니다',
        '정말로 나가시겠습니까? 작성 중인 리뷰는 저장되지 않습니다.',
        [
          {
            text: '계속 작성',
            style: 'cancel',
          },
          {
            text: '나가기',
            style: 'destructive',
            onPress: () => {
              if (onCancel) {
                onCancel();
              } else {
                onClose();
              }
              bottomSheetModalRef.current?.dismiss();
            },
          },
        ]
      );
    } else {
      if (onCancel) {
        onCancel();
      } else {
        onClose();
      }
      bottomSheetModalRef.current?.dismiss();
    }
  };

  // 별점 텍스트 반환
  const getRatingText = () => {
    switch (rating) {
      case 0:
        return '별점 선택';
      case 1:
        return '별로예요';
      case 2:
        return '아쉬워요';
      case 3:
        return '보통이에요';
      case 4:
        return '좋아요';
      case 5:
        return '최고예요';
      default:
        return '별점 선택';
    }
  };

  // 버튼 텍스트 결정
  const getButtonText = () => {
    if (isSubmitting) {
      return '처리 중...';
    } else if (isDeleteMode) {
      return '리뷰 삭제하기';
    } else if (isCreateMode) {
      return '리뷰 등록하기';
    } else if (isEditMode) {
      return '리뷰 수정하기';
    } else {
      return '리뷰 등록하기';
    }
  };

  // 다이얼로그 제목 결정
  const getDialogTitle = () => {
    if (isDeleteMode) {
      return '리뷰 삭제하기';
    } else if (isCreateMode) {
      return '리뷰 작성하기';
    } else if (isEditMode) {
      return '리뷰 수정하기';
    } else {
      return '리뷰 작성하기';
    }
  };

  // 읽기 상태별 아이콘 반환
  const getStatusIcon = (status: ReadingStatusType | null) => {
    if (!status) return '❌';
    switch (status) {
      case ReadingStatusType.WANT_TO_READ:
        return '📚';
      case ReadingStatusType.READING:
        return '📖';
      case ReadingStatusType.READ:
        return '✅';
      default:
        return '📚';
    }
  };

  // 읽기 상태별 색상 반환
  const getStatusColor = (status: ReadingStatusType | null) => {
    if (!status) return '#EF4444';
    switch (status) {
      case ReadingStatusType.WANT_TO_READ:
        return '#7C3AED';
      case ReadingStatusType.READING:
        return '#2563EB';
      case ReadingStatusType.READ:
        return '#059669';
      default:
        return '#111827';
    }
  };

  // 읽기 상태별 파스텔 배경색 반환
  const getStatusBackgroundColor = (status: ReadingStatusType | null) => {
    if (!status) return '#FEF7F7'; // 더 연한 빨강
    switch (status) {
      case ReadingStatusType.WANT_TO_READ:
        return '#FAF5FF'; // 더 연한 보라
      case ReadingStatusType.READING:
        return '#EFF6FF'; // 더 연한 파랑
      case ReadingStatusType.READ:
        return '#F0FDF4'; // 더 연한 초록
      default:
        return '#F9FAFB';
    }
  };

  const handleReadingStatusSelect = (status: ReadingStatusType | null) => {
    setReadingStatus(status);
    closeReadingStatusModal();
  };

  const handleOpenReadingStatusModal = () => {
    console.log('Opening reading status modal');
    setIsReadingStatusModalVisible(true);
    // Animate slide up
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeReadingStatusModal = () => {
    // Animate slide down then close
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsReadingStatusModalVisible(false);
      slideAnim.setValue(300);
    });
  };

  // Handle pan gesture for swipe to close
  const onHandlePanGestureEvent = (event: any) => {
    const { translationY, state, velocityY } = event.nativeEvent;

    if (state === State.ACTIVE) {
      // Only allow dragging down
      if (translationY > 0) {
        slideAnim.setValue(translationY);
      }
    } else if (state === State.END) {
      // Close if dragged down more than 80px OR has fast downward velocity
      if (translationY > 80 || velocityY > 1500) {
        closeReadingStatusModal();
      } else {
        // Snap back to original position
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  // 커스텀 backdrop - 기존 backdrop을 사용하되 터치 이벤트만 커스터마이징
  const renderMainBackdrop = useCallback(
    (props: any) => {
      const handleBackdropPress = () => {
        // 리뷰 내용이 있으면 확인 알림 (바텀시트는 닫지 않음)
        if (getCurrentTextContent().trim().length > 0) {
          Alert.alert(
            '작성 중인 리뷰가 있습니다',
            '정말로 나가시겠습니까? 작성 중인 리뷰는 저장되지 않습니다.',
            [
              {
                text: '계속 작성',
                style: 'cancel',
              },
              {
                text: '나가기',
                style: 'destructive',
                onPress: () => {
                  onClose();
                  bottomSheetModalRef.current?.dismiss();
                },
              },
            ]
          );
        } else {
          // 내용이 없으면 바로 닫기
          onClose();
          bottomSheetModalRef.current?.dismiss();
        }
      };

      // 기존 BottomSheetBackdrop 위에 투명한 TouchableOpacity 오버레이
      return (
        <View style={StyleSheet.absoluteFillObject}>
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.5}
            enableTouchThrough={true}
          />
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={handleBackdropPress}
          />
        </View>
      );
    },
    [onClose]
  );

  const renderContent = () => (
    <BottomSheetView style={styles.contentContainer}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>{getDialogTitle()}</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color='#6B7280' />
        </TouchableOpacity>
      </View>

      {/* 설명 */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          <Text style={styles.bookTitle}>{bookTitle}</Text>에 대한{' '}
          {isDeleteMode ? '리뷰를 삭제하시겠습니까?' : '리뷰를 작성해주세요'}
        </Text>
      </View>

      {/* 별점 섹션 */}
      <View style={styles.ratingSection}>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
              key={star}
              onPress={() => !isSubmitting && setRating(star)}
              style={styles.starButton}
            >
              <Star
                size={36}
                color={star <= rating ? '#FCD34D' : '#D1D5DB'}
                fill={star <= rating ? '#FCD34D' : 'transparent'}
              />
            </TouchableOpacity>
          ))}
          {rating > 0 && (
            <TouchableOpacity
              onPress={handleResetRating}
              style={styles.resetButton}
              disabled={isSubmitting}
            >
              <X size={16} color='#6B7280' />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.ratingText}>{getRatingText()}</Text>
      </View>

      {/* 읽기 상태 선택 (생성 모드에서만) */}
      {isCreateMode && (
        <View style={styles.readingStatusSection}>
          <TouchableOpacity
            style={[
              styles.readingStatusButton,
              {
                borderColor: getStatusColor(readingStatus),
                backgroundColor: getStatusBackgroundColor(readingStatus),
              },
            ]}
            onPress={handleOpenReadingStatusModal}
            disabled={isSubmitting}
          >
            <View style={styles.readingStatusContent}>
              <Text style={styles.statusIcon}>{getStatusIcon(readingStatus)}</Text>
              <Text style={[styles.statusText, { color: getStatusColor(readingStatus) }]}>
                {readingStatus ? StatusTexts[readingStatus] : StatusTexts['NONE']}
              </Text>
              <ChevronDown size={16} color={getStatusColor(readingStatus)} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* 리뷰 내용 입력 */}
      <View style={styles.textInputSection}>
        <TextInput
          ref={textInputRef}
          value={content}
          style={[
            styles.textInput,
            {
              backgroundColor: isDeleteMode ? '#FEF2F2' : isCreateMode ? '#F0FDF4' : '#F9FAFB',
            },
          ]}
          multiline
          numberOfLines={6}
          onChangeText={handleTextChange}
          placeholder={
            isDeleteMode ? '내용을 비워두면 리뷰가 삭제됩니다' : '이 책에 대한 리뷰를 남겨주세요'
          }
          placeholderTextColor='#9CA3AF'
          editable={!isSubmitting}
          textAlignVertical='top'
        />
      </View>

      {/* 버튼 섹션 */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleClose}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.submitButton,
            {
              backgroundColor: isDeleteMode ? '#EF4444' : AppColors.primary,
              opacity: rating === 0 || isSubmitting ? 0.5 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          <View style={styles.submitButtonContent}>
            {isDeleteMode ? (
              <Trash2 size={16} color='white' />
            ) : (
              <PenLine size={16} color='white' />
            )}
            <Text style={styles.submitButtonText}>{getButtonText()}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </BottomSheetView>
  );

  return (
    <>
      {/* Main Review BottomSheet */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        enableDynamicSizing={true}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        backdropComponent={renderMainBackdrop}
        handleIndicatorStyle={styles.dragHandle}
        backgroundStyle={styles.modalContainer}
        enableOverDrag={false}
        enableContentPanningGesture={false}
      >
        {renderContent()}
      </BottomSheetModal>

      {/* Reading Status Selection Modal */}
      <Modal
        visible={isReadingStatusModalVisible}
        transparent={true}
        animationType='none'
        onRequestClose={closeReadingStatusModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeReadingStatusModal}
        >
          <View style={styles.modalWrapper}>
            <PanGestureHandler
              onHandlerStateChange={onHandlePanGestureEvent}
              activeOffsetY={10}
              failOffsetY={-10}
            >
              <Animated.View
                style={[
                  styles.readingStatusModalContainer,
                  {
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                  <View style={styles.modalHandle} />

                  <View style={styles.optionsContainer}>
                    {Object.values(ReadingStatusType).map(status => {
                      const isSelected = readingStatus === status;
                      const statusColor = getStatusColor(status);
                      const backgroundColor = getStatusBackgroundColor(status);

                      return (
                        <TouchableOpacity
                          key={status}
                          style={[styles.optionItem, isSelected && { backgroundColor }]}
                          onPress={() => handleReadingStatusSelect(status)}
                        >
                          <Text style={styles.statusIcon}>{getStatusIcon(status)}</Text>
                          <Text style={[styles.optionText, { color: statusColor }]}>
                            {StatusTexts[status]}
                          </Text>
                          {isSelected && (
                            <Text style={[styles.checkMark, { color: statusColor }]}>✓</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}

                    {/* 선택 안함 옵션 */}
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        styles.noneOptionBorder,
                        readingStatus === null && {
                          backgroundColor: getStatusBackgroundColor(null),
                        },
                      ]}
                      onPress={() => handleReadingStatusSelect(null)}
                    >
                      <Text style={styles.statusIcon}>❌</Text>
                      <Text style={[styles.optionText, { color: '#EF4444' }]}>
                        {StatusTexts['NONE']}
                      </Text>
                      {readingStatus === null && (
                        <Text style={[styles.checkMark, { color: '#EF4444' }]}>✓</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </PanGestureHandler>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  descriptionContainer: {
    paddingVertical: 16,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  bookTitle: {
    fontWeight: '600',
    color: '#111827',
  },
  ratingSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  resetButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  ratingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  readingStatusSection: {
    marginVertical: 16,
  },
  readingStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  readingStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  textInputSection: {
    marginVertical: 16,
  },
  textInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  buttonSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  optionsContainer: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 0,
    borderColor: 'transparent',
    marginBottom: 8,
    marginHorizontal: 4,
    gap: 12,
    backgroundColor: 'transparent',
    minHeight: 56,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  checkMark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  noneOptionBorder: {
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    marginTop: 8,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  selectedOption: {
    backgroundColor: '#F0FDF4',
    borderColor: AppColors.primary,
  },
  readingStatusContainer: {
    padding: 20,
  },
  readingStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  readingStatusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  readingStatusModal: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalWrapper: {
    flex: 0,
  },
  readingStatusModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
});
