/**
 * Singly linked list step generator.
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step } from '../core/types';
import { createStepMeta } from '../core/types';

export type LinkedListNodeState = 'default' | 'current' | 'found' | 'inserting' | 'deleting';

export interface LinkedListNode {
  id: string;
  value: number;
  state: LinkedListNodeState;
}

export interface LinkedListData {
  nodes: LinkedListNode[];
}

export const LINKED_LIST_STATE_COLORS: Record<LinkedListNodeState, string> = {
  default: '#60a5fa',
  current: '#fbbf24',
  found: '#4ade80',
  inserting: '#a78bfa',
  deleting: '#f87171',
};

let nodeIdCounter = 0;
function generateNodeId(): string {
  return `node-${++nodeIdCounter}`;
}

export function generateInsertAtTailSteps(
  nodes: LinkedListNode[],
  value: number
): Step<LinkedListData>[] {
  const steps: Step<LinkedListData>[] = [];
  let stepId = 0;
  let reads = 0;
  let writes = 0;

  steps.push({
    id: stepId++,
    description: `Preparing to insert ${value} at the tail`,
    snapshot: { data: { nodes: nodes.map((n) => ({ ...n, state: 'default' as LinkedListNodeState })) } },
    meta: createStepMeta({ reads, writes, highlightedLine: 1, highlightColor: LINKED_LIST_STATE_COLORS.default }),
  });

  if (nodes.length === 0) {
    writes++;
    const newNode: LinkedListNode = { id: generateNodeId(), value, state: 'inserting' };

    steps.push({
      id: stepId++,
      description: `List is empty. Creating new head node with value ${value}`,
      snapshot: { data: { nodes: [newNode] } },
      meta: createStepMeta({ reads, writes, highlightedLine: 2, highlightColor: LINKED_LIST_STATE_COLORS.inserting }),
    });

    steps.push({
      id: stepId++,
      description: `Successfully inserted ${value} as head`,
      snapshot: { data: { nodes: [{ ...newNode, state: 'default' }] } },
      meta: createStepMeta({ reads, writes, highlightedLine: 3, highlightColor: LINKED_LIST_STATE_COLORS.found }),
    });

    return steps;
  }

  for (let i = 0; i < nodes.length; i++) {
    reads++;
    const traverseNodes = nodes.map((n, idx) => ({
      ...n,
      state: (idx === i ? 'current' : 'default') as LinkedListNodeState,
    }));

    steps.push({
      id: stepId++,
      description:
        i === nodes.length - 1
          ? `Found tail node (value: ${nodes[i].value})`
          : `Traversing: visiting node ${i} (value: ${nodes[i].value})`,
      snapshot: { data: { nodes: traverseNodes } },
      meta: createStepMeta({ reads, writes, highlightedLine: 4, highlightColor: LINKED_LIST_STATE_COLORS.current }),
      activeIndices: [i],
    });
  }

  writes++;
  const newNode: LinkedListNode = { id: generateNodeId(), value, state: 'inserting' };
  const insertingNodes = [...nodes.map((n) => ({ ...n, state: 'default' as LinkedListNodeState })), newNode];

  steps.push({
    id: stepId++,
    description: `Inserting new node with value ${value} after tail`,
    snapshot: { data: { nodes: insertingNodes } },
    meta: createStepMeta({ reads, writes, highlightedLine: 5, highlightColor: LINKED_LIST_STATE_COLORS.inserting }),
  });

  const finalNodes = insertingNodes.map((n) => ({ ...n, state: 'default' as LinkedListNodeState }));
  steps.push({
    id: stepId++,
    description: `Successfully inserted ${value}. List length: ${finalNodes.length}`,
    snapshot: { data: { nodes: finalNodes } },
    meta: createStepMeta({ reads, writes, highlightedLine: 6, highlightColor: LINKED_LIST_STATE_COLORS.found }),
  });

  return steps;
}

export function generateDeleteByValueSteps(
  nodes: LinkedListNode[],
  value: number
): Step<LinkedListData>[] {
  const steps: Step<LinkedListData>[] = [];
  let stepId = 0;
  let reads = 0;
  let writes = 0;

  steps.push({
    id: stepId++,
    description: `Searching for node with value ${value} to delete`,
    snapshot: { data: { nodes: nodes.map((n) => ({ ...n, state: 'default' as LinkedListNodeState })) } },
    meta: createStepMeta({ reads, writes, highlightedLine: 1, highlightColor: LINKED_LIST_STATE_COLORS.default }),
  });

  if (nodes.length === 0) {
    steps.push({
      id: stepId++,
      description: 'List is empty. Nothing to delete.',
      snapshot: { data: { nodes: [] } },
      meta: createStepMeta({ reads, writes, highlightedLine: 2, highlightColor: LINKED_LIST_STATE_COLORS.deleting }),
    });
    return steps;
  }

  let foundIndex = -1;
  for (let i = 0; i < nodes.length; i++) {
    reads++;
    const searchNodes = nodes.map((n, idx) => ({
      ...n,
      state: (idx === i ? 'current' : 'default') as LinkedListNodeState,
    }));

    const isMatch = nodes[i].value === value;
    steps.push({
      id: stepId++,
      description: isMatch
        ? `Found ${value} at position ${i}!`
        : `Checking node ${i}: ${nodes[i].value} !== ${value}`,
      snapshot: { data: { nodes: searchNodes } },
      meta: createStepMeta({
        reads,
        writes,
        highlightedLine: 3,
        highlightColor: isMatch ? LINKED_LIST_STATE_COLORS.found : LINKED_LIST_STATE_COLORS.current,
      }),
      activeIndices: [i],
    });

    if (isMatch) {
      foundIndex = i;
      break;
    }
  }

  if (foundIndex === -1) {
    steps.push({
      id: stepId++,
      description: `Value ${value} not found in the list`,
      snapshot: { data: { nodes: nodes.map((n) => ({ ...n, state: 'default' as LinkedListNodeState })) } },
      meta: createStepMeta({ reads, writes, highlightedLine: 4, highlightColor: LINKED_LIST_STATE_COLORS.deleting }),
    });
    return steps;
  }

  writes++;
  const deletingNodes = nodes.map((n, idx) => ({
    ...n,
    state: (idx === foundIndex ? 'deleting' : 'default') as LinkedListNodeState,
  }));

  steps.push({
    id: stepId++,
    description: `Deleting node with value ${value}`,
    snapshot: { data: { nodes: deletingNodes } },
    meta: createStepMeta({ reads, writes, highlightedLine: 5, highlightColor: LINKED_LIST_STATE_COLORS.deleting }),
  });

  const remainingNodes = nodes
    .filter((_, idx) => idx !== foundIndex)
    .map((n) => ({ ...n, state: 'default' as LinkedListNodeState }));

  steps.push({
    id: stepId++,
    description: `Successfully deleted ${value}. List length: ${remainingNodes.length}`,
    snapshot: { data: { nodes: remainingNodes } },
    meta: createStepMeta({ reads, writes, highlightedLine: 6, highlightColor: LINKED_LIST_STATE_COLORS.found }),
  });

  return steps;
}

export const linkedListConfig = {
  id: 'linked-list',
  name: 'Singly Linked List',
  description: 'Linear nodes linked by pointers — insert at tail and delete by value.',
  defaultSpeed: 500,
};
