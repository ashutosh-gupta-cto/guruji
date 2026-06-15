/**
 * B+ tree engine with step-by-step animations.
 * Ported from Yusux/BPlusTreeVisualizer.
 */
import type {
  AnimationStep,
  BPlusTreeNode,
  HighlightInfo,
  InternalNode,
  LeafNode,
} from './types';
import { isInternalNode, isLeafNode } from './types';

let nodeIdCounter = 0;

export class BPlusTree {
  root: BPlusTreeNode | null;
  order: number;
  minLeafKeys: number;
  minKeys: number;

  constructor(order: number) {
    if (order < 3) throw new Error('Order must be at least 3');
    this.order = order;
    this.root = null;
    this.minKeys = Math.ceil(order / 2) - 1;
    this.minLeafKeys = Math.ceil(order / 2);
  }

  private cloneTree(root: BPlusTreeNode | null): BPlusTreeNode | null {
    if (!root) return null;
    const allNodes: BPlusTreeNode[] = [];
    const queue: BPlusTreeNode[] = [root];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const node = queue.shift()!;
      if (visited.has(node.id)) continue;
      visited.add(node.id);
      allNodes.push(node);
      if (isInternalNode(node)) queue.push(...node.children);
    }

    const nodeMap = new Map<string, BPlusTreeNode>();
    allNodes.forEach((node) => {
      const copy = { ...node, keys: [...node.keys] } as BPlusTreeNode;
      if (isInternalNode(copy)) copy.children = [...(node as InternalNode).children];
      if (isLeafNode(copy)) copy.values = [...(node as LeafNode).values];
      nodeMap.set(node.id, copy);
    });

    nodeMap.forEach((copy) => {
      const orig = allNodes.find((n) => n.id === copy.id)!;
      if (orig.parent) copy.parent = (nodeMap.get(orig.parent.id) as InternalNode) ?? null;
      if (isInternalNode(copy) && isInternalNode(orig)) {
        copy.children = orig.children.map((c) => nodeMap.get(c.id)!);
      }
      if (isLeafNode(copy) && isLeafNode(orig)) {
        const o = orig as LeafNode;
        const c = copy as LeafNode;
        if (o.next) c.next = (nodeMap.get(o.next.id) as LeafNode) ?? null;
        if (o.prev) c.prev = (nodeMap.get(o.prev.id) as LeafNode) ?? null;
      }
    });

    return nodeMap.get(root.id) ?? null;
  }

  private addStep(
    steps: AnimationStep[],
    tree: BPlusTreeNode | null,
    type: AnimationStep['type'],
    message: string,
    highlights: HighlightInfo,
    extra: object = {},
  ) {
    steps.push({ type, message, highlights, treeState: this.cloneTree(tree), ...extra });
  }

  findChildIndex(node: InternalNode, key: number): number {
    let i = 0;
    while (i < node.keys.length && key >= node.keys[i]) i++;
    return i;
  }

  getFindAnimation(key: number): AnimationStep[] {
    const steps: AnimationStep[] = [];
    if (!this.root) {
      this.addStep(steps, null, 'no-change', `Key ${key} not found in empty tree.`, {});
      return steps;
    }
    this.addStep(steps, this.root, 'start', `Searching for key ${key}.`, { nodes: [this.root.id] });

    let node = this.root;
    const pathIds = [node.id];
    while (isInternalNode(node)) {
      const child = node.children[this.findChildIndex(node, key)];
      pathIds.push(child.id);
      this.addStep(steps, this.root, 'traverse', `Traversing based on key ${key}.`, { nodes: [...pathIds] });
      node = child;
    }

    const leaf = node as LeafNode;
    const keyIndex = leaf.keys.indexOf(key);
    if (keyIndex !== -1) {
      this.addStep(steps, this.root, 'found', `Key ${key} found in leaf node.`, {
        nodes: pathIds,
        keys: [{ nodeId: leaf.id, keyIndex }],
      });
    } else {
      this.addStep(steps, this.root, 'no-change', `Key ${key} not found.`, { nodes: pathIds });
    }
    return steps;
  }

  getInsertAnimation(key: number, value: unknown): AnimationStep[] {
    const steps: AnimationStep[] = [];
    if (this.find(key)) {
      this.addStep(steps, this.root, 'no-change', `Error: Key ${key} already exists.`, {});
      return steps;
    }
    const temp = new BPlusTree(this.order);
    temp.root = this.cloneTree(this.root);
    this.addStep(steps, temp.root, 'start', `Starting insertion of key ${key}.`, {});
    temp.insert(key, value, steps);
    this.addStep(steps, temp.root, 'final', `Insertion of ${key} complete.`, {});
    return steps;
  }

  getDeleteAnimation(key: number): AnimationStep[] {
    const steps: AnimationStep[] = [];
    const temp = new BPlusTree(this.order);
    temp.root = this.cloneTree(this.root);
    const leaf = temp.findLeaf(key, steps);
    const keyIndex = leaf ? leaf.keys.indexOf(key) : -1;
    if (!leaf || keyIndex === -1) {
      this.addStep(steps, this.root, 'no-change', `Key ${key} not found for deletion.`, {});
      return steps;
    }
    this.addStep(steps, temp.root, 'found', `Found key ${key}. Preparing to delete.`, {
      nodes: [leaf.id],
      keys: [{ nodeId: leaf.id, keyIndex }],
    });
    temp.delete(key, steps);
    this.addStep(steps, temp.root, 'final', `Deletion of ${key} complete.`, {});
    return steps;
  }

  find(key: number): boolean {
    if (!this.root) return false;
    let node: BPlusTreeNode = this.root;
    while (isInternalNode(node)) node = node.children[this.findChildIndex(node, key)];
    return (node as LeafNode).keys.includes(key);
  }

  insert(key: number, value: unknown, steps?: AnimationStep[]): void {
    if (!this.root) {
      this.root = this.createLeafNode([key], [value]);
      if (steps)
        this.addStep(steps, this.root, 'new-root', `Tree empty — created root leaf for ${key}.`, {
          nodes: [this.root.id],
        });
      return;
    }

    let node = this.root;
    const pathIds = [this.root.id];
    while (isInternalNode(node)) {
      if (steps)
        this.addStep(steps, this.root, 'traverse', `Finding leaf for ${key}.`, { nodes: [...pathIds] });
      node = node.children[this.findChildIndex(node, key)];
      pathIds.push(node.id);
    }

    const leaf = node as LeafNode;
    if (steps)
      this.addStep(steps, this.root, 'found', `Insert into leaf for key ${key}.`, { nodes: pathIds });

    let i = 0;
    while (i < leaf.keys.length && key > leaf.keys[i]) i++;
    leaf.keys.splice(i, 0, key);
    leaf.values.splice(i, 0, value);

    if (leaf.keys.length > this.order) this.splitLeaf(leaf, steps);
  }

  private splitLeaf(leaf: LeafNode, steps?: AnimationStep[]) {
    const mid = Math.ceil(leaf.keys.length / 2);
    const newLeaf = this.createLeafNode(leaf.keys.splice(mid), leaf.values.splice(mid));
    newLeaf.next = leaf.next;
    if (leaf.next) leaf.next.prev = newLeaf;
    leaf.next = newLeaf;
    newLeaf.prev = leaf;
    const pushedKey = newLeaf.keys[0];
    if (steps)
      this.addStep(
        steps,
        this.root,
        'split',
        `Leaf full — split and push ${pushedKey} up.`,
        { nodes: [leaf.id, newLeaf.id] },
        {
          splitInfo: {
            oldNodeId: leaf.id,
            newNodeId: newLeaf.id,
            pushedKey,
            pushedToNodeId: leaf.parent?.id ?? null,
          },
        },
      );
    this.insertIntoParent(leaf, pushedKey, newLeaf, steps);
  }

  private insertIntoParent(left: BPlusTreeNode, key: number, right: BPlusTreeNode, steps?: AnimationStep[]) {
    const parent = left.parent;
    if (!parent) {
      const newRoot = this.createInternalNode([key], [left, right]);
      this.root = newRoot;
      left.parent = newRoot;
      right.parent = newRoot;
      if (steps)
        this.addStep(steps, this.root, 'new-root', 'Created new root after split.', { nodes: [newRoot.id] });
      return;
    }
    const idx = parent.children.indexOf(left);
    parent.keys.splice(idx, 0, key);
    parent.children.splice(idx + 1, 0, right);
    right.parent = parent;
    if (steps)
      this.addStep(steps, this.root, 'update-parent', `Inserted ${key} into parent.`, { nodes: [parent.id] });
    if (parent.children.length > this.order) this.splitInternal(parent, steps);
  }

  private splitInternal(node: InternalNode, steps?: AnimationStep[]) {
    const mid = Math.floor(this.order / 2);
    const median = node.keys.splice(mid, 1)[0];
    const newNode = this.createInternalNode(node.keys.splice(mid), node.children.splice(mid + 1));
    newNode.children.forEach((c) => (c.parent = newNode));
    if (steps)
      this.addStep(
        steps,
        this.root,
        'split',
        `Internal node full — split at ${median}.`,
        { nodes: [node.id, newNode.id] },
        {
          splitInfo: {
            oldNodeId: node.id,
            newNodeId: newNode.id,
            pushedKey: median,
            pushedToNodeId: node.parent?.id ?? null,
          },
        },
      );
    this.insertIntoParent(node, median, newNode, steps);
  }

  private findLeaf(key: number, steps?: AnimationStep[]): LeafNode | null {
    if (!this.root) return null;
    let node = this.root;
    const pathIds = [node.id];
    if (steps) this.addStep(steps, this.root, 'start', `Searching for ${key}.`, { nodes: pathIds });
    while (isInternalNode(node)) {
      node = node.children[this.findChildIndex(node, key)];
      pathIds.push(node.id);
      if (steps) this.addStep(steps, this.root, 'traverse', 'Traversing…', { nodes: [...pathIds] });
    }
    return node as LeafNode;
  }

  delete(key: number, steps?: AnimationStep[]): boolean {
    if (!this.root) return false;
    const leaf = this.findLeaf(key);
    if (!leaf) return false;
    const idx = leaf.keys.indexOf(key);
    if (idx === -1) return false;

    leaf.keys.splice(idx, 1);
    leaf.values.splice(idx, 1);

    if (leaf === this.root) {
      if (leaf.keys.length === 0) this.root = null;
      return true;
    }

    if (leaf.keys.length < this.minLeafKeys) this.handleUnderflow(leaf, steps);
    return true;
  }

  private handleUnderflow(node: BPlusTreeNode, steps?: AnimationStep[]) {
    if (steps)
      this.addStep(steps, this.root, 'merge', `Node underflow — rebalancing.`, { nodes: [node.id] });
    const parent = node.parent!;
    const idx = parent.children.indexOf(node);

    if (idx > 0) {
      const left = parent.children[idx - 1];
      if (isLeafNode(left) && left.keys.length > this.minLeafKeys) {
        if (steps) this.addStep(steps, this.root, 'borrow-left', 'Borrow from left sibling.', { nodes: [node.id, left.id] });
        (node as LeafNode).keys.unshift(left.keys.pop()!);
        (node as LeafNode).values.unshift(left.values.pop()!);
        parent.keys[idx - 1] = (node as LeafNode).keys[0];
        return;
      }
    }
    if (idx < parent.children.length - 1) {
      const right = parent.children[idx + 1];
      if (isLeafNode(right) && right.keys.length > this.minLeafKeys) {
        if (steps) this.addStep(steps, this.root, 'borrow-right', 'Borrow from right sibling.', { nodes: [node.id, right.id] });
        (node as LeafNode).keys.push(right.keys.shift()!);
        (node as LeafNode).values.push(right.values.shift()!);
        parent.keys[idx] = (right as LeafNode).keys[0];
        return;
      }
    }

    const left = idx > 0 ? parent.children[idx - 1] : node;
    const right = idx > 0 ? node : parent.children[idx + 1];
    if (steps) this.addStep(steps, this.root, 'merge', 'Merge with sibling.', { nodes: [left.id, right.id] });
    if (isLeafNode(left) && isLeafNode(right)) {
      left.keys.push(...right.keys);
      left.values.push(...right.values);
      left.next = right.next;
      if (right.next) right.next.prev = left;
    }
    parent.keys.splice(idx > 0 ? idx - 1 : idx, 1);
    parent.children.splice(idx > 0 ? idx : idx + 1, 1);
    if (parent === this.root && parent.keys.length === 0) {
      this.root = left;
      left.parent = null;
    }
  }

  private createLeafNode(keys: number[], values: unknown[]): LeafNode {
    return { id: `leaf-${nodeIdCounter++}`, keys, values, isLeaf: true, parent: null, prev: null, next: null };
  }

  private createInternalNode(keys: number[], children: BPlusTreeNode[]): InternalNode {
    return { id: `internal-${nodeIdCounter++}`, keys, children, isLeaf: false, parent: null };
  }

  static fromKeys(order: number, keys: number[]): BPlusTree {
    nodeIdCounter = 0;
    const tree = new BPlusTree(order);
    keys.forEach((k) => tree.insert(k, k));
    return tree;
  }

  static resetCounter(): void {
    nodeIdCounter = 0;
  }
}

export function collectNodes(root: BPlusTreeNode | null): BPlusTreeNode[] {
  if (!root) return [];
  const nodes: BPlusTreeNode[] = [];
  const queue = [root];
  const seen = new Set<string>();
  while (queue.length) {
    const n = queue.shift()!;
    if (seen.has(n.id)) continue;
    seen.add(n.id);
    nodes.push(n);
    if (isInternalNode(n)) queue.push(...n.children);
  }
  return nodes;
}
