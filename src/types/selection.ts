import type { Participant } from './participant';

export type SelectionResult = {
  allParticipants: Participant[];
  wave1: Participant[];
  wave2: Participant[];
  final20: Participant[];
  winner?: Participant;
  seeds: { wave1?: string; wave2?: string };
};

export type DrawLog = {
  timestamp: string;
  participantCount: number;
  validParticipantCount: number;
  wave1Ids: string[];
  wave2Ids: string[];
  final20Ids: string[];
  winnerId: string;
  seed: string;
  participantHash: string;
};

export type AppStage =
  | 'idle'
  | 'data_loaded'
  | 'scan'
  | 'wave1'
  | 'wave2'
  | 'final20'
  | 'transform'
  | 'roulette'
  | 'winner';
