import { TTSStatus } from '../constants';

export interface TTSState {
  status: TTSStatus;
  currentText: string;
  highlightStartIndex: number;
  highlightEndIndex: number;
}

export class TTSService {
  private static utterance: SpeechSynthesisUtterance | null = null;

  static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  static stop() {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  static pause() {
    if (this.isSupported()) {
      window.speechSynthesis.pause();
    }
  }

  static resume() {
    if (this.isSupported()) {
      window.speechSynthesis.resume();
    }
  }

  static play(
    text: string,
    callbacks: {
      onStart?: () => void;
      onBoundary?: (startIndex: number, endIndex: number) => void;
      onEnd?: () => void;
      onError?: (error: any) => void;
    }
  ) {
    if (!this.isSupported()) return;

    this.stop();

    this.utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en-') && (v.name.includes('Premium') || v.name.includes('Natural') || v.name.includes('Google'))) || voices.find(v => v.lang.startsWith('en-'));
    
    if (preferredVoice) {
      this.utterance.voice = preferredVoice;
    }

    this.utterance.rate = 1.0;
    this.utterance.pitch = 1.0;

    this.utterance.onstart = () => callbacks.onStart?.();

    this.utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        let nextSpaceIndex = text.indexOf(' ', charIndex);
        if (nextSpaceIndex === -1) nextSpaceIndex = text.length;
        
        const punctuationRegex = /[.,!?;:]/;
        const match = text.slice(charIndex).match(punctuationRegex);
        if (match && match.index !== undefined) {
           const puncIndex = charIndex + match.index;
           if (puncIndex < nextSpaceIndex) {
               nextSpaceIndex = puncIndex;
           }
        }

        callbacks.onBoundary?.(charIndex, nextSpaceIndex);
      }
    };

    this.utterance.onend = () => callbacks.onEnd?.();
    this.utterance.onerror = (e) => callbacks.onError?.(e);

    window.speechSynthesis.speak(this.utterance);
  }
}
