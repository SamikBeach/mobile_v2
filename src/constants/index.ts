// 읽기 상태 타입
export enum ReadingStatusType {
  WANT_TO_READ = 'WANT_TO_READ',
  READING = 'READING',
  READ = 'READ',
}

// 읽기 상태별 텍스트
export const StatusTexts = {
  [ReadingStatusType.WANT_TO_READ]: '읽고 싶어요',
  [ReadingStatusType.READING]: '읽는 중',
  [ReadingStatusType.READ]: '읽었어요',
  NONE: '선택 안함',
} as const;

// 읽기 상태별 이모지
export const StatusIcons = {
  [ReadingStatusType.WANT_TO_READ]: '💜',
  [ReadingStatusType.READING]: '📖',
  [ReadingStatusType.READ]: '✅',
  NONE: '❌',
} as const;

// 읽기 상태별 색상
export const StatusColors = {
  [ReadingStatusType.WANT_TO_READ]: {
    background: '#F3E8FF',
    text: '#7C3AED',
    border: '#C4B5FD',
  },
  [ReadingStatusType.READING]: {
    background: '#DBEAFE',
    text: '#2563EB',
    border: '#93C5FD',
  },
  [ReadingStatusType.READ]: {
    background: '#D1FAE5',
    text: '#059669',
    border: '#6EE7B7',
  },
} as const;
