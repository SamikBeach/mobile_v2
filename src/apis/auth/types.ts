import { User } from '../user';

/**
 * 인증 제공자 유형
 */
export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  APPLE = 'apple',
  NAVER = 'naver',
  KAKAO = 'kakao',
}

/**
 * 사용자 계정 상태
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

/**
 * 로그인 요청 파라미터
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 로그인 응답 데이터
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * 리프레시 토큰 요청 파라미터
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * 리프레시 토큰 응답 데이터
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * 이메일 중복 확인 요청 (회원가입 1단계)
 */
export interface CheckEmailRequest {
  email: string;
}

/**
 * 이메일 중복 확인 응답
 */
export interface CheckEmailResponse {
  isAvailable: boolean;
  message: string;
  email: string;
}

/**
 * 회원가입 정보 입력 및 인증 코드 발송 요청 (회원가입 2단계)
 */
export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  marketingConsent?: boolean;
}

/**
 * 회원가입 정보 입력 응답
 */
export interface RegisterResponse {
  message: string;
  email: string;
}

/**
 * 인증 코드 확인 및 최종 회원가입 요청 (회원가입 3단계)
 */
export interface CompleteRegistrationRequest {
  email: string;
  code: string;
}

/**
 * 최종 회원가입 완료 응답
 */
export interface CompleteRegistrationResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * 기존 회원가입 요청 (레거시)
 */
export interface SignupRequest {
  email: string;
  password?: string;
  username?: string;
  marketingConsent?: boolean;
}

/**
 * 기존 회원가입 응답 (레거시)
 */
export interface SignupResponse {
  message: string;
  email: string;
}

/**
 * 이메일 인증 요청
 */
export interface VerifyEmailRequest {
  email: string;
  code: string;
}

/**
 * 이메일 인증 응답
 */
export interface VerifyEmailResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * 비밀번호 재설정 요청
 */
export interface RequestPasswordResetRequest {
  email: string;
}

/**
 * 비밀번호 재설정 요청 응답
 */
export interface RequestPasswordResetResponse {
  message: string;
  email: string;
}

/**
 * 비밀번호 재설정 요청
 */
export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

/**
 * 비밀번호 재설정 응답
 */
export interface ResetPasswordResponse {
  message: string;
}

/**
 * 비밀번호 변경 요청
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * 비밀번호 변경 응답
 */
export interface ChangePasswordResponse {
  message: string;
}

/**
 * 계정 삭제 요청
 */
export interface DeleteAccountRequest {
  password?: string; // 소셜 로그인 사용자는 비밀번호가 없을 수 있음
}

/**
 * 계정 삭제 응답
 */
export interface DeleteAccountResponse {
  message: string;
}

/**
 * 소셜 로그인 요청
 */
export interface SocialLoginRequest {
  provider: AuthProvider;
  accessToken?: string;
  authorizationCode?: string;
}

/**
 * 소셜 로그인 응답
 */
export interface SocialLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * 비밀번호 재설정 토큰 검증 요청
 */
export interface VerifyResetTokenRequest {
  email: string;
  token: string;
}

/**
 * 비밀번호 재설정 토큰 검증 응답
 */
export interface VerifyResetTokenResponse {
  isValid: boolean;
  message: string;
}
