import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { BookDetailScreen } from '../screens';
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
        options={({ route }) => ({
          headerShown: true,
          headerTitle: route.params?.title || '책 상세',
          headerBackTitle: '',
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
