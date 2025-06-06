import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Flame, Compass, Users, Library, User } from 'lucide-react-native';
import { HomeScreenWrapper } from '../screens/HomeScreenWrapper';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Basic placeholder screens
const PlaceholderScreen = ({ title }: { title: string }) => {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>{title}</Text>
      </View>
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
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: 60 + insets.bottom, // Safe Area 고려
          paddingBottom: insets.bottom, // Safe Area 만큼 패딩
          paddingTop: 8,
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
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
});
