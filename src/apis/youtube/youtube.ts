import axios from '../axios';
import { YouTubeSearchResponse, YouTubeSearchParams } from './types';

/**
 * YouTube 동영상 검색
 */
export const searchYouTubeVideos = async (
  params: YouTubeSearchParams
): Promise<YouTubeSearchResponse> => {
  const response = await axios.get<YouTubeSearchResponse>('/youtube/search', {
    params,
  });
  return response.data;
};
