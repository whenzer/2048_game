import { useCallback, useRef } from 'react';

// Sound URLs (using data URIs for simple sounds)
const createOscillatorSound = (frequency: number, duration: number, type: OscillatorType = 'sine'): () => void => {
  return () => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch {
      // Audio not supported
    }
  };
};

const sounds = {
  move: createOscillatorSound(200, 0.1, 'square'),
  merge: createOscillatorSound(400, 0.15, 'sine'),
  bigMerge: createOscillatorSound(600, 0.2, 'sine'),
  win: () => {
    const play = createOscillatorSound(523, 0.15, 'sine');
    play();
    setTimeout(() => createOscillatorSound(659, 0.15, 'sine')(), 150);
    setTimeout(() => createOscillatorSound(784, 0.3, 'sine')(), 300);
  },
  gameOver: () => {
    const play = createOscillatorSound(300, 0.2, 'sawtooth');
    play();
    setTimeout(() => createOscillatorSound(200, 0.3, 'sawtooth')(), 200);
  },
  powerUp: createOscillatorSound(800, 0.1, 'triangle'),
  combo: createOscillatorSound(500, 0.1, 'sine'),
};

interface UseSoundOptions {
  enabled?: boolean;
}

export const useSound = (options: UseSoundOptions = {}) => {
  const { enabled = true } = options;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const playSound = useCallback((soundName: keyof typeof sounds) => {
    if (!enabledRef.current) return;
    
    try {
      sounds[soundName]();
    } catch {
      // Sound failed to play
    }
  }, []);

  return {
    playMove: () => playSound('move'),
    playMerge: (value: number) => {
      if (value >= 256) {
        playSound('bigMerge');
      } else {
        playSound('merge');
      }
    },
    playWin: () => playSound('win'),
    playGameOver: () => playSound('gameOver'),
    playPowerUp: () => playSound('powerUp'),
    playCombo: () => playSound('combo'),
  };
};
