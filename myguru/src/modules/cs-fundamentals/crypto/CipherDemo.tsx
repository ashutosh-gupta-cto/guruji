/**
 * Simplified AES step-through demo.
 * Inspired by powergr/cipherflow-visualizer.
 */

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { runAesDemo, stateToHex } from './aes-demo';

const PRESETS = ['HELLO WORLD!!!', 'CS FUNDA AES', 'MYGURU ROCKS!'];

export default function CipherDemo() {
  const [plaintext, setPlaintext] = useState(PRESETS[0]);
  const [stepIdx, setStepIdx] = useState(0);

  const steps = useMemo(() => runAesDemo(plaintext.slice(0, 16)), [plaintext]);
  const step = steps[stepIdx] ?? steps[0];

  return (
    <div className="crypto-root">
      <div className="csf-toolbar">
        <Lock size={14} />
        <input
          className="csf-input"
          value={plaintext}
          maxLength={16}
          onChange={(e) => {
            setPlaintext(e.target.value);
            setStepIdx(0);
          }}
          placeholder="Up to 16 chars"
          style={{ maxWidth: '14rem' }}
        />
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className="csf-btn"
            onClick={() => {
              setPlaintext(p);
              setStepIdx(0);
            }}
          >
            {p.slice(0, 8)}…
          </button>
        ))}
      </div>

      <div className="crypto-phase">
        <span className="crypto-badge">{step.phase}</span>
        <p className="crypto-msg">{step.message}</p>
      </div>

      <div className="crypto-state-grid">
        {step.state.map((row, ri) => (
          <div key={ri} className="crypto-row">
            {row.map((cell, ci) => (
              <div key={ci} className="crypto-cell">
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="crypto-hex csf-mono">{stateToHex(step.state)}</p>

      <div className="crypto-stepper">
        <button
          type="button"
          className="csf-btn"
          disabled={stepIdx <= 0}
          onClick={() => setStepIdx((i) => i - 1)}
        >
          <ChevronLeft size={14} />
        </button>
        <span className="crypto-step-label">
          Step {stepIdx + 1}/{steps.length}
        </span>
        <button
          type="button"
          className="csf-btn"
          disabled={stepIdx >= steps.length - 1}
          onClick={() => setStepIdx((i) => i + 1)}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <style>{`
        .crypto-root { display: flex; flex-direction: column; gap: 0.75rem; }
        .crypto-phase { display: flex; flex-direction: column; gap: 0.35rem; }
        .crypto-badge { display: inline-block; width: fit-content; padding: 0.2rem 0.5rem; border-radius: 4px; background: var(--csf-cyan-dim); color: var(--csf-cyan); font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
        .crypto-msg { font-size: 0.85rem; color: var(--csf-fg-muted); margin: 0; }
        .crypto-state-grid { display: inline-flex; flex-direction: column; gap: 4px; padding: 0.75rem; background: var(--csf-bg-elev); border: 1px solid var(--csf-border); border-radius: 8px; width: fit-content; }
        .crypto-row { display: flex; gap: 4px; }
        .crypto-cell { width: 2.25rem; height: 2.25rem; display: flex; align-items: center; justify-content: center; background: var(--csf-bg-card); border: 1px solid var(--csf-border-strong); border-radius: 4px; font-family: var(--csf-mono); font-size: 0.7rem; color: var(--csf-teal); }
        .crypto-hex { font-size: 0.75rem; color: var(--csf-fg-faint); margin: 0; }
        .crypto-stepper { display: flex; align-items: center; gap: 0.5rem; }
        .crypto-step-label { font-size: 0.8rem; color: var(--csf-fg-muted); }
      `}</style>
    </div>
  );
}
