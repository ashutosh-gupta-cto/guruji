/**
 * Topological sort (Kahn's algorithm) step generator.
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step } from '../core/types';
import { createStepMeta } from '../core/types';
import type { GraphData, GraphNode, GraphEdge } from './dijkstra';
import { NODE_STATE_COLORS, EDGE_STATE_COLORS } from './dijkstra';

export interface TopoSortData extends GraphData {
  sortedOrder: string[];
  inDegree: Map<string, number>;
  queue: string[];
}

function cloneGraph(graph: GraphData): GraphData {
  return {
    directed: graph.directed,
    nodes: graph.nodes.map((n) => ({ ...n })),
    edges: graph.edges.map((e) => ({ ...e })),
  };
}

export function createSampleDAG(): GraphData {
  return {
    nodes: [
      { id: 'A', x: 0.15, y: 0.3, state: 'default' },
      { id: 'B', x: 0.4, y: 0.2, state: 'default' },
      { id: 'C', x: 0.15, y: 0.7, state: 'default' },
      { id: 'D', x: 0.65, y: 0.2, state: 'default' },
      { id: 'E', x: 0.4, y: 0.7, state: 'default' },
      { id: 'F', x: 0.65, y: 0.7, state: 'default' },
    ],
    edges: [
      { id: 'AB', source: 'A', target: 'B', weight: 1, state: 'default' },
      { id: 'AC', source: 'A', target: 'C', weight: 1, state: 'default' },
      { id: 'BD', source: 'B', target: 'D', weight: 1, state: 'default' },
      { id: 'BE', source: 'B', target: 'E', weight: 1, state: 'default' },
      { id: 'CE', source: 'C', target: 'E', weight: 1, state: 'default' },
      { id: 'DF', source: 'D', target: 'F', weight: 1, state: 'default' },
      { id: 'EF', source: 'E', target: 'F', weight: 1, state: 'default' },
    ],
    directed: true,
  };
}

export function scaleGraphPosition(
  relativeX: number,
  relativeY: number,
  width: number,
  height: number
): { x: number; y: number } {
  const padding = 40;
  const radius = 22;
  const availableWidth = width - padding * 2 - radius * 2;
  const availableHeight = height - padding * 2 - radius * 2;
  return {
    x: padding + radius + relativeX * availableWidth,
    y: padding + radius + relativeY * availableHeight,
  };
}

export function generateTopoSortSteps(graph: GraphData): Step<TopoSortData>[] {
  const steps: Step<TopoSortData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingGraph = cloneGraph(graph);
  const sortedOrder: string[] = [];
  const inDegree = new Map<string, number>();
  const queue: string[] = [];

  for (const node of workingGraph.nodes) {
    inDegree.set(node.id, 0);
  }
  for (const edge of workingGraph.edges) {
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const snapshot = (): TopoSortData => ({
    ...cloneGraph(workingGraph),
    sortedOrder: [...sortedOrder],
    inDegree: new Map(inDegree),
    queue: [...queue],
  });

  steps.push({
    id: stepId++,
    description: "Starting Topological Sort (Kahn's Algorithm)",
    snapshot: { data: snapshot() },
    meta: createStepMeta({ highlightColor: NODE_STATE_COLORS.current }),
  });

  const inDegreeStr = Array.from(inDegree.entries())
    .map(([id, deg]) => `${id}:${deg}`)
    .join(', ');
  steps.push({
    id: stepId++,
    description: `Calculated in-degrees: ${inDegreeStr}`,
    snapshot: { data: snapshot() },
    meta: createStepMeta({ highlightColor: NODE_STATE_COLORS.current }),
  });

  for (const node of workingGraph.nodes) {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
      const nodeRef = workingGraph.nodes.find((n) => n.id === node.id);
      if (nodeRef) nodeRef.state = 'frontier';
    }
  }

  steps.push({
    id: stepId++,
    description: `Nodes with in-degree 0 (ready): [${queue.join(', ')}]`,
    snapshot: { data: snapshot() },
    meta: createStepMeta({ highlightColor: NODE_STATE_COLORS.frontier }),
  });

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentNode = workingGraph.nodes.find((n) => n.id === currentId);
    comparisons++;
    if (currentNode) currentNode.state = 'current';

    steps.push({
      id: stepId++,
      description: `Processing node ${currentId}`,
      snapshot: { data: snapshot() },
      meta: createStepMeta({ comparisons, highlightColor: NODE_STATE_COLORS.current }),
    });

    sortedOrder.push(currentId);
    if (currentNode) currentNode.state = 'visited';

    const outgoingEdges = workingGraph.edges.filter((e) => e.source === currentId);
    for (const edge of outgoingEdges) {
      const targetId = edge.target;
      inDegree.set(targetId, (inDegree.get(targetId) ?? 0) - 1);
      const edgeRef = workingGraph.edges.find((e) => e.id === edge.id);
      if (edgeRef) edgeRef.state = 'path';

      if (inDegree.get(targetId) === 0) {
        queue.push(targetId);
        const targetNode = workingGraph.nodes.find((n) => n.id === targetId);
        if (targetNode) targetNode.state = 'frontier';
        steps.push({
          id: stepId++,
          description: `Node ${targetId} now has in-degree 0, added to queue`,
          snapshot: { data: snapshot() },
          meta: createStepMeta({ comparisons, highlightColor: NODE_STATE_COLORS.frontier }),
        });
      }
    }

    steps.push({
      id: stepId++,
      description: `Added ${currentId} to sorted order. Order so far: [${sortedOrder.join(', ')}]`,
      snapshot: { data: snapshot() },
      meta: createStepMeta({ comparisons, highlightColor: NODE_STATE_COLORS.visited }),
    });
  }

  if (sortedOrder.length !== workingGraph.nodes.length) {
    steps.push({
      id: stepId++,
      description: 'Error: Graph contains a cycle! Topological sort not possible.',
      snapshot: { data: snapshot() },
      meta: createStepMeta({ comparisons, highlightColor: EDGE_STATE_COLORS.rejected }),
    });
  } else {
    for (const node of workingGraph.nodes) node.state = 'inMST';
    for (const edge of workingGraph.edges) edge.state = 'path';
    steps.push({
      id: stepId++,
      description: `Topological Sort complete! Order: [${sortedOrder.join(' → ')}]`,
      snapshot: { data: snapshot() },
      meta: createStepMeta({ comparisons, highlightColor: NODE_STATE_COLORS.inMST }),
    });
  }

  return steps;
}

export type { GraphNode, GraphEdge };
