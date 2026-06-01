import { describe, it, expect } from 'vitest';
import { ParserModule } from '../parser.service';

describe('ParserModule', () => {
  describe('getPage', () => {
    it('should segment raw text into pages for youtube source type', async () => {
      const longText = 'Paragraph 1\n\nParagraph 2\n\n' + 'Line\n'.repeat(60) + 'End';
      const result = await ParserModule.getPage(longText, 'Test Video', 1, 'youtube');
      
      expect(result.totalPages).toBeGreaterThan(1);
      expect(result.text).toContain('Paragraph 1');
      expect(result.image).toBe(null);
    });

    it('should return correct page content for media sources', async () => {
      const longText = 'Page 1 Content\n\n' + 'x\n'.repeat(100) + 'Page 2 Content';
      const resultPage2 = await ParserModule.getPage(longText, 'Test Video', 2, 'youtube');
      
      expect(resultPage2.text).toContain('Page 2 Content');
    });

    it('should fallback to text rendering for unknown file types', async () => {
      const text = 'Hello World';
      const buffer = new TextEncoder().encode(text).buffer;
      const result = await ParserModule.getPage(buffer, 'test.xyz', 1);
      
      expect(result.text).toBe('Hello World');
      expect(result.totalPages).toBe(1);
    });
  });
});
