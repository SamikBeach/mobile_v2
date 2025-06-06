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
 * 태그 인덱스에 따른 색상 반환
 * @param index 태그 인덱스
 * @returns 색상 코드
 */
export function getTagColor(index: number): string {
  return TAG_COLORS[index % TAG_COLORS.length];
}

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
