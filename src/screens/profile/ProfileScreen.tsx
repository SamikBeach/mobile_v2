import React, { useState, Suspense, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import {
  User,
  UserCircle,
  UserPlus,
  Check,
  Book,
  MessageSquare,
  BookOpen,
  Users,
  AreaChart,
  Bell,
  ChevronRight,
} from 'lucide-react-native';
import { useAtomValue } from 'jotai';
import Toast from 'react-native-toast-message';
import { useRoute, RouteProp } from '@react-navigation/native';
import { userAtom } from '../../atoms/user';
import { LoadingSpinner } from '../../components';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useIsMyProfile } from '../../hooks/useIsMyProfile';
import { useUserFollow } from '../../hooks/useUserFollow';
import { ProfileEditBottomSheet } from '../my/components/ProfileEditBottomSheet';
import { ReadBooksSection } from './components/ReadBooksSection';
import { ReviewsSection as ReviewsSectionComponent } from './components/ReviewsSection';
import { LibrariesSection as LibrariesSectionComponent } from './components/LibrariesSection';

const { width: screenWidth } = Dimensions.get('window');

// Route params type
type ProfileScreenRouteProp = RouteProp<
  { Profile: { userId?: number; section?: string } },
  'Profile'
>;

// Error Fallback Component
const ErrorFallback: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>정보를 불러올 수 없습니다</Text>
    <Text style={styles.errorSubtitle}>프로필 정보를 불러오는 중 문제가 발생했습니다.</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>다시 시도</Text>
    </TouchableOpacity>
  </View>
);

// Profile Header Component
const ProfileHeader: React.FC<{ userId: number }> = ({ userId }) => {
  const currentUser = useAtomValue(userAtom);
  const { profileData } = useUserProfile(userId);
  const isMyProfile = useIsMyProfile(userId);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [followDialogType, setFollowDialogType] = useState<'followers' | 'following' | null>(null);

  // 프론트엔드와 동일한 방식으로 구조분해할당 (Suspense 덕분에 항상 데이터 존재)
  const { user, followers, following, isFollowing: initialIsFollowing } = profileData;

  const { isFollowing, setIsFollowing, toggleFollow, isLoading } = useUserFollow(
    initialIsFollowing || false
  );

  // 초기 팔로우 상태 설정
  useEffect(() => {
    if (initialIsFollowing !== undefined) {
      setIsFollowing(initialIsFollowing);
    }
  }, [initialIsFollowing, setIsFollowing]);

  // 사용자 표시 정보 설정
  const displayName = user.username || user.email?.split('@')[0] || '';
  const initial = displayName.charAt(0);

  // 팔로우 버튼 클릭 핸들러
  const handleFollowClick = async () => {
    if (!currentUser) {
      Alert.alert('로그인 필요', '팔로우하려면 로그인이 필요합니다.');
      return;
    }

    await toggleFollow(user.id, user.username);
  };

  // 프로필 편집 다이얼로그 열기
  const handleOpenEditDialog = () => {
    setIsEditDialogOpen(true);
  };

  // 팔로워/팔로잉 다이얼로그 열기
  const handleOpenFollowDialog = (type: 'followers' | 'following') => {
    setFollowDialogType(type);
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.profileRow}>
          <View style={styles.profileLeft}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {user.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
              )}
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>{displayName}</Text>
              </View>
              <Text style={styles.bio}>{user.bio || '자기소개가 없습니다.'}</Text>
              <View style={styles.followStats}>
                <TouchableOpacity
                  style={styles.followButton}
                  onPress={() => handleOpenFollowDialog('following')}
                >
                  <Text style={styles.followNumber}>{following}</Text>
                  <Text style={styles.followLabel}>팔로잉</Text>
                </TouchableOpacity>
                <View style={styles.followDivider} />
                <TouchableOpacity
                  style={styles.followButton}
                  onPress={() => handleOpenFollowDialog('followers')}
                >
                  <Text style={styles.followNumber}>{followers}</Text>
                  <Text style={styles.followLabel}>팔로워</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.actionButtonContainer}>
            {isMyProfile ? (
              <TouchableOpacity style={styles.editButton} onPress={handleOpenEditDialog}>
                <UserCircle size={16} color='#374151' />
                <Text style={styles.editButtonText}>프로필 편집</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.followActionButton,
                  isFollowing ? styles.followingButton : styles.notFollowingButton,
                ]}
                onPress={handleFollowClick}
                disabled={isLoading}
              >
                {isFollowing ? (
                  <>
                    <Check size={16} color='#374151' />
                    <Text style={styles.followingButtonText}>팔로잉</Text>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} color='white' />
                    <Text style={styles.notFollowingButtonText}>팔로우</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* 프로필 편집 BottomSheet */}
      <ProfileEditBottomSheet
        isVisible={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        profileData={profileData}
      />
    </View>
  );
};

// Profile Summary Component
const ProfileSummary: React.FC<{
  userId: number;
  selectedSection: string;
  onSectionChange: (section: string) => void;
}> = ({ userId, selectedSection, onSectionChange }) => {
  const { profileData } = useUserProfile(userId);

  // 프론트엔드와 동일한 방식으로 구조분해할당 (Suspense 덕분에 항상 데이터 존재)
  const { libraryCount, readCount, subscribedLibraryCount, ratingCount } = profileData;

  // 평균 별점 API에서 가져오기 (null인 경우 0으로 처리)
  const averageRating = profileData.averageRating ?? 0;

  const summaryItems = [
    {
      id: 'read',
      label: '읽은 책',
      value: readCount,
      icon: Book,
      colors: {
        bg: selectedSection === 'read' ? '#DDD6FE' : '#F5F3FF',
        iconBg: selectedSection === 'read' ? '#C4B5FD' : '#DDD6FE',
        iconColor: selectedSection === 'read' ? '#5B21B6' : '#7C3AED',
        textColor: selectedSection === 'read' ? '#111827' : '#374151',
      },
    },
    {
      id: 'reviews',
      label: '리뷰와 별점',
      value: profileData.reviewAndRatingCount || profileData.reviewCount.review + ratingCount,
      extraValue: `★${averageRating.toFixed(1)}`,
      icon: MessageSquare,
      colors: {
        bg: selectedSection === 'reviews' ? '#FECACA' : '#FEF2F2',
        iconBg: selectedSection === 'reviews' ? '#FCA5A5' : '#FECACA',
        iconColor: selectedSection === 'reviews' ? '#991B1B' : '#DC2626',
        textColor: selectedSection === 'reviews' ? '#111827' : '#374151',
      },
    },
    {
      id: 'libraries',
      label: '서재',
      value: libraryCount,
      icon: BookOpen,
      colors: {
        bg: selectedSection === 'libraries' ? '#BAE6FD' : '#EFF6FF',
        iconBg: selectedSection === 'libraries' ? '#7DD3FC' : '#BAE6FD',
        iconColor: selectedSection === 'libraries' ? '#0C4A6E' : '#0369A1',
        textColor: selectedSection === 'libraries' ? '#111827' : '#374151',
      },
    },
    {
      id: 'community',
      label: '커뮤니티',
      value:
        profileData.reviewCount.general +
        profileData.reviewCount.discussion +
        profileData.reviewCount.question +
        profileData.reviewCount.meetup,
      icon: Users,
      colors: {
        bg: selectedSection === 'community' ? '#FDE68A' : '#FFFBEB',
        iconBg: selectedSection === 'community' ? '#FCD34D' : '#FDE68A',
        iconColor: selectedSection === 'community' ? '#92400E' : '#D97706',
        textColor: selectedSection === 'community' ? '#111827' : '#374151',
      },
    },
    {
      id: 'subscriptions',
      label: '구독한 서재',
      value: subscribedLibraryCount,
      icon: Bell,
      colors: {
        bg: selectedSection === 'subscriptions' ? '#A7F3D0' : '#ECFDF5',
        iconBg: selectedSection === 'subscriptions' ? '#6EE7B7' : '#A7F3D0',
        iconColor: selectedSection === 'subscriptions' ? '#065F46' : '#059669',
        textColor: selectedSection === 'subscriptions' ? '#111827' : '#374151',
      },
    },
    {
      id: 'stats',
      label: '통계',
      value: null,
      icon: AreaChart,
      colors: {
        bg: selectedSection === 'stats' ? '#C7D2FE' : '#EEF2FF',
        iconBg: selectedSection === 'stats' ? '#A5B4FC' : '#C7D2FE',
        iconColor: selectedSection === 'stats' ? '#312E81' : '#4338CA',
        textColor: selectedSection === 'stats' ? '#111827' : '#374151',
      },
    },
  ];

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryGrid}>
        {summaryItems.map(item => {
          const IconComponent = item.icon;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.summaryItem, { backgroundColor: item.colors.bg }]}
              onPress={() => onSectionChange(item.id)}
            >
              <View style={[styles.summaryIconContainer, { backgroundColor: item.colors.iconBg }]}>
                <IconComponent size={20} color={item.colors.iconColor} />
              </View>
              <View style={styles.summaryContent}>
                {item.value !== null ? (
                  <View style={styles.summaryValueRow}>
                    <Text style={[styles.summaryValue, { color: item.colors.textColor }]}>
                      {item.value}
                    </Text>
                    {item.extraValue && (
                      <Text style={styles.summaryExtraValue}>{item.extraValue}</Text>
                    )}
                  </View>
                ) : (
                  <Text style={[styles.summaryValue, { color: item.colors.textColor }]}>
                    {'\u00A0'}
                  </Text>
                )}
                <Text style={[styles.summaryLabel, { color: item.colors.textColor }]}>
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Section Content Components (placeholders)

const CommunitySection: React.FC = () => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>커뮤니티 활동</Text>
    <Text style={styles.sectionPlaceholder}>커뮤니티 활동이 여기에 표시됩니다.</Text>
  </View>
);

const SubscriptionsSection: React.FC = () => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>구독한 서재</Text>
    <Text style={styles.sectionPlaceholder}>구독한 서재가 여기에 표시됩니다.</Text>
  </View>
);

const StatsSection: React.FC = () => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>통계</Text>
    <Text style={styles.sectionPlaceholder}>통계 정보가 여기에 표시됩니다.</Text>
  </View>
);

// Loading Skeletons
const HeaderSkeleton: React.FC = () => (
  <View style={styles.headerContainer}>
    <View style={styles.headerContent}>
      <View style={styles.profileRow}>
        <View style={styles.profileLeft}>
          <View style={[styles.avatarContainer, styles.skeletonAvatar]} />
          <View style={styles.userInfo}>
            <View style={[styles.skeletonText, { width: 120, height: 20 }]} />
            <View style={[styles.skeletonText, { width: 200, height: 16, marginTop: 4 }]} />
            <View style={styles.followStats}>
              <View style={[styles.skeletonText, { width: 60, height: 16 }]} />
              <View style={[styles.skeletonText, { width: 60, height: 16 }]} />
            </View>
          </View>
        </View>
        <View style={[styles.skeletonText, { width: 80, height: 36 }]} />
      </View>
    </View>
  </View>
);

const SummarySkeleton: React.FC = () => (
  <View style={styles.summaryContainer}>
    <View style={styles.summaryGrid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View key={index} style={[styles.summaryItem, styles.skeletonSummaryItem]}>
          <View style={[styles.summaryIconContainer, styles.skeletonIcon]} />
          <View style={styles.summaryContent}>
            <View style={[styles.skeletonText, { width: 30, height: 20 }]} />
            <View style={[styles.skeletonText, { width: 50, height: 12, marginTop: 4 }]} />
          </View>
        </View>
      ))}
    </View>
  </View>
);

// Profile Content Component with Error Boundary
const ProfileContent: React.FC<{ userId: number }> = ({ userId }) => {
  const [selectedSection, setSelectedSection] = useState('read');

  // userId가 유효하지 않은 경우 처리
  if (!userId || isNaN(userId)) {
    return <ErrorFallback onRetry={() => {}} />;
  }

  const renderSectionContent = () => {
    switch (selectedSection) {
      case 'read':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ReadBooksSection userId={userId} />
          </Suspense>
        );
      case 'reviews':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ReviewsSectionComponent userId={userId} />
          </Suspense>
        );
      case 'libraries':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <LibrariesSectionComponent userId={userId} />
          </Suspense>
        );
      case 'community':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CommunitySection />
          </Suspense>
        );
      case 'subscriptions':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <SubscriptionsSection />
          </Suspense>
        );
      case 'stats':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <StatsSection />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ReadBooksSection userId={userId} />
          </Suspense>
        );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 프로필 헤더 */}
      <Suspense fallback={<HeaderSkeleton />}>
        <ProfileHeader userId={userId} />
      </Suspense>

      {/* 독서 정보 개요 */}
      <Suspense fallback={<SummarySkeleton />}>
        <ProfileSummary
          userId={userId}
          selectedSection={selectedSection}
          onSectionChange={setSelectedSection}
        />
      </Suspense>

      {/* 섹션 컨텐츠 */}
      <View style={styles.contentContainer}>{renderSectionContent()}</View>
    </ScrollView>
  );
};

// Main Profile Screen Component
export const ProfileScreen: React.FC = () => {
  const route = useRoute<ProfileScreenRouteProp>();
  const currentUser = useAtomValue(userAtom);

  // route params가 있으면 사용하고, 없으면 현재 사용자 ID 사용
  const userId = route.params?.userId || currentUser?.id;
  const section = route.params?.section || 'read';

  const handleRetry = () => {
    // 페이지 새로고침 로직
    // React Navigation에서는 리로드 대신 refetch 등을 사용
  };

  // userId가 없는 경우 로그인 필요 화면
  if (!userId) {
    return <ErrorFallback onRetry={() => {}} />;
  }

  return (
    <View style={styles.wrapper}>
      <Suspense
        fallback={
          <View style={styles.loadingContainer}>
            <HeaderSkeleton />
            <SummarySkeleton />
            <LoadingSpinner />
          </View>
        }
      >
        <ProfileContent userId={userId} />
      </Suspense>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  headerContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerContent: {
    width: '100%',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 16,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: 'white',
    marginRight: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  defaultAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '500',
    color: '#374151',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  bio: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  followStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 4,
  },
  followLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  followDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  actionButtonContainer: {
    justifyContent: 'flex-start',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 6,
  },
  followActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  followingButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  notFollowingButton: {
    backgroundColor: '#111827',
  },
  followingButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 6,
  },
  notFollowingButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginLeft: 6,
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: (screenWidth - 48) / 3, // 3개씩 배치, 패딩 고려
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryExtraValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D97706',
    marginLeft: 4,
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  sectionPlaceholder: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 40,
  },
  // Skeleton styles
  skeletonAvatar: {
    backgroundColor: '#F3F4F6',
  },
  skeletonText: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  skeletonSummaryItem: {
    backgroundColor: '#F9FAFB',
  },
  skeletonIcon: {
    backgroundColor: '#E5E7EB',
  },
});
