import { motion } from 'framer-motion';

export type DrawMode = 'pick1' | 'pick5';

type IdleStageProps = {
  fileName?: string;
  error?: string;
  mode: DrawMode;
  onFile: (file: File) => void;
  onMock: () => void;
  onModeChange: (mode: DrawMode) => void;
};

export function IdleStage({
  fileName,
  error,
  mode,
  onFile,
  onMock,
  onModeChange,
}: IdleStageProps) {
  return (
    <motion.section className="stage idle-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="hero-copy">
        <p className="eyebrow">Stage-ready lucky draw</p>
        <h1>
          <span className="neon-brand">NVIDIA</span>
          <span className="hero-subtitle">LUCKY DRAW</span>
        </h1>
      </div>

      <div className="load-card">
        <label className="file-drop">
          <span>Drop in the participant sheet</span>
          <small>.xlsx, .csv, or exported Google Sheets CSV</small>
          <input
            type="file"
            accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) onFile(file);
            }}
          />
        </label>

        <button type="button" className="mock-button" onClick={onMock}>
          Load 700 rehearsal candidates
        </button>

        <div className="mode-toggle" role="radiogroup" aria-label="Draw mode">
          <span className="mode-toggle-label">Mode</span>
          <div className="mode-toggle-group">
            <button
              type="button"
              role="radio"
              aria-checked={mode === 'pick1'}
              className={`mode-button${mode === 'pick1' ? ' active' : ''}`}
              onClick={() => onModeChange('pick1')}
            >
              Pick 1
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={mode === 'pick5'}
              className={`mode-button${mode === 'pick5' ? ' active' : ''}`}
              onClick={() => onModeChange('pick5')}
            >
              Pick 5
            </button>
          </div>
        </div>

        {fileName ? <p className="load-note">Loaded file: {fileName}</p> : null}
        {error ? <p className="error-note">{error}</p> : null}
      </div>
    </motion.section>
  );
}
