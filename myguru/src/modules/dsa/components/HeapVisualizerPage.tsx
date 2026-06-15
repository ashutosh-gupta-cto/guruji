import { useCallback, useEffect, useState } from 'react';

import { StepEngine } from '../core/step-engine';
import type { Step } from '../core/types';
import {
  calculateTreeLayout,
  createInitialHeap,
  generatePopSteps,
  generatePushSteps,
  getLeftChildIndex,
  getRightChildIndex,
  HEAP_STATE_COLORS,
  type HeapData,
  type HeapElement,
  type HeapType,
} from '../visualizers/heap';

const SVG_W = 600;
const SVG_H = 320;
const ARRAY_Y = 250;

function toInitial(elements: HeapElement[], heapType: HeapType): Step<HeapData> {
  return {
    id: 0,
    description: `${heapType === 'max' ? 'Max' : 'Min'}-heap ready — push or pop to begin`,
    snapshot: { data: { elements, heapType } },
    meta: { comparisons: 0, swaps: 0, reads: 0, writes: 0 },
  };
}

export function HeapVisualizerPage() {
  const [heapType, setHeapType] = useState<HeapType>('max');
  const [elements, setElements] = useState<HeapElement[]>(() => createInitialHeap());
  const [pushValue, setPushValue] = useState(45);
  const [steps, setSteps] = useState<Step<HeapData>[]>(() => [
    toInitial(createInitialHeap(), 'max'),
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

  const current = steps[index]?.snapshot.data;
  const treeNodes = calculateTreeLayout(current?.elements ?? [], SVG_W, ARRAY_Y - 20);

  const runSteps = useCallback(
    (next: Step<HeapData>[]) => {
      const final = next[next.length - 1]?.snapshot.data;
      if (final) setElements(final.elements.map((e) => ({ ...e, state: 'default' })));
      setSteps(next);
      engine.loadSteps(next);
      engine.reset();
    },
    [engine]
  );

  const handlePush = () => {
    runSteps(generatePushSteps(elements, pushValue, heapType));
  };

  const handlePop = () => {
    runSteps(generatePopSteps(elements, heapType));
  };

  const toggleType = () => {
    const nextType: HeapType = heapType === 'max' ? 'min' : 'max';
    setHeapType(nextType);
    const reset = toInitial(elements, nextType);
    setSteps([reset]);
    engine.loadSteps([reset]);
    engine.reset();
  };

  return (
    <div className="viz-panel">
      <div className="viz-panel__controls">
        <label>
          Value
          <input
            type="number"
            value={pushValue}
            onChange={(e) => setPushValue(Number(e.target.value))}
            className="viz-input"
          />
        </label>
        <button type="button" className="btn btn--primary" onClick={handlePush}>
          Push
        </button>
        <button type="button" className="btn btn--secondary" onClick={handlePop}>
          Pop
        </button>
        <button type="button" className="btn btn--secondary" onClick={toggleType}>
          Toggle {heapType === 'max' ? 'Min' : 'Max'}
        </button>
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="viz-svg" role="img" aria-label="Heap visualization">
        <text x={20} y={18} fill="#9ca3af" fontSize={12}>
          {heapType === 'max' ? 'Max' : 'Min'}-Heap
        </text>

        {treeNodes.map((node, i) => {
          const leftIdx = getLeftChildIndex(i);
          const rightIdx = getRightChildIndex(i);
          const edges: { x2: number; y2: number }[] = [];
          if (leftIdx < treeNodes.length) edges.push({ x2: treeNodes[leftIdx].x, y2: treeNodes[leftIdx].y });
          if (rightIdx < treeNodes.length) edges.push({ x2: treeNodes[rightIdx].x, y2: treeNodes[rightIdx].y });
          return edges.map((edge, ei) => (
            <line
              key={`${i}-${ei}`}
              x1={node.x}
              y1={node.y + 22}
              x2={edge.x2}
              y2={edge.y2 - 22}
              stroke="#4b5563"
              strokeWidth={2}
            />
          ));
        })}

        {treeNodes.map((node) => (
          <g key={node.index}>
            <circle cx={node.x} cy={node.y} r={22} fill={HEAP_STATE_COLORS[node.state]} stroke="#0a0a0f" strokeWidth={2} />
            <text x={node.x} y={node.y + 5} fill="#0a0a0f" fontSize={13} fontWeight={700} textAnchor="middle">
              {node.value}
            </text>
            <text x={node.x} y={node.y + 38} fill="#6b7280" fontSize={9} textAnchor="middle">
              {node.index}
            </text>
          </g>
        ))}

        <text x={20} y={ARRAY_Y - 8} fill="#9ca3af" fontSize={11}>
          Array representation
        </text>
        {(current?.elements ?? []).map((el, i) => {
          const barW = Math.min(50, (SVG_W - 40) / Math.max(current?.elements.length ?? 1, 1) - 4);
          const totalW = (current?.elements.length ?? 0) * (barW + 4) - 4;
          const startX = (SVG_W - totalW) / 2;
          const x = startX + i * (barW + 4);
          return (
            <g key={i}>
              <rect x={x} y={ARRAY_Y} width={barW} height={36} rx={4} fill={HEAP_STATE_COLORS[el.state]} />
              <text x={x + barW / 2} y={ARRAY_Y + 20} fill="#0a0a0f" fontSize={11} fontWeight={700} textAnchor="middle">
                {el.value}
              </text>
              <text x={x + barW / 2} y={ARRAY_Y + 52} fill="#6b7280" fontSize={9} textAnchor="middle">
                {i}
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
