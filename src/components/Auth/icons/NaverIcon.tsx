import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface NaverIconProps {
  size?: number;
  color?: string;
}

export const NaverIcon: React.FC<NaverIconProps> = ({ size = 20, color = '#FFFFFF' }) => {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill={color}>
      <Path d='M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z' />
    </Svg>
  );
};
