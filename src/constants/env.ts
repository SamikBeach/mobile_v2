export const ENV = {
  SERVER_URL: process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3005/api/v2',
  APP_URL: process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:3004',
  AWS_REGION: process.env.EXPO_PUBLIC_AWS_REGION || 'ap-northeast-2',
  AWS_S3_BUCKET_NAME: process.env.EXPO_PUBLIC_AWS_S3_BUCKET_NAME || 'miyukbooks',
  GOOGLE_OAUTH_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID || '',
} as const;
