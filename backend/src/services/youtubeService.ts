import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.YOUTUBE_API_KEY;

export async function getYouTubeReviews(deviceName: string) {
  if (!API_KEY) return [];
  
  try {
    const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `${deviceName} review`,
        type: 'video',
        maxResults: 3,
        key: API_KEY
      }
    });

    return res.data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelName: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (error) {
    console.error('YouTube API Error:', error);
    return [];
  }
}
