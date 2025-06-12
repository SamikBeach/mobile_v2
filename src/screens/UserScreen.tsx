import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User as UserIcon, Settings, LogOut } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { userAtom } from '../atoms/user';
import { logout as logoutApi } from '../apis/auth';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';

type UserScreenNavigationProp = NavigationProp<RootStackParamList>;

// Avatar 컴포넌트
interface AvatarProps {
  imageUrl?: string | null;
  fallbackText: string;
  size?: number;
}

function Avatar({ imageUrl, fallbackText, size = 32 }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // 디버깅을 위한 로그
  console.log('UserScreen Avatar - imageUrl:', imageUrl);
  console.log('UserScreen Avatar - fallbackText:', fallbackText);
  console.log('UserScreen Avatar - size:', size);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#e5e7eb', // bg-gray-200
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {imageUrl && !imageError && imageUrl.trim() !== '' ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          onError={error => {
            console.log('UserScreen Avatar Image Error:', error.nativeEvent.error);
            console.log('UserScreen Avatar Failed URL:', imageUrl);
            setImageError(true);
          }}
          onLoad={() => {
            console.log('UserScreen Avatar Image Loaded Successfully:', imageUrl);
          }}
        />
      ) : (
        <Text
          style={{
            fontSize: size * 0.4,
            fontWeight: '500',
            color: '#374151', // text-gray-700
            textTransform: 'uppercase',
          }}
        >
          {fallbackText}
        </Text>
      )}
    </View>
  );
}

// 메뉴 아이템 컴포넌트
interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

function MenuItem({ icon, title, onPress, variant = 'default', loading = false }: MenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16, // 더 넓은 패딩
        paddingVertical: 12, // 더 높은 패딩
        borderRadius: 8,
        gap: 12, // 더 넓은 간격
        minHeight: 44, // 터치하기 좋은 높이
        opacity: loading ? 0.5 : 1,
      }}
      activeOpacity={0.7}
    >
      <View style={{ width: 20, height: 20 }}>
        {loading ? (
          <ActivityIndicator
            size='small'
            color={variant === 'destructive' ? '#dc2626' : '#6b7280'}
          />
        ) : (
          icon
        )}
      </View>
      <Text
        style={{
          fontSize: 16, // 더 큰 글자
          color: variant === 'destructive' ? '#dc2626' : '#111827',
          fontWeight: '400',
        }}
      >
        {loading && variant === 'destructive' ? '로그아웃 중...' : title}
      </Text>
    </TouchableOpacity>
  );
}

// 구분선 컴포넌트
function Separator() {
  return (
    <View
      style={{
        height: 1, // h-px
        backgroundColor: '#e5e7eb', // bg-border
        marginHorizontal: 16, // 좌우 여백
        marginVertical: 8, // 위아래 여백
      }}
    />
  );
}

export function UserScreen() {
  const navigation = useNavigation<UserScreenNavigationProp>();
  const [user, setUser] = useAtom(userAtom);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // 디버깅을 위한 로그
    console.log('UserScreen - 전체 user data:', JSON.stringify(user, null, 2));
    console.log('UserScreen - user.profileImage:', user?.profileImage);
    console.log('UserScreen - user.avatar:', user?.avatar);
  }, [user]);

  // 로그아웃 mutation
  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      return logoutApi();
    },
    onSuccess: () => {
      setUser(null);
      navigation.goBack();
    },
    onError: error => {
      console.error('로그아웃 실패:', error);
      setUser(null);
      navigation.goBack();
    },
  });

  // 로그아웃 핸들러
  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', onPress: () => logout() },
    ]);
  };

  // 프로필 페이지로 이동
  const handleProfileClick = () => {
    // UserScreen 모달을 먼저 닫고 Profile 페이지로 이동
    navigation.goBack();
    if (user?.id) {
      // 모달이 닫힌 후 Profile 페이지로 이동
      setTimeout(() => {
        navigation.navigate('Profile', { userId: user.id });
      }, 100);
    } else {
      console.error('User ID is not available');
      Alert.alert('오류', '사용자 정보를 불러올 수 없습니다.');
    }
  };

  // 설정 페이지로 이동
  const handleSettingsClick = () => {
    navigation.goBack();
    // 모달이 닫힌 후 AccountSettings 페이지로 이동
    setTimeout(() => {
      navigation.navigate('AccountSettings');
    }, 100);
  };

  if (!user) {
    if (!isMounted) return null;

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

        <View
          style={{
            padding: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: '#6b7280',
              textAlign: 'center',
            }}
          >
            로그인이 필요합니다
          </Text>
        </View>
      </View>
    );
  }

  // 사용자 표시 정보 설정
  const displayName = user.username || user.email.split('@')[0];
  const initial = displayName?.charAt(0);
  // profileImage와 avatar 둘 다 확인
  const avatarUrl = user.profileImage || user.avatar || null;

  // 디버깅을 위한 로그
  console.log('UserScreen - displayName:', displayName);
  console.log('UserScreen - initial:', initial);
  console.log('UserScreen - final avatarUrl:', avatarUrl);

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

      {/* 콘텐츠 */}
      <View
        style={{
          marginHorizontal: 12, // 좌우 여백 줄임 (20px → 12px)
          backgroundColor: 'white',
        }}
      >
        {/* 사용자 정보 섹션 */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 12, // 더 넓은 간격
            padding: 16, // 더 넓은 패딩
            width: '100%',
          }}
        >
          <Avatar
            imageUrl={avatarUrl}
            fallbackText={initial || 'U'}
            size={40} // 더 큰 아바타
          />
          <View
            style={{
              flex: 1,
              minWidth: 0, // min-w-0
              flexDirection: 'column',
              gap: 4, // 더 넓은 간격
            }}
          >
            <Text
              style={{
                fontSize: 16, // 더 큰 글자
                fontWeight: '600', // 더 굵은 폰트
                color: '#111827',
                lineHeight: 20,
              }}
              numberOfLines={1}
              ellipsizeMode='tail'
            >
              {displayName}
            </Text>
            <Text
              style={{
                fontSize: 14, // 더 큰 글자
                color: '#6b7280',
                lineHeight: 18,
              }}
              numberOfLines={2}
            >
              {user.email}
            </Text>
          </View>
        </View>

        <Separator />

        {/* 메뉴 아이템들 */}
        <MenuItem
          icon={<UserIcon size={20} color='#6b7280' />}
          title='내 프로필'
          onPress={handleProfileClick}
        />

        <MenuItem
          icon={<Settings size={20} color='#6b7280' />}
          title='설정'
          onPress={handleSettingsClick}
        />

        <Separator />

        {/* 로그아웃 버튼 - 빨간 글씨 */}
        <MenuItem
          icon={<LogOut size={20} color='#dc2626' />}
          title='로그아웃'
          onPress={handleLogout}
          variant='destructive'
          loading={isLoggingOut}
        />
      </View>
    </View>
  );
}
