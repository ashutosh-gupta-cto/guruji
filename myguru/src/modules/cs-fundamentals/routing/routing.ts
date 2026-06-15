/**
 * Dijkstra shortest-path with step traces.
 * Ported from G-Amar/Network-Routing-Visualized.
 */

export interface GraphNode {
  id: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface RoutingGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface DijkstraStep {
  visited: string[];
  current: string | null;
  distances: Record<string, { cost: number; prev: string | null }>;
  message: string;
  relaxedEdge?: string;
}

export const DEMO_GRAPH: RoutingGraph = {
  nodes: [
    { id: 'A', x: 60, y: 120 },
    { id: 'B', x: 180, y: 40 },
    { id: 'C', x: 180, y: 200 },
    { id: 'D', x: 300, y: 120 },
    { id: 'E', x: 420, y: 120 },
  ],
  edges: [
    { id: 'A-B', source: 'A', target: 'B', weight: 3 },
    { id: 'A-C', source: 'A', target: 'C', weight: 5 },
    { id: 'B-E', source: 'B', target: 'E', weight: 4 },
    { id: 'B-C', source: 'B', target: 'C', weight: 2 },
    { id: 'C-D', source: 'C', target: 'D', weight: 2 },
    { id: 'D-E', source: 'D', target: 'E', weight: 1 },
    { id: 'B-D', source: 'B', target: 'D', weight: 6 },
  ],
};

function neighbors(graph: RoutingGraph, nodeId: string): GraphEdge[] {
  return graph.edges.filter((e) => e.source === nodeId || e.target === nodeId);
}

function otherNode(edge: GraphEdge, nodeId: string): string {
  return edge.source === nodeId ? edge.target : edge.source;
}

export function dijkstraSteps(
  graph: RoutingGraph,
  source: string,
  dest: string,
): { steps: DijkstraStep[]; path: string[] } {
  const steps: DijkstraStep[] = [];
  const visited = new Set<string>();
  const dist: Record<string, { cost: number; prev: string | null }> = {};
  graph.nodes.forEach((n) => {
    dist[n.id] = { cost: Infinity, prev: null };
  });
  dist[source].cost = 0;

  steps.push({
    visited: [],
    current: null,
    distances: JSON.parse(JSON.stringify(dist)),
    message: `Initialize: dist(${source}) = 0, all others ∞.`,
  });

  while (visited.size < graph.nodes.length) {
    let minCost = Infinity;
    let minNode = '';
    for (const n of graph.nodes) {
      if (!visited.has(n.id) && dist[n.id].cost < minCost) {
        minCost = dist[n.id].cost;
        minNode = n.id;
      }
    }
    if (!minNode || minCost === Infinity) break;

    visited.add(minNode);
    steps.push({
      visited: [...visited],
      current: minNode,
      distances: JSON.parse(JSON.stringify(dist)),
      message: `Visit ${minNode} (smallest tentative distance ${minCost}).`,
    });

    if (minNode === dest) break;

    for (const edge of neighbors(graph, minNode)) {
      const nb = otherNode(edge, minNode);
      if (visited.has(nb)) continue;
      const newCost = minCost + edge.weight;
      if (newCost < dist[nb].cost) {
        dist[nb] = { cost: newCost, prev: minNode };
        steps.push({
          visited: [...visited],
          current: minNode,
          distances: JSON.parse(JSON.stringify(dist)),
          relaxedEdge: edge.id,
          message: `Relax ${minNode}→${nb}: dist(${nb}) = ${newCost}.`,
        });
      }
    }
  }

  const path: string[] = [];
  let cur: string | null = dest;
  while (cur) {
    path.unshift(cur);
    cur = dist[cur]?.prev ?? null;
  }
  if (path[0] !== source) path.length = 0;

  steps.push({
    visited: [...visited],
    current: dest,
    distances: JSON.parse(JSON.stringify(dist)),
    message: path.length
      ? `Shortest path ${source}→${dest}: ${path.join(' → ')} (cost ${dist[dest].cost}).`
      : `No path from ${source} to ${dest}.`,
  });

  return { steps, path };
}
