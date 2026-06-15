/**
 * Network routing visualizer — Dijkstra step-through.
 * Ported from G-Amar/Network-Routing-Visualized.
 */

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Route } from 'lucide-react';
import { DEMO_GRAPH, dijkstraSteps } from './routing';

export default function RoutingViz() {
  const [source, setSource] = useState('A');
  const [dest, setDest] = useState('E');
  const [stepIdx, setStepIdx] = useState(0);

  const { steps, path } = useMemo(
    () => dijkstraSteps(DEMO_GRAPH, source, dest),
    [source, dest],
  );
  const step = steps[stepIdx] ?? steps[0];
  const pathSet = new Set(path);

  return (
    <div className="route-root">
      <div className="csf-toolbar">
        <Route size={14} />
        <span className="csf-label" style={{ margin: 0 }}>
          Source
        </span>
        {DEMO_GRAPH.nodes.map((n) => (
          <button
            key={`s-${n.id}`}
            type="button"
            className={`csf-btn${source === n.id ? ' csf-btn--primary' : ''}`}
            onClick={() => {
              setSource(n.id);
              setStepIdx(0);
            }}
          >
            {n.id}
          </button>
        ))}
        <span className="csf-label" style={{ margin: 0 }}>
          Dest
        </span>
        {DEMO_GRAPH.nodes.map((n) => (
          <button
            key={`d-${n.id}`}
            type="button"
            className={`csf-btn${dest === n.id ? ' csf-btn--primary' : ''}`}
            onClick={() => {
              setDest(n.id);
              setStepIdx(0);
            }}
          >
            {n.id}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 480 240" className="route-svg" role="img" aria-label="Routing graph">
        {DEMO_GRAPH.edges.map((e) => {
          const s = DEMO_GRAPH.nodes.find((n) => n.id === e.source)!;
          const t = DEMO_GRAPH.nodes.find((n) => n.id === e.target)!;
          const onPath =
            path.length > 1 &&
            path.some((id, i) => i < path.length - 1 && ((id === e.source && path[i + 1] === e.target) || (id === e.target && path[i + 1] === e.source)));
          const relaxed = step.relaxedEdge === e.id;
          return (
            <g key={e.id}>
              <line
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                className={`route-edge${onPath ? ' route-edge--path' : ''}${relaxed ? ' route-edge--relax' : ''}`}
              />
              <text x={(s.x + t.x) / 2} y={(s.y + t.y) / 2 - 6} className="route-weight">
                {e.weight}
              </text>
            </g>
          );
        })}
        {DEMO_GRAPH.nodes.map((n) => {
          const visited = step.visited.includes(n.id);
          const current = step.current === n.id;
          const dist = step.distances[n.id]?.cost;
          return (
            <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
              <circle
                r={22}
                className={`route-node${visited ? ' route-node--visited' : ''}${current ? ' route-node--current' : ''}${pathSet.has(n.id) ? ' route-node--path' : ''}`}
              />
              <text className="route-label" y={4}>
                {n.id}
              </text>
              <text className="route-dist" y={38}>
                {dist === Infinity ? '∞' : dist}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="route-msg">{step.message}</p>

      <div className="route-stepper">
        <button
          type="button"
          className="csf-btn"
          disabled={stepIdx <= 0}
          onClick={() => setStepIdx((i) => i - 1)}
        >
          <ChevronLeft size={14} />
        </button>
        <span>
          Step {stepIdx + 1}/{steps.length}
        </span>
        <button
          type="button"
          className="csf-btn"
          disabled={stepIdx >= steps.length - 1}
          onClick={() => setStepIdx((i) => i + 1)}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <style>{`
        .route-root { display: flex; flex-direction: column; gap: 0.75rem; }
        .route-svg { width: 100%; background: var(--csf-bg-elev); border: 1px solid var(--csf-border); border-radius: 10px; }
        .route-edge { stroke: var(--csf-border-strong); stroke-width: 2; }
        .route-edge--relax { stroke: var(--csf-amber); stroke-width: 3; }
        .route-edge--path { stroke: var(--csf-green); stroke-width: 3; }
        .route-weight { text-anchor: middle; font-size: 10px; fill: var(--csf-fg-muted); font-family: var(--csf-mono); }
        .route-node { fill: var(--csf-bg-card); stroke: var(--csf-purple); stroke-width: 2; }
        .route-node--visited { fill: var(--csf-purple-dim); }
        .route-node--current { fill: var(--csf-teal); stroke: var(--csf-teal); }
        .route-node--path { stroke: var(--csf-green); }
        .route-label { text-anchor: middle; font-family: var(--csf-mono); font-size: 12px; fill: var(--csf-fg); font-weight: 700; }
        .route-dist { text-anchor: middle; font-size: 9px; fill: var(--csf-fg-faint); font-family: var(--csf-mono); }
        .route-msg { font-size: 0.85rem; color: var(--csf-fg-muted); margin: 0; }
        .route-stepper { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--csf-fg-muted); }
      `}</style>
    </div>
  );
}
