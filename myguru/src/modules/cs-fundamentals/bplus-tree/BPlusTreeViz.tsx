/**
 * B+ tree interactive visualizer with insert/find/delete steps.
 * Ported from Yusux/BPlusTreeVisualizer.
 */

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Trash2, Plus } from 'lucide-react';
import { BPlusTree, collectNodes } from './bplus-tree-engine';
import type { AnimationStep, BPlusTreeNode } from './types';
import { isInternalNode, isLeafNode } from './types';

type Op = 'insert' | 'find' | 'delete';

function TreeSvg({
  root,
  highlights,
}: {
  root: BPlusTreeNode | null;
  highlights: AnimationStep['highlights'];
}) {
  const nodes = useMemo(() => collectNodes(root), [root]);
  if (!root) {
    return <p className="bpt-empty">Empty tree — insert a key to begin.</p>;
  }

  const levels = new Map<number, BPlusTreeNode[]>();
  const depthOf = (n: BPlusTreeNode): number => {
    let d = 0;
    let cur: BPlusTreeNode | null = n;
    while (cur?.parent) {
      d++;
      cur = cur.parent;
    }
    return d;
  };
  nodes.forEach((n) => {
    const d = depthOf(n);
    if (!levels.has(d)) levels.set(d, []);
    levels.get(d)!.push(n);
  });

  const maxKeys = Math.max(...nodes.map((n) => n.keys.length), 1);
  const nodeW = 28 + maxKeys * 22;
  const nodeH = 36;
  const levelH = 70;
  const positions = new Map<string, { x: number; y: number }>();

  [...levels.entries()].forEach(([level, levelNodes]) => {
    const totalW = levelNodes.length * (nodeW + 16);
    levelNodes.forEach((n, i) => {
      positions.set(n.id, {
        x: 40 + i * (nodeW + 16) + (400 - totalW) / 2,
        y: 30 + level * levelH,
      });
    });
  });

  const hlNodes = new Set(highlights.nodes ?? []);
  const hlKeys = new Set((highlights.keys ?? []).map((k) => `${k.nodeId}:${k.keyIndex}`));

  const width = 480;
  const height = (levels.size + 1) * levelH + 40;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="bpt-svg" role="img" aria-label="B+ tree">
      {nodes.flatMap((n) => {
        if (!isInternalNode(n)) return [];
        return n.children.map((c) => {
          const p1 = positions.get(n.id)!;
          const p2 = positions.get(c.id)!;
          return (
            <line
              key={`${n.id}-${c.id}`}
              x1={p1.x + nodeW / 2}
              y1={p1.y + nodeH}
              x2={p2.x + nodeW / 2}
              y2={p2.y}
              className="bpt-edge"
            />
          );
        });
      })}
      {nodes.map((n) => {
        const pos = positions.get(n.id)!;
        const highlighted = hlNodes.has(n.id);
        return (
          <g key={n.id} transform={`translate(${pos.x}, ${pos.y})`}>
            <rect
              width={nodeW}
              height={nodeH}
              rx={6}
              className={`bpt-node${highlighted ? ' bpt-node--hl' : ''}${isLeafNode(n) ? ' bpt-node--leaf' : ''}`}
            />
            {n.keys.map((k, ki) => (
              <text
                key={ki}
                x={14 + ki * 22}
                y={22}
                className={`bpt-key${hlKeys.has(`${n.id}:${ki}`) ? ' bpt-key--hl' : ''}`}
              >
                {k}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export default function BPlusTreeViz() {
  const [order, setOrder] = useState(4);
  const [tree] = useState(() => BPlusTree.fromKeys(4, [10, 20, 30]));
  const [keyInput, setKeyInput] = useState('');
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [stepIdx, setStepIdx] = useState(-1);

  const current = stepIdx >= 0 ? steps[stepIdx] : null;

  const runOp = (op: Op) => {
    const key = parseInt(keyInput, 10);
    if (Number.isNaN(key)) return;
    BPlusTree.resetCounter();
    const t = BPlusTree.fromKeys(order, collectNodes(tree.root).flatMap((n) => (isLeafNode(n) ? n.keys : [])));
    let newSteps: AnimationStep[];
    if (op === 'insert') newSteps = t.getInsertAnimation(key, key);
    else if (op === 'find') newSteps = t.getFindAnimation(key);
    else newSteps = t.getDeleteAnimation(key);
    setSteps(newSteps);
    setStepIdx(0);
  };

  return (
    <div className="bpt-root">
      <div className="csf-toolbar">
        <div>
          <span className="csf-label">Order</span>
          <input
            type="number"
            min={3}
            max={6}
            value={order}
            onChange={(e) => setOrder(Math.max(3, Math.min(6, parseInt(e.target.value, 10) || 4)))}
            className="csf-input"
            style={{ width: '3.5rem' }}
          />
        </div>
        <input
          className="csf-input"
          placeholder="Key (integer)"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          style={{ maxWidth: '8rem' }}
        />
        <button type="button" className="csf-btn csf-btn--primary" onClick={() => runOp('insert')}>
          <Plus size={14} /> Insert
        </button>
        <button type="button" className="csf-btn" onClick={() => runOp('find')}>
          <Search size={14} /> Find
        </button>
        <button type="button" className="csf-btn" onClick={() => runOp('delete')}>
          <Trash2 size={14} /> Delete
        </button>
      </div>

      <div className="bpt-canvas">
        <TreeSvg root={current?.treeState ?? tree.root} highlights={current?.highlights ?? {}} />
      </div>

      {steps.length > 0 && (
        <div className="bpt-stepper">
          <button
            type="button"
            className="csf-btn"
            disabled={stepIdx <= 0}
            onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
          >
            <ChevronLeft size={14} />
          </button>
          <span className="bpt-step-msg">
            {stepIdx + 1}/{steps.length}: {current?.message}
          </span>
          <button
            type="button"
            className="csf-btn"
            disabled={stepIdx >= steps.length - 1}
            onClick={() => setStepIdx((i) => Math.min(steps.length - 1, i + 1))}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      <style>{`
        .bpt-root { display: flex; flex-direction: column; gap: 0.75rem; }
        .bpt-canvas { background: var(--csf-bg-elev); border: 1px solid var(--csf-border); border-radius: 10px; padding: 0.75rem; overflow-x: auto; min-height: 180px; }
        .bpt-svg { width: 100%; min-height: 160px; }
        .bpt-edge { stroke: var(--csf-border-strong); stroke-width: 1.5; }
        .bpt-node { fill: var(--csf-bg-card); stroke: var(--csf-purple); stroke-width: 1.5; }
        .bpt-node--leaf { stroke: var(--csf-teal); }
        .bpt-node--hl { fill: var(--csf-purple-dim); stroke-width: 2.5; }
        .bpt-key { font-family: var(--csf-mono); font-size: 11px; fill: var(--csf-fg); }
        .bpt-key--hl { fill: var(--csf-amber); font-weight: 700; }
        .bpt-empty { color: var(--csf-fg-faint); font-size: 0.85rem; text-align: center; padding: 2rem; }
        .bpt-stepper { display: flex; align-items: center; gap: 0.5rem; }
        .bpt-step-msg { flex: 1; font-size: 0.8rem; color: var(--csf-fg-muted); }
      `}</style>
    </div>
  );
}
