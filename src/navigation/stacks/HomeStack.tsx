import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreenWrapper } from '../../screens/HomeScreenWrapper';
import { HeaderLeft, HeaderRight } from '../components/HeaderComponents';
import { commonScreenOptions } from '../config/screenOptions';

const HomeStack = createNativeStackNavigator();

export const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={commonScreenOptions}>
    <HomeStack.Screen
      name='HomeMain'
      component={HomeScreenWrapper}
      options={{
        headerLeft: () => <HeaderLeft />,
        headerTitle: '',
        headerRight: () => <HeaderRight />,
      }}
    />
  </HomeStack.Navigator>
);
