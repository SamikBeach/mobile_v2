import React from 'react';
import { View, Text } from 'react-native';
import Toast, { BaseToast } from 'react-native-toast-message';

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#10B981',
        borderLeftWidth: 0,
        backgroundColor: '#1F2937',
        borderRadius: 12,
        height: 60,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        flex: 1,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
      }}
      text2Style={{
        fontSize: 13,
        fontWeight: '400',
        color: '#D1D5DB',
        lineHeight: 18,
      }}
      renderLeadingIcon={() => (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#10B981',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
            alignSelf: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>✓</Text>
        </View>
      )}
    />
  ),
  error: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#EF4444',
        borderLeftWidth: 0,
        backgroundColor: '#1F2937',
        borderRadius: 12,
        height: 60,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        flex: 1,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
      }}
      text2Style={{
        fontSize: 13,
        fontWeight: '400',
        color: '#D1D5DB',
        lineHeight: 18,
      }}
      renderLeadingIcon={() => (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#EF4444',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
            alignSelf: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>!</Text>
        </View>
      )}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#3B82F6',
        borderLeftWidth: 0,
        backgroundColor: '#1F2937',
        borderRadius: 12,
        height: 60,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        flex: 1,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
      }}
      text2Style={{
        fontSize: 13,
        fontWeight: '400',
        color: '#D1D5DB',
        lineHeight: 18,
      }}
      renderLeadingIcon={() => (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#3B82F6',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
            alignSelf: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>i</Text>
        </View>
      )}
    />
  ),
};

export const CustomToast: React.FC = () => {
  return (
    <Toast
      config={toastConfig}
      visibilityTime={2000} // 2초 노출
      autoHide={true}
      topOffset={60}
      bottomOffset={40}
      swipeable={true} // 드래그로 사라지게 하기
    />
  );
};
