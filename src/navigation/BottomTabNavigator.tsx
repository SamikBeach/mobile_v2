import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Flame, Compass, Users, Library, User } from 'lucide-react-native';
import { AuthBottomSheet } from '../components/Auth';
import { MainTabParamList } from './types';
import {
  HomeStackNavigator,
  PopularStackNavigator,
  DiscoverStackNavigator,
  CommunityStackNavigator,
  LibrariesStackNavigator,
  MyStackNavigator,
} from './stacks';

const Tab = createBottomTabNavigator<MainTabParamList>();

// 임시 인증 상태 훅 (실제로는 전역 상태 관리에서 가져와야 함)
const useAuth = () => {
  const [isAuthenticated] = useState(false); // 임시로 false로 설정
  return { isAuthenticated };
};

export const BottomTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const [showAuthBottomSheet, setShowAuthBottomSheet] = useState(false);

  const handleMyTabPress = (e: any) => {
    if (!isAuthenticated) {
      // 인증되지 않은 경우 탭 이동을 막고 AuthBottomSheet 표시
      e.preventDefault();
      setShowAuthBottomSheet(true);
    }
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color }) => {
            let IconComponent;

            switch (route.name) {
              case 'Home':
                IconComponent = Home;
                break;
              case 'Popular':
                IconComponent = Flame;
                break;
              case 'Discover':
                IconComponent = Compass;
                break;
              case 'Community':
                IconComponent = Users;
                break;
              case 'Libraries':
                IconComponent = Library;
                break;
              case 'My':
                IconComponent = User;
                break;
              default:
                IconComponent = Home;
            }

            return <IconComponent size={22} color={color} strokeWidth={1.4} />;
          },
          tabBarActiveTintColor: '#166534', // green-800
          tabBarInactiveTintColor: '#6B7280', // gray-500
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
            height: 60 + insets.bottom, // Safe Area 고려
            paddingBottom: insets.bottom, // Safe Area 만큼 패딩
            paddingTop: 2,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
          tabBarItemStyle: {
            paddingVertical: 2,
          },
        })}
      >
        <Tab.Screen
          name='Home'
          component={HomeStackNavigator}
          options={{
            title: '홈',
            tabBarLabel: '홈',
          }}
        />
        <Tab.Screen
          name='Popular'
          component={PopularStackNavigator}
          options={{
            title: '분야별 인기',
            tabBarLabel: '분야별 인기',
          }}
        />
        <Tab.Screen
          name='Discover'
          component={DiscoverStackNavigator}
          options={{
            title: '발견하기',
            tabBarLabel: '발견하기',
          }}
        />
        <Tab.Screen
          name='Community'
          component={CommunityStackNavigator}
          options={{
            title: '커뮤니티',
            tabBarLabel: '커뮤니티',
          }}
        />
        <Tab.Screen
          name='Libraries'
          component={LibrariesStackNavigator}
          options={{
            title: '서재',
            tabBarLabel: '서재',
          }}
        />
        <Tab.Screen
          name='My'
          component={MyStackNavigator}
          options={{
            title: 'My',
            tabBarLabel: 'My',
          }}
          listeners={{
            tabPress: handleMyTabPress,
          }}
        />
      </Tab.Navigator>

      {/* Auth Bottom Sheet */}
      <AuthBottomSheet
        isVisible={showAuthBottomSheet}
        onClose={() => setShowAuthBottomSheet(false)}
        initialMode='login'
      />
    </>
  );
};
