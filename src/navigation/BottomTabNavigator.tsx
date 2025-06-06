import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Flame, Compass, Users, Library, User } from 'lucide-react-native';
import { HomeScreenWrapper } from '../screens/HomeScreenWrapper';
import { Header } from '../components/Header/Header';
import { useHeaderTabBarVisibility } from '../hooks/useTabBarVisibility';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Updated placeholder screens with headers and scroll support
const PlaceholderScreen = ({ title }: { title: string }) => {
  const { handleScroll, headerStyle, headerHeight } = useHeaderTabBarVisibility();

  const handleSearchPress = () => {
    console.log('Search pressed');
  };

  const handleSendPress = () => {
    console.log('Send pressed');
  };

  const handleNotificationPress = () => {
    console.log('Notification pressed');
  };

  const handleSettingsPress = () => {
    console.log('Settings pressed');
  };

  return (
    <View style={styles.container}>
      {/* Absolute Positioned Header */}
      <View style={[styles.headerContainer, headerStyle]}>
        <Header
          onSearchPress={handleSearchPress}
          onSendPress={handleSendPress}
          onNotificationPress={handleNotificationPress}
          onSettingsPress={handleSettingsPress}
        />
      </View>

      {/* Scrollable Content with fixed padding */}
      <ScrollView
        style={[styles.scrollView, { paddingTop: headerHeight }]} // 고정된 paddingTop
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate='normal'
        bouncesZoom={false}
      >
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{title}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const PopularScreen = () => <PlaceholderScreen title='분야별 인기' />;
const DiscoverScreen = () => <PlaceholderScreen title='발견하기' />;
const CommunityScreen = () => <PlaceholderScreen title='커뮤니티' />;
const LibrariesScreen = () => <PlaceholderScreen title='서재' />;
const MyScreen = () => <PlaceholderScreen title='My' />;

export const BottomTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
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
        tabBarHideOnKeyboard: true, // 키보드가 올라올 때 숨김
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6', // border-gray-100
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <Tab.Screen
        name='Home'
        component={HomeScreenWrapper}
        options={{
          title: '홈',
          tabBarLabel: '홈',
        }}
      />
      <Tab.Screen
        name='Popular'
        component={PopularScreen}
        options={{
          title: '분야별 인기',
          tabBarLabel: '분야별 인기',
        }}
      />
      <Tab.Screen
        name='Discover'
        component={DiscoverScreen}
        options={{
          title: '발견하기',
          tabBarLabel: '발견하기',
        }}
      />
      <Tab.Screen
        name='Community'
        component={CommunityScreen}
        options={{
          title: '커뮤니티',
          tabBarLabel: '커뮤니티',
        }}
      />
      <Tab.Screen
        name='Libraries'
        component={LibrariesScreen}
        options={{
          title: '서재',
          tabBarLabel: '서재',
        }}
      />
      <Tab.Screen
        name='My'
        component={MyScreen}
        options={{
          title: 'My',
          tabBarLabel: 'My',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    minHeight: 600, // 스크롤이 가능하도록 충분한 높이 제공
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
});
