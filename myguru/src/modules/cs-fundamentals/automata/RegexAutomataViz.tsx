/**
 * Regex → NFA visualizer (Thompson construction).
 * Inspired by Royal-lobster/stateforge and AmirHossein812002/Regex2FA.
 */

import { useMemo, useState } from 'react';
import { ChevronRight, Workflow } from 'lucide-react';
import { regexToNfa } from './regex-to-nfa';

const PRESETS = ['a', 'a|b', '(ab)*', 'a+b'];

export default function RegexAutomataViz() {
  const [regex, setRegex] = useState('(a|b)*');
  const result = useMemo(() => regexToNfa(regex), [regex]);

  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    result.states.forEach((s) => map.set(s.id, { x: s.x, y: s.y }));
    return map;
  }, [result.states]);

  const width = Math.max(320, ...result.states.map((s) => s.x + 80));
  const height = Math.max(180, ...result.states.map((s) => s.y + 60));

  return (
    <div className="auto-root">
      <div className="csf-toolbar">
        <Workflow size={14} />
        <input
          className="csf-input"
          value={regex}
          onChange={(e) => setRegex(e.target.value)}
          placeholder="Regex pattern"
          style={{ maxWidth: '12rem' }}
        />
        {PRESETS.map((p) => (
          <button key={p} type="button" className="csf-btn" onClick={() => setRegex(p)}>
            /{p}/
          </button>
        ))}
      </div>

      <p className="auto-desc">
        NFA with {result.states.length} states — alphabet:{' '}
        {result.alphabet.length ? `{${result.alphabet.join(', ')}}` : 'ε only'}
      </p>

      <svg viewBox={`0 0 ${width} ${height}`} className="auto-svg" role="img" aria-label="NFA graph">
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="var(--csf-fg-muted)" />
          </marker>
        </defs>
        {result.transitions.map((t, i) => {
          const from = positions.get(t.from);
          const to = positions.get(t.to);
          if (!from || !to) return null;
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const len = Math.hypot(dx, dy) || 1;
          const x1 = from.x + (dx / len) * 20;
          const y1 = from.y + (dy / len) * 20;
          const x2 = to.x - (dx / len) * 24;
          const y2 = to.y - (dy / len) * 24;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="auto-edge" markerEnd="url(#arrow)" />
              <text x={mx} y={my - 4} className="auto-edge-label">
                {t.symbol}
              </text>
            </g>
          );
        })}
        {result.states.map((s) => {
          const p = positions.get(s.id)!;
          return (
            <g key={s.id} transform={`translate(${p.x}, ${p.y})`}>
              {s.isFinal && <circle r={26} className="auto-final-ring" />}
              <circle r={20} className={`auto-state${s.isInitial ? ' auto-state--initial' : ''}`} />
              <text className="auto-state-label" y={4}>
                {s.label.replace(/^q/, '')}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="auto-legend">
        <span>
          <ChevronRight size={12} /> ε = epsilon transition
        </span>
        <span>Double ring = accepting state</span>
      </div>

      <style>{`
        .auto-root { display: flex; flex-direction: column; gap: 0.75rem; }
        .auto-desc { font-size: 0.85rem; color: var(--csf-fg-muted); margin: 0; }
        .auto-svg { width: 100%; min-height: 160px; background: var(--csf-bg-elev); border: 1px solid var(--csf-border); border-radius: 10px; }
        .auto-edge { stroke: var(--csf-border-strong); stroke-width: 1.5; fill: none; }
        .auto-edge-label { text-anchor: middle; font-size: 10px; fill: var(--csf-cyan); font-family: var(--csf-mono); }
        .auto-state { fill: var(--csf-bg-card); stroke: var(--csf-purple); stroke-width: 2; }
        .auto-state--initial { stroke: var(--csf-teal); stroke-width: 3; }
        .auto-final-ring { fill: none; stroke: var(--csf-green); stroke-width: 1.5; }
        .auto-state-label { text-anchor: middle; font-family: var(--csf-mono); font-size: 10px; fill: var(--csf-fg); }
        .auto-legend { display: flex; gap: 1rem; font-size: 0.7rem; color: var(--csf-fg-faint); }
      `}</style>
    </div>
  );
}
