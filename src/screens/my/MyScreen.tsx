import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ProfileScreen } from './ProfileScreen';

export const MyScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ProfileScreen />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingVertical: 16,
    gap: 20,
  },
});
