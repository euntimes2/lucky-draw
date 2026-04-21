import type { AppStage } from '../../types/selection';

const cueByStage: Partial<Record<AppStage, { frequency: number; duration: number; type: OscillatorType }>> = {
  scan: { frequency: 110, duration: 0.18, type: 'sawtooth' },
  wave1: { frequency: 330, duration: 0.16, type: 'triangle' },
  wave2: { frequency: 392, duration: 0.16, type: 'triangle' },
  final20: { frequency: 523, duration: 0.22, type: 'sine' },
  transform: { frequency: 196, duration: 0.28, type: 'sawtooth' },
  roulette: { frequency: 146, duration: 0.32, type: 'triangle' },
  winner: { frequency: 659, duration: 0.5, type: 'sine' },
};

let audioContext: AudioContext | undefined;

export function playStageCue(stage: AppStage) {
  const cue = cueByStage[stage];
  if (!cue) return;

  audioContext ??= new AudioContext();
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = cue.type;
  oscillator.frequency.setValueAtTime(cue.frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(cue.frequency * 1.35, now + cue.duration);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + cue.duration);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + cue.duration + 0.02);
}
