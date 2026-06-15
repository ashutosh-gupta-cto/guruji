/**
 * Simplified interactive git commit graph.
 *
 * Inspired by pcottle/learnGitBranching / explain-git-with-d3 —
 * visualize commits, branches, checkout, and merge on a DAG.
 *
 * @see https://github.com/pcottle/learnGitBranching
 */

import { useMemo, useState } from 'react';
import { GitBranch, GitCommit, RotateCcw } from 'lucide-react';
import {
  branch,
  checkout,
  cherryPick,
  commit,
  getHeadCommit,
  layoutCommits,
  merge,
  rebase,
  resetDemo,
  type GitState,
} from './git-engine';

const NODE_R = 18;
const LANE_H = 52;
const COL_W = 72;

const DEMO_STEPS: { label: string; run: (s: GitState) => GitState }[] = [
  { label: 'Commit on main', run: (s) => commit(s, 'Add README') },
  { label: 'Branch feature', run: (s) => branch(s, 'feature') },
  { label: 'Checkout feature', run: (s) => checkout(s, 'feature') },
  { label: 'Commit on feature', run: (s) => commit(s, 'Build feature') },
  { label: 'Checkout main', run: (s) => checkout(s, 'main') },
  { label: 'Commit on main', run: (s) => commit(s, 'Fix typo') },
  { label: 'Merge feature', run: (s) => merge(s, 'feature') },
];

const REBASE_DEMO: { label: string; run: (s: GitState) => GitState }[] = [
  { label: 'Commit on main', run: (s) => commit(s, 'Init') },
  { label: 'Branch dev', run: (s) => branch(s, 'dev') },
  { label: 'Checkout dev', run: (s) => checkout(s, 'dev') },
  { label: 'Commit on dev', run: (s) => commit(s, 'Dev work') },
  { label: 'Checkout main', run: (s) => checkout(s, 'main') },
  { label: 'Commit on main', run: (s) => commit(s, 'Hotfix') },
  { label: 'Rebase dev', run: (s) => rebase(s, 'dev') },
];

function GitGraphSvg({ state }: { state: GitState }) {
  const commits = useMemo(() => layoutCommits({ ...state, commits: { ...state.commits } }), [state]);
  const headTarget = getHeadCommit(state).id;

  const width = Math.max(commits.length * COL_W + 80, 320);
  const maxLane = Math.max(...commits.map((c) => c.y), 0);
  const height = (maxLane + 2) * LANE_H + 40;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="gg-svg" role="img" aria-label="Git commit graph">
      {commits.flatMap((c) =>
        c.parents.map((pid) => {
          const parent = state.commits[pid];
          if (!parent) return null;
          const x1 = 40 + parent.x * COL_W;
          const y1 = 30 + parent.y * LANE_H;
          const x2 = 40 + c.x * COL_W;
          const y2 = 30 + c.y * LANE_H;
          return (
            <line
              key={`${pid}-${c.id}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className="gg-edge"
            />
          );
        }),
      )}
      {commits.map((c) => {
        const cx = 40 + c.x * COL_W;
        const cy = 30 + c.y * LANE_H;
        const isHead = c.id === headTarget;
        return (
          <g key={c.id} transform={`translate(${cx}, ${cy})`}>
            <circle r={NODE_R} className={`gg-node${isHead ? ' gg-node--head' : ''}`} />
            <text className="gg-node-label" y={4}>
              {c.id}
            </text>
          </g>
        );
      })}
      {Object.values(state.branches).map((b) => {
        const target = state.commits[b.target];
        if (!target) return null;
        const isHead = state.head === b.name;
        const cx = 40 + target.x * COL_W;
        const cy = 30 + target.y * LANE_H - NODE_R - 8;
        return (
          <g key={b.name} transform={`translate(${cx}, ${cy})`}>
            <rect
              x={-b.name.length * 4 - 8}
              y={-10}
              width={b.name.length * 8 + 16}
              height={18}
              rx={4}
              className={`gg-branch-tag${isHead ? ' gg-branch-tag--head' : ''}`}
            />
            <text className="gg-branch-label" y={3}>
              {b.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function GitGraph() {
  const [state, setState] = useState(resetDemo);
  const [commitMsg, setCommitMsg] = useState('');
  const [branchName, setBranchName] = useState('');
  const [mergeBranch, setMergeBranch] = useState('');
  const [rebaseBranch, setRebaseBranch] = useState('');
  const [cherryCommit, setCherryCommit] = useState('');

  const branchNames = Object.keys(state.branches).filter((b) => !b.startsWith('detached@'));

  return (
    <div className="gg-root">
      <div className="gg-graph-panel">
        <GitGraphSvg state={state} />
        <div className="gg-commits-list">
          {layoutCommits({ ...state, commits: { ...state.commits } })
            .slice()
            .reverse()
            .slice(0, 5)
            .map((c) => (
              <div key={c.id} className="gg-commit-msg">
                <span className="gg-commit-id">{c.id}</span> {c.message}
              </div>
            ))}
        </div>
      </div>

      <div className="gg-controls">
        <div className="gg-control-row">
          <GitCommit size={14} />
          <input
            className="csf-input"
            placeholder="Commit message"
            value={commitMsg}
            onChange={(e) => setCommitMsg(e.target.value)}
          />
          <button
            type="button"
            className="csf-btn csf-btn--primary"
            onClick={() => {
              setState((s) => commit(s, commitMsg));
              setCommitMsg('');
            }}
          >
            Commit
          </button>
        </div>

        <div className="gg-control-row">
          <GitBranch size={14} />
          <input
            className="csf-input"
            placeholder="Branch name"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
          />
          <button
            type="button"
            className="csf-btn"
            onClick={() => {
              if (branchName) {
                setState((s) => branch(s, branchName));
                setBranchName('');
              }
            }}
          >
            Branch
          </button>
        </div>

        <div className="gg-control-row">
          <span className="csf-label" style={{ margin: 0 }}>
            Checkout
          </span>
          {branchNames.map((name) => (
            <button
              key={name}
              type="button"
              className={`csf-btn${state.head === name ? ' csf-btn--primary' : ''}`}
              onClick={() => setState((s) => checkout(s, name))}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="gg-control-row">
          <span className="csf-label" style={{ margin: 0 }}>
            Merge
          </span>
          <input
            className="csf-input"
            placeholder="Branch to merge"
            value={mergeBranch}
            onChange={(e) => setMergeBranch(e.target.value)}
            style={{ maxWidth: '10rem' }}
          />
          <button
            type="button"
            className="csf-btn"
            onClick={() => {
              if (mergeBranch) {
                setState((s) => merge(s, mergeBranch));
                setMergeBranch('');
              }
            }}
          >
            Merge
          </button>
        </div>

        <div className="gg-control-row">
          <span className="csf-label" style={{ margin: 0 }}>
            Rebase
          </span>
          <input
            className="csf-input"
            placeholder="Branch to rebase"
            value={rebaseBranch}
            onChange={(e) => setRebaseBranch(e.target.value)}
            style={{ maxWidth: '10rem' }}
          />
          <button
            type="button"
            className="csf-btn"
            onClick={() => {
              if (rebaseBranch) {
                setState((s) => rebase(s, rebaseBranch));
                setRebaseBranch('');
              }
            }}
          >
            Rebase
          </button>
        </div>

        <div className="gg-control-row">
          <span className="csf-label" style={{ margin: 0 }}>
            Cherry-pick
          </span>
          <input
            className="csf-input"
            placeholder="Commit id (e.g. C3)"
            value={cherryCommit}
            onChange={(e) => setCherryCommit(e.target.value.toUpperCase())}
            style={{ maxWidth: '10rem' }}
          />
          <button
            type="button"
            className="csf-btn"
            onClick={() => {
              if (cherryCommit) {
                setState((s) => cherryPick(s, cherryCommit));
                setCherryCommit('');
              }
            }}
          >
            Cherry-pick
          </button>
        </div>

        <div className="gg-control-row">
          <button type="button" className="csf-btn" onClick={() => setState(resetDemo())}>
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            type="button"
            className="csf-btn csf-btn--primary"
            onClick={() => {
              let s = resetDemo();
              for (const step of DEMO_STEPS) s = step.run(s);
              setState(s);
            }}
          >
            Merge demo
          </button>
          <button
            type="button"
            className="csf-btn"
            onClick={() => {
              let s = resetDemo();
              for (const step of REBASE_DEMO) s = step.run(s);
              setState(s);
            }}
          >
            Rebase demo
          </button>
        </div>
      </div>

      <div className="gg-history">
        <span className="csf-label">Command history</span>
        <div className="gg-history-log">
          {state.history.length === 0 ? (
            <span className="gg-history-empty">Run a git command to begin</span>
          ) : (
            state.history.map((cmd, i) => (
              <div key={i} className="gg-history-line">
                <span className="gg-prompt">$</span> {cmd}
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .gg-root { display: flex; flex-direction: column; gap: 1rem; }
        .gg-graph-panel { background: var(--csf-bg-elev); border: 1px solid var(--csf-border); border-radius: 10px; padding: 1rem; overflow-x: auto; }
        .gg-svg { width: 100%; min-height: 160px; }
        .gg-edge { stroke: var(--csf-border-strong); stroke-width: 2; fill: none; }
        .gg-node { fill: var(--csf-bg-card); stroke: var(--csf-purple); stroke-width: 2; }
        .gg-node--head { fill: var(--csf-purple-dim); stroke: var(--csf-purple); stroke-width: 3; }
        .gg-node-label { text-anchor: middle; font-family: var(--csf-mono); font-size: 10px; fill: var(--csf-fg); }
        .gg-branch-tag { fill: var(--csf-teal-dim); stroke: var(--csf-teal); stroke-width: 1; }
        .gg-branch-tag--head { fill: var(--csf-teal); }
        .gg-branch-label { text-anchor: middle; font-family: var(--csf-mono); font-size: 9px; fill: var(--csf-fg); }
        .gg-branch-tag--head + .gg-branch-label { fill: #042f2e; font-weight: 700; }
        .gg-commits-list { margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
        .gg-commit-msg { font-size: 0.75rem; color: var(--csf-fg-muted); }
        .gg-commit-id { font-family: var(--csf-mono); color: var(--csf-purple); }
        .gg-controls { display: flex; flex-direction: column; gap: 0.65rem; }
        .gg-control-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
        .gg-history-log { background: var(--csf-bg-elev); border: 1px solid var(--csf-border); border-radius: 8px; padding: 0.75rem; max-height: 120px; overflow-y: auto; font-family: var(--csf-mono); font-size: 0.75rem; }
        .gg-history-line { color: var(--csf-fg-muted); margin-bottom: 0.2rem; }
        .gg-prompt { color: var(--csf-teal); margin-right: 0.35rem; }
        .gg-history-empty { color: var(--csf-fg-faint); }
      `}</style>
    </div>
  );
}
