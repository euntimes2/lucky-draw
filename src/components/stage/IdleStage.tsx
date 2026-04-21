import { motion } from 'framer-motion';

type IdleStageProps = {
  fileName?: string;
  pastedValue: string;
  error?: string;
  stats?: {
    rawRows: number;
    droppedRows: number;
    duplicateRows: number;
    validRows: number;
  };
  onFile: (file: File) => void;
  onPasteChange: (value: string) => void;
  onParsePaste: () => void;
  onMock: () => void;
};

export function IdleStage({
  fileName,
  pastedValue,
  error,
  stats,
  onFile,
  onPasteChange,
  onParsePaste,
  onMock,
}: IdleStageProps) {
  return (
    <motion.section className="stage idle-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="hero-copy">
        <p className="eyebrow">Stage-ready lucky draw</p>
        <h1>
          <span className="neon-brand">NVIDIA</span>
          <span className="neon-brand">DGX SPARK</span>
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

        <div className="paste-panel">
          <label htmlFor="participant-paste">Paste CSV or JSON</label>
          <textarea
            id="participant-paste"
            value={pastedValue}
            placeholder="name,affiliation,email&#10;Kim Minsoo,SNU,private@example.com"
            onChange={(event) => onPasteChange(event.currentTarget.value)}
          />
          <button type="button" onClick={onParsePaste}>
            Parse pasted data
          </button>
        </div>

        <button type="button" className="mock-button" onClick={onMock}>
          Load 700 rehearsal candidates
        </button>

        {fileName ? <p className="load-note">Loaded file: {fileName}</p> : null}
        {error ? <p className="error-note">{error}</p> : null}
        {stats ? (
          <div className="parse-stats">
            <span>{stats.validRows.toLocaleString()} valid</span>
            <span>{stats.rawRows.toLocaleString()} rows</span>
            <span>{stats.duplicateRows.toLocaleString()} duplicates removed</span>
            <span>{stats.droppedRows.toLocaleString()} empty names dropped</span>
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}
