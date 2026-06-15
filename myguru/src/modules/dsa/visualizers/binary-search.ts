/**
 * Binary search step generator.
 * @license MIT — pattern from ChazWyllie/data-structure-visualizer
 */

import type { Step } from '../core/types';
import { createStepMeta } from '../core/types';

export interface BinarySearchData {
  values: number[];
  target: number;
  left: number;
  right: number;
  mid: number | null;
  found: boolean;
}

export const binarySearchConfig = {
  id: 'binary-search',
  name: 'Binary Search',
  category: 'search',
  description: 'Halve the search space on sorted data',
};

export function generateBinarySearchSteps(
  values: number[],
  target: number,
): Step<BinarySearchData>[] {
  const sorted = [...values].sort((a, b) => a - b);
  const steps: Step<BinarySearchData>[] = [];
  let id = 0;
  let left = 0;
  let right = sorted.length - 1;
  let comparisons = 0;

  const push = (description: string, data: BinarySearchData, activeIndices?: number[]) => {
    steps.push({
      id: id++,
      description,
      snapshot: { data },
      meta: createStepMeta({ comparisons }),
      activeIndices,
    });
  };

  push('Sorted array — binary search begins', {
    values: sorted,
    target,
    left,
    right,
    mid: null,
    found: false,
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;
    const midVal = sorted[mid];

    if (midVal === target) {
      push(`Found ${target} at index ${mid}`, {
        values: sorted,
        target,
        left,
        right,
        mid,
        found: true,
      }, [mid]);
      return steps;
    }

    if (midVal < target) {
      push(`${midVal} < ${target} — search right half`, {
        values: sorted,
        target,
        left: mid + 1,
        right,
        mid,
        found: false,
      }, [left, mid, right]);
      left = mid + 1;
    } else {
      push(`${midVal} > ${target} — search left half`, {
        values: sorted,
        target,
        left,
        right: mid - 1,
        mid,
        found: false,
      }, [left, mid, right]);
      right = mid - 1;
    }
  }

  push(`${target} not found in array`, {
    values: sorted,
    target,
    left,
    right,
    mid: null,
    found: false,
  });

  return steps;
}
