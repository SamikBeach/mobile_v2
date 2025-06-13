import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Send, ThumbsUp, MoreHorizontal, MessageCircle } from 'lucide-react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReviewComment } from '../apis/review/types';
import { CommentActionBottomSheet } from './CommentActionBottomSheet';

interface CommentBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  comments: ReviewComment[];
  onSubmitComment: (comment: string) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  onLikeComment: (commentId: number, isLiked: boolean) => Promise<void>;
  onUpdateComment?: (commentId: number, content: string) => Promise<void>;
  isLoading: boolean;
  currentUserId?: number;
}

// 댓글 아이템 컴포넌트
const CommentItem = ({
  comment,
  onDelete,
  onLike,
  onUpdate,
  currentUserId,
}: {
  comment: ReviewComment;
  onDelete: (commentId: number) => void;
  onLike: (commentId: number, isLiked: boolean) => void;
  onUpdate?: (commentId: number, content: string) => void;
  currentUserId?: number;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const commentActionBottomSheetRef = useRef<BottomSheetModal>(null);

  const formatDate = (date: Date | string) => {
    const commentDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - commentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays <= 7) return `${diffDays}일 전`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}주 전`;
    return `${Math.ceil(diffDays / 30)}개월 전`;
  };

  const getInitials = (username: string) => {
    return username.charAt(0);
  };

  const isAuthor = currentUserId === comment.author.id;

  const handleMorePress = () => {
    commentActionBottomSheetRef.current?.present();
  };

  const handleEdit = () => {
    commentActionBottomSheetRef.current?.dismiss();
    setIsEditing(true);
    setEditText(comment.content);
  };

  const handleDelete = () => {
    commentActionBottomSheetRef.current?.dismiss();
    Alert.alert('댓글 삭제', '이 댓글을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => onDelete(comment.id),
      },
    ]);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;

    try {
      if (onUpdate) {
        await onUpdate(comment.id, editText.trim());
      }
      setIsEditing(false);
    } catch {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '댓글 수정 중 오류가 발생했습니다.',
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(comment.content);
  };

  return (
    <>
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUserInfo}>
            <View style={styles.commentAvatar}>
              <Text style={styles.commentAvatarText}>{getInitials(comment.author.username)}</Text>
            </View>
            <View style={styles.commentUserDetails}>
              <Text style={styles.commentUsername}>{comment.author.username}</Text>
              <Text style={styles.commentTime}>{formatDate(comment.createdAt)}</Text>
            </View>
          </View>
          {isAuthor && (
            <TouchableOpacity onPress={handleMorePress} style={styles.moreButton}>
              <MoreHorizontal size={14} color='#6B7280' />
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          // 수정 모드
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              multiline
              placeholder='댓글을 수정하세요...'
              placeholderTextColor='#9CA3AF'
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.editCancelButton} onPress={handleCancelEdit}>
                <Text style={styles.editCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editSaveButton} onPress={handleSaveEdit}>
                <Text style={styles.editSaveText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // 일반 표시 모드
          <>
            <Text style={styles.commentContent}>{comment.content}</Text>
            <View style={styles.commentActions}>
              <TouchableOpacity
                style={[
                  styles.commentActionButton,
                  comment.isLiked && styles.commentActionButtonLiked,
                ]}
                onPress={() => onLike(comment.id, comment.isLiked || false)}
              >
                <ThumbsUp
                  size={14}
                  color={comment.isLiked ? '#059669' : '#6B7280'}
                  fill={comment.isLiked ? '#059669' : 'transparent'}
                />
                <Text
                  style={[
                    styles.commentActionText,
                    comment.isLiked && styles.commentActionTextLiked,
                  ]}
                >
                  {comment.likeCount || 0}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* 댓글 액션 BottomSheet */}
      {isAuthor && (
        <CommentActionBottomSheet
          bottomSheetRef={commentActionBottomSheetRef}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </>
  );
};

export const CommentBottomSheet: React.FC<CommentBottomSheetProps> = ({
  isVisible,
  onClose,
  comments,
  onSubmitComment,
  onDeleteComment,
  onLikeComment,
  onUpdateComment,
  isLoading,
  currentUserId,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const textInputRef = useRef<TextInput>(null);
  const commentTextRef = useRef<string>('');
  const safeAreaInsets = useSafeAreaInsets();

  // Calculate max height based on screen height and safe area
  const maxHeight = `${85}%`;

  useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  // Submit comment handler
  const handleSubmit = async () => {
    console.log('🚀 handleSubmit called');
    console.log('📝 isLoading:', isLoading);

    if (isLoading) {
      console.log('❌ Blocked: already loading');
      return;
    }

    const inputText = commentTextRef.current;
    console.log('💬 Input text from ref:', `"${inputText}"`);
    console.log('📏 Input text length:', inputText.length);
    console.log('🔍 Trimmed text:', `"${inputText.trim()}"`);

    if (!inputText.trim()) {
      console.log('❌ Blocked: empty text after trim');
      return;
    }

    try {
      console.log('📤 Calling onSubmitComment with:', `"${inputText}"`);
      await onSubmitComment(inputText);
      console.log('✅ onSubmitComment completed successfully');

      // Clear the ref and input after successful submission
      commentTextRef.current = '';
      if (textInputRef.current) {
        textInputRef.current.clear();
        console.log('🧹 Input cleared');
      }
    } catch (error) {
      console.error('❌ Error in onSubmitComment:', error);
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

  // Render comment item
  const renderCommentItem = ({ item }: { item: ReviewComment }) => (
    <CommentItem
      comment={item}
      onDelete={onDeleteComment}
      onLike={onLikeComment}
      onUpdate={onUpdateComment}
      currentUserId={currentUserId}
    />
  );

  // 커스텀 핸들 컴포넌트 - 실시간 댓글 개수 사용
  const renderHandle = useCallback(
    () => (
      <View style={styles.customHandleContainer}>
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>댓글 {comments.length}개</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [comments.length, onClose] // comments.length를 dependency로 사용
  );

  // Empty state component
  const EmptyComments = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MessageCircle size={32} color='#9CA3AF' />
      </View>
      <Text style={styles.emptyTitle}>아직 댓글이 없습니다</Text>
      <Text style={styles.emptySubtitle}>이 글에 첫 번째 댓글을 작성해보세요</Text>
    </View>
  );

  // Footer component for fixed input
  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props}>
        <View style={styles.inputContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
            <View style={styles.inputWrapper}>
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                placeholder='댓글을 입력하세요...'
                placeholderTextColor='#9CA3AF'
                onChangeText={text => {
                  console.log('✏️ Text changed:', `"${text}"`);
                  commentTextRef.current = text;
                  console.log('💾 Saved to ref:', `"${commentTextRef.current}"`);
                }}
                multiline
                maxLength={500}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: !isLoading ? '#16A34A' : '#D1D5DB',
                  },
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Send size={16} color='white' />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </BottomSheetFooter>
    ),
    [isLoading, handleSubmit]
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={[maxHeight]}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      enableContentPanningGesture={false}
      backdropComponent={renderBackdrop}
      handleComponent={renderHandle}
      footerComponent={renderFooter}
      backgroundStyle={styles.modalContainer}
      keyboardBehavior='interactive'
      keyboardBlurBehavior='restore'
      android_keyboardInputMode='adjustResize'
      topInset={safeAreaInsets.top}
    >
      <BottomSheetFlatList
        data={comments}
        renderItem={renderCommentItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={EmptyComments}
        contentContainerStyle={styles.flatListContainer}
        showsVerticalScrollIndicator={false}
      />
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandle: {
    backgroundColor: '#D1D5DB',
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  listContentContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  commentItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  commentUserDetails: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  commentTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  moreButton: {
    padding: 4,
  },
  editContainer: {
    paddingVertical: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    height: 44,
    maxHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  editCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  editCancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  editSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#059669',
  },
  editSaveText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  commentActionButtonLiked: {
    backgroundColor: '#ECFDF5',
  },
  commentActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  commentActionTextLiked: {
    color: '#059669',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20, // Reduced to move input closer to bottom
    minHeight: 80, // Reduced minimum height
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    height: 44,
    maxHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsContainer: {
    flex: 1,
  },
  flatListContainer: {
    flexGrow: 1,
    paddingBottom: 240, // Much increased to prevent content being hidden behind input
  },
  customHandleContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
});
