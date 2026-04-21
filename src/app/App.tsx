import { startTransition, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { OperatorPanel } from '../components/common/OperatorPanel';
import { IdleStage } from '../components/stage/IdleStage';
import { ParticipantScanStage } from '../components/stage/ParticipantScanStage';
import { WaveRevealStage } from '../components/stage/WaveRevealStage';
import { FinalGridStage } from '../components/stage/FinalGridStage';
import { TransformStage } from '../components/stage/TransformStage';
import { RouletteStage } from '../components/roulette/RouletteStage';
import { WinnerRevealStage } from '../components/stage/WinnerRevealStage';
import { generateMockParticipants, parsePastedParticipants, parseSpreadsheetFile, type ParseResult } from '../features/input/parser';
import { clearWave, drawWave, initSelection } from '../features/selection/selection';
import { createDrawLog, downloadDrawLog } from '../lib/logger/drawLog';
import { createSeed } from '../lib/random/seededRandom';
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

export function App() {
  const [stage, setStage] = useState<AppStage>('idle');
  const [stageRunId, setStageRunId] = useState(0);
  const [waveStarted, setWaveStarted] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selection, setSelection] = useState<SelectionResult>();
  const [rouletteWinner, setRouletteWinner] = useState<Participant>();
  const [drawLog, setDrawLog] = useState<DrawLog>();
  const [seed, setSeed] = useState('');
  const [fileName, setFileName] = useState<string>();
  const [pastedValue, setPastedValue] = useState('');
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

  async function handleParsePaste() {
    setError(undefined);
    setFileName(undefined);
    try {
      applyParseResult(await parsePastedParticipants(pastedValue));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not parse pasted data.');
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
    setPastedValue('');
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
    startTransition(() => setStage((current) => nextStage(current)));
    setStageRunId((value) => value + 1);
  }

  function handlePrevious() {
    startTransition(() => setStage((current) => previousStage(current)));
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

  function handleStartWave() {
    if (!selection) return;
    if (stage !== 'wave1' && stage !== 'wave2') return;
    const alreadyDrawn = stage === 'wave1' ? selection.wave1.length === 10 : selection.wave2.length === 10;
    if (!alreadyDrawn) {
      const newSeed = createSeed();
      const nextSelection = drawWave(selection, stage, newSeed);
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

  function renderStage() {
    if (!selection) {
      return (
        <IdleStage
          key={`idle-${stageRunId}`}
          fileName={fileName}
          pastedValue={pastedValue}
          error={error}
          stats={stats}
          onFile={handleFile}
          onPasteChange={setPastedValue}
          onParsePaste={handleParsePaste}
          onMock={handleMockData}
        />
      );
    }

    switch (stage) {
      case 'scan':
        return <ParticipantScanStage key={`scan-${stageRunId}`} participants={selection.allParticipants} />;
      case 'wave1':
        return (
          <WaveRevealStage
            key={`wave1-${stageRunId}`}
            title="10 survived"
            candidates={selection.wave1}
            pool={selection.allParticipants}
            direction="left"
            started={waveStarted}
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
          />
        );
      case 'final20':
        return <FinalGridStage key={`final20-${stageRunId}`} finalists={selection.final20} />;
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
            pastedValue={pastedValue}
            error={error}
            stats={stats}
            onFile={handleFile}
            onPasteChange={setPastedValue}
            onParsePaste={handleParsePaste}
            onMock={handleMockData}
          />
        );
    }
  }

  return (
    <main className="app-shell">
      <div className="ambient-grid" />
      <AnimatePresence mode="wait">{renderStage()}</AnimatePresence>
      <OperatorPanel
        stage={stage}
        participantCount={stats?.rawRows ?? participants.length}
        validCount={selection?.allParticipants.length ?? participants.length}
        seed={seed}
        soundEnabled={soundEnabled}
        canStart={Boolean(selection)}
        drawLog={drawLog}
        waveStarted={waveStarted}
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
