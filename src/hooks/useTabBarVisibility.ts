import { useRef, useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

// Android에서 LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const useHeaderTabBarVisibility = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const lastScrollY = useRef(0);
  const isHidden = useRef(false);

  const tabBarHeight = 64 + insets.bottom;
  const headerHeight = 56 + insets.top; // 헤더 높이 계산

  // Header 스타일 상태 - height는 고정하고 transform만 변경
  const [headerStyle, setHeaderStyle] = useState({
    height: headerHeight,
    transform: [{ translateY: 0 }],
    opacity: 1,
  });

  // BottomNav 스타일
  const defaultTabBarStyle = {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    height: tabBarHeight,
    paddingBottom: insets.bottom,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
    overflow: 'visible' as const,
  };

  const hiddenTabBarStyle = {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    height: 0,
    paddingBottom: 0,
    paddingTop: 0,
    elevation: 0,
    shadowOpacity: 0,
    overflow: 'hidden' as const,
  };

  // 부드러운 애니메이션 설정
  const animationConfig = {
    duration: 300,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.scaleY,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.scaleY,
    },
  };

  const handleScroll = useCallback(
    (event: any) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const scrollDifference = currentScrollY - lastScrollY.current;

      // 스크롤 위치가 50px 미만이면 항상 표시
      if (currentScrollY < 50) {
        if (isHidden.current) {
          LayoutAnimation.configureNext(animationConfig);
          navigation.setOptions({
            tabBarStyle: defaultTabBarStyle,
          });
          setHeaderStyle({
            height: headerHeight,
            transform: [{ translateY: 0 }], // 원래 위치로
            opacity: 1,
          });
          isHidden.current = false;
        }
      } else {
        // 아래로 스크롤 (스크롤 차이가 양수)하고 충분히 스크롤했을 때 숨김
        if (scrollDifference > 5 && !isHidden.current) {
          LayoutAnimation.configureNext(animationConfig);
          navigation.setOptions({
            tabBarStyle: hiddenTabBarStyle,
          });
          setHeaderStyle({
            height: headerHeight, // height는 고정
            transform: [{ translateY: -headerHeight }], // 위로 완전히 밀어올림
            opacity: 0,
          });
          isHidden.current = true;
        }
        // 위로 스크롤 (스크롤 차이가 음수)할 때 표시
        else if (scrollDifference < -5 && isHidden.current) {
          LayoutAnimation.configureNext(animationConfig);
          navigation.setOptions({
            tabBarStyle: defaultTabBarStyle,
          });
          setHeaderStyle({
            height: headerHeight,
            transform: [{ translateY: 0 }], // 원래 위치로
            opacity: 1,
          });
          isHidden.current = false;
        }
      }

      lastScrollY.current = currentScrollY;
    },
    [navigation, defaultTabBarStyle, hiddenTabBarStyle, animationConfig, headerHeight]
  );

  return {
    handleScroll,
    headerStyle,
    headerHeight, // ScrollView의 paddingTop을 위해 추가
    isHidden: isHidden.current,
  };
};
