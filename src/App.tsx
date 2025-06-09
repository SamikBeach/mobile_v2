import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Provider as JotaiProvider } from 'jotai';
import Toast from 'react-native-toast-message';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './providers/AuthProvider';
import { RootNavigator } from './navigation';
import { useDeepLink } from './hooks/useDeepLink';

const AppContent: React.FC = () => {
  // Deep Link 처리 훅 초기화
  useDeepLink();

  return (
    <>
      <StatusBar barStyle='dark-content' backgroundColor='white' />
      <BottomSheetModalProvider>
        <RootNavigator />
      </BottomSheetModalProvider>
      <Toast />
    </>
  );
};

export default function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <JotaiProvider>
            <AuthProvider>
              <NavigationContainer>
                <AppContent />
              </NavigationContainer>
            </AuthProvider>
          </JotaiProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
