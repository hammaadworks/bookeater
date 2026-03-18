import { useState, useEffect, useCallback } from 'react';
import { TTSService, TTSState } from '../../services/tts.service';
import { TTSStatus } from '../../constants';

export function useTTS() {
  const [state, setState] = useState<TTSState>({
    status: TTSStatus.IDLE,
    currentText: '',
    highlightStartIndex: 0,
    highlightEndIndex: 0,
  });

  const stop = useCallback(() => {
    TTSService.stop();
    setState(prev => ({
      ...prev,
      status: TTSStatus.IDLE,
      highlightStartIndex: 0,
      highlightEndIndex: 0,
    }));
  }, []);

  const play = useCallback((text: string) => {
    if (!TTSService.isSupported()) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }

    TTSService.play(text, {
      onStart: () => {
        setState({
          status: TTSStatus.PLAYING,
          currentText: text,
          highlightStartIndex: 0,
          highlightEndIndex: 0,
        });
      },
      onBoundary: (startIndex: number, endIndex: number) => {
        setState(prev => ({
          ...prev,
          highlightStartIndex: startIndex,
          highlightEndIndex: endIndex,
        }));
      },
      onEnd: () => {
        setState(prev => ({
          ...prev,
          status: TTSStatus.IDLE,
          highlightStartIndex: 0,
          highlightEndIndex: 0,
        }));
      },
      onError: (e: any) => {
        console.error('SpeechSynthesis Error:', e);
        stop();
      }
    });
  }, [stop]);

  const pause = useCallback(() => {
    TTSService.pause();
    setState(prev => ({ ...prev, status: TTSStatus.PAUSED }));
  }, []);

  const resume = useCallback(() => {
    TTSService.resume();
    setState(prev => ({ ...prev, status: TTSStatus.PLAYING }));
  }, []);

  useEffect(() => {
    return () => TTSService.stop();
  }, []);

  return {
    ...state,
    isPlaying: state.status === TTSStatus.PLAYING,
    isPaused: state.status === TTSStatus.PAUSED,
    play,
    pause,
    resume,
    stop
  };
}
