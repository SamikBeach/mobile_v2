import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export function LoadingView(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ActivityIndicator size='large' color='#007AFF' />
      <Text style={styles.text}>미역서점 로딩 중...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
});
