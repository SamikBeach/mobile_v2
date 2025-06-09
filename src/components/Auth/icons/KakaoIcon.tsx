import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface KakaoIconProps {
  size?: number;
  color?: string;
}

export const KakaoIcon: React.FC<KakaoIconProps> = ({ size = 20, color = '#3A1D1C' }) => {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill={color}>
      <Path d='M12 3C7.03 3 3 6.24 3 10.24c0 2.52 1.64 4.74 4.12 6.05l-.97 3.57c-.09.33.25.59.54.42l4.36-2.85c.31.02.63.03.95.03 4.97 0 9-3.24 9-7.24S16.97 3 12 3z' />
    </Svg>
  );
};
