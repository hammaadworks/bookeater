import { useState, useEffect, useCallback } from 'react';

interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  highlightStartIndex: number;
  highlightEndIndex: number;
}

export function useTTS() {
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentText: '',
    highlightStartIndex: 0,
    highlightEndIndex: 0,
  });

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      highlightStartIndex: 0,
      highlightEndIndex: 0,
    }));
  }, []);

  const play = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }

    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en-') && (v.name.includes('Premium') || v.name.includes('Natural') || v.name.includes('Google'))) || voices.find(v => v.lang.startsWith('en-'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setState({
        isPlaying: true,
        isPaused: false,
        currentText: text,
        highlightStartIndex: 0,
        highlightEndIndex: 0,
      });
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        // Find the end of the word
        let nextSpaceIndex = text.indexOf(' ', charIndex);
        if (nextSpaceIndex === -1) nextSpaceIndex = text.length;
        
        // Also consider punctuation as word boundaries
        const punctuationRegex = /[.,!?;:]/;
        const match = text.slice(charIndex).match(punctuationRegex);
        if (match && match.index !== undefined) {
           const puncIndex = charIndex + match.index;
           if (puncIndex < nextSpaceIndex) {
               nextSpaceIndex = puncIndex;
           }
        }

        setState(prev => ({
          ...prev,
          highlightStartIndex: charIndex,
          highlightEndIndex: nextSpaceIndex,
        }));
      }
    };

    utterance.onend = () => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        highlightStartIndex: 0,
        highlightEndIndex: 0,
      }));
    };

    utterance.onerror = (e) => {
      console.error('SpeechSynthesis Error:', e);
      stop();
    };

    window.speechSynthesis.speak(utterance);
  }, [stop]);

  const pause = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setState(prev => ({ ...prev, isPaused: true, isPlaying: false }));
    }
  }, []);

  const resume = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setState(prev => ({ ...prev, isPaused: false, isPlaying: true }));
    }
  }, []);

  // Ensure speech synthesis stops when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { ...state, play, pause, resume, stop };
}
