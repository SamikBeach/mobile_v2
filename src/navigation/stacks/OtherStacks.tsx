import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HeaderLeft, HeaderRight } from '../components/HeaderComponents';
import { PlaceholderScreen } from '../components/PlaceholderScreen';
import { commonScreenOptions } from '../config/screenOptions';
import { DiscoverScreen } from '../../screens';
import { CommunityScreen } from '../../screens/community/CommunityScreen';
import { LibrariesScreen } from '../../screens/libraries/LibrariesScreen';
import { MyScreen } from '../../screens/my/MyScreen';

const DiscoverStack = createNativeStackNavigator();
const CommunityStack = createNativeStackNavigator();
const LibrariesStack = createNativeStackNavigator();
const MyStack = createNativeStackNavigator();

export const DiscoverStackNavigator = () => (
  <DiscoverStack.Navigator screenOptions={commonScreenOptions}>
    <DiscoverStack.Screen
      name='DiscoverMain'
      component={DiscoverScreen}
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
      component={CommunityScreen}
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
      component={LibrariesScreen}
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
      component={MyScreen}
      options={{
        headerLeft: () => <HeaderLeft />,
        headerTitle: '',
        headerRight: () => <HeaderRight />,
      }}
    />
  </MyStack.Navigator>
);
