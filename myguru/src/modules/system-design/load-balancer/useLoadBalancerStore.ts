/**
 * Zustand store for load balancer simulation.
 * Ported from pronzzz/sysarch-interactive (src/store/useStore.ts)
 * @see https://github.com/pronzzz/sysarch-interactive
 */

import { create } from 'zustand';
import type { Edge, GameState, Node, RequestParticle } from './types';

interface GameStore extends GameState {
  selectedNodeId: string | null;
  selectNode: (id: string | null) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  addEdge: (edge: Edge) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setParticles: (particles: RequestParticle[]) => void;
  addParticle: (particle: RequestParticle) => void;
  removeParticle: (id: string) => void;
}

const useLoadBalancerStore = create<GameStore>((set) => ({
  nodes: [
    {
      id: 'client-1',
      type: 'CLIENT',
      x: 100,
      y: 300,
      config: { rps: 2 },
      state: { currentLoad: 0, health: 100 },
    },
    {
      id: 'lb-1',
      type: 'LOAD_BALANCER',
      x: 300,
      y: 300,
      config: {},
      state: { currentLoad: 0, health: 100 },
    },
    {
      id: 'server-1',
      type: 'SERVER',
      x: 500,
      y: 250,
      config: { capacity: 5, latency: 50 },
      state: { currentLoad: 0, health: 100 },
    },
    {
      id: 'server-2',
      type: 'SERVER',
      x: 500,
      y: 350,
      config: { capacity: 5, latency: 50 },
      state: { currentLoad: 0, health: 100 },
    },
  ],
  edges: [
    { id: 'edge-1', sourceNodeId: 'client-1', targetNodeId: 'lb-1' },
    { id: 'edge-2', sourceNodeId: 'lb-1', targetNodeId: 'server-1' },
    { id: 'edge-3', sourceNodeId: 'lb-1', targetNodeId: 'server-2' },
  ],
  particles: [],
  isPlaying: false,
  tickRate: 1,
  selectedNodeId: null,

  selectNode: (id) => set({ selectedNodeId: id }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),
  addEdge: (edge) =>
    set((state) => {
      const exists = state.edges.some(
        (e) => e.sourceNodeId === edge.sourceNodeId && e.targetNodeId === edge.targetNodeId,
      );
      if (exists) return state;
      return { edges: [...state.edges, edge] };
    }),
  removeNode: (id) => set((state) => ({ nodes: state.nodes.filter((n) => n.id !== id) })),
  removeEdge: (id) => set((state) => ({ edges: state.edges.filter((e) => e.id !== id) })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setParticles: (particles) => set({ particles }),
  addParticle: (particle) => set((state) => ({ particles: [...state.particles, particle] })),
  removeParticle: (id) =>
    set((state) => ({ particles: state.particles.filter((p) => p.id !== id) })),
}));

export default useLoadBalancerStore;
