/**
 * Quick Sort step generator.
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step, SortingData, ElementState } from '../core/types';
import { createStepMeta } from '../core/types';
import { cloneElements, STATE_COLORS } from './sorting-shared';

interface QuickStep {
  elements: { value: number; state: ElementState }[];
  description: string;
  comparisons: number;
  swaps: number;
  line: number;
  color: string;
  activeIndices?: number[];
  modifiedIndices?: number[];
}

export function generateQuickSortSteps(arr: number[]): Step<SortingData>[] {
  const elements = arr.map((value) => ({ value, state: 'default' as ElementState }));
  const quickSteps: QuickStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  const sortedIndices = new Set<number>();

  quickSteps.push({
    elements: cloneElements(elements),
    description: 'Initial array state',
    comparisons: 0,
    swaps: 0,
    line: 1,
    color: STATE_COLORS.default,
  });

  function partition(low: number, high: number): number {
    const pivotValue = elements[high].value;

    quickSteps.push({
      elements: elements.map((e, idx) => ({
        ...e,
        state: (sortedIndices.has(idx)
          ? 'sorted'
          : idx === high
            ? 'pivot'
            : idx >= low && idx < high
              ? 'active'
              : 'default') as ElementState,
      })),
      description: `Choosing pivot: ${pivotValue} at index ${high}`,
      comparisons,
      swaps,
      line: 3,
      color: STATE_COLORS.pivot,
    });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      comparisons++;
      quickSteps.push({
        elements: elements.map((e, idx) => ({
          ...e,
          state: (sortedIndices.has(idx)
            ? 'sorted'
            : idx === high
              ? 'pivot'
              : idx === j
                ? 'comparing'
                : idx >= low && idx <= i
                  ? 'active'
                  : 'default') as ElementState,
        })),
        description: `Comparing ${elements[j].value} with pivot ${pivotValue}`,
        comparisons,
        swaps,
        line: 4,
        color: STATE_COLORS.comparing,
        activeIndices: [j, high],
      });

      if (elements[j].value < pivotValue) {
        i++;
        if (i !== j) {
          swaps++;
          const temp = elements[i];
          elements[i] = elements[j];
          elements[j] = temp;

          quickSteps.push({
            elements: elements.map((e, idx) => ({
              ...e,
              state: (sortedIndices.has(idx)
                ? 'sorted'
                : idx === i || idx === j
                  ? 'swapping'
                  : idx === high
                    ? 'pivot'
                    : 'default') as ElementState,
            })),
            description: `Swapping ${elements[i].value} and ${elements[j].value}`,
            comparisons,
            swaps,
            line: 5,
            color: STATE_COLORS.swapping,
            modifiedIndices: [i, j],
          });
        }
      }
    }

    swaps++;
    const temp = elements[i + 1];
    elements[i + 1] = elements[high];
    elements[high] = temp;

    sortedIndices.add(i + 1);
    quickSteps.push({
      elements: elements.map((e, idx) => ({
        ...e,
        state: (sortedIndices.has(idx)
          ? 'sorted'
          : idx === i + 1
            ? 'sorted'
            : 'default') as ElementState,
      })),
      description: `Pivot ${elements[i + 1].value} placed at final position ${i + 1}`,
      comparisons,
      swaps,
      line: 6,
      color: STATE_COLORS.sorted,
      modifiedIndices: [i + 1, high],
    });

    return i + 1;
  }

  function quickSort(low: number, high: number): void {
    if (low < high) {
      quickSteps.push({
        elements: elements.map((e, idx) => ({
          ...e,
          state: (sortedIndices.has(idx)
            ? 'sorted'
            : idx >= low && idx <= high
              ? 'active'
              : 'default') as ElementState,
        })),
        description: `Sorting subarray [${low}..${high}]`,
        comparisons,
        swaps,
        line: 2,
        color: STATE_COLORS.active,
      });

      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      sortedIndices.add(low);
    }
  }

  if (arr.length > 0) {
    quickSort(0, arr.length - 1);
  }

  quickSteps.push({
    elements: elements.map((e) => ({ ...e, state: 'sorted' as ElementState })),
    description: 'Array is now fully sorted!',
    comparisons,
    swaps,
    line: 7,
    color: STATE_COLORS.sorted,
  });

  return quickSteps.map((step, idx) => ({
    id: idx,
    description: step.description,
    snapshot: { data: { elements: step.elements } },
    meta: createStepMeta({
      comparisons: step.comparisons,
      swaps: step.swaps,
      reads: step.comparisons * 2,
      writes: step.swaps * 2,
      highlightedLine: step.line,
      highlightColor: step.color,
    }),
    activeIndices: step.activeIndices,
    modifiedIndices: step.modifiedIndices,
  }));
}

export const quickSortConfig = {
  id: 'quick-sort',
  name: 'Quick Sort',
  description: 'Picks a pivot and partitions the array around it recursively.',
  defaultSpeed: 200,
  complexity: {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    space: 'O(log n)',
  },
};
