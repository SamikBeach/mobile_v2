import React, { useState, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
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
  LogOut,
} from 'lucide-react-native';
import { useAtomValue, useSetAtom } from 'jotai';
import Toast from 'react-native-toast-message';
import { userAtom } from '../../atoms/user';
import { authUtils } from '../../apis/axios';
import { logout } from '../../apis/auth';
import { ProfileEditBottomSheet } from './components/ProfileEditBottomSheet';
import { FollowListBottomSheet } from './components/FollowListBottomSheet';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../../apis/user';

// Profile Header Component
const ProfileHeader: React.FC = () => {
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [followDialogType, setFollowDialogType] = useState<'followers' | 'following' | null>(null);

  // 프로필 데이터 - 추후 API에서 받아올 예정
  const profileData = {
    followers: 0,
    following: 0,
    isFollowing: false,
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            // 서버에 로그아웃 요청
            await logout();

            // 로컬 토큰 제거
            await authUtils.removeTokens();

            // 사용자 상태 초기화
            setUser(null);

            // 성공 Toast 메시지
            Toast.show({
              type: 'success',
              text1: '로그아웃 완료',
              text2: '안전하게 로그아웃되었습니다.',
              position: 'top',
              visibilityTime: 2000,
            });
          } catch (error) {
            console.error('Logout error:', error);

            // 에러가 발생해도 로컬 상태는 초기화
            await authUtils.removeTokens();
            setUser(null);

            Toast.show({
              type: 'info',
              text1: '로그아웃 완료',
              text2: '로그아웃되었습니다.',
              position: 'top',
              visibilityTime: 2000,
            });
          }
        },
      },
    ]);
  };

  if (!user) return null;

  const displayName = user.username || user.email?.split('@')[0] || '';
  const initial = displayName.charAt(0).toUpperCase();

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
                  onPress={() => setFollowDialogType('following')}
                >
                  <Text style={styles.followNumber}>{profileData.following}</Text>
                  <Text style={styles.followLabel}>팔로잉</Text>
                </TouchableOpacity>
                <View style={styles.followDivider} />
                <TouchableOpacity
                  style={styles.followButton}
                  onPress={() => setFollowDialogType('followers')}
                >
                  <Text style={styles.followNumber}>{profileData.followers}</Text>
                  <Text style={styles.followLabel}>팔로워</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => setIsEditDialogOpen(true)}
            >
              <UserCircle size={16} color='#374151' />
              <Text style={styles.editProfileText}>프로필 편집</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={16} color='#EF4444' />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Profile Edit Bottom Sheet */}
      <ProfileEditBottomSheet
        isVisible={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        profileData={user}
      />

      {/* Follow List Bottom Sheet */}
      {followDialogType && (
        <FollowListBottomSheet
          userId={user.id}
          type={followDialogType}
          isVisible={true}
          onClose={() => setFollowDialogType(null)}
        />
      )}
    </View>
  );
};

// Profile Summary Component
interface ProfileSummaryProps {
  selectedSection: string;
  onSectionChange: (section: string) => void;
}

const ProfileSummary: React.FC<ProfileSummaryProps> = ({ selectedSection, onSectionChange }) => {
  // 프로필 통계 데이터 - 추후 API에서 받아올 예정
  const profileData = {
    readCount: 0,
    reviewAndRatingCount: 0,
    averageRating: 0,
    libraryCount: 0,
    communityCount: 0,
    subscribedLibraryCount: 0,
  };

  const getSectionStyle = (sectionId: string, baseColor: string, selectedColor: string) => {
    const isSelected = selectedSection === sectionId;
    return {
      backgroundColor: isSelected ? selectedColor : `${baseColor}50`,
      iconBackgroundColor: isSelected ? `${selectedColor}80` : `${baseColor}80`,
      textColor: isSelected ? '#111827' : '#374151',
      iconColor: isSelected ? '#1F2937' : '#4B5563',
    };
  };

  const sections = [
    {
      id: 'read',
      icon: Book,
      count: profileData.readCount,
      label: '읽은 책',
      ...getSectionStyle('read', '#8B5CF6', '#DDD6FE'),
    },
    {
      id: 'reviews',
      icon: MessageSquare,
      count: profileData.reviewAndRatingCount,
      label: '리뷰와 별점',
      rating: profileData.averageRating,
      ...getSectionStyle('reviews', '#F43F5E', '#FECDD3'),
    },
    {
      id: 'libraries',
      icon: BookOpen,
      count: profileData.libraryCount,
      label: '서재',
      ...getSectionStyle('libraries', '#0EA5E9', '#BAE6FD'),
    },
    {
      id: 'community',
      icon: Users,
      count: profileData.communityCount,
      label: '커뮤니티',
      ...getSectionStyle('community', '#F59E0B', '#FDE68A'),
    },
    {
      id: 'subscriptions',
      icon: Bell,
      count: profileData.subscribedLibraryCount,
      label: '구독 서재',
      ...getSectionStyle('subscriptions', '#10B981', '#A7F3D0'),
    },
    {
      id: 'stats',
      icon: AreaChart,
      count: 0,
      label: '독서 통계',
      ...getSectionStyle('stats', '#8B5CF6', '#DDD6FE'),
    },
  ];

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryGrid}>
        {sections.map(section => (
          <TouchableOpacity
            key={section.id}
            style={[styles.summaryButton, { backgroundColor: section.backgroundColor }]}
            onPress={() => onSectionChange(section.id)}
          >
            <View
              style={[
                styles.summaryIconContainer,
                { backgroundColor: section.iconBackgroundColor },
              ]}
            >
              <section.icon size={20} color={section.iconColor} />
            </View>
            <View style={styles.summaryTextContainer}>
              {section.id === 'reviews' ? (
                <View style={styles.reviewContainer}>
                  <Text style={[styles.summaryCount, { color: section.textColor }]}>
                    {section.count}
                  </Text>
                  {'rating' in section && (
                    <Text style={styles.ratingText}>★{section.rating?.toFixed(1) || '0.0'}</Text>
                  )}
                </View>
              ) : (
                <Text style={[styles.summaryCount, { color: section.textColor }]}>
                  {section.count}
                </Text>
              )}
              <Text style={[styles.summaryLabel, { color: section.textColor }]}>
                {section.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Section Content Components
const ReadBooksSection: React.FC = () => (
  <View style={styles.sectionContainer}>
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>📚</Text>
      <Text style={styles.emptyStateTitle}>아직 읽은 책이 없습니다</Text>
      <Text style={styles.emptyStateSubtitle}>첫 번째 책을 읽고 기록해보세요!</Text>
    </View>
  </View>
);

const ReviewsSection: React.FC = () => (
  <View style={styles.sectionContainer}>
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>✍️</Text>
      <Text style={styles.emptyStateTitle}>작성한 리뷰가 없습니다</Text>
      <Text style={styles.emptyStateSubtitle}>첫 번째 리뷰를 작성해보세요!</Text>
    </View>
  </View>
);

const LibrariesSection: React.FC = () => (
  <View style={styles.sectionContainer}>
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>📖</Text>
      <Text style={styles.emptyStateTitle}>만든 서재가 없습니다</Text>
      <Text style={styles.emptyStateSubtitle}>첫 번째 서재를 만들어보세요!</Text>
    </View>
  </View>
);

const CommunitySection: React.FC = () => (
  <View style={styles.sectionContainer}>
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>💬</Text>
      <Text style={styles.emptyStateTitle}>커뮤니티 활동이 없습니다</Text>
      <Text style={styles.emptyStateSubtitle}>다른 독서가들과 이야기를 나눠보세요!</Text>
    </View>
  </View>
);

const SubscriptionsSection: React.FC = () => (
  <View style={styles.sectionContainer}>
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>🔔</Text>
      <Text style={styles.emptyStateTitle}>구독한 서재가 없습니다</Text>
      <Text style={styles.emptyStateSubtitle}>관심있는 서재를 구독해보세요!</Text>
    </View>
  </View>
);

const StatsSection: React.FC = () => (
  <View style={styles.sectionContainer}>
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>📊</Text>
      <Text style={styles.emptyStateTitle}>독서 통계</Text>
      <Text style={styles.emptyStateSubtitle}>책을 읽기 시작하면 통계가 나타납니다!</Text>
    </View>
  </View>
);

// Loading Skeleton
const ProfileSkeleton: React.FC = () => (
  <ScrollView style={styles.container}>
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.profileRow}>
          <View style={styles.profileLeft}>
            <View style={[styles.avatarContainer, styles.skeleton]} />
            <View style={styles.userInfo}>
              <View style={[styles.skeletonText, { width: 120, height: 20 }]} />
              <View style={[styles.skeletonText, { width: 200, height: 16, marginTop: 4 }]} />
              <View style={[styles.skeletonText, { width: 100, height: 14, marginTop: 8 }]} />
            </View>
          </View>
          <View style={[styles.editProfileButton, styles.skeleton]} />
        </View>
      </View>
    </View>
    <View style={styles.summaryContainer}>
      <View style={styles.summaryGrid}>
        {[...Array(6)].map((_, index) => (
          <View key={index} style={[styles.summaryButton, styles.skeleton]} />
        ))}
      </View>
    </View>
    <View style={styles.sectionContainer}>
      <ActivityIndicator size='large' color='#6B7280' style={{ marginTop: 40 }} />
    </View>
  </ScrollView>
);

// Profile Content Component
const ProfileContent: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState('read');

  const { data: userProfile } = useSuspenseQuery({
    queryKey: ['user-profile'],
    queryFn: getCurrentUser,
  });

  const renderSectionContent = () => {
    switch (selectedSection) {
      case 'read':
        return <ReadBooksSection />;
      case 'reviews':
        return <ReviewsSection />;
      case 'libraries':
        return <LibrariesSection />;
      case 'community':
        return <CommunitySection />;
      case 'subscriptions':
        return <SubscriptionsSection />;
      case 'stats':
        return <StatsSection />;
      default:
        return <ReadBooksSection />;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ProfileHeader />
      <ProfileSummary selectedSection={selectedSection} onSectionChange={setSelectedSection} />
      {renderSectionContent()}
    </ScrollView>
  );
};

// Main Profile Screen Component
export const ProfileScreen: React.FC = () => {
  const user = useAtomValue(userAtom);

  if (!user) {
    return (
      <View style={styles.notLoggedInContainer}>
        <Text style={styles.notLoggedInText}>로그인이 필요합니다</Text>
      </View>
    );
  }

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  notLoggedInText: {
    fontSize: 16,
    color: '#6B7280',
  },

  // Header Styles - 웹 버전과 동일한 레이아웃
  headerContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    width: '100%',
  },
  profileRow: {
    flexDirection: 'column',
    gap: 16,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
    fontSize: 24,
    fontWeight: '500',
    color: '#6B7280',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  bio: {
    marginTop: 4,
    maxWidth: 300,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  followStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  followNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  followLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  followDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },

  // Summary Styles - 웹 버전과 동일한 그리드 레이아웃
  summaryContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  summaryButton: {
    width: '32%',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minHeight: 80,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTextContainer: {
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  reviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F59E0B',
  },

  // Section Styles
  sectionContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Skeleton Styles
  skeleton: {
    backgroundColor: '#F3F4F6',
  },
  skeletonText: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
});
