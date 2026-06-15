import { useCallback, useEffect, useState } from 'react';

import { StepEngine } from '../core/step-engine';
import type { Step } from '../core/types';
import { EDGE_STATE_COLORS, NODE_STATE_COLORS } from '../visualizers/dijkstra';
import {
  createSampleDAG,
  generateTopoSortSteps,
  scaleGraphPosition,
  type TopoSortData,
} from '../visualizers/topological-sort';

const SVG_W = 500;
const SVG_H = 340;
const NODE_R = 22;

export function TopoSortPage() {
  const [steps, setSteps] = useState<Step<TopoSortData>[]>([]);
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
    const graph = createSampleDAG();
    const next = generateTopoSortSteps(graph);
    setSteps(next);
    engine.loadSteps(next);
    engine.reset();
    setIndex(0);
  }, [engine]);

  const current = steps[index]?.snapshot.data;
  const description =
    steps[index]?.description ??
    "Run Kahn's algorithm to order DAG vertices by dependency.";

  return (
    <div className="viz-panel">
      <div className="viz-panel__controls">
        <button type="button" className="btn btn--primary" onClick={run}>
          Run topological sort
        </button>
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="viz-svg" role="img" aria-label="Topological sort">
        {current?.edges.map((edge) => {
          const src = current.nodes.find((n) => n.id === edge.source);
          const tgt = current.nodes.find((n) => n.id === edge.target);
          if (!src || !tgt) return null;
          const s = scaleGraphPosition(src.x, src.y, SVG_W, SVG_H - 40);
          const t = scaleGraphPosition(tgt.x, tgt.y, SVG_W, SVG_H - 40);
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const x1 = s.x + ux * NODE_R;
          const y1 = s.y + uy * NODE_R;
          const x2 = t.x - ux * NODE_R;
          const y2 = t.y - uy * NODE_R;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          return (
            <g key={edge.id}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={EDGE_STATE_COLORS[edge.state]} strokeWidth={2} />
              {current.directed && (
                <polygon
                  points={`${x2},${y2} ${x2 - ux * 8 - uy * 4},${y2 - uy * 8 + ux * 4} ${x2 - ux * 8 + uy * 4},${y2 - uy * 8 - ux * 4}`}
                  fill={EDGE_STATE_COLORS[edge.state]}
                />
              )}
              <circle cx={mx} cy={my} r={0} />
            </g>
          );
        })}
        {current?.nodes.map((node) => {
          const pos = scaleGraphPosition(node.x, node.y, SVG_W, SVG_H - 40);
          return (
            <g key={node.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_R}
                fill={NODE_STATE_COLORS[node.state]}
                stroke="#0a0a0f"
                strokeWidth={2}
              />
              <text x={pos.x} y={pos.y + 5} fill="#0a0a0f" fontSize={14} fontWeight={700} textAnchor="middle">
                {node.id}
              </text>
            </g>
          );
        })}
        {current && current.sortedOrder.length > 0 && (
          <text x={SVG_W - 20} y={18} fill="#10b981" fontSize={11} textAnchor="end">
            Order: {current.sortedOrder.join(' → ')}
          </text>
        )}
        {current && current.queue.length > 0 && (
          <text x={20} y={SVG_H - 12} fill="#f59e0b" fontSize={11}>
            Queue: [{current.queue.join(', ')}]
          </text>
        )}
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
