import { useCallback, useEffect, useState } from 'react';

import { StepEngine } from '../core/step-engine';
import type { Step } from '../core/types';
import {
  BST_STATE_COLORS,
  bstToSnapshotNode,
  collectRenderEdges,
  collectRenderNodes,
  createSampleBST,
  generateInsertSteps,
  generateSearchSteps,
  insertIntoBST,
  snapshotToRenderTree,
  type BSTNode,
  type BstData,
} from '../visualizers/bst';

const SVG_W = 600;
const SVG_H = 340;
const NODE_R = 22;

function toInitial(root: BSTNode | null): Step<BstData> {
  return {
    id: 0,
    description: 'BST ready — insert or search a value',
    snapshot: { data: { root: bstToSnapshotNode(root) } },
    meta: { comparisons: 0, swaps: 0, reads: 0, writes: 0 },
  };
}

export function BstVisualizerPage() {
  const [tree, setTree] = useState<BSTNode | null>(() => createSampleBST());
  const [value, setValue] = useState(55);
  const [steps, setSteps] = useState<Step<BstData>[]>(() => [toInitial(createSampleBST())]);
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
  const renderRoot = snapshotToRenderTree(current?.root ?? null, SVG_W);
  const nodes = collectRenderNodes(renderRoot);
  const edges = collectRenderEdges(renderRoot);

  const runSteps = useCallback(
    (next: Step<BstData>[], updateTree?: BSTNode | null) => {
      if (updateTree !== undefined) setTree(updateTree);
      setSteps(next);
      engine.loadSteps(next);
      engine.reset();
    },
    [engine]
  );

  const handleInsert = () => {
    const next = generateInsertSteps(tree, value);
    runSteps(next, insertIntoBST(tree, value));
  };

  const handleSearch = () => {
    runSteps(generateSearchSteps(tree, value));
  };

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
          Insert
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleSearch}>
          Search
        </button>
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="viz-svg" role="img" aria-label="BST visualization">
        {!current?.root && (
          <text x={SVG_W / 2} y={SVG_H / 2} fill="#94a3b8" fontSize={14} textAnchor="middle">
            Empty tree
          </text>
        )}
        {edges.map((edge, i) => (
          <line
            key={i}
            x1={edge.x1}
            y1={edge.y1 + NODE_R}
            x2={edge.x2}
            y2={edge.y2 - NODE_R}
            stroke="#64748b"
            strokeWidth={2}
          />
        ))}
        {nodes.map((node) => (
          <g key={node.value + node.x}>
            <circle
              cx={node.x}
              cy={node.y}
              r={NODE_R}
              fill={BST_STATE_COLORS[node.state]}
              stroke="#1e293b"
              strokeWidth={2}
            />
            <text x={node.x} y={node.y + 5} fill="#1e293b" fontSize={13} fontWeight={700} textAnchor="middle">
              {node.value}
            </text>
          </g>
        ))}
        {current?.message && (
          <text
            x={SVG_W / 2}
            y={SVG_H - 16}
            fill={current.message === 'Found!' ? '#4ade80' : '#f87171'}
            fontSize={16}
            fontWeight={700}
            textAnchor="middle"
          >
            {current.message}
          </text>
        )}
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
