/**
 * Kruskal's MST step generator.
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step } from '../core/types';
import { createStepMeta } from '../core/types';
import type { GraphData, GraphNode } from './graph-shared';
import {
  cloneGraph,
  EDGE_STATE_COLORS,
  NODE_STATE_COLORS,
  sortEdgesByWeight,
} from './graph-shared';

export interface KruskalData extends GraphData {
  mstEdges: string[];
  mstWeight: number;
  unionFind: { parent: Map<string, string>; rank: Map<string, number> };
}

function createUnionFind(nodes: GraphNode[]): {
  parent: Map<string, string>;
  rank: Map<string, number>;
} {
  const parent = new Map<string, string>();
  const rank = new Map<string, number>();
  for (const node of nodes) {
    parent.set(node.id, node.id);
    rank.set(node.id, 0);
  }
  return { parent, rank };
}

function find(parent: Map<string, string>, x: string): string {
  if (parent.get(x) !== x) {
    const root = find(parent, parent.get(x)!);
    parent.set(x, root);
    return root;
  }
  return x;
}

function union(
  parent: Map<string, string>,
  rank: Map<string, number>,
  x: string,
  y: string
): boolean {
  const rootX = find(parent, x);
  const rootY = find(parent, y);
  if (rootX === rootY) return false;

  const rankX = rank.get(rootX)!;
  const rankY = rank.get(rootY)!;

  if (rankX < rankY) parent.set(rootX, rootY);
  else if (rankX > rankY) parent.set(rootY, rootX);
  else {
    parent.set(rootY, rootX);
    rank.set(rootX, rankX + 1);
  }

  return true;
}

export function generateKruskalSteps(graph: GraphData): Step<KruskalData>[] {
  const steps: Step<KruskalData>[] = [];
  let stepId = 0;
  let comparisons = 0;

  const workingGraph = cloneGraph(graph);
  const mstEdges: string[] = [];
  let mstWeight = 0;
  const uf = createUnionFind(workingGraph.nodes);

  const snapshot = (): KruskalData => ({
    ...cloneGraph(workingGraph),
    mstEdges: [...mstEdges],
    mstWeight,
    unionFind: { parent: new Map(uf.parent), rank: new Map(uf.rank) },
  });

  steps.push({
    id: stepId++,
    description: "Starting Kruskal's algorithm — finding Minimum Spanning Tree",
    snapshot: { data: snapshot() },
    meta: createStepMeta({ highlightColor: NODE_STATE_COLORS.current }),
  });

  const sortedEdges = sortEdgesByWeight(workingGraph.edges);

  steps.push({
    id: stepId++,
    description: `Sorted ${sortedEdges.length} edges by weight: [${sortedEdges.map((e) => e.weight).join(', ')}]`,
    snapshot: { data: snapshot() },
    meta: createStepMeta({ highlightColor: NODE_STATE_COLORS.current }),
  });

  for (const edge of sortedEdges) {
    comparisons++;

    const workingEdge = workingGraph.edges.find((e) => e.id === edge.id);
    if (workingEdge) workingEdge.state = 'considering';

    const sourceNode = workingGraph.nodes.find((n) => n.id === edge.source);
    const targetNode = workingGraph.nodes.find((n) => n.id === edge.target);
    if (sourceNode) sourceNode.state = 'current';
    if (targetNode) targetNode.state = 'current';

    steps.push({
      id: stepId++,
      description: `Considering edge ${edge.source}-${edge.target} (weight: ${edge.weight})`,
      snapshot: { data: snapshot() },
      meta: createStepMeta({ comparisons, highlightColor: EDGE_STATE_COLORS.considering }),
    });

    const rootSource = find(uf.parent, edge.source);
    const rootTarget = find(uf.parent, edge.target);

    if (rootSource === rootTarget) {
      if (workingEdge) workingEdge.state = 'rejected';
      steps.push({
        id: stepId++,
        description: `Rejected: ${edge.source} and ${edge.target} are already connected (would create cycle)`,
        snapshot: { data: snapshot() },
        meta: createStepMeta({ comparisons, highlightColor: EDGE_STATE_COLORS.rejected }),
      });
      if (workingEdge) workingEdge.state = 'default';
    } else {
      union(uf.parent, uf.rank, edge.source, edge.target);
      mstEdges.push(edge.id);
      mstWeight += edge.weight;

      if (workingEdge) workingEdge.state = 'inMST';
      if (sourceNode) sourceNode.state = 'inMST';
      if (targetNode) targetNode.state = 'inMST';

      steps.push({
        id: stepId++,
        description: `Added: ${edge.source}-${edge.target} (weight: ${edge.weight}). MST weight: ${mstWeight}`,
        snapshot: { data: snapshot() },
        meta: createStepMeta({ comparisons, highlightColor: EDGE_STATE_COLORS.inMST }),
      });
    }

    if (sourceNode && sourceNode.state !== 'inMST') sourceNode.state = 'default';
    if (targetNode && targetNode.state !== 'inMST') targetNode.state = 'default';

    if (mstEdges.length === workingGraph.nodes.length - 1) break;
  }

  for (const edge of workingGraph.edges) {
    edge.state = mstEdges.includes(edge.id) ? 'inMST' : 'default';
  }
  for (const node of workingGraph.nodes) node.state = 'inMST';

  steps.push({
    id: stepId++,
    description: `Kruskal's complete! MST has ${mstEdges.length} edges with total weight ${mstWeight}`,
    snapshot: { data: snapshot() },
    meta: createStepMeta({ comparisons, highlightColor: NODE_STATE_COLORS.inMST }),
  });

  return steps;
}

export const kruskalConfig = {
  id: 'kruskal',
  name: "Kruskal's MST",
  description: 'Adds edges in weight order using Union-Find to avoid cycles.',
  defaultSpeed: 800,
};
