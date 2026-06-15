import { useCallback, useState } from 'react';

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

export function GraphVisualizerPage() {
  const [steps, setSteps] = useState<Step<DijkstraData>[]>([]);
  const [index, setIndex] = useState(0);
  const [engine] = useState(() => new StepEngine());

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
    'Run Dijkstra to explore shortest paths — nodes expand in frontier order like BFS.';

  return (
    <div className="viz-panel">
      <div className="viz-panel__controls">
        <button type="button" className="btn btn--primary" onClick={run}>
          Run graph traversal
        </button>
      </div>

      <svg viewBox="0 0 500 320" className="viz-svg" role="img" aria-label="Graph traversal">
        {current?.edges.map((edge: GraphEdge) => {
          const src = current.nodes.find((n: GraphNode) => n.id === edge.source);
          const tgt = current.nodes.find((n: GraphNode) => n.id === edge.target);
          if (!src || !tgt) return null;
          return (
            <line
              key={edge.id}
              x1={src.x}
              y1={src.y}
              x2={tgt.x}
              y2={tgt.y}
              stroke={EDGE_STATE_COLORS[edge.state]}
              strokeWidth={2}
            />
          );
        })}
        {current?.nodes.map((node: GraphNode) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={22}
              fill={NODE_STATE_COLORS[node.state]}
              stroke="#0a0a0f"
              strokeWidth={2}
            />
            <text
              x={node.x}
              y={node.y + 5}
              fill="#0a0a0f"
              fontSize={14}
              fontWeight={700}
              textAnchor="middle"
            >
              {node.id}
            </text>
          </g>
        ))}
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
        </div>
      )}
    </div>
  );
}
