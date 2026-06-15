/**
 * Dijkstra's algorithm step generator and graph types.
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step } from '../core/types';
import { createStepMeta } from '../core/types';

export type NodeState = 'default' | 'current' | 'visited' | 'inMST' | 'frontier' | 'path';
export type EdgeState = 'default' | 'considering' | 'inMST' | 'rejected' | 'path';

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  state: NodeState;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  state: EdgeState;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
}

export interface DijkstraData extends GraphData {
  distances: Map<string, number>;
  predecessors: Map<string, string | null>;
  visited: Set<string>;
  currentNode: string | null;
  sourceNode: string;
}

export const NODE_STATE_COLORS: Record<NodeState, string> = {
  default: '#60a5fa',
  current: '#fbbf24',
  visited: '#a78bfa',
  inMST: '#4ade80',
  frontier: '#f97316',
  path: '#22d3ee',
};

export const EDGE_STATE_COLORS: Record<EdgeState, string> = {
  default: '#4b5563',
  considering: '#fbbf24',
  inMST: '#4ade80',
  rejected: '#ef4444',
  path: '#22d3ee',
};

const INFINITY = 999999;

interface PQEntry {
  nodeId: string;
  distance: number;
}

class MinPriorityQueue {
  private heap: PQEntry[] = [];

  insert(nodeId: string, distance: number): void {
    this.heap.push({ nodeId, distance });
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin(): PQEntry | null {
    if (this.heap.length === 0) {
      return null;
    }
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return min;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].distance <= this.heap[index].distance) {
        break;
      }
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    let smallest = index;

    do {
      index = smallest;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < length && this.heap[leftChild].distance < this.heap[smallest].distance) {
        smallest = leftChild;
      }
      if (rightChild < length && this.heap[rightChild].distance < this.heap[smallest].distance) {
        smallest = rightChild;
      }
      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      }
    } while (smallest !== index);
  }
}

function cloneGraph(graph: GraphData): GraphData {
  return {
    directed: graph.directed,
    nodes: graph.nodes.map((n) => ({ ...n })),
    edges: graph.edges.map((e) => ({ ...e })),
  };
}

function cloneDijkstraSnapshot(
  graph: GraphData,
  distances: Map<string, number>,
  predecessors: Map<string, string | null>,
  visited: Set<string>,
  currentNode: string | null,
  sourceNode: string
): DijkstraData {
  return {
    ...cloneGraph(graph),
    distances: new Map(distances),
    predecessors: new Map(predecessors),
    visited: new Set(visited),
    currentNode,
    sourceNode,
  };
}

export function createSampleDijkstraGraph(): GraphData {
  return {
    nodes: [
      { id: 'A', x: 0.15, y: 0.5, state: 'default' },
      { id: 'B', x: 0.35, y: 0.25, state: 'default' },
      { id: 'C', x: 0.35, y: 0.75, state: 'default' },
      { id: 'D', x: 0.55, y: 0.25, state: 'default' },
      { id: 'E', x: 0.55, y: 0.75, state: 'default' },
      { id: 'F', x: 0.75, y: 0.5, state: 'default' },
      { id: 'G', x: 0.9, y: 0.5, state: 'default' },
    ],
    edges: [
      { id: 'AB', source: 'A', target: 'B', weight: 4, state: 'default' },
      { id: 'AC', source: 'A', target: 'C', weight: 2, state: 'default' },
      { id: 'BD', source: 'B', target: 'D', weight: 5, state: 'default' },
      { id: 'BC', source: 'B', target: 'C', weight: 1, state: 'default' },
      { id: 'CD', source: 'C', target: 'D', weight: 8, state: 'default' },
      { id: 'CE', source: 'C', target: 'E', weight: 10, state: 'default' },
      { id: 'DE', source: 'D', target: 'E', weight: 2, state: 'default' },
      { id: 'DF', source: 'D', target: 'F', weight: 6, state: 'default' },
      { id: 'EF', source: 'E', target: 'F', weight: 3, state: 'default' },
      { id: 'FG', source: 'F', target: 'G', weight: 1, state: 'default' },
    ],
    directed: false,
  };
}

export function generateDijkstraSteps(
  graph: GraphData,
  sourceId = 'A'
): Step<DijkstraData>[] {
  const steps: Step<DijkstraData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingGraph = cloneGraph(graph);
  const distances = new Map<string, number>();
  const predecessors = new Map<string, string | null>();
  const visited = new Set<string>();

  for (const node of workingGraph.nodes) {
    distances.set(node.id, node.id === sourceId ? 0 : INFINITY);
    predecessors.set(node.id, null);
  }

  const sourceNode = workingGraph.nodes.find((n) => n.id === sourceId);
  if (sourceNode) {
    sourceNode.state = 'current';
  }

  steps.push({
    id: stepId++,
    description: `Dijkstra's algorithm starting from node ${sourceId}`,
    snapshot: {
      data: cloneDijkstraSnapshot(
        workingGraph,
        distances,
        predecessors,
        visited,
        sourceId,
        sourceId
      ),
    },
    meta: createStepMeta({ highlightColor: NODE_STATE_COLORS.current }),
  });

  const pq = new MinPriorityQueue();
  pq.insert(sourceId, 0);

  steps.push({
    id: stepId++,
    description: `Added source ${sourceId} to priority queue with distance 0`,
    snapshot: {
      data: cloneDijkstraSnapshot(
        workingGraph,
        distances,
        predecessors,
        visited,
        sourceId,
        sourceId
      ),
    },
    meta: createStepMeta({ highlightColor: NODE_STATE_COLORS.current }),
  });

  const adjacency = new Map<string, { neighbor: string; weight: number; edgeId: string }[]>();
  for (const node of workingGraph.nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of workingGraph.edges) {
    adjacency.get(edge.source)?.push({
      neighbor: edge.target,
      weight: edge.weight ?? 1,
      edgeId: edge.id,
    });
    if (!graph.directed) {
      adjacency.get(edge.target)?.push({
        neighbor: edge.source,
        weight: edge.weight ?? 1,
        edgeId: edge.id,
      });
    }
  }

  while (!pq.isEmpty()) {
    const minEntry = pq.extractMin();
    if (!minEntry) {
      break;
    }

    const { nodeId: currentId, distance: currentDist } = minEntry;
    if (visited.has(currentId)) {
      continue;
    }

    visited.add(currentId);
    const currentNodeRef = workingGraph.nodes.find((n) => n.id === currentId);
    if (currentNodeRef) {
      currentNodeRef.state = 'inMST';
    }

    steps.push({
      id: stepId++,
      description: `Processing node ${currentId} with distance ${currentDist}`,
      snapshot: {
        data: cloneDijkstraSnapshot(
          workingGraph,
          distances,
          predecessors,
          visited,
          currentId,
          sourceId
        ),
      },
      meta: createStepMeta({
        comparisons,
        highlightColor: NODE_STATE_COLORS.current,
      }),
    });

    const neighbors = adjacency.get(currentId) ?? [];
    for (const { neighbor, weight, edgeId } of neighbors) {
      if (visited.has(neighbor)) {
        continue;
      }

      comparisons++;
      const edgeRef = workingGraph.edges.find((e) => e.id === edgeId);
      if (edgeRef) {
        edgeRef.state = 'considering';
      }

      const neighborNodeRef = workingGraph.nodes.find((n) => n.id === neighbor);
      if (neighborNodeRef?.state === 'default') {
        neighborNodeRef.state = 'frontier';
      }

      const currentDistToNode = distances.get(currentId) ?? INFINITY;
      const newDist = currentDistToNode + weight;
      const oldDist = distances.get(neighbor) ?? INFINITY;

      steps.push({
        id: stepId++,
        description: `Checking edge ${currentId} → ${neighbor} (weight ${weight})`,
        snapshot: {
          data: cloneDijkstraSnapshot(
            workingGraph,
            distances,
            predecessors,
            visited,
            currentId,
            sourceId
          ),
        },
        meta: createStepMeta({
          comparisons,
          highlightColor: EDGE_STATE_COLORS.considering,
        }),
      });

      if (newDist < oldDist) {
        distances.set(neighbor, newDist);
        predecessors.set(neighbor, currentId);
        pq.insert(neighbor, newDist);

        if (edgeRef) {
          edgeRef.state = 'inMST';
        }

        steps.push({
          id: stepId++,
          description: `Relaxed: dist[${neighbor}] = ${newDist} (via ${currentId})`,
          snapshot: {
            data: cloneDijkstraSnapshot(
              workingGraph,
              distances,
              predecessors,
              visited,
              currentId,
              sourceId
            ),
          },
          meta: createStepMeta({
            comparisons,
            highlightColor: NODE_STATE_COLORS.inMST,
          }),
        });
      } else if (edgeRef) {
        edgeRef.state = 'default';
      }
    }
  }

  const finalDistStr = Array.from(distances.entries())
    .map(([id, d]) => `${id}:${d === INFINITY ? '∞' : d}`)
    .join(', ');

  steps.push({
    id: stepId++,
    description: `Dijkstra complete. Shortest distances: ${finalDistStr}`,
    snapshot: {
      data: cloneDijkstraSnapshot(
        workingGraph,
        distances,
        predecessors,
        visited,
        null,
        sourceId
      ),
    },
    meta: createStepMeta({
      comparisons,
      highlightColor: NODE_STATE_COLORS.inMST,
    }),
  });

  return steps;
}

export const dijkstraConfig = {
  id: 'dijkstra',
  name: "Dijkstra's Algorithm",
  description: 'Single-source shortest paths using a priority queue (non-negative weights).',
  defaultSpeed: 600,
};
