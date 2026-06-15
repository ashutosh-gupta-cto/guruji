/**
 * Stack step generator.
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step } from '../core/types';
import { createStepMeta } from '../core/types';

export type StackElementState = 'default' | 'pushing' | 'popping' | 'top';

export interface StackElement {
  value: number;
  state: StackElementState;
}

export interface StackData {
  elements: StackElement[];
  maxSize: number;
}

export const STACK_STATE_COLORS: Record<StackElementState, string> = {
  default: '#60a5fa',
  pushing: '#4ade80',
  popping: '#f87171',
  top: '#fbbf24',
};

export const STACK_MAX_SIZE = 8;

export function generatePushSteps(
  stack: StackElement[],
  value: number,
  maxSize: number
): Step<StackData>[] {
  const steps: Step<StackData>[] = [];
  let stepId = 0;
  let writes = 0;

  const initialElements = stack.map((e, i) => ({
    ...e,
    state: (i === stack.length - 1 ? 'top' : 'default') as StackElementState,
  }));

  steps.push({
    id: stepId++,
    description: `Preparing to push ${value} onto the stack`,
    snapshot: { data: { elements: initialElements, maxSize } },
    meta: createStepMeta({ writes, highlightedLine: 1, highlightColor: STACK_STATE_COLORS.default }),
  });

  if (stack.length >= maxSize) {
    steps.push({
      id: stepId++,
      description: `Stack overflow! Cannot push ${value} — stack is full`,
      snapshot: { data: { elements: initialElements, maxSize } },
      meta: createStepMeta({ writes, highlightedLine: 2, highlightColor: STACK_STATE_COLORS.popping }),
    });
    return steps;
  }

  const pushingElements = [
    ...stack.map((e) => ({ ...e, state: 'default' as StackElementState })),
    { value, state: 'pushing' as StackElementState },
  ];
  writes++;

  steps.push({
    id: stepId++,
    description: `Pushing ${value} onto the stack`,
    snapshot: { data: { elements: pushingElements, maxSize } },
    meta: createStepMeta({ writes, highlightedLine: 3, highlightColor: STACK_STATE_COLORS.pushing }),
  });

  const finalElements = [
    ...stack.map((e) => ({ ...e, state: 'default' as StackElementState })),
    { value, state: 'top' as StackElementState },
  ];

  steps.push({
    id: stepId++,
    description: `Successfully pushed ${value}. Stack size: ${finalElements.length}`,
    snapshot: { data: { elements: finalElements, maxSize } },
    meta: createStepMeta({ writes, highlightedLine: 4, highlightColor: STACK_STATE_COLORS.top }),
  });

  return steps;
}

export function generatePopSteps(stack: StackElement[], maxSize: number): Step<StackData>[] {
  const steps: Step<StackData>[] = [];
  let stepId = 0;
  let reads = 0;

  if (stack.length === 0) {
    steps.push({
      id: stepId++,
      description: 'Stack underflow! Cannot pop — stack is empty',
      snapshot: { data: { elements: [], maxSize } },
      meta: createStepMeta({ reads, highlightedLine: 1, highlightColor: STACK_STATE_COLORS.popping }),
    });
    return steps;
  }

  const initialElements = stack.map((e, i) => ({
    ...e,
    state: (i === stack.length - 1 ? 'top' : 'default') as StackElementState,
  }));

  steps.push({
    id: stepId++,
    description: `Preparing to pop from stack (top value: ${stack[stack.length - 1].value})`,
    snapshot: { data: { elements: initialElements, maxSize } },
    meta: createStepMeta({ reads, highlightedLine: 1, highlightColor: STACK_STATE_COLORS.top }),
  });

  reads++;
  const poppedValue = stack[stack.length - 1].value;
  const poppingElements = stack.map((e, i) => ({
    ...e,
    state: (i === stack.length - 1 ? 'popping' : 'default') as StackElementState,
  }));

  steps.push({
    id: stepId++,
    description: `Popping ${poppedValue} from the stack`,
    snapshot: { data: { elements: poppingElements, maxSize } },
    meta: createStepMeta({ reads, highlightedLine: 2, highlightColor: STACK_STATE_COLORS.popping }),
  });

  const remainingStack = stack.slice(0, -1);
  const finalElements = remainingStack.map((e, i) => ({
    ...e,
    state: (i === remainingStack.length - 1 ? 'top' : 'default') as StackElementState,
  }));

  steps.push({
    id: stepId++,
    description: `Popped ${poppedValue}. Stack size: ${finalElements.length}`,
    snapshot: { data: { elements: finalElements, maxSize } },
    meta: createStepMeta({ reads, highlightedLine: 3, highlightColor: STACK_STATE_COLORS.top }),
  });

  return steps;
}

export const stackConfig = {
  id: 'stack',
  name: 'Stack',
  description: 'Last-In-First-Out (LIFO) structure — push and pop at the top only.',
  defaultSpeed: 400,
};
