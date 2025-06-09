import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export const LoadingSpinner: React.FC = () => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );

    spinAnimation.start();

    return () => spinAnimation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinner,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%', // w-full
    justifyContent: 'center', // justify-center
    alignItems: 'center', // 중앙 정렬을 위해 추가
    paddingVertical: 16, // py-4
  },
  spinner: {
    height: 32, // h-8
    width: 32, // w-8
    borderRadius: 16, // rounded-full
    borderWidth: 2, // border-2
    borderColor: '#D1D5DB', // border-gray-300
    borderTopColor: '#2563EB', // border-t-blue-600
  },
});
