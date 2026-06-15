/**
 * Bubble Sort step generator.
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step, SortingData, ElementState } from '../core/types';
import { createStepMeta } from '../core/types';
import { cloneElements, STATE_COLORS } from './sorting-shared';

export function generateBubbleSortSteps(arr: number[]): Step<SortingData>[] {
  const steps: Step<SortingData>[] = [];
  const elements = arr.map((value) => ({ value, state: 'default' as ElementState }));
  let stepId = 0;
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    id: stepId++,
    description: 'Initial array state',
    snapshot: { data: { elements: cloneElements(elements) } },
    meta: createStepMeta({
      highlightedLine: 1,
      highlightColor: STATE_COLORS.default,
    }),
  });

  const n = elements.length;

  for (let i = 0; i < n - 1; i++) {
    steps.push({
      id: stepId++,
      description: `Pass ${i + 1}: bubble largest unsorted element to position ${n - 1 - i}`,
      snapshot: { data: { elements: cloneElements(elements) } },
      meta: createStepMeta({
        comparisons,
        swaps,
        reads: comparisons * 2,
        writes: swaps * 2,
        highlightedLine: 2,
        highlightColor: STATE_COLORS.active,
      }),
    });

    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      const comparingElements = elements.map((e, idx) => ({
        ...e,
        state: (idx === j || idx === j + 1
          ? 'comparing'
          : idx > n - 1 - i
            ? 'sorted'
            : 'default') as ElementState,
      }));

      steps.push({
        id: stepId++,
        description: `Comparing elements at index ${j} (${elements[j].value}) and ${j + 1} (${elements[j + 1].value})`,
        snapshot: { data: { elements: comparingElements } },
        meta: createStepMeta({
          comparisons,
          swaps,
          reads: comparisons * 2,
          writes: swaps * 2,
          highlightedLine: 3,
          highlightColor: STATE_COLORS.comparing,
        }),
        activeIndices: [j, j + 1],
      });

      if (elements[j].value > elements[j + 1].value) {
        swaps++;
        const swappingElements = elements.map((e, idx) => ({
          ...e,
          state: (idx === j || idx === j + 1
            ? 'swapping'
            : idx > n - 1 - i
              ? 'sorted'
              : 'default') as ElementState,
        }));

        steps.push({
          id: stepId++,
          description: `Swapping ${elements[j].value} and ${elements[j + 1].value}`,
          snapshot: { data: { elements: swappingElements } },
          meta: createStepMeta({
            comparisons,
            swaps,
            reads: comparisons * 2,
            writes: swaps * 2,
            highlightedLine: 4,
            highlightColor: STATE_COLORS.swapping,
          }),
          activeIndices: [j, j + 1],
          modifiedIndices: [j, j + 1],
        });

        const temp = elements[j];
        elements[j] = elements[j + 1];
        elements[j + 1] = temp;
      }
    }

    elements[n - 1 - i].state = 'sorted';
    steps.push({
      id: stepId++,
      description: `Element ${elements[n - 1 - i].value} is now in its sorted position`,
      snapshot: { data: { elements: cloneElements(elements) } },
      meta: createStepMeta({
        comparisons,
        swaps,
        reads: comparisons * 2,
        writes: swaps * 2,
        highlightedLine: 5,
        highlightColor: STATE_COLORS.sorted,
      }),
    });
  }

  if (elements.length > 0) {
    elements[0].state = 'sorted';
  }

  steps.push({
    id: stepId++,
    description: 'Array is now fully sorted!',
    snapshot: {
      data: {
        elements: elements.map((e) => ({ ...e, state: 'sorted' as ElementState })),
      },
    },
    meta: createStepMeta({
      comparisons,
      swaps,
      reads: comparisons * 2,
      writes: swaps * 2,
      highlightedLine: 6,
      highlightColor: STATE_COLORS.sorted,
    }),
  });

  return steps;
}

export const bubbleSortConfig = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  description:
    'Repeatedly compares adjacent elements and swaps them if they are in the wrong order.',
  defaultSpeed: 300,
  complexity: {
    time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
  },
};
