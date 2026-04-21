import { motion } from 'framer-motion';
import type { Participant } from '../../types/participant';

type TransformStageProps = {
  finalists: Participant[];
  winnerId: string;
};

export function TransformStage({ finalists, winnerId }: TransformStageProps) {
  return (
    <motion.section className="stage transform-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="stage-heading">
        <p className="eyebrow">Identity preserved</p>
        <h2>Final round begins</h2>
      </div>

      <div className="transform-grid">
        {finalists.map((candidate, index) => (
          <motion.div
            className="transform-item"
            key={candidate.id}
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.035 }}
          >
            <div className="fragment-card">
              <span className="fragment one" />
              <span className="fragment two" />
              <span className="fragment three" />
              <strong>{candidate.name}</strong>
            </div>
            <div className={`marble-token ${candidate.id === winnerId ? 'winner-token' : ''}`}>
              {String(index + 1).padStart(2, '0')}
            </div>
            <small>{candidate.affiliation ?? 'Finalist'}</small>
            {candidate.email ? <em>{candidate.email}</em> : null}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
