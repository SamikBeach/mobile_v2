// 태그 색상 배열 - 파스텔톤
export const TAG_COLORS = [
  '#FFF8E2', // 파스텔 옐로우
  '#F2E2FF', // 파스텔 퍼플
  '#FFE2EC', // 파스텔 코럴
  '#E2FFFC', // 파스텔 민트
  '#E2F0FF', // 파스텔 블루
  '#FFECDA', // 파스텔 오렌지
  '#ECFFE2', // 파스텔 그린
  '#FFE2F7', // 파스텔 핑크
];

/**
 * 태그 인덱스에 따른 색상을 반환합니다.
 * 웹 버전과 동일한 색상 팔레트를 사용합니다.
 */
export const getTagColor = (index: number): string => {
  const colors = [
    '#F1F5F9', // slate-100
    '#FECACA', // red-200
    '#FEF3C7', // yellow-200
    '#D1FAE5', // green-200
    '#DBEAFE', // blue-200
    '#E0E7FF', // indigo-200
    '#E9D5FF', // purple-200
    '#FECDD3', // rose-200
  ];

  return colors[index % colors.length];
};

/**
 * 태그 인터페이스
 */
export interface Tag {
  id: string;
  name: string;
  color: string;
}

/**
 * 기본 태그 생성 ("전체" 태그)
 */
export function createDefaultTag(): Tag {
  return {
    id: 'all',
    name: '전체',
    color: '#E2E8F0',
  };
}
