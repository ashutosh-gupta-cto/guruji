/**
 * Shared graph types and utilities for MST visualizers.
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { GraphData, GraphEdge, GraphNode } from './dijkstra';
import { EDGE_STATE_COLORS, NODE_STATE_COLORS } from './dijkstra';

export type { GraphData, GraphEdge, GraphNode, NodeState, EdgeState } from './dijkstra';
export { NODE_STATE_COLORS, EDGE_STATE_COLORS };

export function createSampleMSTGraph(): GraphData {
  const nodes: GraphNode[] = [
    { id: 'A', x: 0.15, y: 0.3, state: 'default' },
    { id: 'B', x: 0.4, y: 0.15, state: 'default' },
    { id: 'C', x: 0.65, y: 0.3, state: 'default' },
    { id: 'D', x: 0.15, y: 0.7, state: 'default' },
    { id: 'E', x: 0.4, y: 0.85, state: 'default' },
    { id: 'F', x: 0.65, y: 0.7, state: 'default' },
  ];

  const edges: GraphEdge[] = [
    { id: 'AB', source: 'A', target: 'B', weight: 4, state: 'default' },
    { id: 'AC', source: 'A', target: 'C', weight: 6, state: 'default' },
    { id: 'AD', source: 'A', target: 'D', weight: 2, state: 'default' },
    { id: 'BC', source: 'B', target: 'C', weight: 3, state: 'default' },
    { id: 'BE', source: 'B', target: 'E', weight: 5, state: 'default' },
    { id: 'CF', source: 'C', target: 'F', weight: 1, state: 'default' },
    { id: 'DE', source: 'D', target: 'E', weight: 7, state: 'default' },
    { id: 'DF', source: 'D', target: 'F', weight: 8, state: 'default' },
    { id: 'EF', source: 'E', target: 'F', weight: 4, state: 'default' },
  ];

  return { nodes, edges, directed: false };
}

export function createRandomGraph(nodeCount: number, edgeDensity = 0.4): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
    const radius = 0.35;
    nodes.push({
      id: String.fromCharCode(65 + i),
      x: 0.5 + radius * Math.cos(angle),
      y: 0.5 + radius * Math.sin(angle),
      state: 'default',
    });
  }

  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (Math.random() < edgeDensity) {
        edges.push({
          id: `${nodes[i].id}${nodes[j].id}`,
          source: nodes[i].id,
          target: nodes[j].id,
          weight: Math.floor(Math.random() * 9) + 1,
          state: 'default',
        });
      }
    }
  }

  const connected = new Set<string>([nodes[0].id]);
  for (let i = 1; i < nodeCount; i++) {
    const nodeId = nodes[i].id;
    let isConnected = false;
    for (const edge of edges) {
      if (
        (edge.source === nodeId && connected.has(edge.target)) ||
        (edge.target === nodeId && connected.has(edge.source))
      ) {
        isConnected = true;
        break;
      }
    }

    if (!isConnected) {
      const connectedArr = Array.from(connected);
      const target = connectedArr[Math.floor(Math.random() * connectedArr.length)];
      edges.push({
        id: `${nodeId}${target}`,
        source: nodeId,
        target,
        weight: Math.floor(Math.random() * 9) + 1,
        state: 'default',
      });
    }

    connected.add(nodeId);
  }

  return { nodes, edges, directed: false };
}

export function cloneGraph(graph: GraphData): GraphData {
  return {
    nodes: graph.nodes.map((n) => ({ ...n })),
    edges: graph.edges.map((e) => ({ ...e })),
    directed: graph.directed,
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

export function getEdgesForNode(edges: GraphEdge[], nodeId: string): GraphEdge[] {
  return edges.filter((e) => e.source === nodeId || e.target === nodeId);
}

export function sortEdgesByWeight(edges: GraphEdge[]): GraphEdge[] {
  return [...edges].sort((a, b) => a.weight - b.weight);
}
