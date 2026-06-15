/**
 * Breadth-first search step generator.
 *
 * Adapted from BFS lesson content and ChazWyllie graph patterns (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step } from '../core/types';
import { createStepMeta } from '../core/types';
import {
  createSampleDijkstraGraph,
  NODE_STATE_COLORS,
  type GraphData,
  type GraphEdge,
  type GraphNode,
} from './dijkstra';

export interface BfsData extends GraphData {
  visited: Set<string>;
  queue: string[];
  visitOrder: string[];
  currentNode: string | null;
  sourceNode: string;
}

function cloneGraph(graph: GraphData): GraphData {
  return {
    directed: graph.directed,
    nodes: graph.nodes.map((n) => ({ ...n })),
    edges: graph.edges.map((e) => ({ ...e })),
  };
}

function snapshot(
  graph: GraphData,
  visited: Set<string>,
  queue: string[],
  visitOrder: string[],
  currentNode: string | null,
  sourceNode: string
): BfsData {
  return {
    ...cloneGraph(graph),
    visited: new Set(visited),
    queue: [...queue],
    visitOrder: [...visitOrder],
    currentNode,
    sourceNode,
  };
}

export function createSampleBfsGraph(): GraphData {
  return createSampleDijkstraGraph();
}

export function generateBfsSteps(graph: GraphData, sourceId = 'A'): Step<BfsData>[] {
  const steps: Step<BfsData>[] = [];
  let stepId = 0;

  const workingGraph = cloneGraph(graph);
  const visited = new Set<string>();
  const queue: string[] = [];
  const visitOrder: string[] = [];

  const adjacency = new Map<string, string[]>();
  for (const node of workingGraph.nodes) adjacency.set(node.id, []);
  for (const edge of workingGraph.edges) {
    adjacency.get(edge.source)?.push(edge.target);
    if (!graph.directed) adjacency.get(edge.target)?.push(edge.source);
  }

  steps.push({
    id: stepId++,
    description: `BFS starting from node ${sourceId}`,
    snapshot: { data: snapshot(workingGraph, visited, queue, visitOrder, null, sourceId) },
    meta: createStepMeta({ highlightColor: NODE_STATE_COLORS.current }),
  });

  queue.push(sourceId);
  visited.add(sourceId);
  const sourceRef = workingGraph.nodes.find((n) => n.id === sourceId);
  if (sourceRef) sourceRef.state = 'frontier';

  steps.push({
    id: stepId++,
    description: `Enqueue source ${sourceId}`,
    snapshot: { data: snapshot(workingGraph, visited, queue, visitOrder, sourceId, sourceId) },
    meta: createStepMeta({ highlightColor: NODE_STATE_COLORS.frontier }),
  });

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentRef = workingGraph.nodes.find((n) => n.id === currentId);
    if (currentRef) currentRef.state = 'current';

    steps.push({
      id: stepId++,
      description: `Dequeue ${currentId} — processing node`,
      snapshot: { data: snapshot(workingGraph, visited, queue, visitOrder, currentId, sourceId) },
      meta: createStepMeta({ highlightColor: NODE_STATE_COLORS.current }),
    });

    visitOrder.push(currentId);
    if (currentRef) currentRef.state = 'visited';

    const neighbors = adjacency.get(currentId) ?? [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue;

      const edge = workingGraph.edges.find(
        (e: GraphEdge) =>
          (e.source === currentId && e.target === neighbor) ||
          (e.target === currentId && e.source === neighbor)
      );
      if (edge) edge.state = 'path';

      visited.add(neighbor);
      queue.push(neighbor);

      const neighborRef = workingGraph.nodes.find((n: GraphNode) => n.id === neighbor);
      if (neighborRef) neighborRef.state = 'frontier';

      steps.push({
        id: stepId++,
        description: `Enqueue unvisited neighbor ${neighbor}`,
        snapshot: { data: snapshot(workingGraph, visited, queue, visitOrder, currentId, sourceId) },
        meta: createStepMeta({ highlightColor: NODE_STATE_COLORS.frontier }),
      });
    }

    steps.push({
      id: stepId++,
      description: `Finished ${currentId}. Visit order: [${visitOrder.join(', ')}]`,
      snapshot: { data: snapshot(workingGraph, visited, queue, visitOrder, currentId, sourceId) },
      meta: createStepMeta({ highlightColor: NODE_STATE_COLORS.visited }),
    });
  }

  for (const node of workingGraph.nodes) {
    if (node.state !== 'visited') node.state = 'default';
  }

  steps.push({
    id: stepId++,
    description: `BFS complete. Visit order: ${visitOrder.join(' → ')}`,
    snapshot: { data: snapshot(workingGraph, visited, queue, visitOrder, null, sourceId) },
    meta: createStepMeta({ highlightColor: NODE_STATE_COLORS.inMST }),
  });

  return steps;
}

export const bfsConfig = {
  id: 'graph-bfs',
  name: 'Breadth-First Search',
  description: 'Layer-by-layer graph traversal using a FIFO queue.',
  defaultSpeed: 600,
};

export type { GraphNode, GraphEdge };
