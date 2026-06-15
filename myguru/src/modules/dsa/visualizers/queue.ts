/**
 * Queue step generator.
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step } from '../core/types';
import { createStepMeta } from '../core/types';

export type QueueElementState = 'default' | 'enqueuing' | 'dequeuing' | 'front' | 'rear';

export interface QueueElement {
  value: number;
  state: QueueElementState;
}

export interface QueueData {
  elements: QueueElement[];
  maxSize: number;
}

export const QUEUE_STATE_COLORS: Record<QueueElementState, string> = {
  default: '#60a5fa',
  enqueuing: '#4ade80',
  dequeuing: '#f87171',
  front: '#fbbf24',
  rear: '#a78bfa',
};

export const QUEUE_MAX_SIZE = 8;

export function generateEnqueueSteps(
  queue: QueueElement[],
  value: number,
  maxSize: number
): Step<QueueData>[] {
  const steps: Step<QueueData>[] = [];
  let stepId = 0;
  let writes = 0;

  const initialElements = queue.map((e, i) => ({
    ...e,
    state: (i === 0 ? 'front' : i === queue.length - 1 ? 'rear' : 'default') as QueueElementState,
  }));

  steps.push({
    id: stepId++,
    description: `Preparing to enqueue ${value}`,
    snapshot: { data: { elements: initialElements, maxSize } },
    meta: createStepMeta({ writes, highlightedLine: 1, highlightColor: QUEUE_STATE_COLORS.default }),
  });

  if (queue.length >= maxSize) {
    steps.push({
      id: stepId++,
      description: `Queue is full! Cannot enqueue ${value}`,
      snapshot: { data: { elements: initialElements, maxSize } },
      meta: createStepMeta({ writes, highlightedLine: 2, highlightColor: QUEUE_STATE_COLORS.dequeuing }),
    });
    return steps;
  }

  writes++;
  const enqueuingElements = [
    ...queue.map((e, i) => ({
      ...e,
      state: (i === 0 ? 'front' : 'default') as QueueElementState,
    })),
    { value, state: 'enqueuing' as QueueElementState },
  ];

  steps.push({
    id: stepId++,
    description: `Adding ${value} to the rear of the queue`,
    snapshot: { data: { elements: enqueuingElements, maxSize } },
    meta: createStepMeta({ writes, highlightedLine: 3, highlightColor: QUEUE_STATE_COLORS.enqueuing }),
  });

  const finalElements = [
    ...queue.map((e, i) => ({
      ...e,
      state: (i === 0 ? 'front' : 'default') as QueueElementState,
    })),
    { value, state: 'rear' as QueueElementState },
  ];

  if (finalElements.length === 1) {
    finalElements[0].state = 'front';
  }

  steps.push({
    id: stepId++,
    description: `Successfully enqueued ${value}. Queue size: ${finalElements.length}`,
    snapshot: { data: { elements: finalElements, maxSize } },
    meta: createStepMeta({ writes, highlightedLine: 4, highlightColor: QUEUE_STATE_COLORS.rear }),
  });

  return steps;
}

export function generateDequeueSteps(queue: QueueElement[], maxSize: number): Step<QueueData>[] {
  const steps: Step<QueueData>[] = [];
  let stepId = 0;
  let reads = 0;

  if (queue.length === 0) {
    steps.push({
      id: stepId++,
      description: 'Queue is empty! Cannot dequeue',
      snapshot: { data: { elements: [], maxSize } },
      meta: createStepMeta({ reads, highlightedLine: 1, highlightColor: QUEUE_STATE_COLORS.dequeuing }),
    });
    return steps;
  }

  const initialElements = queue.map((e, i) => ({
    ...e,
    state: (i === 0 ? 'front' : i === queue.length - 1 ? 'rear' : 'default') as QueueElementState,
  }));

  steps.push({
    id: stepId++,
    description: `Preparing to dequeue (front value: ${queue[0].value})`,
    snapshot: { data: { elements: initialElements, maxSize } },
    meta: createStepMeta({ reads, highlightedLine: 1, highlightColor: QUEUE_STATE_COLORS.front }),
  });

  reads++;
  const dequeuedValue = queue[0].value;
  const dequeueingElements = queue.map((e, i) => ({
    ...e,
    state: (i === 0 ? 'dequeuing' : i === queue.length - 1 ? 'rear' : 'default') as QueueElementState,
  }));

  steps.push({
    id: stepId++,
    description: `Removing ${dequeuedValue} from the front of the queue`,
    snapshot: { data: { elements: dequeueingElements, maxSize } },
    meta: createStepMeta({ reads, highlightedLine: 2, highlightColor: QUEUE_STATE_COLORS.dequeuing }),
  });

  const remainingQueue = queue.slice(1);
  const finalElements = remainingQueue.map((e, i) => ({
    ...e,
    state: (i === 0 ? 'front' : i === remainingQueue.length - 1 ? 'rear' : 'default') as QueueElementState,
  }));

  steps.push({
    id: stepId++,
    description: `Dequeued ${dequeuedValue}. Queue size: ${finalElements.length}`,
    snapshot: { data: { elements: finalElements, maxSize } },
    meta: createStepMeta({ reads, highlightedLine: 3, highlightColor: QUEUE_STATE_COLORS.front }),
  });

  return steps;
}

export const queueConfig = {
  id: 'queue',
  name: 'Queue',
  description: 'First-In-First-Out (FIFO) structure — enqueue at rear, dequeue at front.',
  defaultSpeed: 400,
};
