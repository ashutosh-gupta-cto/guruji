/**
 * Binary search tree step generators (insert + search).
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step } from '../core/types';
import { createStepMeta } from '../core/types';

export interface BSTNode {
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
}

export type BstNodeState = 'default' | 'current' | 'found' | 'visited' | 'inserting' | 'path';

export interface SnapshotNode {
  value: number;
  state: BstNodeState;
  left: SnapshotNode | null;
  right: SnapshotNode | null;
}

export interface BstData {
  root: SnapshotNode | null;
  message?: string;
}

export const BST_STATE_COLORS: Record<BstNodeState, string> = {
  default: '#60a5fa',
  current: '#fbbf24',
  found: '#4ade80',
  visited: '#a78bfa',
  inserting: '#22d3ee',
  path: '#f97316',
};

const NODE_RADIUS = 22;
const LEVEL_HEIGHT = 60;
const MIN_NODE_SPACING = 50;

export function insertIntoBST(root: BSTNode | null, value: number): BSTNode {
  if (!root) return { value, left: null, right: null };
  if (value < root.value) root.left = insertIntoBST(root.left, value);
  else if (value > root.value) root.right = insertIntoBST(root.right, value);
  return root;
}

function cloneBST(node: BSTNode | null): BSTNode | null {
  if (!node) return null;
  return { value: node.value, left: cloneBST(node.left), right: cloneBST(node.right) };
}

function bstToSnapshotNode(
  node: BSTNode | null,
  stateMap: Map<number, BstNodeState> = new Map()
): SnapshotNode | null {
  if (!node) return null;
  return {
    value: node.value,
    state: stateMap.get(node.value) ?? 'default',
    left: bstToSnapshotNode(node.left, stateMap),
    right: bstToSnapshotNode(node.right, stateMap),
  };
}

function getSnapshotTreeDepth(node: SnapshotNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(getSnapshotTreeDepth(node.left), getSnapshotTreeDepth(node.right));
}

export interface RenderNode {
  value: number;
  x: number;
  y: number;
  state: BstNodeState;
  left: RenderNode | null;
  right: RenderNode | null;
}

function calculatePositions(
  node: SnapshotNode | null,
  x: number,
  y: number,
  horizontalSpread: number
): RenderNode | null {
  if (!node) return null;
  return {
    value: node.value,
    x,
    y,
    state: node.state,
    left: calculatePositions(node.left, x - horizontalSpread, y + LEVEL_HEIGHT, horizontalSpread / 2),
    right: calculatePositions(node.right, x + horizontalSpread, y + LEVEL_HEIGHT, horizontalSpread / 2),
  };
}

export function snapshotToRenderTree(root: SnapshotNode | null, canvasWidth: number): RenderNode | null {
  if (!root) return null;
  const depth = getSnapshotTreeDepth(root);
  const padding = 20;
  const initialSpread = Math.min(
    (canvasWidth - padding * 2) / 4,
    MIN_NODE_SPACING * 2 ** Math.max(0, depth - 1)
  );
  return calculatePositions(root, canvasWidth / 2, padding + NODE_RADIUS + 20, initialSpread);
}

export function collectRenderNodes(node: RenderNode | null, out: RenderNode[] = []): RenderNode[] {
  if (!node) return out;
  collectRenderNodes(node.left, out);
  out.push(node);
  collectRenderNodes(node.right, out);
  return out;
}

export function collectRenderEdges(
  node: RenderNode | null,
  out: { x1: number; y1: number; x2: number; y2: number }[] = []
): typeof out {
  if (!node) return out;
  if (node.left) {
    out.push({ x1: node.x, y1: node.y, x2: node.left.x, y2: node.left.y });
    collectRenderEdges(node.left, out);
  }
  if (node.right) {
    out.push({ x1: node.x, y1: node.y, x2: node.right.x, y2: node.right.y });
    collectRenderEdges(node.right, out);
  }
  return out;
}

export function createSampleBST(): BSTNode | null {
  let root: BSTNode | null = null;
  for (const v of [50, 30, 70, 20, 40, 60, 80]) {
    root = insertIntoBST(root, v);
  }
  return root;
}

export function generateInsertSteps(root: BSTNode | null, value: number): Step<BstData>[] {
  const steps: Step<BstData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  steps.push({
    id: stepId++,
    description: `Inserting value ${value} into BST`,
    snapshot: { data: { root: bstToSnapshotNode(root) } },
    meta: createStepMeta({ comparisons, highlightColor: BST_STATE_COLORS.default }),
  });

  if (!root) {
    const newRoot: BSTNode = { value, left: null, right: null };
    steps.push({
      id: stepId++,
      description: `Tree is empty. Creating root node with value ${value}`,
      snapshot: {
        data: { root: bstToSnapshotNode(newRoot, new Map([[value, 'inserting']])) },
      },
      meta: createStepMeta({ comparisons, highlightColor: BST_STATE_COLORS.inserting }),
    });
    steps.push({
      id: stepId++,
      description: `Successfully inserted ${value} as root`,
      snapshot: {
        data: { root: bstToSnapshotNode(newRoot, new Map([[value, 'found']])) },
      },
      meta: createStepMeta({ comparisons, highlightColor: BST_STATE_COLORS.found }),
    });
    return steps;
  }

  let current: BSTNode | null = root;
  const path: number[] = [];

  while (current) {
    comparisons++;
    path.push(current.value);
    const pathMap = new Map<number, BstNodeState>();
    path.forEach((v, i) => pathMap.set(v, i === path.length - 1 ? 'current' : 'path'));

    if (value === current.value) {
      pathMap.set(current.value, 'found');
      steps.push({
        id: stepId++,
        description: `Value ${value} already exists in tree. Skipping insertion.`,
        snapshot: { data: { root: bstToSnapshotNode(root, pathMap) } },
        meta: createStepMeta({ comparisons, highlightColor: BST_STATE_COLORS.found }),
      });
      return steps;
    }

    if (value < current.value) {
      steps.push({
        id: stepId++,
        description: `${value} < ${current.value}, go left`,
        snapshot: { data: { root: bstToSnapshotNode(root, pathMap) } },
        meta: createStepMeta({ comparisons, highlightColor: BST_STATE_COLORS.current }),
      });
      if (!current.left) {
        const newRoot = cloneBST(root)!;
        insertIntoBST(newRoot, value);
        const insertMap = new Map<number, BstNodeState>();
        path.forEach((v) => insertMap.set(v, 'path'));
        insertMap.set(value, 'inserting');
        steps.push({
          id: stepId++,
          description: `Found empty left slot. Inserting ${value}`,
          snapshot: { data: { root: bstToSnapshotNode(newRoot, insertMap) } },
          meta: createStepMeta({ comparisons, highlightColor: BST_STATE_COLORS.inserting }),
        });
        steps.push({
          id: stepId++,
          description: `Successfully inserted ${value}`,
          snapshot: { data: { root: bstToSnapshotNode(newRoot, new Map([[value, 'found']])) } },
          meta: createStepMeta({ comparisons, highlightColor: BST_STATE_COLORS.found }),
        });
        return steps;
      }
      current = current.left;
    } else {
      steps.push({
        id: stepId++,
        description: `${value} > ${current.value}, go right`,
        snapshot: { data: { root: bstToSnapshotNode(root, pathMap) } },
        meta: createStepMeta({ comparisons, highlightColor: BST_STATE_COLORS.current }),
      });
      if (!current.right) {
        const newRoot = cloneBST(root)!;
        insertIntoBST(newRoot, value);
        const insertMap = new Map<number, BstNodeState>();
        path.forEach((v) => insertMap.set(v, 'path'));
        insertMap.set(value, 'inserting');
        steps.push({
          id: stepId++,
          description: `Found empty right slot. Inserting ${value}`,
          snapshot: { data: { root: bstToSnapshotNode(newRoot, insertMap) } },
          meta: createStepMeta({ comparisons, highlightColor: BST_STATE_COLORS.inserting }),
        });
        steps.push({
          id: stepId++,
          description: `Successfully inserted ${value}`,
          snapshot: { data: { root: bstToSnapshotNode(newRoot, new Map([[value, 'found']])) } },
          meta: createStepMeta({ comparisons, highlightColor: BST_STATE_COLORS.found }),
        });
        return steps;
      }
      current = current.right;
    }
  }

  return steps;
}

export function generateSearchSteps(root: BSTNode | null, value: number): Step<BstData>[] {
  const steps: Step<BstData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  steps.push({
    id: stepId++,
    description: `Searching for value ${value}`,
    snapshot: { data: { root: bstToSnapshotNode(root) } },
    meta: createStepMeta({ comparisons, highlightColor: BST_STATE_COLORS.default }),
  });

  if (!root) {
    steps.push({
      id: stepId++,
      description: `Tree is empty. Value ${value} not found.`,
      snapshot: { data: { root: null, message: 'Not found' } },
      meta: createStepMeta({ comparisons, highlightColor: BST_STATE_COLORS.path }),
    });
    return steps;
  }

  let current: BSTNode | null = root;
  const path: number[] = [];

  while (current) {
    comparisons++;
    path.push(current.value);
    const pathMap = new Map<number, BstNodeState>();
    path.forEach((v, i) => pathMap.set(v, i === path.length - 1 ? 'current' : 'path'));

    if (value === current.value) {
      pathMap.set(current.value, 'found');
      steps.push({
        id: stepId++,
        description: `Found ${value}!`,
        snapshot: { data: { root: bstToSnapshotNode(root, pathMap), message: 'Found!' } },
        meta: createStepMeta({ comparisons, highlightColor: BST_STATE_COLORS.found }),
      });
      return steps;
    }

    const goLeft: boolean = value < current.value;
    steps.push({
      id: stepId++,
      description: goLeft
        ? `${value} < ${current.value}, go left`
        : `${value} > ${current.value}, go right`,
      snapshot: { data: { root: bstToSnapshotNode(root, pathMap) } },
      meta: createStepMeta({ comparisons, highlightColor: BST_STATE_COLORS.current }),
    });

    const next: BSTNode | null = goLeft ? current.left : current.right;
    if (!next) {
      const notFoundMap = new Map<number, BstNodeState>();
      path.forEach((v) => notFoundMap.set(v, 'path'));
      steps.push({
        id: stepId++,
        description: `No ${goLeft ? 'left' : 'right'} child. Value ${value} not found.`,
        snapshot: { data: { root: bstToSnapshotNode(root, notFoundMap), message: 'Not found' } },
        meta: createStepMeta({ comparisons, highlightColor: BST_STATE_COLORS.path }),
      });
      return steps;
    }
    current = next;
  }

  return steps;
}

export { cloneBST, bstToSnapshotNode };
