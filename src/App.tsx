import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { QueryProvider } from './providers/QueryProvider';
import { HomeScreen } from './screens/HomeScreen';

export default function App(): React.JSX.Element {
  return (
    <QueryProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='dark-content' backgroundColor='#ffffff' />
        <HomeScreen />
      </SafeAreaView>
    </QueryProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
