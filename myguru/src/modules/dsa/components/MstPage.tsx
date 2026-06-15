import { useCallback, useEffect, useState } from 'react';

import { StepEngine } from '../core/step-engine';
import type { Step } from '../core/types';
import {
  createSampleMSTGraph,
  EDGE_STATE_COLORS,
  NODE_STATE_COLORS,
  scaleGraphPosition,
  type GraphEdge,
  type GraphNode,
} from '../visualizers/graph-shared';
import { generateKruskalSteps, type KruskalData } from '../visualizers/kruskal';
import { generatePrimSteps, type PrimData } from '../visualizers/prim';

const SVG_W = 500;
const SVG_H = 360;
const NODE_R = 22;

type Tab = 'prim' | 'kruskal';

export function MstPage() {
  const [tab, setTab] = useState<Tab>('prim');
  const [primSteps, setPrimSteps] = useState<Step<PrimData>[]>([]);
  const [kruskalSteps, setKruskalSteps] = useState<Step<KruskalData>[]>([]);
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

  const runPrim = useCallback(() => {
    const graph = createSampleMSTGraph();
    const next = generatePrimSteps(graph, 'A');
    setPrimSteps(next);
    setTab('prim');
    engine.loadSteps(next);
    engine.reset();
    setIndex(0);
  }, [engine]);

  const runKruskal = useCallback(() => {
    const graph = createSampleMSTGraph();
    const next = generateKruskalSteps(graph);
    setKruskalSteps(next);
    setTab('kruskal');
    engine.loadSteps(next);
    engine.reset();
    setIndex(0);
  }, [engine]);

  const switchTab = (next: Tab) => {
    setTab(next);
    setIndex(0);
    engine.loadSteps(next === 'prim' ? primSteps : kruskalSteps);
    engine.reset();
  };

  const current =
    tab === 'prim' ? primSteps[index]?.snapshot.data : kruskalSteps[index]?.snapshot.data;
  const description =
    tab === 'prim' ? primSteps[index]?.description : kruskalSteps[index]?.description;
  const mstWeight = current && 'mstWeight' in current ? current.mstWeight : 0;
  const mstEdges = current && 'mstEdges' in current ? current.mstEdges.length : 0;
  const nodeCount = current?.nodes.length ?? 0;

  return (
    <div className="viz-panel">
      <div className="viz-panel__controls">
        <button
          type="button"
          className={tab === 'prim' ? 'btn btn--primary' : 'btn btn--secondary'}
          onClick={() => primSteps.length > 0 && switchTab('prim')}
        >
          Prim
        </button>
        <button
          type="button"
          className={tab === 'kruskal' ? 'btn btn--primary' : 'btn btn--secondary'}
          onClick={() => kruskalSteps.length > 0 && switchTab('kruskal')}
        >
          Kruskal
        </button>
        <button type="button" className="btn btn--primary" onClick={runPrim}>
          Run Prim
        </button>
        <button type="button" className="btn btn--secondary" onClick={runKruskal}>
          Run Kruskal
        </button>
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="viz-svg" role="img" aria-label="Minimum spanning tree">
        <text x={20} y={18} fill="#9ca3af" fontSize={12}>
          {tab === 'prim' ? "Prim's MST" : "Kruskal's MST"}
        </text>
        {nodeCount > 0 && (
          <text x={SVG_W - 20} y={18} fill="#9ca3af" fontSize={11} textAnchor="end">
            Edges: {mstEdges}/{nodeCount - 1} · Weight: {mstWeight}
          </text>
        )}
        {current?.edges.map((edge: GraphEdge) => {
          const src = current.nodes.find((n: GraphNode) => n.id === edge.source);
          const tgt = current.nodes.find((n: GraphNode) => n.id === edge.target);
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
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={EDGE_STATE_COLORS[edge.state]} strokeWidth={edge.state === 'default' ? 2 : 3} />
              <circle cx={mx} cy={my} r={12} fill="#1f2937" />
              <text x={mx} y={my + 4} fill="#9ca3af" fontSize={10} fontWeight={700} textAnchor="middle">
                {edge.weight}
              </text>
            </g>
          );
        })}
        {current?.nodes.map((node: GraphNode) => {
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
      </svg>

      <p className="viz-caption">
        {description ?? 'Run Prim or Kruskal to build a minimum spanning tree.'}
      </p>

      {(primSteps.length > 0 || kruskalSteps.length > 0) && (
        <div className="viz-panel__controls">
          <button type="button" className="btn btn--secondary" onClick={() => engine.stepBack()}>
            Prev
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Step {index + 1} / {(tab === 'prim' ? primSteps : kruskalSteps).length}
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
