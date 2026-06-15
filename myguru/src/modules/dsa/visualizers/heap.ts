/**
 * Min/max heap step generators and layout helpers.
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step } from '../core/types';
import { createStepMeta } from '../core/types';

export type HeapType = 'max' | 'min';
export type HeapNodeState =
  | 'default'
  | 'current'
  | 'comparing'
  | 'swapping'
  | 'inserted'
  | 'removed';

export interface HeapElement {
  value: number;
  state: HeapNodeState;
}

export interface HeapData {
  elements: HeapElement[];
  heapType: HeapType;
}

export const HEAP_STATE_COLORS: Record<HeapNodeState, string> = {
  default: '#60a5fa',
  current: '#fbbf24',
  comparing: '#a78bfa',
  swapping: '#f97316',
  inserted: '#4ade80',
  removed: '#ef4444',
};

const NODE_RADIUS = 22;
const LEVEL_HEIGHT = 60;

function compare(a: number, b: number, heapType: HeapType): boolean {
  return heapType === 'max' ? a > b : a < b;
}

export function getParentIndex(i: number): number {
  return Math.floor((i - 1) / 2);
}

export function getLeftChildIndex(i: number): number {
  return 2 * i + 1;
}

export function getRightChildIndex(i: number): number {
  return 2 * i + 2;
}

export interface TreeNodeLayout {
  value: number;
  state: HeapNodeState;
  x: number;
  y: number;
  index: number;
}

export function calculateTreeLayout(
  elements: HeapElement[],
  canvasWidth: number,
  treeAreaHeight: number
): TreeNodeLayout[] {
  if (elements.length === 0) return [];

  const nodes: TreeNodeLayout[] = [];
  const depth = Math.floor(Math.log2(elements.length)) + 1;
  const padding = 20;
  const startY = padding + NODE_RADIUS + 10;
  const availableHeight = treeAreaHeight - startY - NODE_RADIUS - 10;
  const levelHeight = Math.min(LEVEL_HEIGHT, availableHeight / Math.max(1, depth - 1));

  for (let i = 0; i < elements.length; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const nodesInLevel = 2 ** level;
    const positionInLevel = i - (nodesInLevel - 1);
    const levelWidth = canvasWidth - padding * 2;
    const spacing = levelWidth / nodesInLevel;
    const x = padding + spacing * (positionInLevel + 0.5);
    const y = startY + level * levelHeight;

    nodes.push({
      value: elements[i].value,
      state: elements[i].state,
      x,
      y,
      index: i,
    });
  }

  return nodes;
}

export function generatePushSteps(
  elements: HeapElement[],
  value: number,
  heapType: HeapType
): Step<HeapData>[] {
  const steps: Step<HeapData>[] = [];
  let stepId = 0;
  let comparisons = 0;
  let swaps = 0;

  const heap = elements.map((e) => ({ ...e, state: 'default' as HeapNodeState }));

  steps.push({
    id: stepId++,
    description: `Pushing value ${value} into ${heapType}-heap`,
    snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
    meta: createStepMeta({ comparisons, highlightColor: HEAP_STATE_COLORS.default }),
  });

  heap.push({ value, state: 'inserted' });
  let currentIndex = heap.length - 1;

  steps.push({
    id: stepId++,
    description: `Added ${value} at index ${currentIndex} (end of array)`,
    snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
    meta: createStepMeta({ comparisons, highlightColor: HEAP_STATE_COLORS.inserted }),
  });

  while (currentIndex > 0) {
    const parentIndex = getParentIndex(currentIndex);
    comparisons++;
    heap[currentIndex].state = 'current';
    heap[parentIndex].state = 'comparing';

    const heapWord = heapType === 'max' ? 'greater' : 'smaller';
    steps.push({
      id: stepId++,
      description: `Comparing ${heap[currentIndex].value} with parent ${heap[parentIndex].value}`,
      snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
      meta: createStepMeta({ comparisons, highlightColor: HEAP_STATE_COLORS.comparing }),
      activeIndices: [currentIndex, parentIndex],
    });

    if (compare(heap[currentIndex].value, heap[parentIndex].value, heapType)) {
      swaps++;
      heap[currentIndex].state = 'swapping';
      heap[parentIndex].state = 'swapping';

      steps.push({
        id: stepId++,
        description: `${heap[currentIndex].value} is ${heapWord} than ${heap[parentIndex].value}, swapping`,
        snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
        meta: createStepMeta({ comparisons, swaps, highlightColor: HEAP_STATE_COLORS.swapping }),
        modifiedIndices: [currentIndex, parentIndex],
      });

      const temp = heap[currentIndex];
      heap[currentIndex] = heap[parentIndex];
      heap[parentIndex] = temp;
      heap[currentIndex].state = 'default';
      heap[parentIndex].state = 'current';
      currentIndex = parentIndex;
    } else {
      heap[currentIndex].state = 'inserted';
      heap[parentIndex].state = 'default';
      steps.push({
        id: stepId++,
        description: `Heap property satisfied. ${heap[currentIndex].value} is in correct position.`,
        snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
        meta: createStepMeta({ comparisons, swaps, highlightColor: HEAP_STATE_COLORS.inserted }),
      });
      break;
    }
  }

  heap.forEach((e) => (e.state = 'default'));
  const insertedIndex = heap.findIndex((e) => e.value === value);
  if (insertedIndex >= 0) heap[insertedIndex].state = 'inserted';

  steps.push({
    id: stepId++,
    description: `Push complete. ${value} is now in the heap.`,
    snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
    meta: createStepMeta({ comparisons, swaps, highlightColor: HEAP_STATE_COLORS.inserted }),
  });

  return steps;
}

export function generatePopSteps(elements: HeapElement[], heapType: HeapType): Step<HeapData>[] {
  const steps: Step<HeapData>[] = [];
  let stepId = 0;
  let comparisons = 0;
  let swaps = 0;
  const heap = elements.map((e) => ({ ...e, state: 'default' as HeapNodeState }));

  if (heap.length === 0) {
    steps.push({
      id: stepId++,
      description: 'Heap is empty. Nothing to pop.',
      snapshot: { data: { elements: [], heapType } },
      meta: createStepMeta({ comparisons }),
    });
    return steps;
  }

  const rootValue = heap[0].value;
  heap[0].state = 'removed';

  steps.push({
    id: stepId++,
    description: `Popping root value ${rootValue} from ${heapType}-heap`,
    snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
    meta: createStepMeta({ comparisons, highlightColor: HEAP_STATE_COLORS.removed }),
  });

  if (heap.length === 1) {
    steps.push({
      id: stepId++,
      description: `Removed ${rootValue}. Heap is now empty.`,
      snapshot: { data: { elements: [], heapType } },
      meta: createStepMeta({ comparisons, highlightColor: HEAP_STATE_COLORS.removed }),
    });
    return steps;
  }

  const lastValue = heap[heap.length - 1].value;
  heap[0] = { value: lastValue, state: 'current' };
  heap.pop();

  steps.push({
    id: stepId++,
    description: `Moved last element ${lastValue} to root position`,
    snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
    meta: createStepMeta({ comparisons, highlightColor: HEAP_STATE_COLORS.current }),
  });

  let currentIndex = 0;
  const n = heap.length;
  let heapPropertySatisfied = false;

  while (!heapPropertySatisfied) {
    const leftIndex = getLeftChildIndex(currentIndex);
    const rightIndex = getRightChildIndex(currentIndex);
    let targetIndex = currentIndex;

    if (leftIndex < n) {
      comparisons++;
      heap[currentIndex].state = 'current';
      heap[leftIndex].state = 'comparing';
      steps.push({
        id: stepId++,
        description: `Comparing ${heap[currentIndex].value} with left child ${heap[leftIndex].value}`,
        snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
        meta: createStepMeta({ comparisons, swaps, highlightColor: HEAP_STATE_COLORS.comparing }),
        activeIndices: [currentIndex, leftIndex],
      });
      if (compare(heap[leftIndex].value, heap[targetIndex].value, heapType)) {
        targetIndex = leftIndex;
      }
      heap[leftIndex].state = 'default';
    }

    if (rightIndex < n) {
      comparisons++;
      heap[currentIndex].state = 'current';
      heap[rightIndex].state = 'comparing';
      steps.push({
        id: stepId++,
        description: `Comparing ${heap[currentIndex].value} with right child ${heap[rightIndex].value}`,
        snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
        meta: createStepMeta({ comparisons, swaps, highlightColor: HEAP_STATE_COLORS.comparing }),
        activeIndices: [currentIndex, rightIndex],
      });
      if (compare(heap[rightIndex].value, heap[targetIndex].value, heapType)) {
        targetIndex = rightIndex;
      }
      heap[rightIndex].state = 'default';
    }

    if (targetIndex === currentIndex) {
      heap[currentIndex].state = 'inserted';
      steps.push({
        id: stepId++,
        description: `Heap property satisfied. ${heap[currentIndex].value} is in correct position.`,
        snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
        meta: createStepMeta({ comparisons, swaps, highlightColor: HEAP_STATE_COLORS.inserted }),
      });
      heapPropertySatisfied = true;
    } else {
      swaps++;
      heap[currentIndex].state = 'swapping';
      heap[targetIndex].state = 'swapping';
      steps.push({
        id: stepId++,
        description: `Swapping ${heap[currentIndex].value} with ${heap[targetIndex].value}`,
        snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
        meta: createStepMeta({ comparisons, swaps, highlightColor: HEAP_STATE_COLORS.swapping }),
        modifiedIndices: [currentIndex, targetIndex],
      });
      const temp = heap[currentIndex];
      heap[currentIndex] = heap[targetIndex];
      heap[targetIndex] = temp;
      heap[currentIndex].state = 'default';
      heap[targetIndex].state = 'current';
      currentIndex = targetIndex;
    }
  }

  heap.forEach((e) => (e.state = 'default'));
  steps.push({
    id: stepId++,
    description: `Pop complete. Removed ${rootValue} from the heap.`,
    snapshot: { data: { elements: heap.map((e) => ({ ...e })), heapType } },
    meta: createStepMeta({ comparisons, swaps, highlightColor: HEAP_STATE_COLORS.default }),
  });

  return steps;
}

export function createInitialHeap(): HeapElement[] {
  return [50, 30, 40, 10, 20, 35, 25].map((value) => ({ value, state: 'default' as HeapNodeState }));
}
