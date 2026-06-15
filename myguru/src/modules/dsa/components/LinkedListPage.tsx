import { useCallback, useEffect, useState } from 'react';

import { StepEngine } from '../core/step-engine';
import type { Step } from '../core/types';
import {
  generateDeleteByValueSteps,
  generateInsertAtTailSteps,
  LINKED_LIST_STATE_COLORS,
  type LinkedListData,
  type LinkedListNode,
} from '../visualizers/linked-list';

const NODE_R = 25;
const NODE_GAP = 80;
const SVG_W = 600;
const SVG_H = 200;

function toInitial(): Step<LinkedListData> {
  return {
    id: 0,
    description: 'Linked list ready — insert at tail or delete by value',
    snapshot: { data: { nodes: [] } },
    meta: { comparisons: 0, swaps: 0, reads: 0, writes: 0 },
  };
}

export function LinkedListPage() {
  const [nodes, setNodes] = useState<LinkedListNode[]>([]);
  const [value, setValue] = useState(42);
  const [steps, setSteps] = useState<Step<LinkedListData>[]>([toInitial()]);
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

  const runSteps = useCallback(
    (next: Step<LinkedListData>[]) => {
      const final = next[next.length - 1]?.snapshot.data;
      if (final) setNodes(final.nodes.map((n) => ({ ...n, state: 'default' })));
      setSteps(next);
      engine.loadSteps(next);
      engine.reset();
    },
    [engine]
  );

  const handleInsert = () => runSteps(generateInsertAtTailSteps(nodes, value));
  const handleDelete = () => runSteps(generateDeleteByValueSteps(nodes, value));
  const handleClear = () => {
    setNodes([]);
    runSteps([toInitial()]);
  };

  const current = steps[index]?.snapshot.data;
  const startX = 100;

  return (
    <div className="viz-panel">
      <div className="viz-panel__controls">
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
          Insert at Tail
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleDelete}>
          Delete by Value
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleClear}>
          Clear
        </button>
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="viz-svg" role="img" aria-label="Linked list visualization">
        <text x={20} y={20} fill="#9ca3af" fontSize={12}>
          Singly Linked List — length {current?.nodes.length ?? 0}
        </text>
        <text x={startX - 50} y={100} fill="#71717a" fontSize={11} textAnchor="middle">
          HEAD
        </text>
        {(current?.nodes.length ?? 0) === 0 ? (
          <text x={startX} y={104} fill="#71717a" fontSize={12}>
            null
          </text>
        ) : (
          <>
            <line x1={startX - 30} y1={100} x2={startX - NODE_R - 5} y2={100} stroke="#71717a" strokeWidth={2} />
            <polygon points={`${startX - NODE_R - 5},100 ${startX - NODE_R - 12},95 ${startX - NODE_R - 12},105`} fill="#71717a" />
          </>
        )}
        {(current?.nodes ?? []).map((node, i) => {
          const x = startX + i * (NODE_R * 2 + NODE_GAP);
          return (
            <g key={node.id}>
              <circle cx={x} cy={100} r={NODE_R} fill={LINKED_LIST_STATE_COLORS[node.state]} stroke="#0a0a0f" strokeWidth={2} />
              <text x={x} y={105} fill="#0f0f0f" fontSize={14} fontWeight={700} textAnchor="middle">
                {node.value}
              </text>
              <text x={x} y={138} fill="#71717a" fontSize={10} textAnchor="middle">
                [{i}]
              </text>
              {i < (current?.nodes.length ?? 0) - 1 ? (
                <>
                  <line
                    x1={x + NODE_R + 5}
                    y1={100}
                    x2={x + NODE_R * 2 + NODE_GAP - NODE_R - 5}
                    y2={100}
                    stroke="#71717a"
                    strokeWidth={2}
                  />
                  <polygon
                    points={`${x + NODE_R * 2 + NODE_GAP - NODE_R - 5},100 ${x + NODE_R * 2 + NODE_GAP - NODE_R - 12},95 ${x + NODE_R * 2 + NODE_GAP - NODE_R - 12},105`}
                    fill="#71717a"
                  />
                </>
              ) : (
                <text x={x + NODE_R + 20} y={104} fill="#71717a" fontSize={11}>
                  → null
                </text>
              )}
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
