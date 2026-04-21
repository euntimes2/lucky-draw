import { motion } from 'framer-motion';
import type { Participant } from '../../types/participant';

type FinalGridStageProps = {
  finalists: Participant[];
};

export function FinalGridStage({ finalists }: FinalGridStageProps) {
  return (
    <motion.section className="stage final-grid-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="stage-heading">
        <p className="eyebrow">Finalists assembled</p>
        <h2>Final 20</h2>
      </div>

      <div className="final-grid">
        {finalists.map((candidate, index) => (
          <motion.article
            className="final-card"
            key={candidate.id}
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.045, duration: 0.36 }}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{candidate.name}</strong>
            {candidate.affiliation ? <small>{candidate.affiliation}</small> : <small>Finalist</small>}
            {candidate.email ? <em>{candidate.email}</em> : null}
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}
