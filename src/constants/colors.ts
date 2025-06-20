/**
 * Tailwind CSS Green Color Palette
 * 모바일 앱 전체에서 사용하는 color constants
 */

// Tailwind Green 계열 색상 팔레트 (v4 OKLCH 기반)
export const TailwindGreen = {
  50: '#F0FDF4', // green-50 - 매우 밝은 배경용
  100: '#DCFCE7', // green-100 - 밝은 배경용
  200: '#BBF7D0', // green-200 - 연한 배경용
  300: '#86EFAC', // green-300 - 연한 액센트용
  400: '#4ADE80', // green-400 - 중간 액센트용
  500: '#22C55E', // green-500 - 기본 초록색
  600: '#16A34A', // green-600 - 진한 초록색 (주 CTA 색상)
  700: '#15803D', // green-700 - 더 진한 초록색
  800: '#166534', // green-800 - 매우 진한 초록색
  900: '#14532D', // green-900 - 가장 진한 초록색
  950: '#052E16', // green-950 - 최대 진한 초록색
} as const;

// Emerald 계열 (더 진한 청록색 계열)
export const TailwindEmerald = {
  50: '#ECFDF5',
  100: '#D1FAE5',
  200: '#A7F3D0',
  300: '#6EE7B7',
  400: '#34D399',
  500: '#10B981', // emerald-500 - 대안 초록색
  600: '#059669',
  700: '#047857',
  800: '#065F46',
  900: '#064E3B',
  950: '#022C22',
} as const;

// 앱에서 사용하는 주요 색상 정의
export const AppColors = {
  // Primary CTA 버튼 (가장 중요한 액션)
  primary: TailwindGreen[600], // #16A34A (green-600)
  primaryHover: TailwindGreen[700], // #15803D (green-700)
  primaryDisabled: TailwindGreen[300], // #86EFAC (green-300)

  // Secondary 색상 (덜 중요한 액션)
  secondary: TailwindGreen[500], // #22C55E (green-500)
  secondaryHover: TailwindGreen[600], // #16A34A (green-600)

  // Success 상태 표시
  success: TailwindEmerald[500], // #10B981 (emerald-500)
  successLight: TailwindGreen[100], // #DCFCE7 (green-100)
  successText: TailwindGreen[800], // #166534 (green-800)

  // 배경 및 UI 요소
  backgroundLight: TailwindGreen[50], // #F0FDF4 (green-50)
  backgroundMedium: TailwindGreen[100], // #DCFCE7 (green-100)

  // 테두리
  border: TailwindGreen[200], // #BBF7D0 (green-200)
  borderActive: TailwindGreen[500], // #22C55E (green-500)

  // 텍스트
  textPrimary: TailwindGreen[800], // #166534 (green-800)
  textSecondary: TailwindGreen[600], // #16A34A (green-600)

  // 아이콘
  iconPrimary: TailwindGreen[600], // #16A34A (green-600)
  iconSecondary: TailwindEmerald[500], // #10B981 (emerald-500)

  // 스위치/토글
  switchTrack: TailwindEmerald[500], // #10B981 (emerald-500)
  switchTrackInactive: '#F3F4F6', // gray-100
} as const;

// 기존 하드코딩된 색상들과의 매핑
export const LegacyColorMapping = {
  '#16A34A': AppColors.primary, // green-600
  '#10B981': AppColors.success, // emerald-500
  '#22C55E': AppColors.secondary, // green-500
  '#15803D': AppColors.primaryHover, // green-700
  '#166534': AppColors.textPrimary, // green-800
  '#dcfce7': AppColors.backgroundMedium, // green-100
  '#D1FAE5': TailwindGreen[200], // 기존 태그 색상
} as const;

// 차트용 파스텔 색상 배열
export const ChartColors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  tertiary: '#F59E0B',
  quaternary: '#EF4444',
  text: '#1F2937',
  lightText: '#6B7280',
  grid: '#F3F4F6',
  background: '#FFFFFF',
  // 파스텔톤 색상들
  pastel: {
    blue: '#BFDBFE',
    green: '#A7F3D0',
    yellow: '#FDE68A',
    red: '#FECACA',
    purple: '#C4B5FD',
    pink: '#F9A8D4',
    indigo: '#C7D2FE',
    orange: '#FDBA74',
    lime: '#BEF264',
    cyan: '#A5F3FC',
    violet: '#C4B5FD',
  },
  // 차트용 색상 배열
  charts: [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ],
};

export default AppColors;
