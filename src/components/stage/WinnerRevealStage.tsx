import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { Participant } from '../../types/participant';

type WinnerRevealStageProps = {
  winner: Participant;
};

const CONFETTI_COLORS = ['#76b900', '#b6ff6a', '#d4ff7a', '#f6fff0', '#ffffff'];
const BURST_INTERVAL_MS = 1100;
const BURST_DURATION_MS = 5000;

export function WinnerRevealStage({ winner }: WinnerRevealStageProps) {
  useEffect(() => {
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
    const stop = window.setTimeout(() => window.clearInterval(interval), BURST_DURATION_MS);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(stop);
      confetti.reset();
    };
  }, []);

  return (
    <motion.section className="stage winner-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="winner-aura" />
      <motion.div
        className="winner-card"
        initial={{ opacity: 0, scale: 0.72, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 140, damping: 12 }}
      >
        <p className="eyebrow">Winner</p>
        <h2>{winner.name}</h2>
        {winner.affiliation ? <span>{winner.affiliation}</span> : null}
        {winner.email ? <span className="winner-email">{winner.email}</span> : null}
      </motion.div>
    </motion.section>
  );
}
