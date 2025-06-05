/**
 * Axios 인스턴스 및 인터셉터 설정
 *
 * 모든 API 요청에 대한 기본 설정과 인터셉터를 정의합니다.
 * - 요청 인터셉터: 헤더에 인증 토큰 추가
 * - 응답 인터셉터: 401 에러 발생 시 토큰 갱신 시도
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../constants/env';

// AsyncStorage에서 토큰을 가져오는 헬퍼 함수
const getAccessToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('accessToken');
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
};

const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('refreshToken');
  } catch (error) {
    console.error('Failed to get refresh token:', error);
    return null;
  }
};

// 토큰을 AsyncStorage에 저장하는 헬퍼 함수
const setTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
    ]);
  } catch (error) {
    console.error('Failed to set tokens:', error);
  }
};

// 토큰을 AsyncStorage에서 제거하는 헬퍼 함수
const removeTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
  } catch (error) {
    console.error('Failed to remove tokens:', error);
  }
};

// axios 인스턴스 생성
export const api: AxiosInstance = axios.create({
  baseURL: ENV.SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Version': 'v2',
  },
});

// 실패한 요청들의 대기열
interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: InternalAxiosRequestConfig;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

// 대기열 처리 함수
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.config.headers['Authorization'] = `Bearer ${token}`;
      prom.resolve(api(prom.config));
    }
  });

  failedQueue = [];
};

// 요청 인터셉터 - 토큰이 있으면 헤더에 추가
api.interceptors.request.use(
  async config => {
    console.log('[AXIOS REQUEST]', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      params: config.params,
      data: config.data,
      headers: {
        ...config.headers,
        Authorization: config.headers?.Authorization ? '[HIDDEN]' : undefined,
      },
    });

    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('[AXIOS REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 401 에러 발생 시 토큰 갱신 시도
api.interceptors.response.use(
  response => {
    console.log('[AXIOS RESPONSE]', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    console.error('[AXIOS RESPONSE ERROR]', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러가 아니거나 이미 재시도한 요청이면 에러 반환
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (!originalRequest._retry) {
      originalRequest._retry = true;

      // 이미 토큰 갱신 진행 중이면 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      isRefreshing = true;

      try {
        // 리프레시 토큰으로 새 토큰 발급 요청
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          processQueue(new Error('리프레시 토큰이 없습니다'));
          return Promise.reject(error);
        }

        const { data } = await axios.post(
          `${ENV.SERVER_URL}/auth/refresh-token`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        // 새 토큰 저장
        await setTokens(data.accessToken, data.refreshToken);

        // 대기 중인 요청 모두 처리
        processQueue(null, data.accessToken);

        // 원래 요청 재시도
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신에 실패하면 로그아웃 처리
        await removeTokens();
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API client 헬퍼 함수
export const authUtils = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  removeTokens,
  isAuthenticated: async () => !!(await getAccessToken()),
};

export default api;
