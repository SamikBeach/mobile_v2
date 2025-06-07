import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { User, Settings, BookOpen, Heart, MessageCircle, Bell } from 'lucide-react-native';
import { AuthBottomSheet } from '../../components/Auth';

// 임시로 로그인 상태를 관리하는 상태 (나중에 실제 인증 상태로 교체)
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  return {
    isAuthenticated,
    user,
    setIsAuthenticated,
    setUser,
  };
};

export const MyScreen: React.FC = () => {
  const { isAuthenticated, user, setIsAuthenticated, setUser } = useAuth();
  const [showAuthBottomSheet, setShowAuthBottomSheet] = useState(false);

  // 로그인이 되지 않은 상태에서 화면이 포커스될 때 AuthBottomSheet를 표시
  React.useEffect(() => {
    console.log('MyScreen useEffect - isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      // 약간의 지연을 두어 화면이 완전히 렌더링된 후 BottomSheet 표시
      const timer = setTimeout(() => {
        console.log('MyScreen - 자동으로 AuthBottomSheet 표시');
        setShowAuthBottomSheet(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const handleAuthClose = () => {
    setShowAuthBottomSheet(false);
    // 로그인하지 않은 상태에서 BottomSheet를 닫으면 다시 표시할 수 있도록 프롬프트 유지
  };

  // 임시 로그인 테스트 함수
  const handleTestLogin = () => {
    setIsAuthenticated(true);
    setUser({
      id: 1,
      username: '테스트 사용자',
      email: 'test@example.com',
      profileImage: null,
    });
    setShowAuthBottomSheet(false);
  };

  // 로그인 성공 핸들러 (AuthBottomSheet에서 호출)
  const handleLoginSuccess = () => {
    // 실제 로그인 로직은 AuthBottomSheet 내부에서 처리되고,
    // 성공 시 여기서 상태 업데이트
    setShowAuthBottomSheet(false);
  };

  // 임시 로그아웃 테스트 함수
  const handleTestLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const menuItems = [
    {
      icon: BookOpen,
      title: '내 서재',
      subtitle: '읽은 책, 읽고 싶은 책을 관리하세요',
      onPress: () => console.log('내 서재'),
    },
    {
      icon: Heart,
      title: '좋아요',
      subtitle: '좋아요한 리뷰와 게시물',
      onPress: () => console.log('좋아요'),
    },
    {
      icon: MessageCircle,
      title: '내 리뷰',
      subtitle: '작성한 리뷰 보기',
      onPress: () => console.log('내 리뷰'),
    },
    {
      icon: Bell,
      title: '알림',
      subtitle: '알림 설정 및 확인',
      onPress: () => console.log('알림'),
    },
    {
      icon: Settings,
      title: '설정',
      subtitle: '계정 및 앱 설정',
      onPress: () => console.log('설정'),
    },
  ];

  if (isAuthenticated && user) {
    // 로그인된 상태의 UI
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* 프로필 섹션 */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {user.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.defaultProfileImage}>
                <User size={32} color='#6B7280' />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>편집</Text>
          </TouchableOpacity>
        </View>

        {/* 통계 섹션 */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>읽은 책</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>리뷰</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>팔로워</Text>
          </View>
        </View>

        {/* 메뉴 섹션 */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <item.icon size={20} color='#374151' />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleTestLogout}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // 로그인되지 않은 상태의 UI (빈 화면 + AuthBottomSheet)
  return (
    <View style={styles.container}>
      <View style={styles.loginPromptContainer}>
        <Text style={styles.loginPromptTitle}>로그인이 필요합니다</Text>
        <Text style={styles.loginPromptSubtitle}>더 많은 기능을 이용하려면 로그인해주세요</Text>
        <TouchableOpacity
          style={styles.loginPromptButton}
          onPress={() => setShowAuthBottomSheet(true)}
        >
          <Text style={styles.loginPromptButtonText}>로그인하기</Text>
        </TouchableOpacity>

        {/* 임시 테스트 버튼 */}
        <TouchableOpacity
          style={[styles.loginPromptButton, { backgroundColor: '#3B82F6', marginTop: 12 }]}
          onPress={handleTestLogin}
        >
          <Text style={styles.loginPromptButtonText}>임시 로그인 (테스트)</Text>
        </TouchableOpacity>
      </View>

      {/* Auth Bottom Sheet */}
      <AuthBottomSheet
        isVisible={showAuthBottomSheet}
        onClose={handleAuthClose}
        initialMode='login'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loginPromptTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  loginPromptSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginPromptButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginPromptButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  defaultProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  editButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  statsSection: {
    flexDirection: 'row',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  menuSection: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  menuArrow: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#EF4444',
  },
});
