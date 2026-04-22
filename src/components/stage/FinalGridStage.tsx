import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { Participant } from '../../types/participant';

type FinalGridStageProps = {
  finalists: Participant[];
  showFireworks?: boolean;
};

const CONFETTI_COLORS = ['#76b900', '#b6ff6a', '#d4ff7a', '#f6fff0', '#ffffff'];
const BURST_INTERVAL_MS = 1100;

export function FinalGridStage({ finalists, showFireworks }: FinalGridStageProps) {
  useEffect(() => {
    if (!showFireworks) return;
    const fire = () => {
      confetti({
        particleCount: 90,
        spread: 72,
        startVelocity: 58,
        origin: { x: 0.08, y: 0.82 },
        angle: 60,
        colors: CONFETTI_COLORS,
        shapes: ['square', 'circle'],
        scalar: 1.1,
        ticks: 220,
      });
      confetti({
        particleCount: 90,
        spread: 72,
        startVelocity: 58,
        origin: { x: 0.92, y: 0.82 },
        angle: 120,
        colors: CONFETTI_COLORS,
        shapes: ['square', 'circle'],
        scalar: 1.1,
        ticks: 220,
      });
      confetti({
        particleCount: 140,
        spread: 110,
        startVelocity: 48,
        origin: { x: 0.5, y: 0.3 },
        colors: CONFETTI_COLORS,
        shapes: ['star', 'circle'],
        scalar: 1.25,
        ticks: 260,
      });
    };

    fire();
    const interval = window.setInterval(fire, BURST_INTERVAL_MS);
    return () => {
      window.clearInterval(interval);
      confetti.reset();
    };
  }, [showFireworks]);

  return (
    <motion.section className="stage final-grid-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="stage-heading">
        <p className="eyebrow">{showFireworks ? 'Winners' : 'Finalists assembled'}</p>
        <h2>Final {finalists.length}</h2>
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
