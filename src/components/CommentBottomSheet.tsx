import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Send, ThumbsUp, Trash2, MessageCircle } from 'lucide-react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Comment } from '../apis/review/types';

interface CommentBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  comments: Comment[];
  commentText: string;
  setCommentText: (text: string) => void;
  onSubmitComment: () => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  onLikeComment: (commentId: number, isLiked: boolean) => Promise<void>;
  isLoading: boolean;
  currentUserId?: number;
}

// 댓글 아이템 컴포넌트
const CommentItem = ({
  comment,
  onDelete,
  onLike,
  currentUserId,
}: {
  comment: Comment;
  onDelete: (commentId: number) => void;
  onLike: (commentId: number, isLiked: boolean) => void;
  currentUserId?: number;
}) => {
  const formatDate = (date: Date | string) => {
    const commentDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - commentDate.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays <= 7) return `${diffDays}일 전`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}주 전`;
    return `${Math.ceil(diffDays / 30)}개월 전`;
  };

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  const isAuthor = currentUserId === comment.author.id;

  const handleDelete = () => {
    Alert.alert('댓글 삭제', '정말로 이 댓글을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => onDelete(comment.id) },
    ]);
  };

  return (
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
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Trash2 size={14} color='#6B7280' />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.commentContent}>{comment.content}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity
          style={[styles.commentActionButton, comment.isLiked && styles.commentActionButtonLiked]}
          onPress={() => onLike(comment.id, comment.isLiked || false)}
        >
          <ThumbsUp
            size={14}
            color={comment.isLiked ? '#059669' : '#6B7280'}
            fill={comment.isLiked ? '#059669' : 'transparent'}
          />
          <Text
            style={[styles.commentActionText, comment.isLiked && styles.commentActionTextLiked]}
          >
            {comment.likeCount || 0}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const CommentBottomSheet: React.FC<CommentBottomSheetProps> = ({
  isVisible,
  onClose,
  comments,
  commentText,
  setCommentText,
  onSubmitComment,
  onDeleteComment,
  onLikeComment,
  isLoading,
  currentUserId,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const textInputRef = useRef<TextInput>(null);

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
      // 바텀시트가 열린 후 잠시 기다렸다가 포커스
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  // Submit comment handler
  const handleSubmit = async () => {
    if (!commentText.trim() || isLoading) return;
    await onSubmitComment();
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
  const renderCommentItem = ({ item }: { item: Comment }) => (
    <CommentItem
      comment={item}
      onDelete={onDeleteComment}
      onLike={onLikeComment}
      currentUserId={currentUserId}
    />
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

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={['75%']}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.dragHandle}
      backgroundStyle={styles.modalContainer}
      keyboardBehavior='interactive'
      keyboardBlurBehavior='restore'
      android_keyboardInputMode='adjustResize'
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>댓글 {comments.length}개</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>

        {/* Comments List */}
        <FlatList
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={item => item.id.toString()}
          style={styles.commentsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyComments}
          contentContainerStyle={comments.length === 0 ? styles.emptyListContainer : undefined}
        />

        {/* Comment Input - Fixed at bottom */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                placeholder='댓글을 입력하세요...'
                placeholderTextColor='#9CA3AF'
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: commentText.trim() && !isLoading ? '#16A34A' : '#D1D5DB',
                  },
                ]}
                onPress={handleSubmit}
                disabled={!commentText.trim() || isLoading}
              >
                <Send size={16} color='white' />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BottomSheetView>
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  deleteButton: {
    padding: 4,
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
    paddingBottom: 16,
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
    fontSize: 16,
    maxHeight: 120,
    textAlignVertical: 'center',
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
