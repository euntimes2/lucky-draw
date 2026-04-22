import { startTransition, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { OperatorPanel } from '../components/common/OperatorPanel';
import { IdleStage, type DrawMode } from '../components/stage/IdleStage';
import { STAGE_LABELS } from './stages';
import { ParticipantScanStage } from '../components/stage/ParticipantScanStage';
import { WaveRevealStage } from '../components/stage/WaveRevealStage';
import { FinalGridStage } from '../components/stage/FinalGridStage';
import { TransformStage } from '../components/stage/TransformStage';
import { RouletteStage } from '../components/roulette/RouletteStage';
import { WinnerRevealStage } from '../components/stage/WinnerRevealStage';
import { generateMockParticipants, parseSpreadsheetFile, type ParseResult } from '../features/input/parser';
import { clearWave, drawWave, initSelection } from '../features/selection/selection';
import { createDrawLog, downloadDrawLog } from '../lib/logger/drawLog';
import { createSeed } from '../lib/random/seededRandom';
import { DEFAULT_PARTICIPANTS } from '../data/participants';
import { playStageCue } from '../lib/audio/cues';
import type { Participant } from '../types/participant';
import type { AppStage, DrawLog, SelectionResult } from '../types/selection';
import { nextStage, previousStage } from './stages';

type ParseStats = {
  rawRows: number;
  droppedRows: number;
  duplicateRows: number;
  validRows: number;
};

function resolveStageLabel(stage: AppStage, mode: DrawMode): string {
  if (mode === 'pick5') {
    if (stage === 'wave1') return '5 survived';
    if (stage === 'final20') return 'Final 5';
  }
  return STAGE_LABELS[stage];
}

export function App() {
  const [stage, setStage] = useState<AppStage>('idle');
  const [stageRunId, setStageRunId] = useState(0);
  const [waveStarted, setWaveStarted] = useState(false);
  const [mode, setMode] = useState<DrawMode>('pick1');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selection, setSelection] = useState<SelectionResult>();
  const [rouletteWinner, setRouletteWinner] = useState<Participant>();
  const [drawLog, setDrawLog] = useState<DrawLog>();
  const [seed, setSeed] = useState('');
  const [fileName, setFileName] = useState<string>();
  const [stats, setStats] = useState<ParseStats>();
  const [error, setError] = useState<string>();
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    if (!soundEnabled) return;
    playStageCue(stage);
  }, [soundEnabled, stage, stageRunId]);

  useEffect(() => {
    setWaveStarted(false);
  }, [stage, stageRunId]);

  // Lock the UI to a 15" reference canvas (1440x900 CSS px) via transform scale
  // on #root (styles.css). Every display renders the exact same layout.
  useEffect(() => {
    const REF_WIDTH = 1440;
    const REF_HEIGHT = 900;
    const update = () => {
      const scale = Math.min(
        window.innerWidth / REF_WIDTH,
        window.innerHeight / REF_HEIGHT
      );
      document.documentElement.style.setProperty('--ui-scale', String(scale));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (DEFAULT_PARTICIPANTS.length < 20) return;
    applyParseResult({
      participants: DEFAULT_PARTICIPANTS,
      rawRows: DEFAULT_PARTICIPANTS.length,
      droppedRows: 0,
      duplicateRows: 0,
    });
    setFileName('Registered participants');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT') return;

      if (event.code === 'Space') {
        event.preventDefault();
        if (stage === 'roulette') return; // RouletteStage handles Space locally
        handleNext();
      } else if (event.key.toLowerCase() === 'r') {
        handleReplay();
      } else if (event.key.toLowerCase() === 'f') {
        handleFullscreen();
      } else if (event.key.toLowerCase() === 'm') {
        setSoundEnabled((value) => !value);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  async function handleFile(file: File) {
    setError(undefined);
    setFileName(file.name);
    try {
      applyParseResult(await parseSpreadsheetFile(file));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not parse the selected file.');
    }
  }

  function handleMockData() {
    const mockParticipants = generateMockParticipants(700);
    const mockResult: ParseResult = {
      participants: mockParticipants,
      rawRows: mockParticipants.length,
      droppedRows: 0,
      duplicateRows: 0,
    };
    setFileName('700 rehearsal candidates');
    applyParseResult(mockResult);
  }

  function applyParseResult(result: ParseResult) {
    if (result.participants.length < 20) {
      setParticipants(result.participants);
      setSelection(undefined);
      setRouletteWinner(undefined);
      setDrawLog(undefined);
      setStats({
        rawRows: result.rawRows,
        droppedRows: result.droppedRows,
        duplicateRows: result.duplicateRows,
        validRows: result.participants.length,
      });
      setError('At least 20 valid participants are required.');
      return;
    }

    const nextSelection = initSelection(result.participants);
    const nextLog = createDrawLog(nextSelection, '', result.rawRows);

    setSeed('');
    setParticipants(result.participants);
    setSelection(nextSelection);
    setRouletteWinner(undefined);
    setDrawLog(nextLog);
    setStats({
      rawRows: result.rawRows,
      droppedRows: result.droppedRows,
      duplicateRows: result.duplicateRows,
      validRows: result.participants.length,
    });
    setStage('data_loaded');
    setStageRunId((value) => value + 1);
  }

  function handleStart() {
    if (!selection) return;
    startTransition(() => setStage('scan'));
    setStageRunId((value) => value + 1);
  }

  function handleNext() {
    if (!selection) return;
    if (mode === 'pick5' && stage === 'final20') return; // terminal — use Restart
    startTransition(() =>
      setStage((current) => {
        let next = nextStage(current);
        if (next === 'wave2') next = nextStage(next); // both modes draw in a single wave
        return next;
      })
    );
    setStageRunId((value) => value + 1);
  }

  function handlePrevious() {
    startTransition(() =>
      setStage((current) => {
        let prev = previousStage(current);
        if (prev === 'wave2') prev = previousStage(prev);
        return prev;
      })
    );
    setStageRunId((value) => value + 1);
  }

  function handleReplay() {
    if (selection && (stage === 'wave1' || stage === 'wave2')) {
      const cleared = clearWave(selection, stage);
      setSelection(cleared);
      setDrawLog((current) =>
        current
          ? {
              ...current,
              wave1Ids: cleared.wave1.map((p) => p.id),
              wave2Ids: cleared.wave2.map((p) => p.id),
              final20Ids: cleared.final20.map((p) => p.id),
            }
          : current
      );
    }
    setStageRunId((value) => value + 1);
  }

  function handleRestart() {
    startTransition(() => setStage(selection ? 'data_loaded' : 'idle'));
    setStageRunId((value) => value + 1);
  }

  function handleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => undefined);
      return;
    }
    document.exitFullscreen().catch(() => undefined);
  }

  function handleExportLog() {
    if (drawLog) downloadDrawLog(drawLog);
  }

  const waveSize = mode === 'pick5' ? 5 : 20;

  function handleStartWave() {
    if (!selection) return;
    if (stage !== 'wave1' && stage !== 'wave2') return;
    const currentWave = stage === 'wave1' ? selection.wave1 : selection.wave2;
    const alreadyDrawn = currentWave.length === waveSize;
    if (!alreadyDrawn) {
      const newSeed = createSeed();
      const nextSelection = drawWave(selection, stage, newSeed, waveSize);
      setSelection(nextSelection);
      setSeed(
        [nextSelection.seeds.wave1, nextSelection.seeds.wave2].filter(Boolean).join(' | ')
      );
      setDrawLog((current) =>
        current
          ? {
              ...current,
              wave1Ids: nextSelection.wave1.map((p) => p.id),
              wave2Ids: nextSelection.wave2.map((p) => p.id),
              final20Ids: nextSelection.final20.map((p) => p.id),
              seed: [nextSelection.seeds.wave1, nextSelection.seeds.wave2].filter(Boolean).join(' | '),
            }
          : current
      );
    }
    setWaveStarted(true);
  }

  function handleModeChange(nextMode: DrawMode) {
    if (stage !== 'idle' && stage !== 'data_loaded') return;
    if (mode === nextMode) return;
    setMode(nextMode);
    if (selection) {
      const cleared = { ...selection, wave1: [], wave2: [], final20: [], seeds: {}, winner: undefined };
      setSelection(cleared);
      setRouletteWinner(undefined);
      setSeed('');
      setDrawLog((current) =>
        current
          ? { ...current, wave1Ids: [], wave2Ids: [], final20Ids: [], winnerId: '', seed: '' }
          : current
      );
    }
  }

  function renderStage() {
    if (!selection) {
      return (
        <IdleStage
          key={`idle-${stageRunId}`}
          fileName={fileName}
          error={error}
          mode={mode}
          onFile={handleFile}
          onMock={handleMockData}
          onModeChange={handleModeChange}
        />
      );
    }

    const wave1Title = mode === 'pick5' ? '5 survived' : '20 survived';
    const waveRevealSpeed = mode === 'pick5' ? 3 : 1;

    switch (stage) {
      case 'scan':
        return <ParticipantScanStage key={`scan-${stageRunId}`} participants={selection.allParticipants} />;
      case 'wave1':
        return (
          <WaveRevealStage
            key={`wave1-${stageRunId}`}
            title={wave1Title}
            candidates={selection.wave1}
            pool={selection.allParticipants}
            direction="left"
            started={waveStarted}
            revealSpeedFactor={waveRevealSpeed}
            waveSize={waveSize}
          />
        );
      case 'wave2':
        return (
          <WaveRevealStage
            key={`wave2-${stageRunId}`}
            title="10 more survived"
            candidates={selection.wave2}
            pool={selection.allParticipants}
            direction="right"
            started={waveStarted}
            revealSpeedFactor={waveRevealSpeed}
            waveSize={waveSize}
          />
        );
      case 'final20':
        return (
          <FinalGridStage
            key={`final20-${stageRunId}`}
            finalists={selection.final20}
            showFireworks={mode === 'pick5'}
          />
        );
      case 'transform':
        return <TransformStage key={`transform-${stageRunId}`} finalists={selection.final20} winnerId={rouletteWinner?.id ?? ''} />;
      case 'roulette':
        return (
          <RouletteStage
            key={`roulette-${stageRunId}`}
            finalists={selection.final20}
            onComplete={(winner) => {
              setRouletteWinner(winner);
              setSelection((current) => (current ? { ...current, winner } : current));
              setDrawLog((current) => (current ? { ...current, winnerId: winner.id } : current));
              startTransition(() => setStage('winner'));
            }}
          />
        );
      case 'winner': {
        const winner = rouletteWinner ?? selection.winner;
        if (!winner) return null;
        return <WinnerRevealStage key={`winner-${stageRunId}`} winner={winner} />;
      }
      case 'idle':
      case 'data_loaded':
      default:
        return (
          <IdleStage
            key={`loaded-${stageRunId}`}
            fileName={fileName}
            error={error}
            mode={mode}
            onFile={handleFile}
            onMock={handleMockData}
            onModeChange={handleModeChange}
          />
        );
    }
  }

  return (
    <main className="app-shell">
      <div className="ambient-grid" />
      <AnimatePresence mode="wait">{renderStage()}</AnimatePresence>
      <div className="brand-footer" aria-hidden="true">
        <img src="/snu.png" alt="Seoul National University" />
        <img src="/nvidia_logo.png" alt="NVIDIA" />
      </div>
      <OperatorPanel
        stage={stage}
        stageLabel={resolveStageLabel(stage, mode)}
        participantCount={stats?.rawRows ?? participants.length}
        validCount={selection?.allParticipants.length ?? participants.length}
        seed={seed}
        soundEnabled={soundEnabled}
        canStart={Boolean(selection)}
        drawLog={drawLog}
        waveStarted={waveStarted}
        waveSize={waveSize}
        terminalAtFinal={mode === 'pick5'}
        onStart={handleStart}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onReplay={handleReplay}
        onRestart={handleRestart}
        onToggleSound={() => setSoundEnabled((value) => !value)}
        onFullscreen={handleFullscreen}
        onExportLog={handleExportLog}
        onStartWave={handleStartWave}
      />
    </main>
  );
}
