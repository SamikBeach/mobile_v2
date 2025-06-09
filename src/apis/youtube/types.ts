export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  url: string;
}

export interface YouTubeSearchResponse {
  videos: YouTubeVideo[];
  nextPageToken?: string;
  totalResults: number;
}

export interface YouTubeSearchParams {
  query: string;
  maxResults?: number;
  pageToken?: string;
}
