import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PopularScreen } from '../../screens/popular/PopularScreen';
import { HeaderLeft, HeaderRight } from '../components/HeaderComponents';
import { commonScreenOptions } from '../config/screenOptions';

const PopularStack = createNativeStackNavigator();

export const PopularStackNavigator = () => (
  <PopularStack.Navigator screenOptions={commonScreenOptions}>
    <PopularStack.Screen
      name='PopularMain'
      component={PopularScreen}
      options={{
        headerLeft: () => <HeaderLeft />,
        headerTitle: '',
        headerRight: () => <HeaderRight />,
      }}
    />
  </PopularStack.Navigator>
);
