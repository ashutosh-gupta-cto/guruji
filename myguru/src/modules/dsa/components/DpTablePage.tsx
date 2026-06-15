import { useCallback, useEffect, useState } from 'react';

import { StepEngine } from '../core/step-engine';
import type { Step } from '../core/types';
import { DP_CELL_COLORS, generateFibDpSteps, type DpTableData } from '../visualizers/dp-table';

const CELL_W = 44;
const CELL_H = 44;
const GAP = 6;

export function DpTablePage() {
  const [n, setN] = useState(8);
  const [steps, setSteps] = useState<Step<DpTableData>[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [engine] = useState(() => new StepEngine());

  useEffect(() => {
    return engine.subscribe((event) => {
      if (event.type === 'step-change') setIndex(event.index);
      if (event.type === 'play') setPlaying(true);
      if (event.type === 'pause' || event.type === 'complete') setPlaying(false);
    });
  }, [engine]);

  const run = useCallback(() => {
    const next = generateFibDpSteps(n);
    setSteps(next);
    engine.loadSteps(next);
    engine.reset();
    setIndex(0);
  }, [engine, n]);

  const current = steps[index]?.snapshot.data;
  const description =
    steps[index]?.description ?? 'Fill the memo table bottom-up to compute Fibonacci numbers.';

  const cellCount = current?.cells.length ?? n + 1;
  const totalW = cellCount * (CELL_W + GAP) - GAP;
  const svgW = Math.max(600, totalW + 80);
  const svgH = 180;

  return (
    <div className="viz-panel">
      <div className="viz-panel__controls">
        <label>
          n
          <input
            type="number"
            min={2}
            max={12}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="viz-input"
          />
        </label>
        <button type="button" className="btn btn--primary" onClick={run}>
          Animate DP table
        </button>
      </div>

      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="viz-svg" role="img" aria-label="DP table">
        <text x={20} y={22} fill="#9ca3af" fontSize={12}>
          fib(i) memo table — green cells are base cases
        </text>
        {(current?.cells ?? []).map((cell, i) => {
          const x = (svgW - totalW) / 2 + i * (CELL_W + GAP);
          const y = 50;
          const isActive = current?.activeIndices.includes(cell.index);
          return (
            <g key={cell.index}>
              <rect
                x={x}
                y={y}
                width={CELL_W}
                height={CELL_H}
                rx={4}
                fill={DP_CELL_COLORS[cell.state]}
                stroke={isActive ? '#fafafa' : 'transparent'}
                strokeWidth={2}
              />
              <text x={x + CELL_W / 2} y={y + CELL_H / 2 + 4} fill="#0a0a0f" fontSize={13} fontWeight={700} textAnchor="middle">
                {cell.value ?? '·'}
              </text>
              <text x={x + CELL_W / 2} y={y + CELL_H + 14} fill="#6b7280" fontSize={10} textAnchor="middle">
                i={cell.index}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="viz-caption">{description}</p>

      {steps.length > 0 && (
        <div className="viz-panel__controls">
          <button type="button" className="btn btn--secondary" onClick={() => engine.stepBack()}>
            Prev
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Step {index + 1} / {steps.length}
          </span>
          <button type="button" className="btn btn--secondary" onClick={() => engine.stepForward()}>
            Next
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => (playing ? engine.pause() : engine.play())}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
        </div>
      )}
    </div>
  );
}
