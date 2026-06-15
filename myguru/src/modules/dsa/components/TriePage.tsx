import { useCallback, useEffect, useMemo, useState } from 'react';

import { StepEngine } from '../core/step-engine';
import type { Step } from '../core/types';
import {
  calculateTrieLayout,
  createSampleTrie,
  generateInsertSteps,
  generatePrefixSteps,
  generateSearchSteps,
  TRIE_NODE_STATE_COLORS,
  type TrieData,
  type TrieNodeData,
} from '../visualizers/trie';

const SVG_W = 600;
const SVG_H = 360;
const NODE_R = 18;

function toInitial(): Step<TrieData> {
  const trie = createSampleTrie();
  return {
    id: 0,
    description: 'Trie ready — search, insert, or find words by prefix',
    snapshot: { data: trie },
    meta: { comparisons: 0, swaps: 0, reads: 0, writes: 0 },
  };
}

function renderEdges(node: TrieNodeData, edges: { x1: number; y1: number; x2: number; y2: number; color: string }[]): void {
  for (const child of node.children) {
    if (node.x !== undefined && node.y !== undefined && child.x !== undefined && child.y !== undefined) {
      edges.push({
        x1: node.x,
        y1: node.y + NODE_R,
        x2: child.x,
        y2: child.y - NODE_R,
        color: child.state !== 'default' ? TRIE_NODE_STATE_COLORS[child.state] : '#4b5563',
      });
    }
    renderEdges(child, edges);
  }
}

function renderNodes(node: TrieNodeData, nodes: TrieNodeData[]): void {
  nodes.push(node);
  for (const child of node.children) renderNodes(child, nodes);
}

export function TriePage() {
  const [trie, setTrie] = useState<TrieData>(() => createSampleTrie());
  const [word, setWord] = useState('car');
  const [steps, setSteps] = useState<Step<TrieData>[]>([toInitial()]);
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
    (next: Step<TrieData>[]) => {
      const final = next[next.length - 1]?.snapshot.data;
      if (final) setTrie(final);
      setSteps(next);
      engine.loadSteps(next);
      engine.reset();
    },
    [engine]
  );

  const current = steps[index]?.snapshot.data ?? trie;

  const layout = useMemo(() => {
    const root = structuredClone(current.root);
    calculateTrieLayout(root, SVG_W / 2, 50, 45, 60);
    const edges: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
    const nodes: TrieNodeData[] = [];
    renderEdges(root, edges);
    renderNodes(root, nodes);
    return { edges, nodes };
  }, [current]);

  return (
    <div className="viz-panel">
      <div className="viz-panel__controls">
        <label>
          Word
          <input type="text" value={word} onChange={(e) => setWord(e.target.value)} className="viz-input" />
        </label>
        <button type="button" className="btn btn--primary" onClick={() => runSteps(generateSearchSteps(trie, word))}>
          Search
        </button>
        <button type="button" className="btn btn--secondary" onClick={() => runSteps(generateInsertSteps(trie, word))}>
          Insert
        </button>
        <button type="button" className="btn btn--secondary" onClick={() => runSteps(generatePrefixSteps(trie, word))}>
          Find Prefix
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => {
            const sample = createSampleTrie();
            setTrie(sample);
            runSteps([toInitial()]);
          }}
        >
          Reset
        </button>
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="viz-svg" role="img" aria-label="Trie visualization">
        <text x={20} y={20} fill="#9ca3af" fontSize={12}>
          Trie — {current.words.length} words
        </text>
        {current.currentWord && (
          <text x={SVG_W - 20} y={20} fill="#9ca3af" fontSize={12} textAnchor="end">
            Current: "{current.currentWord}"
          </text>
        )}
        {layout.edges.map((edge, i) => (
          <line key={i} x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2} stroke={edge.color} strokeWidth={2} />
        ))}
        {layout.nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={NODE_R}
              fill={TRIE_NODE_STATE_COLORS[node.state]}
              stroke={node.isEndOfWord ? '#fff' : 'none'}
              strokeWidth={node.isEndOfWord ? 2 : 0}
            />
            <text x={node.x} y={(node.y ?? 0) + 5} fill="#fff" fontSize={12} fontWeight={700} textAnchor="middle">
              {node.depth === 0 ? '∅' : node.char}
            </text>
          </g>
        ))}
        {current.matchingWords && current.matchingWords.length > 0 && (
          <text x={20} y={SVG_H - 12} fill="#10b981" fontSize={11}>
            Matches: {current.matchingWords.join(', ')}
          </text>
        )}
        <text x={20} y={SVG_H - 28} fill="#6b7280" fontSize={10}>
          Words: {current.words.slice(0, 8).join(', ')}
          {current.words.length > 8 ? '…' : ''}
        </text>
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
