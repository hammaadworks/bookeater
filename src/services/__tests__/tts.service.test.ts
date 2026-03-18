import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TTSService } from '../tts.service';

describe('TTSService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.speechSynthesis
    const mockSpeechSynthesis = {
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      speak: vi.fn(),
      getVoices: vi.fn().mockReturnValue([]),
    };
    
    vi.stubGlobal('speechSynthesis', mockSpeechSynthesis);
    
    // Mock SpeechSynthesisUtterance constructor
    function MockUtterance(text: string) {
      return {
        text,
        lang: '',
        onstart: null,
        onboundary: null,
        onend: null,
        onerror: null,
      };
    }
    vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance);
  });

  it('should detect if speech synthesis is supported', () => {
    expect(TTSService.isSupported()).toBe(true);
  });

  it('should call cancel when stop is called', () => {
    TTSService.stop();
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });

  it('should call pause when pause is called', () => {
    TTSService.pause();
    expect(window.speechSynthesis.pause).toHaveBeenCalled();
  });

  it('should call resume when resume is called', () => {
    TTSService.resume();
    expect(window.speechSynthesis.resume).toHaveBeenCalled();
  });

  it('should call speak with a new utterance when play is called', () => {
    const text = 'Hello world';
    TTSService.play(text, {});
    
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    expect(window.speechSynthesis.cancel).toHaveBeenCalled(); // Should stop previous
  });
});
