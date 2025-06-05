import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from './providers/QueryProvider';
import { BottomTabNavigator } from './navigation';

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <NavigationContainer>
          <StatusBar barStyle='dark-content' backgroundColor='#ffffff' />
          <BottomTabNavigator />
        </NavigationContainer>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
