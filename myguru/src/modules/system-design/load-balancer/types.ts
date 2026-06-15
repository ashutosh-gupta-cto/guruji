/**
 * Types for load balancer / cache particle simulation.
 * Ported from pronzzz/sysarch-interactive (src/types/index.ts)
 * @see https://github.com/pronzzz/sysarch-interactive
 */

export type NodeType = 'CLIENT' | 'LOAD_BALANCER' | 'SERVER' | 'DATABASE' | 'CACHE';

export interface Node {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  config: {
    capacity?: number;
    latency?: number;
    strategy?: 'ROUND_ROBIN' | 'LEAST_CONN';
    rps?: number;
    hitRate?: number;
  };
  state: {
    currentLoad: number;
    health: number;
  };
}

export interface Edge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
}

export interface RequestParticle {
  id: string;
  x: number;
  y: number;
  targetNodeId: string;
  sourceNodeId: string;
  originNodeId: string;
  status: 'PENDING' | 'SUCCESS' | 'ERROR';
  progress: number;
  isResponse: boolean;
  timestamp: number;
  waitTimestamp?: number;
}

export interface GameState {
  nodes: Node[];
  edges: Edge[];
  particles: RequestParticle[];
  isPlaying: boolean;
  tickRate: number;
}
