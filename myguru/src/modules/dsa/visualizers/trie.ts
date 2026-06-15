/**
 * Trie (prefix tree) step generator.
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step } from '../core/types';
import { createStepMeta } from '../core/types';

export type TrieNodeState = 'default' | 'current' | 'visited' | 'found' | 'inserted' | 'notFound';

export interface TrieNodeData {
  id: string;
  char: string;
  isEndOfWord: boolean;
  children: TrieNodeData[];
  state: TrieNodeState;
  depth: number;
  x?: number;
  y?: number;
}

export interface TrieData {
  root: TrieNodeData;
  words: string[];
  currentWord?: string;
  matchingWords?: string[];
}

export const TRIE_NODE_STATE_COLORS: Record<TrieNodeState, string> = {
  default: '#374151',
  current: '#f59e0b',
  visited: '#6366f1',
  found: '#10b981',
  inserted: '#22c55e',
  notFound: '#ef4444',
};

function createTrieNode(char: string, depth: number): TrieNodeData {
  return {
    id: `${depth}-${char}-${Math.random().toString(36).slice(2, 7)}`,
    char,
    isEndOfWord: false,
    children: [],
    state: 'default',
    depth,
  };
}

export function createEmptyTrie(): TrieData {
  return { root: createTrieNode('', 0), words: [] };
}

function cloneTrieNode(node: TrieNodeData): TrieNodeData {
  return { ...node, children: node.children.map((child) => cloneTrieNode(child)) };
}

function cloneTrie(trie: TrieData): TrieData {
  return {
    root: cloneTrieNode(trie.root),
    words: [...trie.words],
    currentWord: trie.currentWord,
    matchingWords: trie.matchingWords ? [...trie.matchingWords] : undefined,
  };
}

function resetTrieState(node: TrieNodeData): void {
  node.state = 'default';
  for (const child of node.children) resetTrieState(child);
}

function findChild(node: TrieNodeData, char: string): TrieNodeData | undefined {
  return node.children.find((child) => child.char === char);
}

function insertWordIntoTrie(root: TrieNodeData, word: string): void {
  let current = root;
  for (const char of word) {
    let child = findChild(current, char);
    if (!child) {
      child = createTrieNode(char, current.depth + 1);
      current.children.push(child);
      current.children.sort((a, b) => a.char.localeCompare(b.char));
    }
    current = child;
  }
  current.isEndOfWord = true;
}

export function createSampleTrie(): TrieData {
  const trie = createEmptyTrie();
  const words = ['cat', 'car', 'card', 'care', 'cart', 'dog', 'do', 'dot'];
  for (const word of words) insertWordIntoTrie(trie.root, word);
  trie.words = [...words].sort();
  return trie;
}

export function generateInsertSteps(trie: TrieData, word: string): Step<TrieData>[] {
  const steps: Step<TrieData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingTrie = cloneTrie(trie);
  resetTrieState(workingTrie.root);

  steps.push({
    id: stepId++,
    description: `Inserting word: "${word}"`,
    snapshot: { data: { ...cloneTrie(workingTrie), currentWord: word } },
    meta: createStepMeta({ highlightColor: TRIE_NODE_STATE_COLORS.default }),
  });

  let current = workingTrie.root;
  current.state = 'current';

  steps.push({
    id: stepId++,
    description: 'Starting at root node',
    snapshot: { data: { ...cloneTrie(workingTrie), currentWord: word } },
    meta: createStepMeta({ highlightColor: TRIE_NODE_STATE_COLORS.current }),
  });

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    comparisons++;
    current.state = 'visited';

    let child = findChild(current, char);
    const isNew = !child;

    if (!child) {
      child = createTrieNode(char, current.depth + 1);
      current.children.push(child);
      current.children.sort((a, b) => a.char.localeCompare(b.char));
    }

    child.state = isNew ? 'inserted' : 'current';

    steps.push({
      id: stepId++,
      description: isNew ? `Created new node for '${char}'` : `Found existing node for '${char}'`,
      snapshot: { data: { ...cloneTrie(workingTrie), currentWord: word } },
      meta: createStepMeta({
        comparisons,
        highlightColor: isNew ? TRIE_NODE_STATE_COLORS.inserted : TRIE_NODE_STATE_COLORS.current,
      }),
    });

    current = child;
  }

  current.isEndOfWord = true;
  current.state = 'inserted';

  if (!workingTrie.words.includes(word)) {
    workingTrie.words.push(word);
    workingTrie.words.sort();
  }

  steps.push({
    id: stepId++,
    description: `Marked '${word[word.length - 1]}' as end of word. "${word}" inserted!`,
    snapshot: { data: { ...cloneTrie(workingTrie), currentWord: word } },
    meta: createStepMeta({ comparisons, highlightColor: TRIE_NODE_STATE_COLORS.inserted }),
  });

  return steps;
}

export function generateSearchSteps(trie: TrieData, word: string): Step<TrieData>[] {
  const steps: Step<TrieData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingTrie = cloneTrie(trie);
  resetTrieState(workingTrie.root);

  steps.push({
    id: stepId++,
    description: `Searching for word: "${word}"`,
    snapshot: { data: { ...cloneTrie(workingTrie), currentWord: word } },
    meta: createStepMeta({ highlightColor: TRIE_NODE_STATE_COLORS.default }),
  });

  let current = workingTrie.root;
  current.state = 'current';

  steps.push({
    id: stepId++,
    description: 'Starting at root node',
    snapshot: { data: { ...cloneTrie(workingTrie), currentWord: word } },
    meta: createStepMeta({ highlightColor: TRIE_NODE_STATE_COLORS.current }),
  });

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    comparisons++;
    current.state = 'visited';

    const child = findChild(current, char);
    if (!child) {
      steps.push({
        id: stepId++,
        description: `Character '${char}' not found! Word "${word}" does not exist.`,
        snapshot: { data: { ...cloneTrie(workingTrie), currentWord: word } },
        meta: createStepMeta({ comparisons, highlightColor: TRIE_NODE_STATE_COLORS.notFound }),
      });
      return steps;
    }

    child.state = 'current';
    steps.push({
      id: stepId++,
      description: `Found '${char}'`,
      snapshot: { data: { ...cloneTrie(workingTrie), currentWord: word } },
      meta: createStepMeta({ comparisons, highlightColor: TRIE_NODE_STATE_COLORS.current }),
    });

    current = child;
  }

  if (current.isEndOfWord) {
    current.state = 'found';
    steps.push({
      id: stepId++,
      description: `Word "${word}" found in trie!`,
      snapshot: { data: { ...cloneTrie(workingTrie), currentWord: word } },
      meta: createStepMeta({ comparisons, highlightColor: TRIE_NODE_STATE_COLORS.found }),
    });
  } else {
    current.state = 'notFound';
    steps.push({
      id: stepId++,
      description: `"${word}" is a prefix but not a complete word in the trie.`,
      snapshot: { data: { ...cloneTrie(workingTrie), currentWord: word } },
      meta: createStepMeta({ comparisons, highlightColor: TRIE_NODE_STATE_COLORS.notFound }),
    });
  }

  return steps;
}

export function generatePrefixSteps(trie: TrieData, prefix: string): Step<TrieData>[] {
  const steps: Step<TrieData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingTrie = cloneTrie(trie);
  resetTrieState(workingTrie.root);

  steps.push({
    id: stepId++,
    description: `Finding all words with prefix: "${prefix}"`,
    snapshot: { data: { ...cloneTrie(workingTrie), currentWord: prefix, matchingWords: [] } },
    meta: createStepMeta({ highlightColor: TRIE_NODE_STATE_COLORS.default }),
  });

  let current = workingTrie.root;
  current.state = 'current';

  for (let i = 0; i < prefix.length; i++) {
    const char = prefix[i];
    comparisons++;
    current.state = 'visited';
    const child = findChild(current, char);

    if (!child) {
      steps.push({
        id: stepId++,
        description: `Prefix "${prefix}" not found. No matching words.`,
        snapshot: { data: { ...cloneTrie(workingTrie), currentWord: prefix, matchingWords: [] } },
        meta: createStepMeta({ comparisons, highlightColor: TRIE_NODE_STATE_COLORS.notFound }),
      });
      return steps;
    }

    child.state = 'current';
    steps.push({
      id: stepId++,
      description: `Found prefix character '${char}'`,
      snapshot: { data: { ...cloneTrie(workingTrie), currentWord: prefix } },
      meta: createStepMeta({ comparisons, highlightColor: TRIE_NODE_STATE_COLORS.current }),
    });

    current = child;
  }

  const matchingWords: string[] = [];
  const basePrefix = prefix.slice(0, -1);

  function collectAndMark(node: TrieNodeData, pathPrefix: string): void {
    node.state = 'found';
    if (node.isEndOfWord) matchingWords.push(pathPrefix + node.char);
    for (const child of node.children) collectAndMark(child, pathPrefix + node.char);
  }

  collectAndMark(current, basePrefix);

  steps.push({
    id: stepId++,
    description: `Found ${matchingWords.length} word(s) with prefix "${prefix}": ${matchingWords.join(', ') || '(none)'}`,
    snapshot: { data: { ...cloneTrie(workingTrie), currentWord: prefix, matchingWords } },
    meta: createStepMeta({ comparisons, highlightColor: TRIE_NODE_STATE_COLORS.found }),
  });

  return steps;
}

export function calculateTrieLayout(
  node: TrieNodeData,
  x: number,
  y: number,
  horizontalSpacing: number,
  verticalSpacing: number
): { width: number } {
  node.x = x;
  node.y = y;

  if (node.children.length === 0) return { width: horizontalSpacing };

  let totalWidth = 0;
  let childX = x;

  for (const child of node.children) {
    const result = calculateTrieLayout(child, childX, y + verticalSpacing, horizontalSpacing, verticalSpacing);
    childX += result.width;
    totalWidth += result.width;
  }

  const firstChild = node.children[0];
  const lastChild = node.children[node.children.length - 1];
  node.x = ((firstChild.x ?? 0) + (lastChild.x ?? 0)) / 2;

  return { width: Math.max(totalWidth, horizontalSpacing) };
}

export const trieConfig = {
  id: 'trie',
  name: 'Trie (Prefix Tree)',
  description: 'Tree structure for efficient string search, insert, and prefix matching.',
  defaultSpeed: 600,
};
