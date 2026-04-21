import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Participant } from '../../types/participant';

type Phase = 'idle' | 'drawing' | 'reveal';

type WaveRevealStageProps = {
  title: string;
  candidates: Participant[];
  pool: Participant[];
  direction: 'left' | 'right';
  started: boolean;
};

const DRAW_DURATION_MS = 4000;
const SHUFFLE_INTERVAL_MS = 87;

export function WaveRevealStage({ title, candidates, pool, direction, started }: WaveRevealStageProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (started && phase === 'idle') setPhase('drawing');
  }, [started, phase]);

  useEffect(() => {
    if (phase !== 'drawing') return;
    const interval = window.setInterval(() => setTick((value) => value + 1), SHUFFLE_INTERVAL_MS);
    const timer = window.setTimeout(() => {
      window.clearInterval(interval);
      setPhase('reveal');
    }, DRAW_DURATION_MS);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [phase]);

  const shufflePool = useMemo(() => (pool.length ? pool : candidates), [pool, candidates]);
  const shuffleCandidate = shufflePool[tick % Math.max(shufflePool.length, 1)];
  const x = direction === 'left' ? -80 : 80;

  const tickerRows = useMemo(() => {
    const source = shufflePool;
    if (!source.length) return [] as Participant[][];
    const pick = (count: number, offset: number) => {
      const step = Math.max(1, Math.floor(source.length / Math.max(count, 1)));
      return Array.from({ length: count }, (_, i) => source[(offset + i * step) % source.length]);
    };
    return [pick(38, 0), pick(38, 13), pick(38, 27)];
  }, [shufflePool]);

  return (
    <motion.section
      className="stage wave-stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <AnimatePresence mode="wait">
        {phase === 'idle' ? (
          <motion.div
            key="idle"
            className="wave-awaiting"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p className="eyebrow">Standing by</p>
            <h2 className="wave-awaiting-title">{title}</h2>

            <div className="wave-awaiting-ticker-group" aria-hidden="true">
              {tickerRows.map((row, rowIndex) => (
                <div key={rowIndex} className={`wave-awaiting-ticker row-${rowIndex}`}>
                  <div className="wave-awaiting-track">
                    {[...row, ...row].map((person, idx) => (
                      <span className="ticker-item" key={`${person.id}-${idx}`}>
                        <strong>{person.name}</strong>
                        {person.affiliation ? <em>{person.affiliation}</em> : null}
                        {person.email ? <span>{person.email}</span> : null}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="wave-awaiting-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="wave-awaiting-hint">Press Draw 10 to begin</p>
          </motion.div>
        ) : phase === 'drawing' ? (
          <motion.div
            key="drawing"
            className="wave-drawing"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.3 }}
          >
            <p className="eyebrow">Drawing finalists</p>
            <div className="wave-drawing-name">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={shuffleCandidate?.id ?? `tick-${tick}`}
                  initial={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                  transition={{ duration: 0.09, ease: 'easeOut' }}
                >
                  {shuffleCandidate?.name ?? '—'}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="wave-drawing-meta">
              <span>{shuffleCandidate?.affiliation ?? '—'}</span>
            </div>
            <div className="wave-drawing-bar" aria-hidden="true" />
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            className="wave-reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="stage-heading">
              <h2>{title}</h2>
            </div>
            <div className={`wave-cluster ${direction}`}>
              {candidates.map((candidate, index) => (
                <motion.article
                  className="candidate-chip"
                  key={candidate.id}
                  initial={{ opacity: 0, x, y: 44, scale: 0.66, rotate: direction === 'left' ? -8 : 8 }}
                  animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 120,
                    damping: 16,
                    mass: 1,
                    delay: 0.15 + index * 0.28,
                  }}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{candidate.name}</strong>
                  {candidate.affiliation ? <small>{candidate.affiliation}</small> : null}
                  {candidate.email ? <em>{candidate.email}</em> : null}
                </motion.article>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
