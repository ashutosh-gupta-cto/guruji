/**
 * Merge Sort step generator.
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step, SortingData, ElementState } from '../core/types';
import { createStepMeta } from '../core/types';
import { cloneElements, STATE_COLORS } from './sorting-shared';

interface MergeStep {
  elements: ArrayElementSnapshot[];
  description: string;
  comparisons: number;
  writes: number;
  line: number;
  color: string;
  modifiedIndices?: number[];
}

type ArrayElementSnapshot = { value: number; state: ElementState };

export function generateMergeSortSteps(arr: number[]): Step<SortingData>[] {
  const elements = arr.map((value) => ({ value, state: 'default' as ElementState }));
  const mergeSteps: MergeStep[] = [];
  let comparisons = 0;
  let writes = 0;

  mergeSteps.push({
    elements: cloneElements(elements),
    description: 'Initial array state',
    comparisons: 0,
    writes: 0,
    line: 1,
    color: STATE_COLORS.default,
  });

  function merge(left: number, mid: number, right: number): void {
    const leftArr = elements.slice(left, mid + 1).map((e) => e.value);
    const rightArr = elements.slice(mid + 1, right + 1).map((e) => e.value);

    mergeSteps.push({
      elements: elements.map((e, idx) => ({
        ...e,
        state: (idx >= left && idx <= mid
          ? 'active'
          : idx > mid && idx <= right
            ? 'pivot'
            : 'default') as ElementState,
      })),
      description: `Merging subarrays [${left}..${mid}] and [${mid + 1}..${right}]`,
      comparisons,
      writes,
      line: 4,
      color: STATE_COLORS.active,
    });

    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;
      if (leftArr[i] <= rightArr[j]) {
        writes++;
        elements[k] = { value: leftArr[i], state: 'swapping' };
        i++;
      } else {
        writes++;
        elements[k] = { value: rightArr[j], state: 'swapping' };
        j++;
      }

      mergeSteps.push({
        elements: elements.map((e, idx) => ({
          ...e,
          state: (idx === k
            ? 'swapping'
            : idx >= left && idx <= right
              ? 'comparing'
              : 'default') as ElementState,
        })),
        description: `Placing ${elements[k].value} at index ${k}`,
        comparisons,
        writes,
        line: 5,
        color: STATE_COLORS.swapping,
        modifiedIndices: [k],
      });
      k++;
    }

    while (i < leftArr.length) {
      writes++;
      elements[k] = { value: leftArr[i], state: 'sorted' };
      mergeSteps.push({
        elements: cloneElements(elements),
        description: `Copying remaining ${leftArr[i]} to index ${k}`,
        comparisons,
        writes,
        line: 6,
        color: STATE_COLORS.sorted,
        modifiedIndices: [k],
      });
      i++;
      k++;
    }

    while (j < rightArr.length) {
      writes++;
      elements[k] = { value: rightArr[j], state: 'sorted' };
      mergeSteps.push({
        elements: cloneElements(elements),
        description: `Copying remaining ${rightArr[j]} to index ${k}`,
        comparisons,
        writes,
        line: 6,
        color: STATE_COLORS.sorted,
        modifiedIndices: [k],
      });
      j++;
      k++;
    }
  }

  function mergeSort(left: number, right: number): void {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);

      mergeSteps.push({
        elements: elements.map((e, idx) => ({
          ...e,
          state: (idx >= left && idx <= right ? 'active' : 'default') as ElementState,
        })),
        description: `Dividing array at indices [${left}..${right}], mid = ${mid}`,
        comparisons,
        writes,
        line: 2,
        color: STATE_COLORS.comparing,
      });

      mergeSort(left, mid);
      mergeSort(mid + 1, right);
      merge(left, mid, right);
    }
  }

  if (arr.length > 0) {
    mergeSort(0, arr.length - 1);
  }

  mergeSteps.push({
    elements: elements.map((e) => ({ ...e, state: 'sorted' as ElementState })),
    description: 'Array is now fully sorted!',
    comparisons,
    writes,
    line: 7,
    color: STATE_COLORS.sorted,
  });

  return mergeSteps.map((step, idx) => ({
    id: idx,
    description: step.description,
    snapshot: { data: { elements: step.elements } },
    meta: createStepMeta({
      comparisons: step.comparisons,
      reads: step.comparisons * 2,
      writes: step.writes * 2,
      highlightedLine: step.line,
      highlightColor: step.color,
    }),
    modifiedIndices: step.modifiedIndices,
  }));
}

export const mergeSortConfig = {
  id: 'merge-sort',
  name: 'Merge Sort',
  description: 'Divide-and-conquer algorithm that splits, sorts halves, then merges.',
  defaultSpeed: 200,
  complexity: {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(n)',
  },
};
