# 미역서점 모바일 앱

React Native와 Expo를 사용한 도서 관리 및 리뷰 플랫폼 모바일 앱입니다.

## 주요 기능

- 📚 도서 검색 및 상세 정보 조회
- ⭐ 도서 평점 및 리뷰 작성
- 📖 개인 서재 관리
- 👥 커뮤니티 기능
- 🔐 소셜 로그인 (Google, Apple, Naver, Kakao)

## 기술 스택

- **React Native** - 크로스 플랫폼 모바일 앱 개발
- **Expo** - 개발 및 빌드 플랫폼
- **TypeScript** - 타입 안전성
- **React Query** - 서버 상태 관리
- **Jotai** - 클라이언트 상태 관리
- **React Navigation** - 네비게이션
- **React Hook Form** - 폼 관리
- **Gorhom Bottom Sheet** - 바텀시트 UI

## 설치 및 실행

### 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn
- Expo CLI
- iOS 시뮬레이터 (iOS 개발 시)
- Android Studio (Android 개발 시)

### 설치

```bash
# 의존성 설치
npm install

# iOS 의존성 설치 (iOS 개발 시)
cd ios && pod install && cd ..
```

### 개발 서버 실행

```bash
# Expo 개발 서버 시작
npx expo start

# iOS 시뮬레이터에서 실행
npx expo run:ios

# Android 에뮬레이터에서 실행
npx expo run:android
```

## OAuth 설정

### 1. 서버 URL 설정

앱에서 OAuth 로그인을 사용하려면 서버 URL을 설정해야 합니다:

```typescript
// src/utils/oauth.ts
const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:8000';
```

### 2. Deep Link 설정

OAuth 콜백을 처리하기 위해 Deep Link가 설정되어 있습니다:

- **Scheme**: `miyuk-books`
- **Callback URL**: `miyuk-books://oauth/callback`

### 3. 지원되는 OAuth 제공자

- **Google**: 웹 기반 OAuth 플로우
- **Naver**: 웹 기반 OAuth 플로우
- **Kakao**: 웹 기반 OAuth 플로우
- **Apple**: iOS 네이티브 SDK (추후 구현 예정)

### 4. OAuth 플로우

1. 사용자가 소셜 로그인 버튼 클릭
2. 인앱 브라우저로 OAuth 제공자 페이지 열기
3. 사용자 인증 완료 후 Deep Link로 앱 복귀
4. 토큰 및 사용자 정보 자동 저장
5. 로그인 상태로 전환

### 5. 테스트

OAuth 기능은 My 탭에서 테스트할 수 있습니다:

- 로그인하지 않은 상태에서 My 탭 접근
- "OAuth 테스트" 섹션에서 각 제공자별 테스트 가능
- 실제 소셜 로그인 버튼으로 완전한 플로우 테스트

## 프로젝트 구조

```
src/
├── apis/           # API 호출 함수들
├── atoms/          # Jotai 상태 관리
├── components/     # 재사용 가능한 컴포넌트
├── hooks/          # 커스텀 훅
├── navigation/     # 네비게이션 설정
├── providers/      # Context 제공자들
├── screens/        # 화면 컴포넌트들
├── types/          # TypeScript 타입 정의
└── utils/          # 유틸리티 함수들
```

## 주요 화면

- **홈**: 인기 도서, 발견 도서, 인기 리뷰, 인기 서재
- **분야별 인기**: 카테고리별 인기 도서 목록
- **발견하기**: 새로운 도서 발견
- **커뮤니티**: 사용자 리뷰 및 토론
- **서재**: 개인 도서 컬렉션 관리
- **My**: 프로필 및 설정

## 개발 가이드

### 코드 스타일

- ESLint + Prettier 사용
- TypeScript strict 모드
- React Query를 통한 서버 상태 관리
- Jotai를 통한 클라이언트 상태 관리

### 컴포넌트 패턴

- Suspense를 활용한 로딩 상태 처리
- React Hook Form을 통한 폼 관리
- Bottom Sheet를 활용한 모달 UI

### API 통신

- React Query의 useSuspenseQuery 사용
- 에러 바운더리를 통한 에러 처리
- 토큰 기반 인증

## 빌드 및 배포

### 개발 빌드

```bash
# iOS 개발 빌드
npx expo run:ios

# Android 개발 빌드
npx expo run:android
```

### 프로덕션 빌드

```bash
# EAS Build를 통한 프로덕션 빌드
npx eas build --platform ios
npx eas build --platform android
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
