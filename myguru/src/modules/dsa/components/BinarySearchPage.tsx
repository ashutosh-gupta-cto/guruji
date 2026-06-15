import { useCallback, useEffect, useState } from 'react';

import { StepEngine } from '../core/step-engine';
import type { Step } from '../core/types';
import { generateBinarySearchSteps, type BinarySearchData } from '../visualizers/binary-search';

function randomIntArray(size: number, max = 99): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 1);
}

function toInitial(values: number[], target: number): Step<BinarySearchData> {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    id: 0,
    description: 'Press Search to begin',
    snapshot: {
      data: {
        values: sorted,
        target,
        left: 0,
        right: sorted.length - 1,
        mid: null,
        found: false,
      },
    },
    meta: { comparisons: 0, swaps: 0, reads: 0, writes: 0 },
  };
}

export function BinarySearchPage() {
  const [values, setValues] = useState(() => randomIntArray(12));
  const [target, setTarget] = useState(() => values[Math.floor(values.length / 2)]);
  const [steps, setSteps] = useState<Step<BinarySearchData>[]>(() => [toInitial(values, target)]);
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

  const current = steps[index]?.snapshot.data;

  const runSearch = useCallback(() => {
    const next = generateBinarySearchSteps(values, target);
    setSteps(next);
    engine.loadSteps(next);
    engine.reset();
  }, [values, target, engine]);

  const randomize = () => {
    const next = randomIntArray(12);
    setValues(next);
    const t = next[Math.floor(Math.random() * next.length)];
    setTarget(t);
    const initial = [toInitial(next, t)];
    setSteps(initial);
    engine.loadSteps(initial);
    engine.reset();
  };

  const barColor = (idx: number) => {
    if (!current) return '#374151';
    if (current.found && current.mid === idx) return '#22c55e';
    if (current.mid === idx) return '#fbbf24';
    if (idx >= current.left && idx <= current.right) return '#818cf8';
    return '#374151';
  };

  return (
    <div className="viz-panel">
      <div className="viz-panel__controls">
        <label>
          Target
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="viz-input"
          />
        </label>
        <button type="button" className="btn btn--secondary" onClick={randomize}>
          Randomize
        </button>
        <button type="button" className="btn btn--primary" onClick={runSearch}>
          Search
        </button>
      </div>

      <svg viewBox="0 0 600 200" className="viz-svg" role="img" aria-label="Binary search visualization">
        {(current?.values ?? []).map((val, idx) => {
          const barW = 520 / (current?.values.length ?? 1);
          const x = 40 + idx * barW;
          const h = (val / 100) * 120 + 20;
          return (
            <g key={idx}>
              <rect x={x} y={160 - h} width={barW - 4} height={h} rx={4} fill={barColor(idx)} />
              <text x={x + barW / 2 - 2} y={175} fill="#a1a1aa" fontSize={10} textAnchor="middle">
                {val}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="viz-caption">{steps[index]?.description}</p>

      <div className="viz-panel__controls">
        <button type="button" className="btn btn--secondary" onClick={() => engine.stepBack()}>
          Prev
        </button>
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
    </div>
  );
}
