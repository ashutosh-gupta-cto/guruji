/**
 * FIFO / LRU page replacement visualizer.
 *
 * Ported from MUMEi-28/VirtualMemorySimulator.
 *
 * @see https://github.com/MUMEi-28/VirtualMemorySimulator
 */

import { useMemo, useState } from 'react';
import {
  parseReferenceString,
  runSimulation,
  type ReplacementAlgorithm,
  type SimulationResult,
} from './algorithms';

const PRESETS: { label: string; ref: string; frames: number }[] = [
  { label: 'Classic (3 frames)', ref: '7 0 1 2 0 3 0 4 2 3 0 3 2', frames: 3 },
  { label: 'Belady example', ref: '1 2 3 4 1 2 5 1 2 3 4 5', frames: 3 },
  { label: 'Short demo', ref: '1 2 3 4 1 2 5', frames: 3 },
];

export default function PageReplacement() {
  const [algorithm, setAlgorithm] = useState<ReplacementAlgorithm>('fifo');
  const [refInput, setRefInput] = useState(PRESETS[0].ref);
  const [frameCount, setFrameCount] = useState(3);
  const [activeStep, setActiveStep] = useState(-1);

  const result: SimulationResult | null = useMemo(() => {
    const refs = parseReferenceString(refInput);
    if (refs.length === 0 || frameCount < 1) return null;
    return runSimulation(algorithm, refs, frameCount);
  }, [algorithm, refInput, frameCount]);

  const refs = parseReferenceString(refInput);

  return (
    <div className="pr-root">
      <div className="csf-toolbar">
        <div>
          <span className="csf-label">Algorithm</span>
          <div className="pr-algo-btns">
            {(['fifo', 'lru', 'opt'] as const).map((a) => (
              <button
                key={a}
                type="button"
                className={`csf-btn${algorithm === a ? ' csf-btn--primary' : ''}`}
                onClick={() => {
                  setAlgorithm(a);
                  setActiveStep(-1);
                }}
              >
                {a.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="csf-label">Frames</span>
          <input
            type="number"
            min={1}
            max={6}
            value={frameCount}
            onChange={(e) => {
              setFrameCount(Math.max(1, Math.min(6, parseInt(e.target.value, 10) || 1)));
              setActiveStep(-1);
            }}
            className="csf-input"
            style={{ width: '4rem' }}
          />
        </div>
      </div>

      <label className="csf-label">Reference string (space-separated)</label>
      <input
        className="csf-input"
        value={refInput}
        onChange={(e) => {
          setRefInput(e.target.value);
          setActiveStep(-1);
        }}
      />

      <div className="pr-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="csf-btn"
            onClick={() => {
              setRefInput(p.ref);
              setFrameCount(p.frames);
              setActiveStep(-1);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {result && (
        <>
          <p className="pr-summary">
            Total page faults: <strong>{result.totalFaults}</strong>
            <span className="pr-summary__hint">
              {' '}
              — click a reference to step through
            </span>
          </p>

          <div className="pr-ref-row">
            <span className="pr-ref-label">Ref</span>
            {refs.map((page, i) => (
              <button
                key={i}
                type="button"
                className={`pr-ref-cell${activeStep === i ? ' pr-ref-cell--active' : ''}${result.steps[i]?.isPageFault ? ' pr-ref-cell--fault' : ''}`}
                onClick={() => setActiveStep(i)}
              >
                {page}
              </button>
            ))}
          </div>

          <div className="pr-grid-wrap">
            <table className="pr-grid">
              <thead>
                <tr>
                  <th>Frame</th>
                  {refs.map((_, i) => (
                    <th key={i}>{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: frameCount }, (_, row) => (
                  <tr key={row}>
                    <td className="pr-frame-label">F{row}</td>
                    {result.steps.map((step, col) => {
                      const value = step.frames[row];
                      const isHighlight =
                        step.isPageFault && value !== null && value === step.page;
                      const isActiveCol = activeStep === col;
                      return (
                        <td
                          key={col}
                          className={`pr-cell${isHighlight ? ' pr-cell--fault' : ''}${isActiveCol ? ' pr-cell--active' : ''}`}
                          onClick={() => setActiveStep(col)}
                        >
                          {value ?? '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="pr-fault-row">
                  <td>Fault</td>
                  {result.steps.map((step, i) => (
                    <td key={i} className={step.isPageFault ? 'pr-fault-yes' : ''}>
                      {step.isPageFault ? '✓' : ''}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {activeStep >= 0 && result.steps[activeStep] && (
            <div className="pr-step-detail">
              Step {activeStep}: access page <strong>{result.steps[activeStep].page}</strong>
              {result.steps[activeStep].isPageFault ? (
                <span className="pr-fault-badge"> PAGE FAULT</span>
              ) : (
                <span className="pr-hit-badge"> HIT</span>
              )}
            </div>
          )}
        </>
      )}

      <style>{`
        .pr-root { display: flex; flex-direction: column; gap: 0.75rem; }
        .pr-algo-btns { display: flex; gap: 0.35rem; }
        .pr-presets { display: flex; flex-wrap: wrap; gap: 0.35rem; }
        .pr-summary { font-size: 0.875rem; color: var(--csf-fg-muted); }
        .pr-summary strong { color: var(--csf-teal); }
        .pr-summary__hint { color: var(--csf-fg-faint); font-size: 0.75rem; }
        .pr-ref-row { display: flex; align-items: center; gap: 0.25rem; overflow-x: auto; padding: 0.25rem 0; }
        .pr-ref-label { font-size: 0.7rem; color: var(--csf-fg-faint); min-width: 2rem; }
        .pr-ref-cell { min-width: 2rem; height: 2rem; border-radius: 6px; border: 1px solid var(--csf-border); background: var(--csf-bg-elev); color: var(--csf-fg); font-family: var(--csf-mono); font-size: 0.8rem; cursor: pointer; }
        .pr-ref-cell--fault { border-color: var(--csf-red); }
        .pr-ref-cell--active { background: var(--csf-teal-dim); border-color: var(--csf-teal); }
        .pr-grid-wrap { overflow-x: auto; }
        .pr-grid { border-collapse: collapse; font-family: var(--csf-mono); font-size: 0.75rem; width: 100%; }
        .pr-grid th, .pr-grid td { border: 1px solid var(--csf-border); padding: 0.35rem 0.5rem; text-align: center; min-width: 2rem; }
        .pr-grid th { background: var(--csf-bg-elev); color: var(--csf-fg-muted); font-weight: 500; }
        .pr-frame-label { color: var(--csf-fg-faint); font-weight: 600; }
        .pr-cell { cursor: pointer; transition: background 0.15s; }
        .pr-cell--fault { background: rgba(248, 113, 113, 0.2); color: var(--csf-red); font-weight: 600; }
        .pr-cell--active { outline: 2px solid var(--csf-teal); }
        .pr-fault-row td { color: var(--csf-fg-faint); }
        .pr-fault-yes { color: var(--csf-red); font-weight: 700; }
        .pr-step-detail { font-size: 0.85rem; padding: 0.75rem; background: var(--csf-bg-elev); border-radius: 8px; border: 1px solid var(--csf-border); }
        .pr-fault-badge { color: var(--csf-red); font-weight: 700; }
        .pr-hit-badge { color: var(--csf-green); font-weight: 600; }
      `}</style>
    </div>
  );
}
