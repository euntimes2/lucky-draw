import type { Participant } from '../../types/participant';
import type { SelectionResult } from '../../types/selection';
import { createSeededRandom, shuffleWithRandom } from '../../lib/random/seededRandom';

export function initSelection(participants: Participant[]): SelectionResult {
  if (participants.length < 20) {
    throw new Error('At least 20 valid participants are required for the final sequence.');
  }
  return {
    allParticipants: participants,
    wave1: [],
    wave2: [],
    final20: [],
    seeds: {},
  };
}

export function drawWave(
  selection: SelectionResult,
  wave: 'wave1' | 'wave2',
  seed: string,
  size = 10
): SelectionResult {
  const random = createSeededRandom(seed);

  let pool: Participant[];
  if (wave === 'wave1') {
    pool = selection.allParticipants;
  } else {
    const excluded = new Set(selection.wave1.map((p) => p.id));
    pool = selection.allParticipants.filter((p) => !excluded.has(p.id));
  }

  const picks = shuffleWithRandom(pool, random).slice(0, size);

  const next: SelectionResult = {
    ...selection,
    seeds: { ...selection.seeds, [wave]: seed },
  };

  if (wave === 'wave1') {
    next.wave1 = picks;
    next.final20 = [...picks, ...selection.wave2];
  } else {
    next.wave2 = picks;
    next.final20 = [...selection.wave1, ...picks];
  }

  return next;
}

export function clearWave(selection: SelectionResult, wave: 'wave1' | 'wave2'): SelectionResult {
  const next: SelectionResult = {
    ...selection,
    seeds: { ...selection.seeds, [wave]: undefined },
  };
  if (wave === 'wave1') {
    next.wave1 = [];
    next.final20 = [...selection.wave2];
  } else {
    next.wave2 = [];
    next.final20 = [...selection.wave1];
  }
  return next;
}
