import { YoutubeTranscript } from 'youtube-transcript';

const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  if (typeof url === 'string' && url.includes('youtube.com')) {
    const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
    console.log('Proxying to:', proxyUrl);
    return originalFetch(proxyUrl, options);
  }
  return originalFetch(url, options);
};

// dQw4w9WgXcQ is Rick Astley - Never Gonna Give You Up
YoutubeTranscript.fetchTranscript('dQw4w9WgXcQ').then(t => console.log('success', t.length)).catch(console.error);
