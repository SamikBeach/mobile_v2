import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const PolicyDialogs: React.FC = () => {
  const handleTermsPress = () => {
    // TODO: 이용약관 모달 또는 웹뷰 열기
    console.log('이용약관 보기');
  };

  const handlePrivacyPress = () => {
    // TODO: 개인정보처리방침 모달 또는 웹뷰 열기
    console.log('개인정보처리방침 보기');
  };

  return (
    <View style={styles.container}>
      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={handleTermsPress}>
          <Text style={styles.linkText}>이용약관</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePrivacyPress}>
          <Text style={styles.linkText}>개인정보 처리방침</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
});
