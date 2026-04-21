import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Participant } from '../../types/participant';

type Phase = 'spinning' | 'stopping' | 'settled';

type RouletteStageProps = {
  finalists: Participant[];
  onComplete: (winner: Participant) => void;
};

const SPIN_SPEED_DEG_PER_SEC = 240;
const DECEL_DURATION_MS = 22000;
const DECEL_EASE_POWER = 4;
const ZOOM_TARGET_SCALE = 1.8;
const WINNER_REVEAL_DELAY_MS = 1400;

const SLICE_PALETTE: ReadonlyArray<{ fill: string; text: string }> = [
  { fill: '#76b900', text: '#051006' }, // NVIDIA green
  { fill: '#0a1406', text: '#f6fff0' }, // near-black
  { fill: '#f6fff0', text: '#051006' }, // off-white
];

function sliceColor(index: number): { fill: string; text: string } {
  return SLICE_PALETTE[index % SLICE_PALETTE.length];
}

function displayName(full: string, maxChars = 8): string {
  const first = (full.split('/')[0] ?? full).trim();
  if (first.length <= maxChars) return first;
  return first.slice(0, maxChars - 1).trim() + '…';
}

export function RouletteStage({ finalists, onComplete }: RouletteStageProps) {
  const [angle, setAngle] = useState(0);
  const [scale, setScale] = useState(1);
  const [phase, setPhase] = useState<Phase>('spinning');
  const [winner, setWinner] = useState<Participant | null>(null);

  const angleRef = useRef(0);
  const phaseRef = useRef<Phase>('spinning');
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number | null>(null);
  const stopStateRef = useRef<{ start: number; from: number; to: number } | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const tick = (now: number) => {
      const last = lastTimeRef.current;
      lastTimeRef.current = now;
      const dt = last == null ? 0 : (now - last) / 1000;

      if (phaseRef.current === 'spinning') {
        angleRef.current += SPIN_SPEED_DEG_PER_SEC * dt;
        setAngle(angleRef.current);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (phaseRef.current === 'stopping') {
        const stop = stopStateRef.current;
        if (!stop) return;
        const elapsed = now - stop.start;
        const t = Math.min(1, elapsed / DECEL_DURATION_MS);
        const eased = 1 - Math.pow(1 - t, DECEL_EASE_POWER);
        const current = stop.from + (stop.to - stop.from) * eased;
        angleRef.current = current;
        setAngle(current);
        setScale(1 + (ZOOM_TARGET_SCALE - 1) * eased);
        if (t >= 1) {
          phaseRef.current = 'settled';
          setPhase('settled');
          const idx = computeWinnerIndex(current, finalists.length);
          const picked = finalists[idx];
          setWinner(picked);
          window.setTimeout(() => onCompleteRef.current(picked), WINNER_REVEAL_DELAY_MS);
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [finalists]);

  function handleStop() {
    if (phaseRef.current !== 'spinning') return;
    const from = angleRef.current;
    const rotations = 3 + Math.random() * 1.5;
    const settleOffset = Math.random() * 360;
    const to = from + rotations * 360 + settleOffset;
    stopStateRef.current = { start: performance.now(), from, to };
    phaseRef.current = 'stopping';
    setPhase('stopping');
  }

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT') return;
      if (phaseRef.current !== 'spinning') return;
      event.preventDefault();
      handleStop();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const n = finalists.length;
  const sliceAngle = 360 / n;
  const RADIUS = 320;
  const CENTER = 340;
  const SIZE = 680;

  const slices = useMemo(() => {
    return finalists.map((candidate, i) => {
      const startDeg = i * sliceAngle - 90 - sliceAngle / 2;
      const endDeg = startDeg + sliceAngle;
      const sr = (startDeg * Math.PI) / 180;
      const er = (endDeg * Math.PI) / 180;
      const x1 = CENTER + RADIUS * Math.cos(sr);
      const y1 = CENTER + RADIUS * Math.sin(sr);
      const x2 = CENTER + RADIUS * Math.cos(er);
      const y2 = CENTER + RADIUS * Math.sin(er);
      const largeArc = sliceAngle > 180 ? 1 : 0;
      const d = `M ${CENTER},${CENTER} L ${x1},${y1} A ${RADIUS},${RADIUS} 0 ${largeArc} 1 ${x2},${y2} Z`;
      const midDeg = (startDeg + endDeg) / 2;
      const palette = sliceColor(i);
      return {
        id: candidate.id,
        d,
        midDeg,
        fill: palette.fill,
        textColor: palette.text,
        nameLabel: displayName(candidate.name),
      };
    });
  }, [finalists, sliceAngle]);

  const headingLabel =
    phase === 'settled' ? 'Selection complete' : phase === 'stopping' ? 'Slowing down' : 'Spinning';

  return (
    <motion.section
      className="stage wheel-stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="wheel-heading">
        <p className="eyebrow">Final round</p>
        <h2>{headingLabel}</h2>
      </div>

      <div className="wheel-frame">
        <div className="wheel-zoom" style={{ transform: `scale(${scale})` }}>
          <div className="wheel-pointer" aria-hidden="true" />
          <div className="wheel-ring" aria-hidden="true" />
          <svg
            className="wheel-disc"
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{ transform: `rotate(${angle}deg)` }}
          >
            <g>
              {slices.map((slice) => (
                <g key={slice.id}>
                  <path d={slice.d} fill={slice.fill} stroke="rgba(2,6,2,0.65)" strokeWidth="1.3" />
                  <g transform={`rotate(${slice.midDeg + 90}, ${CENTER}, ${CENTER})`}>
                    <text
                      x={CENTER}
                      y={CENTER - RADIUS * 0.78}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontFamily="Rajdhani, Aptos Display, sans-serif"
                      fontWeight="800"
                      fontSize="19"
                      fill={slice.textColor}
                    >
                      {slice.nameLabel}
                    </text>
                  </g>
                </g>
              ))}
            </g>
            <circle cx={CENTER} cy={CENTER} r={RADIUS + 6} fill="none" stroke="rgba(118,185,0,0.55)" strokeWidth="4" />
            <circle cx={CENTER} cy={CENTER} r={46} fill="#06100a" stroke="rgba(182,255,106,0.55)" strokeWidth="3" />
            <circle cx={CENTER} cy={CENTER} r={16} fill="#b6ff6a" />
          </svg>
        </div>
      </div>

      {phase === 'spinning' ? (
        <button type="button" className="primary-cta wheel-stop" onClick={handleStop} aria-label="Stop wheel">
          <span className="primary-cta-label">Stop</span>
          <span className="primary-cta-hint">Space</span>
        </button>
      ) : null}

      {phase === 'settled' && winner ? (
        <motion.div
          className="wheel-winner-banner"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="eyebrow">Winner</p>
          <strong>{winner.name}</strong>
          {winner.affiliation ? <small>{winner.affiliation}</small> : null}
        </motion.div>
      ) : null}
    </motion.section>
  );
}

function computeWinnerIndex(angle: number, total: number): number {
  const sliceAngle = 360 / total;
  const normalized = ((angle % 360) + 360) % 360;
  const raw = -normalized / sliceAngle;
  return ((Math.round(raw) % total) + total) % total;
}
