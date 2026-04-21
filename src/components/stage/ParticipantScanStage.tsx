import { useDeferredValue } from 'react';
import { motion } from 'framer-motion';
import type { Participant } from '../../types/participant';

type ParticipantScanStageProps = {
  participants: Participant[];
};

export function ParticipantScanStage({ participants }: ParticipantScanStageProps) {
  const deferredParticipants = useDeferredValue(participants);
  const columns = buildColumns(deferredParticipants);

  return (
    <motion.section
      className="stage scan-stage"
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="scan-overlay">
        <p className="eyebrow">Participant scan</p>
        <h2>All candidates loaded</h2>
        <span>{participants.length.toLocaleString()} entries in motion</span>
      </div>
      <div className="scan-columns" aria-hidden="true">
        {columns.map((column, columnIndex) => (
          <div
            className="scan-column"
            style={{
              animationDuration: `${13 + columnIndex * 1.7}s`,
              animationDelay: `${columnIndex * -1.2}s`,
            }}
            key={`scan-column-${columnIndex}`}
          >
            {[...column, ...column].map((participant, index) => (
              <span key={`${participant.id}-${index}`}>{participant.name}</span>
            ))}
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function buildColumns(participants: Participant[]) {
  const sample = participants.length ? participants.slice(0, 160) : [];
  return Array.from({ length: 8 }, (_, columnIndex) =>
    sample.filter((_, participantIndex) => participantIndex % 8 === columnIndex).slice(0, 24)
  );
}
