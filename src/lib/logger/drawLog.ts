import type { DrawLog, SelectionResult } from '../../types/selection';
import { hashString } from '../random/seededRandom';

export function createDrawLog(selection: SelectionResult, seed: string, originalCount: number): DrawLog {
  const participantFingerprint = selection.allParticipants
    .map((participant) => `${participant.id}:${participant.name}:${participant.affiliation ?? ''}`)
    .join('|');

  return {
    timestamp: new Date().toISOString(),
    participantCount: originalCount,
    validParticipantCount: selection.allParticipants.length,
    wave1Ids: selection.wave1.map((participant) => participant.id),
    wave2Ids: selection.wave2.map((participant) => participant.id),
    final20Ids: selection.final20.map((participant) => participant.id),
    winnerId: selection.winner?.id ?? '',
    seed,
    participantHash: hashString(participantFingerprint).toString(16),
  };
}

export function downloadDrawLog(log: DrawLog) {
  const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `draw-log-${log.timestamp.replaceAll(':', '-')}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
