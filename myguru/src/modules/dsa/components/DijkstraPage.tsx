import { useCallback, useEffect, useState } from 'react';

import { StepEngine } from '../core/step-engine';
import type { Step } from '../core/types';
import {
  createSampleDijkstraGraph,
  generateDijkstraSteps,
  EDGE_STATE_COLORS,
  NODE_STATE_COLORS,
  type DijkstraData,
  type GraphEdge,
  type GraphNode,
} from '../visualizers/dijkstra';
import { scaleGraphPosition } from '../visualizers/graph-shared';

const SVG_W = 500;
const SVG_H = 360;
const NODE_R = 22;

export function DijkstraPage() {
  const [steps, setSteps] = useState<Step<DijkstraData>[]>([]);
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
    const graph = createSampleDijkstraGraph();
    const next = generateDijkstraSteps(graph, 'A');
    setSteps(next);
    engine.loadSteps(next);
    engine.reset();
    setIndex(0);
  }, [engine]);

  const current = steps[index]?.snapshot.data;
  const description =
    steps[index]?.description ??
    "Run Dijkstra's algorithm to find single-source shortest paths.";

  const distStr =
    current &&
    Array.from(current.distances.entries())
      .map(([id, d]) => `${id}:${d >= 999999 ? '∞' : d}`)
      .join('  ');

  return (
    <div className="viz-panel">
      <div className="viz-panel__controls">
        <button type="button" className="btn btn--primary" onClick={run}>
          Run Dijkstra
        </button>
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="viz-svg" role="img" aria-label="Dijkstra shortest paths">
        {current?.edges.map((edge: GraphEdge) => {
          const src = current.nodes.find((n: GraphNode) => n.id === edge.source);
          const tgt = current.nodes.find((n: GraphNode) => n.id === edge.target);
          if (!src || !tgt) return null;
          const s = scaleGraphPosition(src.x, src.y, SVG_W, SVG_H - 50);
          const t = scaleGraphPosition(tgt.x, tgt.y, SVG_W, SVG_H - 50);
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
              <circle cx={mx} cy={my} r={12} fill="#1f2937" />
              <text x={mx} y={my + 4} fill="#9ca3af" fontSize={10} fontWeight={700} textAnchor="middle">
                {edge.weight}
              </text>
            </g>
          );
        })}
        {current?.nodes.map((node: GraphNode) => {
          const pos = scaleGraphPosition(node.x, node.y, SVG_W, SVG_H - 50);
          const dist = current.distances.get(node.id);
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
              {dist !== undefined && (
                <text x={pos.x} y={pos.y + NODE_R + 14} fill="#6b7280" fontSize={10} textAnchor="middle">
                  d={dist >= 999999 ? '∞' : dist}
                </text>
              )}
            </g>
          );
        })}
        {distStr && (
          <text x={20} y={18} fill="#9ca3af" fontSize={11}>
            Distances: {distStr}
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
