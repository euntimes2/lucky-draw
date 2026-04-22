import type { AppStage, DrawLog } from '../../types/selection';

type OperatorPanelProps = {
  stage: AppStage;
  stageLabel: string;
  participantCount: number;
  validCount: number;
  seed: string;
  soundEnabled: boolean;
  canStart: boolean;
  drawLog?: DrawLog;
  waveStarted: boolean;
  waveSize: number;
  terminalAtFinal: boolean;
  onStart: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onReplay: () => void;
  onRestart: () => void;
  onToggleSound: () => void;
  onFullscreen: () => void;
  onExportLog: () => void;
  onStartWave: () => void;
};

type PrimaryAction = { label: string; onClick: () => void; disabled?: boolean };

function resolvePrimary(
  stage: AppStage,
  canStart: boolean,
  waveStarted: boolean,
  waveSize: number,
  terminalAtFinal: boolean,
  handlers: Pick<OperatorPanelProps, 'onStart' | 'onNext' | 'onRestart' | 'onStartWave'>
): PrimaryAction | null {
  switch (stage) {
    case 'idle':
      return null;
    case 'roulette':
      return null; // RouletteStage renders its own Stop button at the same slot
    case 'data_loaded':
      return { label: 'Start show', onClick: handlers.onStart, disabled: !canStart };
    case 'wave1':
    case 'wave2':
      if (!waveStarted) {
        return { label: `Draw ${waveSize}`, onClick: handlers.onStartWave };
      }
      return { label: 'Next stage', onClick: handlers.onNext };
    case 'final20':
      if (terminalAtFinal) {
        return { label: 'Restart show', onClick: handlers.onRestart };
      }
      return { label: 'Next stage', onClick: handlers.onNext };
    case 'winner':
      return { label: 'Restart show', onClick: handlers.onRestart };
    default:
      return { label: 'Next stage', onClick: handlers.onNext };
  }
}

export function OperatorPanel({
  stage,
  stageLabel,
  participantCount,
  validCount,
  seed,
  soundEnabled,
  canStart,
  drawLog,
  waveStarted,
  waveSize,
  terminalAtFinal,
  onStart,
  onNext,
  onPrevious,
  onReplay,
  onRestart,
  onToggleSound,
  onFullscreen,
  onExportLog,
  onStartWave,
}: OperatorPanelProps) {
  const primary = resolvePrimary(stage, canStart, waveStarted, waveSize, terminalAtFinal, { onStart, onNext, onRestart, onStartWave });

  return (
    <>
      {primary ? (
        <button
          type="button"
          className="primary-cta"
          onClick={primary.onClick}
          disabled={primary.disabled}
          aria-label={primary.label}
        >
          <span className="primary-cta-label">{primary.label}</span>
          <span className="primary-cta-hint">Space</span>
        </button>
      ) : null}

      <aside className="operator-panel" aria-label="Operator controls">
        <div className="operator-status">
          <strong>{stageLabel}</strong>
          <span>{validCount.toLocaleString()} valid</span>
          <span>{participantCount.toLocaleString()} loaded</span>
          <span>Seed {seed || '—'}</span>
        </div>
        <div className="operator-actions">
          <button type="button" onClick={onPrevious}>Back</button>
          <button type="button" onClick={onReplay}>Replay</button>
          <button type="button" onClick={onRestart}>Restart</button>
          <button type="button" onClick={onToggleSound}>{soundEnabled ? 'Sound on' : 'Muted'}</button>
          <button type="button" onClick={onFullscreen}>Fullscreen</button>
          <button type="button" onClick={onExportLog} disabled={!drawLog}>Export log</button>
        </div>
      </aside>
    </>
  );
}
