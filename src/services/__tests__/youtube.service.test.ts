import { describe, it, expect } from 'vitest';
import { YoutubeService } from '../youtube.service';

describe('YoutubeService', () => {
  describe('extractVideoId', () => {
    it('should extract ID from standard watch URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(YoutubeService.extractVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from shortened youtu.be URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      expect(YoutubeService.extractVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from embedded URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      expect(YoutubeService.extractVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid URLs', () => {
      const url = 'https://google.com';
      expect(YoutubeService.extractVideoId(url)).toBe(null);
    });
  });
});
