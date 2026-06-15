export interface BPlusTreeNode {
  id: string;
  keys: number[];
  parent: InternalNode | null;
  isLeaf: boolean;
  children?: BPlusTreeNode[];
  values?: unknown[];
  prev?: LeafNode | null;
  next?: LeafNode | null;
}

export interface InternalNode extends BPlusTreeNode {
  isLeaf: false;
  children: BPlusTreeNode[];
}

export interface LeafNode extends BPlusTreeNode {
  isLeaf: true;
  values: unknown[];
  prev: LeafNode | null;
  next: LeafNode | null;
}

export interface FindResult {
  value: unknown;
  path: BPlusTreeNode[];
}

export function isInternalNode(node: BPlusTreeNode): node is InternalNode {
  return !node.isLeaf;
}

export function isLeafNode(node: BPlusTreeNode): node is LeafNode {
  return node.isLeaf;
}

export interface HighlightInfo {
  nodes?: string[];
  keys?: { nodeId: string; keyIndex: number }[];
}

export interface SplitInfo {
  oldNodeId: string;
  newNodeId: string;
  pushedKey: number;
  pushedToNodeId: string | null;
}

export interface AnimationStep {
  type:
    | 'start'
    | 'traverse'
    | 'found'
    | 'split'
    | 'merge'
    | 'borrow-left'
    | 'borrow-right'
    | 'update-parent'
    | 'new-root'
    | 'final'
    | 'no-change';
  treeState: BPlusTreeNode | null;
  message: string;
  highlights: HighlightInfo;
  splitInfo?: SplitInfo;
}
