/**
 * A* pathfinding step generator (grid-based).
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step } from '../core/types';
import { createStepMeta } from '../core/types';

export type CellType =
  | 'empty'
  | 'wall'
  | 'start'
  | 'end'
  | 'path'
  | 'visited'
  | 'frontier'
  | 'current';

export interface GridCell {
  row: number;
  col: number;
  type: CellType;
  g: number;
  h: number;
  f: number;
  parent: { row: number; col: number } | null;
}

export interface AStarData {
  grid: GridCell[][];
  rows: number;
  cols: number;
  start: { row: number; col: number };
  end: { row: number; col: number };
  openSet: Set<string>;
  closedSet: Set<string>;
  pathFound: boolean;
  pathCells: { row: number; col: number }[];
}

export const ASTAR_CELL_COLORS: Record<CellType, string> = {
  empty: '#1e293b',
  wall: '#374151',
  start: '#22c55e',
  end: '#ef4444',
  path: '#f59e0b',
  visited: '#475569',
  frontier: '#3b82f6',
  current: '#8b5cf6',
};

function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

function cloneGrid(grid: GridCell[][]): GridCell[][] {
  return grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      parent: cell.parent ? { ...cell.parent } : null,
    }))
  );
}

function manhattanDistance(
  a: { row: number; col: number },
  b: { row: number; col: number }
): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function getNeighbors(
  row: number,
  col: number,
  rows: number,
  cols: number
): { row: number; col: number }[] {
  const neighbors: { row: number; col: number }[] = [];
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }
  return neighbors;
}

export function createSampleGrid(rows = 8, cols = 10): GridCell[][] {
  const grid: GridCell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        type: 'empty',
        g: Infinity,
        h: 0,
        f: Infinity,
        parent: null,
      });
    }
    grid.push(row);
  }

  const walls = [
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [1, 5],
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 5],
    [6, 5],
    [3, 7],
    [4, 7],
    [5, 7],
  ];
  for (const [r, c] of walls) {
    if (r < rows && c < cols) grid[r][c].type = 'wall';
  }

  grid[0][0].type = 'start';
  grid[rows - 1][cols - 1].type = 'end';
  return grid;
}

export function generateAStarSteps(inputGrid: GridCell[][]): Step<AStarData>[] {
  const steps: Step<AStarData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const rows = inputGrid.length;
  const cols = inputGrid[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return steps;

  const grid = cloneGrid(inputGrid);
  let start: { row: number; col: number } | undefined;
  let end: { row: number; col: number } | undefined;

  for (let r = 0; r < rows && (!start || !end); r++) {
    for (let c = 0; c < cols && (!start || !end); c++) {
      if (grid[r][c].type === 'start') start = { row: r, col: c };
      if (grid[r][c].type === 'end') end = { row: r, col: c };
    }
  }

  if (!start || !end) {
    steps.push({
      id: stepId++,
      description: 'Error: Grid must have start and end positions',
      snapshot: {
        data: {
          grid: cloneGrid(grid),
          rows,
          cols,
          start: start ?? { row: 0, col: 0 },
          end: end ?? { row: rows - 1, col: cols - 1 },
          openSet: new Set(),
          closedSet: new Set(),
          pathFound: false,
          pathCells: [],
        },
      },
      meta: createStepMeta({ comparisons, highlightColor: ASTAR_CELL_COLORS.wall }),
    });
    return steps;
  }

  const openSet = new Set<string>();
  const closedSet = new Set<string>();

  grid[start.row][start.col].g = 0;
  grid[start.row][start.col].h = manhattanDistance(start, end);
  grid[start.row][start.col].f = grid[start.row][start.col].h;
  openSet.add(cellKey(start.row, start.col));

  const snapshot = (
    pathFound = false,
    pathCells: { row: number; col: number }[] = []
  ): AStarData => ({
    grid: cloneGrid(grid),
    rows,
    cols,
    start,
    end,
    openSet: new Set(openSet),
    closedSet: new Set(closedSet),
    pathFound,
    pathCells,
  });

  steps.push({
    id: stepId++,
    description: `A* Search: Finding path from (${start.row},${start.col}) to (${end.row},${end.col})`,
    snapshot: { data: snapshot() },
    meta: createStepMeta({ comparisons, highlightColor: ASTAR_CELL_COLORS.start }),
  });

  steps.push({
    id: stepId++,
    description: `Initialized start node with g=0, h=${grid[start.row][start.col].h} (Manhattan distance)`,
    snapshot: { data: snapshot() },
    meta: createStepMeta({ comparisons, highlightColor: ASTAR_CELL_COLORS.start }),
  });

  let pathFound = false;
  let iterations = 0;
  const maxIterations = rows * cols;

  while (openSet.size > 0 && iterations < maxIterations) {
    iterations++;
    let currentKey: string | null = null;
    let lowestF = Infinity;

    for (const key of openSet) {
      const [r, c] = key.split(',').map(Number);
      comparisons++;
      if (grid[r][c].f < lowestF) {
        lowestF = grid[r][c].f;
        currentKey = key;
      }
    }
    if (!currentKey) break;

    const [currentRow, currentCol] = currentKey.split(',').map(Number);
    const current = { row: currentRow, col: currentCol };

    if (grid[current.row][current.col].type !== 'start') {
      grid[current.row][current.col].type = 'current';
    }

    steps.push({
      id: stepId++,
      description: `Processing (${current.row},${current.col}) with f=${grid[current.row][current.col].f.toFixed(1)} (g=${grid[current.row][current.col].g}, h=${grid[current.row][current.col].h.toFixed(1)})`,
      snapshot: { data: snapshot() },
      meta: createStepMeta({ comparisons, highlightColor: ASTAR_CELL_COLORS.current }),
    });

    if (current.row === end.row && current.col === end.col) {
      pathFound = true;
      const pathCells: { row: number; col: number }[] = [];
      let pathNode: { row: number; col: number } | null = current;
      while (pathNode) {
        pathCells.unshift(pathNode);
        const cell: GridCell = grid[pathNode.row]![pathNode.col]!;
        if (cell.type !== 'start' && cell.type !== 'end') {
          grid[pathNode.row][pathNode.col].type = 'path';
        }
        pathNode = cell.parent;
      }
      steps.push({
        id: stepId++,
        description: `Path found! Length: ${pathCells.length} cells, Cost: ${grid[end.row][end.col].g}`,
        snapshot: { data: snapshot(true, pathCells) },
        meta: createStepMeta({ comparisons, highlightColor: ASTAR_CELL_COLORS.path }),
      });
      break;
    }

    openSet.delete(currentKey);
    closedSet.add(currentKey);
    if (grid[current.row][current.col].type !== 'start') {
      grid[current.row][current.col].type = 'visited';
    }

    for (const neighbor of getNeighbors(current.row, current.col, rows, cols)) {
      const neighborKey = cellKey(neighbor.row, neighbor.col);
      const neighborCell = grid[neighbor.row][neighbor.col];
      if (neighborCell.type === 'wall' || closedSet.has(neighborKey)) continue;

      const tentativeG = grid[current.row][current.col].g + 1;
      const isNewPath = !openSet.has(neighborKey);
      const isBetterPath = tentativeG < neighborCell.g;

      if (isNewPath || isBetterPath) {
        neighborCell.g = tentativeG;
        neighborCell.h = manhattanDistance(neighbor, end);
        neighborCell.f = neighborCell.g + neighborCell.h;
        neighborCell.parent = { row: current.row, col: current.col };

        if (!openSet.has(neighborKey)) {
          openSet.add(neighborKey);
          if (neighborCell.type !== 'end') neighborCell.type = 'frontier';
          steps.push({
            id: stepId++,
            description: `Added (${neighbor.row},${neighbor.col}) to frontier: f=${neighborCell.f.toFixed(1)} (g=${neighborCell.g}, h=${neighborCell.h.toFixed(1)})`,
            snapshot: { data: snapshot() },
            meta: createStepMeta({ comparisons, highlightColor: ASTAR_CELL_COLORS.frontier }),
          });
        }
      }
    }
  }

  if (!pathFound) {
    steps.push({
      id: stepId++,
      description: 'No path exists between start and end positions',
      snapshot: { data: snapshot() },
      meta: createStepMeta({ comparisons, highlightColor: ASTAR_CELL_COLORS.wall }),
    });
  }

  return steps;
}
