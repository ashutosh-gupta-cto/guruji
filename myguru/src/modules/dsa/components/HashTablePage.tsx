import { useCallback, useEffect, useState } from 'react';

import { StepEngine } from '../core/step-engine';
import type { Step } from '../core/types';
import {
  createInitialHashTable,
  generateInsertSteps,
  generateLookupSteps,
  HASH_BUCKET_COLORS,
  HASH_ENTRY_COLORS,
  type HashTableData,
} from '../visualizers/hash-table';

const BUCKET_W = 56;
const BUCKET_H = 36;
const ENTRY_H = 28;
const GAP = 4;

export function HashTablePage() {
  const initial = createInitialHashTable();
  const [table, setTable] = useState(initial);
  const [key, setKey] = useState('grape');
  const [value, setValue] = useState(12);
  const [steps, setSteps] = useState<Step<HashTableData>[]>([
    {
      id: 0,
      description: 'Hash table ready — insert or lookup a key',
      snapshot: { data: initial },
      meta: { comparisons: 0, swaps: 0, reads: 0, writes: 0 },
    },
  ]);
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

  const current = steps[index]?.snapshot.data ?? table;
  const capacity = current.capacity;
  const bucketSpacing = Math.min(BUCKET_W + 8, (560 - 40) / capacity);
  const startX = (600 - bucketSpacing * capacity) / 2;

  const runSteps = useCallback(
    (next: Step<HashTableData>[]) => {
      const final = next[next.length - 1]?.snapshot.data;
      if (final) setTable(final);
      setSteps(next);
      engine.loadSteps(next);
      engine.reset();
    },
    [engine]
  );

  const handleInsert = () => {
    runSteps(generateInsertSteps(table.buckets, key, value, table.size, table.capacity));
  };

  const handleLookup = () => {
    runSteps(generateLookupSteps(table.buckets, key, table.size, table.capacity));
  };

  return (
    <div className="viz-panel">
      <div className="viz-panel__controls">
        <label>
          Key
          <input type="text" value={key} onChange={(e) => setKey(e.target.value)} className="viz-input" />
        </label>
        <label>
          Value
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="viz-input"
          />
        </label>
        <button type="button" className="btn btn--primary" onClick={handleInsert}>
          Insert
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleLookup}>
          Lookup
        </button>
      </div>

      <svg viewBox="0 0 600 320" className="viz-svg" role="img" aria-label="Hash table visualization">
        <text x={20} y={18} fill="#9ca3af" fontSize={12}>
          Hash Table (Chaining) — size {current.size}/{current.capacity}, load {(current.loadFactor * 100).toFixed(0)}%
        </text>

        {current.buckets.map((bucket, i) => {
          const x = startX + i * bucketSpacing;
          const chainStartY = 70 + BUCKET_H + GAP;
          return (
            <g key={i}>
              <rect
                x={x}
                y={70}
                width={BUCKET_W}
                height={BUCKET_H}
                rx={4}
                fill={HASH_BUCKET_COLORS[bucket.state]}
              />
              <text x={x + BUCKET_W / 2} y={70 + BUCKET_H / 2 + 4} fill="#fff" fontSize={11} fontWeight={700} textAnchor="middle">
                {i}
              </text>
              {bucket.entries.length > 0 && (
                <line
                  x1={x + BUCKET_W / 2}
                  y1={70 + BUCKET_H}
                  x2={x + BUCKET_W / 2}
                  y2={chainStartY}
                  stroke="#4b5563"
                  strokeWidth={1}
                />
              )}
              {bucket.entries.slice(0, 4).map((entry, j) => {
                const ey = chainStartY + j * (ENTRY_H + GAP);
                const displayKey = entry.key.length > 5 ? `${entry.key.slice(0, 4)}…` : entry.key;
                return (
                  <g key={j}>
                    <rect
                      x={x}
                      y={ey}
                      width={BUCKET_W}
                      height={ENTRY_H}
                      rx={3}
                      fill={HASH_ENTRY_COLORS[entry.state]}
                    />
                    <text x={x + BUCKET_W / 2} y={ey + 11} fill="#0a0a0f" fontSize={9} textAnchor="middle">
                      {displayKey}
                    </text>
                    <text x={x + BUCKET_W / 2} y={ey + 22} fill="#0a0a0f" fontSize={9} textAnchor="middle">
                      {entry.value}
                    </text>
                  </g>
                );
              })}
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
