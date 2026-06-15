import { useCallback, useEffect, useState } from 'react';

import { StepEngine } from '../core/step-engine';
import type { Step } from '../core/types';
import {
  ASTAR_CELL_COLORS,
  createSampleGrid,
  generateAStarSteps,
  type AStarData,
} from '../visualizers/a-star';

const SVG_W = 520;
const SVG_H = 360;
const PAD = 20;

function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function AStarPage() {
  const [steps, setSteps] = useState<Step<AStarData>[]>([]);
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
    const grid = createSampleGrid();
    const next = generateAStarSteps(grid);
    setSteps(next);
    engine.loadSteps(next);
    engine.reset();
    setIndex(0);
  }, [engine]);

  const current = steps[index]?.snapshot.data;
  const description =
    steps[index]?.description ?? 'Run A* to find the shortest path on a grid with Manhattan heuristic.';

  const rows = current?.rows ?? 8;
  const cols = current?.cols ?? 10;
  const availW = SVG_W - PAD * 2;
  const availH = SVG_H - PAD * 2 - 24;
  const cellSize = Math.min(availW / cols, availH / rows);
  const offsetX = (SVG_W - cellSize * cols) / 2;
  const offsetY = (SVG_H - 24 - cellSize * rows) / 2;

  const cellColor = (row: number, col: number, type: keyof typeof ASTAR_CELL_COLORS) => {
    const key = cellKey(row, col);
    if (
      current?.openSet.has(key) &&
      type !== 'start' &&
      type !== 'end' &&
      type !== 'current' &&
      type !== 'path'
    ) {
      return ASTAR_CELL_COLORS.frontier;
    }
    if (current?.closedSet.has(key) && type !== 'start' && type !== 'end' && type !== 'path') {
      return ASTAR_CELL_COLORS.visited;
    }
    return ASTAR_CELL_COLORS[type];
  };

  return (
    <div className="viz-panel">
      <div className="viz-panel__controls">
        <button type="button" className="btn btn--primary" onClick={run}>
          Find path (A*)
        </button>
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="viz-svg" role="img" aria-label="A star pathfinding">
        {current?.grid.map((row, r) =>
          row.map((cell, c) => {
            const x = offsetX + c * cellSize;
            const y = offsetY + r * cellSize;
            const color = cellColor(r, c, cell.type);
            return (
              <g key={`${r}-${c}`}>
                <rect
                  x={x + 1}
                  y={y + 1}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  fill={color}
                  stroke="#64748b"
                  strokeWidth={1}
                />
                {cell.type === 'start' || cell.type === 'end' ? (
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2 + 4}
                    fill="#fff"
                    fontSize={Math.max(10, cellSize / 3)}
                    fontWeight={700}
                    textAnchor="middle"
                  >
                    {cell.type === 'start' ? 'S' : 'E'}
                  </text>
                ) : cell.type !== 'wall' && cell.g < Infinity ? (
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2 + 3}
                    fill="#e2e8f0"
                    fontSize={Math.max(8, cellSize / 4)}
                    textAnchor="middle"
                  >
                    {cell.f.toFixed(0)}
                  </text>
                ) : null}
              </g>
            );
          })
        )}

        {current?.pathCells && current.pathCells.length > 1 && (
          <polyline
            fill="none"
            stroke="#f59e0b"
            strokeWidth={3}
            points={current.pathCells
              .map(
                (p) =>
                  `${offsetX + p.col * cellSize + cellSize / 2},${offsetY + p.row * cellSize + cellSize / 2}`
              )
              .join(' ')}
          />
        )}

        <g transform={`translate(${PAD}, ${SVG_H - 18})`}>
          {(
            [
              ['start', 'Start'],
              ['end', 'End'],
              ['frontier', 'Frontier'],
              ['visited', 'Visited'],
              ['path', 'Path'],
              ['wall', 'Wall'],
            ] as const
          ).map(([type, label], i) => (
            <g key={type} transform={`translate(${i * 78}, 0)`}>
              <rect width={12} height={12} fill={ASTAR_CELL_COLORS[type]} />
              <text x={16} y={10} fill="#94a3b8" fontSize={10}>
                {label}
              </text>
            </g>
          ))}
        </g>
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
