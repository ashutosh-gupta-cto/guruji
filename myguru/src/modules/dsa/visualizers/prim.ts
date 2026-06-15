/**
 * Prim's MST step generator.
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step } from '../core/types';
import { createStepMeta } from '../core/types';
import type { GraphData } from './graph-shared';
import {
  cloneGraph,
  EDGE_STATE_COLORS,
  NODE_STATE_COLORS,
  getEdgesForNode,
} from './graph-shared';

export interface PrimData extends GraphData {
  mstEdges: string[];
  mstWeight: number;
  visited: Set<string>;
  priorityQueue: Array<{ edgeId: string; weight: number }>;
}

interface HeapItem {
  edgeId: string;
  weight: number;
  source: string;
  target: string;
}

function heapPush(heap: HeapItem[], item: HeapItem): void {
  heap.push(item);
  let i = heap.length - 1;
  while (i > 0) {
    const parentIndex = Math.floor((i - 1) / 2);
    if (heap[parentIndex].weight <= heap[i].weight) break;
    [heap[parentIndex], heap[i]] = [heap[i], heap[parentIndex]];
    i = parentIndex;
  }
}

function heapPop(heap: HeapItem[]): HeapItem | undefined {
  if (heap.length === 0) return undefined;
  if (heap.length === 1) return heap.pop();

  const min = heap[0];
  heap[0] = heap.pop()!;
  let i = 0;
  const len = heap.length;

  while (true) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    let smallest = i;

    if (left < len && heap[left].weight < heap[smallest].weight) smallest = left;
    if (right < len && heap[right].weight < heap[smallest].weight) smallest = right;
    if (smallest === i) break;
    [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
    i = smallest;
  }

  return min;
}

export function generatePrimSteps(graph: GraphData, startNodeId?: string): Step<PrimData>[] {
  const steps: Step<PrimData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingGraph = cloneGraph(graph);
  const mstEdges: string[] = [];
  let mstWeight = 0;
  const visited = new Set<string>();
  const heap: HeapItem[] = [];

  const startNode = startNodeId
    ? workingGraph.nodes.find((n) => n.id === startNodeId)
    : workingGraph.nodes[0];

  if (!startNode || workingGraph.nodes.length === 0) return steps;

  const snapshot = (): PrimData => ({
    ...cloneGraph(workingGraph),
    mstEdges: [...mstEdges],
    mstWeight,
    visited: new Set(visited),
    priorityQueue: heap.map((h) => ({ edgeId: h.edgeId, weight: h.weight })),
  });

  steps.push({
    id: stepId++,
    description: `Prim's MST starting from node ${startNode.id}`,
    snapshot: { data: snapshot() },
    meta: createStepMeta({ highlightColor: NODE_STATE_COLORS.current }),
  });

  visited.add(startNode.id);
  const startNodeRef = workingGraph.nodes.find((n) => n.id === startNode.id)!;
  startNodeRef.state = 'inMST';

  const startEdges = getEdgesForNode(workingGraph.edges, startNode.id);
  for (const edge of startEdges) {
    const edgeRef = workingGraph.edges.find((e) => e.id === edge.id);
    if (edgeRef) edgeRef.state = 'considering';
    heapPush(heap, { edgeId: edge.id, weight: edge.weight, source: edge.source, target: edge.target });
  }

  steps.push({
    id: stepId++,
    description: `Added ${startEdges.length} edge(s) from ${startNode.id} to priority queue`,
    snapshot: { data: snapshot() },
    meta: createStepMeta({ highlightColor: EDGE_STATE_COLORS.considering }),
  });

  while (heap.length > 0 && mstEdges.length < workingGraph.nodes.length - 1) {
    const item = heapPop(heap);
    if (!item) break;

    const sourceVisited = visited.has(item.source);
    const targetVisited = visited.has(item.target);
    comparisons++;

    const edgeRef = workingGraph.edges.find((e) => e.id === item.edgeId);

    if (sourceVisited && targetVisited) {
      if (edgeRef) edgeRef.state = 'rejected';
      steps.push({
        id: stepId++,
        description: `Skip edge ${item.source}-${item.target}: both nodes already in MST`,
        snapshot: { data: snapshot() },
        meta: createStepMeta({ comparisons, highlightColor: EDGE_STATE_COLORS.rejected }),
      });
      if (edgeRef) edgeRef.state = 'default';
      continue;
    }

    const newNodeId = sourceVisited ? item.target : item.source;
    const newNodeRef = workingGraph.nodes.find((n) => n.id === newNodeId);

    if (edgeRef) edgeRef.state = 'considering';
    if (newNodeRef) newNodeRef.state = 'current';

    steps.push({
      id: stepId++,
      description: `Considering edge ${item.source}-${item.target} (weight: ${item.weight}) to add node ${newNodeId}`,
      snapshot: { data: snapshot() },
      meta: createStepMeta({ comparisons, highlightColor: EDGE_STATE_COLORS.considering }),
    });

    visited.add(newNodeId);
    mstEdges.push(item.edgeId);
    mstWeight += item.weight;

    if (edgeRef) edgeRef.state = 'inMST';
    if (newNodeRef) newNodeRef.state = 'inMST';

    const newEdges = getEdgesForNode(workingGraph.edges, newNodeId);
    let addedCount = 0;
    for (const newEdge of newEdges) {
      const otherNodeId = newEdge.source === newNodeId ? newEdge.target : newEdge.source;
      if (!visited.has(otherNodeId)) {
        const newEdgeRef = workingGraph.edges.find((e) => e.id === newEdge.id);
        if (newEdgeRef && newEdgeRef.state !== 'inMST') newEdgeRef.state = 'considering';
        heapPush(heap, {
          edgeId: newEdge.id,
          weight: newEdge.weight,
          source: newEdge.source,
          target: newEdge.target,
        });
        addedCount++;
      }
    }

    steps.push({
      id: stepId++,
      description: `Added ${item.source}-${item.target} to MST. Node ${newNodeId} added. ${addedCount} new edge(s) in queue. Total weight: ${mstWeight}`,
      snapshot: { data: snapshot() },
      meta: createStepMeta({ comparisons, highlightColor: EDGE_STATE_COLORS.inMST }),
    });
  }

  for (const edge of workingGraph.edges) {
    edge.state = mstEdges.includes(edge.id) ? 'inMST' : 'default';
  }
  for (const node of workingGraph.nodes) node.state = 'inMST';

  steps.push({
    id: stepId++,
    description: `Prim's complete! MST has ${mstEdges.length} edges with total weight ${mstWeight}`,
    snapshot: { data: snapshot() },
    meta: createStepMeta({ comparisons, highlightColor: NODE_STATE_COLORS.inMST }),
  });

  return steps;
}

export const primConfig = {
  id: 'prim',
  name: "Prim's MST",
  description: 'Grows MST from a start node, always adding the minimum frontier edge.',
  defaultSpeed: 800,
};
