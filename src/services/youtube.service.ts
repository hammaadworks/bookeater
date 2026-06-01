import { YoutubeTranscript } from 'youtube-transcript';

export interface VideoMetadata {
  id: string;
  title: string;
  author: string;
  duration: number;
}

export const YoutubeService = {
  extractVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  },

  async getTranscript(videoId: string) {
    try {
      // Monkey-patch fetch to route through Vite proxy
      const originalFetch = globalThis.fetch;
      let transcript;
      try {
        globalThis.fetch = async (url, options) => {
          if (typeof url === 'string' && url.includes('youtube.com')) {
            const proxyUrl = url.replace('https://www.youtube.com', '/youtube-proxy');
            return originalFetch(proxyUrl, options);
          }
          return originalFetch(url, options);
        };
        transcript = await YoutubeTranscript.fetchTranscript(videoId);
      } finally {
        // Always restore original fetch
        globalThis.fetch = originalFetch;
      }
      return transcript;
    } catch (error) {
      console.error('Error fetching transcript:', error);
      throw new Error('Could not fetch YouTube transcript. The video might not have captions enabled.');
    }
  },

  async getMetadata(videoId: string): Promise<VideoMetadata> {
    try {
      // Basic fallback since oEmbed requires a proxy or CORS handling
      // We can use the YouTube oEmbed API which is usually CORS-friendly for basic info
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await response.json();
      
      return {
        id: videoId,
        title: data.title,
        author: data.author_name,
        duration: 0, // oEmbed doesn't give duration
      };
    } catch (error) {
      return {
        id: videoId,
        title: 'Unknown YouTube Video',
        author: 'Unknown',
        duration: 0,
      };
    }
  }
};
