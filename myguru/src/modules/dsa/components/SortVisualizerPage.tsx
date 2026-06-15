/**
 * Full-page sorting visualizer with algorithm selector.
 *
 * Step generators ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import { ArrayVisualizer } from './ArrayVisualizer';
import type { SortAlgorithm, SortingData, Step } from '../core/types';
import { generateBubbleSortSteps, bubbleSortConfig } from '../visualizers/bubble-sort';
import { generateMergeSortSteps, mergeSortConfig } from '../visualizers/merge-sort';
import { generateQuickSortSteps, quickSortConfig } from '../visualizers/quick-sort';
import { generateRandomArray } from '../visualizers/sorting-shared';

const ALGORITHMS: SortAlgorithm[] = [
  {
    ...bubbleSortConfig,
    generateSteps: generateBubbleSortSteps,
  },
  {
    ...mergeSortConfig,
    generateSteps: generateMergeSortSteps,
  },
  {
    ...quickSortConfig,
    generateSteps: generateQuickSortSteps,
  },
];

function toInitialStep(data: SortingData): Step<SortingData> {
  return {
    id: 0,
    description: 'Initial array — press Sort to begin',
    snapshot: { data },
    meta: { comparisons: 0, swaps: 0, reads: 0, writes: 0 },
  };
}

const panelStyle: CSSProperties = {
  maxWidth: '760px',
  margin: '0 auto',
  padding: '1.5rem',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: '#fafafa',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  color: '#a1a1aa',
  marginBottom: '0.35rem',
};

const selectStyle: CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.65rem',
  borderRadius: '6px',
  border: '1px solid #3f3f46',
  background: '#18181b',
  color: '#fafafa',
  fontSize: '0.9rem',
};

const toolbarStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
  alignItems: 'flex-end',
  marginBottom: '1rem',
};

const actionButtonStyle: CSSProperties = {
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  border: '1px solid #3f3f46',
  background: '#27272a',
  color: '#fafafa',
  cursor: 'pointer',
  fontSize: '0.875rem',
};

const primaryActionStyle: CSSProperties = {
  ...actionButtonStyle,
  background: '#2563eb',
  borderColor: '#2563eb',
};

export interface SortVisualizerPageProps {
  defaultAlgorithmId?: string;
  defaultArraySize?: number;
}

export function SortVisualizerPage({
  defaultAlgorithmId = 'bubble-sort',
  defaultArraySize = 15,
}: SortVisualizerPageProps) {
  const [algorithmId, setAlgorithmId] = useState(defaultAlgorithmId);
  const [arraySize, setArraySize] = useState(defaultArraySize);
  const [speed, setSpeed] = useState(300);
  const [{ arrayData, steps }, setVisualizerState] = useState(() => {
    const data = generateRandomArray(defaultArraySize);
    return { arrayData: data, steps: [toInitialStep(data)] as Step<SortingData>[] };
  });

  const setArrayData = useCallback((data: SortingData) => {
    setVisualizerState((prev) => ({ ...prev, arrayData: data }));
  }, []);

  const setSteps = useCallback((nextSteps: Step<SortingData>[]) => {
    setVisualizerState((prev) => ({ ...prev, steps: nextSteps }));
  }, []);

  const algorithm = useMemo(
    () => ALGORITHMS.find((a) => a.id === algorithmId) ?? ALGORITHMS[0],
    [algorithmId]
  );

  const handleRandomize = useCallback(() => {
    const data = generateRandomArray(arraySize);
    setArrayData(data);
    setSteps([toInitialStep(data)]);
  }, [arraySize]);

  const handleSort = useCallback(() => {
    const values = arrayData.elements.map((e) => e.value);
    setSteps(algorithm.generateSteps(values));
  }, [algorithm, arrayData]);

  const handleAlgorithmChange = useCallback(
    (nextId: string) => {
      setAlgorithmId(nextId);
      const nextAlgo = ALGORITHMS.find((a) => a.id === nextId) ?? ALGORITHMS[0];
      setSpeed(nextAlgo.defaultSpeed);
      setSteps([toInitialStep(arrayData)]);
    },
    [arrayData]
  );

  const handleSizeChange = useCallback((size: number) => {
    setArraySize(size);
    const data = generateRandomArray(size);
    setArrayData(data);
    setSteps([toInitialStep(data)]);
  }, []);

  return (
    <main style={panelStyle}>
      <header style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.5rem', fontWeight: 600 }}>
          Sorting Visualizer
        </h1>
        <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.95rem' }}>
          Step through classic sorting algorithms bar-by-bar.
        </p>
      </header>

      <div style={toolbarStyle}>
        <div style={{ flex: '1 1 200px' }}>
          <label htmlFor="algo-select" style={labelStyle}>
            Algorithm
          </label>
          <select
            id="algo-select"
            value={algorithmId}
            onChange={(e) => handleAlgorithmChange(e.target.value)}
            style={selectStyle}
          >
            {ALGORITHMS.map((algo) => (
              <option key={algo.id} value={algo.id}>
                {algo.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 160px' }}>
          <label htmlFor="array-size" style={labelStyle}>
            Array size ({arraySize})
          </label>
          <input
            id="array-size"
            type="range"
            min={5}
            max={40}
            step={1}
            value={arraySize}
            onChange={(e) => handleSizeChange(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ flex: '1 1 160px' }}>
          <label htmlFor="speed" style={labelStyle}>
            Speed ({speed} ms/step)
          </label>
          <input
            id="speed"
            type="range"
            min={50}
            max={1500}
            step={50}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <p style={{ color: '#71717a', fontSize: '0.85rem', margin: '0 0 1rem' }}>
        {algorithm.description} · Time: {algorithm.complexity.time.average} · Space:{' '}
        {algorithm.complexity.space}
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button type="button" style={actionButtonStyle} onClick={handleRandomize}>
          Randomize
        </button>
        <button type="button" style={primaryActionStyle} onClick={handleSort}>
          Sort
        </button>
      </div>

      <ArrayVisualizer steps={steps} speed={speed} />
    </main>
  );
}

export { ALGORITHMS };
