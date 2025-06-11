import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  style?: any;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', style }) => {
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
  const imageSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={{ width: imageSize, height: imageSize }}
        resizeMode='contain'
      />
      <Text style={[styles.text, { fontSize }]}>미역서점</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontWeight: 'bold',
    color: '#166534', // green-800
  },
});
