import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import { BottomTabNavigator } from './BottomTabNavigator';
import { BookDetailScreen, LibraryDetailScreen } from '../screens';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name='MainTabs' component={BottomTabNavigator} />
      <Stack.Screen
        name='BookDetail'
        component={BookDetailScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: '책 상세',
          headerBackTitle: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: -8 }}>
              <ChevronLeft size={24} color='#111827' />
            </TouchableOpacity>
          ),
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '600',
          },
          headerTintColor: '#111827',
        })}
      />
      <Stack.Screen
        name='LibraryDetail'
        component={LibraryDetailScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: '서재',
          headerBackTitle: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: -8 }}>
              <ChevronLeft size={24} color='#111827' />
            </TouchableOpacity>
          ),
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '600',
          },
          headerTintColor: '#111827',
        })}
      />
    </Stack.Navigator>
  );
};
