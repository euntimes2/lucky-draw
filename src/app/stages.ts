import type { AppStage } from '../types/selection';

export const STAGE_ORDER: AppStage[] = [
  'idle',
  'data_loaded',
  'scan',
  'wave1',
  'wave2',
  'final20',
  'roulette',
  'winner',
];

export const SHOW_STAGES: AppStage[] = ['scan', 'wave1', 'wave2', 'final20', 'roulette', 'winner'];

export const STAGE_LABELS: Record<AppStage, string> = {
  idle: 'Load candidates',
  data_loaded: 'All candidates loaded',
  scan: 'All candidates loaded',
  wave1: '10 survived',
  wave2: '10 more survived',
  final20: 'Final 20',
  transform: 'Final round begins',
  roulette: 'Round started',
  winner: 'Winner',
};

export function nextStage(stage: AppStage): AppStage {
  const index = STAGE_ORDER.indexOf(stage);
  return STAGE_ORDER[Math.min(index + 1, STAGE_ORDER.length - 1)];
}

export function previousStage(stage: AppStage): AppStage {
  const index = STAGE_ORDER.indexOf(stage);
  return STAGE_ORDER[Math.max(index - 1, 0)];
}
