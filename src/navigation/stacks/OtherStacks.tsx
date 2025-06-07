import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HeaderLeft, HeaderRight } from '../components/HeaderComponents';
import { PlaceholderScreen } from '../components/PlaceholderScreen';
import { commonScreenOptions } from '../config/screenOptions';

const DiscoverStack = createNativeStackNavigator();
const CommunityStack = createNativeStackNavigator();
const LibrariesStack = createNativeStackNavigator();
const MyStack = createNativeStackNavigator();

export const DiscoverStackNavigator = () => (
  <DiscoverStack.Navigator screenOptions={commonScreenOptions}>
    <DiscoverStack.Screen
      name='DiscoverMain'
      component={() => <PlaceholderScreen title='발견하기' />}
      options={{
        headerLeft: () => <HeaderLeft />,
        headerTitle: '',
        headerRight: () => <HeaderRight />,
      }}
    />
  </DiscoverStack.Navigator>
);

export const CommunityStackNavigator = () => (
  <CommunityStack.Navigator screenOptions={commonScreenOptions}>
    <CommunityStack.Screen
      name='CommunityMain'
      component={() => <PlaceholderScreen title='커뮤니티' />}
      options={{
        headerLeft: () => <HeaderLeft />,
        headerTitle: '',
        headerRight: () => <HeaderRight />,
      }}
    />
  </CommunityStack.Navigator>
);

export const LibrariesStackNavigator = () => (
  <LibrariesStack.Navigator screenOptions={commonScreenOptions}>
    <LibrariesStack.Screen
      name='LibrariesMain'
      component={() => <PlaceholderScreen title='서재' />}
      options={{
        headerLeft: () => <HeaderLeft />,
        headerTitle: '',
        headerRight: () => <HeaderRight />,
      }}
    />
  </LibrariesStack.Navigator>
);

export const MyStackNavigator = () => (
  <MyStack.Navigator screenOptions={commonScreenOptions}>
    <MyStack.Screen
      name='MyMain'
      component={() => <PlaceholderScreen title='My' />}
      options={{
        headerLeft: () => <HeaderLeft />,
        headerTitle: '',
        headerRight: () => <HeaderRight />,
      }}
    />
  </MyStack.Navigator>
);
