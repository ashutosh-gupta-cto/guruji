/**
 * Interview practice problems and checklist scoring.
 * Inspired by vijaygupta18/system-design-simulator README.
 */

export type InterviewNodeType =
  | 'CLIENT'
  | 'DNS'
  | 'CDN'
  | 'LOAD_BALANCER'
  | 'CACHE'
  | 'DATABASE'
  | 'QUEUE'
  | 'WEBSOCKET'
  | 'API_GATEWAY';

export interface InterviewNode {
  id: string;
  type: InterviewNodeType;
  x: number;
  y: number;
  label: string;
}

export interface InterviewEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  /** Node types that satisfy this item when present and connected */
  requiredTypes?: InterviewNodeType[];
  /** Custom check against nodes + edges */
  check?: (nodes: InterviewNode[], edges: InterviewEdge[]) => boolean;
  points: number;
}

export interface InterviewProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  requirements: string[];
  palette: InterviewNodeType[];
  checklist: ChecklistItem[];
}

export const NODE_META: Record<
  InterviewNodeType,
  { label: string; color: string; bg: string }
> = {
  CLIENT: { label: 'Client', color: '#7c3aed', bg: '#ede9fe' },
  DNS: { label: 'DNS', color: '#6366f1', bg: '#e0e7ff' },
  CDN: { label: 'CDN', color: '#0891b2', bg: '#cffafe' },
  LOAD_BALANCER: { label: 'Load Balancer', color: '#4f46e5', bg: '#e0e7ff' },
  CACHE: { label: 'Cache', color: '#d97706', bg: '#fef3c7' },
  DATABASE: { label: 'Database', color: '#059669', bg: '#d1fae5' },
  QUEUE: { label: 'Message Queue', color: '#db2777', bg: '#fce7f3' },
  WEBSOCKET: { label: 'WebSocket GW', color: '#2563eb', bg: '#dbeafe' },
  API_GATEWAY: { label: 'API Gateway', color: '#7c3aed', bg: '#ede9fe' },
};

function hasTypeConnected(
  nodes: InterviewNode[],
  edges: InterviewEdge[],
  type: InterviewNodeType,
): boolean {
  const nodeIds = new Set(nodes.filter((n) => n.type === type).map((n) => n.id));
  if (nodeIds.size === 0) return false;
  const connected = new Set<string>();
  for (const e of edges) {
    if (nodeIds.has(e.sourceId) || nodeIds.has(e.targetId)) {
      connected.add(e.sourceId);
      connected.add(e.targetId);
    }
  }
  return [...nodeIds].some((id) => connected.has(id));
}

function hasPathThrough(
  nodes: InterviewNode[],
  edges: InterviewEdge[],
  types: InterviewNodeType[],
): boolean {
  const typeToIds = new Map<InterviewNodeType, string[]>();
  for (const t of types) typeToIds.set(t, []);
  for (const n of nodes) {
    const list = typeToIds.get(n.type);
    if (list) list.push(n.id);
  }
  if (types.some((t) => (typeToIds.get(t)?.length ?? 0) === 0)) return false;

  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    adj.get(e.sourceId)?.push(e.targetId);
    adj.get(e.targetId)?.push(e.sourceId);
  }

  const startIds = typeToIds.get(types[0]) ?? [];
  const targetSet = new Set(typeToIds.get(types[types.length - 1]) ?? []);
  const needed = new Set(types.slice(1, -1));

  for (const start of startIds) {
    const visited = new Set<string>([start]);
    const queue = [start];
    const seenTypes = new Set<InterviewNodeType>();
    const startNode = nodes.find((n) => n.id === start);
    if (startNode) seenTypes.add(startNode.type);

    while (queue.length) {
      const id = queue.shift()!;
      const node = nodes.find((n) => n.id === id);
      if (node) seenTypes.add(node.type);
      if (targetSet.has(id) && [...needed].every((t) => seenTypes.has(t))) return true;
      for (const next of adj.get(id) ?? []) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
  }
  return false;
}

export const INTERVIEW_PROBLEMS: InterviewProblem[] = [
  {
    id: 'url-shortener',
    title: 'URL Shortener',
    difficulty: 'Easy',
    description:
      'Design Bitly/TinyURL. Heavy read bias (100:1 redirects to creates). Sub-100ms redirect latency.',
    requirements: [
      'Unique short codes',
      '100:1 read/write ratio',
      'Redirect latency < 100ms p99',
      'Analytics on clicks',
    ],
    palette: ['CLIENT', 'DNS', 'CDN', 'LOAD_BALANCER', 'CACHE', 'DATABASE'],
    checklist: [
      {
        id: 'lb',
        label: 'Load balancer distributes traffic',
        requiredTypes: ['LOAD_BALANCER'],
        points: 15,
      },
      {
        id: 'cache',
        label: 'Cache layer for hot redirects',
        requiredTypes: ['CACHE'],
        points: 25,
      },
      {
        id: 'db',
        label: 'Persistent store for URL mappings',
        requiredTypes: ['DATABASE'],
        points: 20,
      },
      {
        id: 'read-path',
        label: 'Client → LB → Cache → DB read path wired',
        check: (nodes, edges) =>
          hasPathThrough(nodes, edges, ['CLIENT', 'LOAD_BALANCER', 'CACHE', 'DATABASE']),
        points: 25,
      },
      {
        id: 'cdn',
        label: 'CDN for static/edge caching (optional bonus)',
        requiredTypes: ['CDN'],
        points: 15,
      },
    ],
  },
  {
    id: 'news-feed',
    title: 'News Feed',
    difficulty: 'Hard',
    description:
      'Design Twitter/X timeline. Fan-out on write vs read for celebrities. Eventual consistency within seconds.',
    requirements: [
      'Timeline ranked by relevance',
      'Celebrity fan-out without write storms',
      'Media upload support',
      'Full-text search',
    ],
    palette: ['CLIENT', 'LOAD_BALANCER', 'CACHE', 'DATABASE', 'QUEUE', 'CDN'],
    checklist: [
      {
        id: 'lb',
        label: 'Load balancer at entry',
        requiredTypes: ['LOAD_BALANCER'],
        points: 10,
      },
      {
        id: 'cache',
        label: 'Timeline cache (Redis-style)',
        requiredTypes: ['CACHE'],
        points: 25,
      },
      {
        id: 'queue',
        label: 'Async fan-out via message queue',
        requiredTypes: ['QUEUE'],
        points: 25,
      },
      {
        id: 'db',
        label: 'Durable post/timeline storage',
        requiredTypes: ['DATABASE'],
        points: 20,
      },
      {
        id: 'fanout-path',
        label: 'Write path: Client → LB → Queue → DB',
        check: (nodes, edges) =>
          hasPathThrough(nodes, edges, ['CLIENT', 'LOAD_BALANCER', 'QUEUE', 'DATABASE']),
        points: 20,
      },
    ],
  },
  {
    id: 'chat-system',
    title: 'Chat System',
    difficulty: 'Hard',
    description:
      'Design WhatsApp/Slack. Real-time delivery, ordering, presence, offline store-and-forward.',
    requirements: [
      'WebSocket for online users (<50ms)',
      'Message ordering per conversation',
      'Offline delivery',
      'Group chat fan-out',
    ],
    palette: ['CLIENT', 'LOAD_BALANCER', 'WEBSOCKET', 'API_GATEWAY', 'CACHE', 'QUEUE', 'DATABASE'],
    checklist: [
      {
        id: 'ws',
        label: 'WebSocket gateway for real-time',
        requiredTypes: ['WEBSOCKET'],
        points: 25,
      },
      {
        id: 'queue',
        label: 'Message queue for ordering & fan-out',
        requiredTypes: ['QUEUE'],
        points: 25,
      },
      {
        id: 'cache',
        label: 'Presence / session cache',
        requiredTypes: ['CACHE'],
        points: 15,
      },
      {
        id: 'db',
        label: 'Message persistence',
        requiredTypes: ['DATABASE'],
        points: 20,
      },
      {
        id: 'realtime-path',
        label: 'Client → LB → WebSocket path wired',
        check: (nodes, edges) =>
          hasPathThrough(nodes, edges, ['CLIENT', 'LOAD_BALANCER', 'WEBSOCKET']),
        points: 15,
      },
    ],
  },
];

export interface ScoreResult {
  earned: number;
  total: number;
  percent: number;
  verdict: string;
  items: { id: string; label: string; earned: number; max: number; passed: boolean }[];
}

export function scoreDesign(
  problem: InterviewProblem,
  nodes: InterviewNode[],
  edges: InterviewEdge[],
): ScoreResult {
  const items = problem.checklist.map((item) => {
    let passed = false;
    if (item.check) {
      passed = item.check(nodes, edges);
    } else if (item.requiredTypes) {
      passed = item.requiredTypes.every((t) => hasTypeConnected(nodes, edges, t));
    }
    return {
      id: item.id,
      label: item.label,
      earned: passed ? item.points : 0,
      max: item.points,
      passed,
    };
  });

  const earned = items.reduce((s, i) => s + i.earned, 0);
  const total = items.reduce((s, i) => s + i.max, 0);
  const percent = total > 0 ? Math.round((earned / total) * 100) : 0;

  let verdict = 'Needs Work';
  if (percent >= 86) verdict = 'Architect Level';
  else if (percent >= 71) verdict = 'Excellent';
  else if (percent >= 51) verdict = 'Good';
  else if (percent >= 31) verdict = 'Decent';

  return { earned, total, percent, verdict, items };
}
