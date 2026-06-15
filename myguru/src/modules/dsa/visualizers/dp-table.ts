/**
 * Dynamic programming table step generator (Fibonacci memoization).
 *
 * Inspired by easyhard/dpv memoization table animator.
 *
 * @license MIT
 * @see https://github.com/easyhard/dpv
 */

import type { Step } from '../core/types';
import { createStepMeta } from '../core/types';

export type DpCellState = 'empty' | 'boundary' | 'computing' | 'filled' | 'dependency';

export interface DpCell {
  index: number;
  value: number | null;
  state: DpCellState;
  formula?: string;
}

export interface DpTableData {
  n: number;
  cells: DpCell[];
  activeIndices: number[];
}

export const DP_CELL_COLORS: Record<DpCellState, string> = {
  empty: '#374151',
  boundary: '#22c55e',
  computing: '#fbbf24',
  filled: '#60a5fa',
  dependency: '#a78bfa',
};

function snapshot(n: number, cells: DpCell[], activeIndices: number[] = []): DpTableData {
  return {
    n,
    cells: cells.map((c) => ({ ...c })),
    activeIndices: [...activeIndices],
  };
}

export function generateFibDpSteps(n: number): Step<DpTableData>[] {
  const steps: Step<DpTableData>[] = [];
  let stepId = 0;
  const clampedN = Math.min(Math.max(n, 2), 12);

  const cells: DpCell[] = Array.from({ length: clampedN + 1 }, (_, i) => ({
    index: i,
    value: null,
    state: 'empty',
  }));

  steps.push({
    id: stepId++,
    description: `Building memo table for fib(${clampedN}) — bottom-up DP`,
    snapshot: { data: snapshot(clampedN, cells) },
    meta: createStepMeta({ highlightColor: DP_CELL_COLORS.empty }),
  });

  cells[0].value = 0;
  cells[0].state = 'boundary';
  steps.push({
    id: stepId++,
    description: 'Base case: fib(0) = 0 (boundary)',
    snapshot: { data: snapshot(clampedN, cells, [0]) },
    meta: createStepMeta({ highlightColor: DP_CELL_COLORS.boundary }),
  });

  cells[1].value = 1;
  cells[1].state = 'boundary';
  steps.push({
    id: stepId++,
    description: 'Base case: fib(1) = 1 (boundary)',
    snapshot: { data: snapshot(clampedN, cells, [1]) },
    meta: createStepMeta({ highlightColor: DP_CELL_COLORS.boundary }),
  });

  for (let i = 2; i <= clampedN; i++) {
    cells[i].state = 'computing';
    cells[i - 1].state = 'dependency';
    cells[i - 2].state = 'dependency';
    steps.push({
      id: stepId++,
      description: `Computing fib(${i}) = fib(${i - 1}) + fib(${i - 2}) = ${cells[i - 1].value} + ${cells[i - 2].value}`,
      snapshot: { data: snapshot(clampedN, cells, [i, i - 1, i - 2]) },
      meta: createStepMeta({ highlightColor: DP_CELL_COLORS.computing }),
    });

    cells[i].value = (cells[i - 1].value ?? 0) + (cells[i - 2].value ?? 0);
    cells[i].state = 'filled';
    cells[i].formula = `${cells[i - 1].value}+${cells[i - 2].value}`;
    cells[i - 1].state = i - 1 <= 1 ? 'boundary' : 'filled';
    cells[i - 2].state = i - 2 <= 1 ? 'boundary' : 'filled';

    steps.push({
      id: stepId++,
      description: `fib(${i}) = ${cells[i].value}`,
      snapshot: { data: snapshot(clampedN, cells, [i]) },
      meta: createStepMeta({ highlightColor: DP_CELL_COLORS.filled }),
    });
  }

  steps.push({
    id: stepId++,
    description: `Complete! fib(${clampedN}) = ${cells[clampedN].value}`,
    snapshot: { data: snapshot(clampedN, cells) },
    meta: createStepMeta({ highlightColor: DP_CELL_COLORS.filled }),
  });

  return steps;
}
