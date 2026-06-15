/**
 * Particle physics game loop for traffic simulation.
 * Ported from pronzzz/sysarch-interactive (src/engine/useGameLoop.ts)
 * @see https://github.com/pronzzz/sysarch-interactive
 */

import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useLoadBalancerStore from './useLoadBalancerStore';
import type { Edge, Node, RequestParticle } from './types';

export function useGameLoop() {
  const lastFrameTime = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);

  const spawnParticles = (dt: number, currentNodes: Node[], currentEdges: Edge[]) => {
    const newParticles: RequestParticle[] = [];

    currentNodes.forEach((node) => {
      if (node.type === 'CLIENT' && node.config.rps) {
        const chance = node.config.rps * (dt / 1000);
        if (Math.random() < chance) {
          const edge = currentEdges.find((e) => e.sourceNodeId === node.id);
          if (edge) {
            newParticles.push({
              id: uuidv4(),
              x: node.x,
              y: node.y,
              sourceNodeId: node.id,
              targetNodeId: edge.targetNodeId,
              originNodeId: node.id,
              status: 'PENDING',
              progress: 0,
              isResponse: false,
              timestamp: Date.now(),
            });
          }
        }
      }
    });

    return newParticles;
  };

  const updatePhysics = (time: number) => {
    if (!lastFrameTime.current) {
      lastFrameTime.current = time;
      animationFrameId.current = requestAnimationFrame(updatePhysics);
      return;
    }

    const dt = time - lastFrameTime.current;
    lastFrameTime.current = time;

    const state = useLoadBalancerStore.getState();
    if (!state.isPlaying) {
      animationFrameId.current = requestAnimationFrame(updatePhysics);
      return;
    }

    let nextParticles = [...state.particles];
    const spawned = spawnParticles(dt, state.nodes, state.edges);
    nextParticles.push(...spawned);

    nextParticles = nextParticles
      .map((p) => {
        const traverseTime = 2000;
        const deltaProgress = dt / traverseTime;
        let newProgress = p.progress + deltaProgress;

        const sourceNode = state.nodes.find((n) => n.id === p.sourceNodeId);
        const targetNode = state.nodes.find((n) => n.id === p.targetNodeId);
        if (!sourceNode || !targetNode) return p;

        if (newProgress >= 1) {
          if (!p.isResponse) {
            if (targetNode.type === 'CACHE') {
              const hitRate = targetNode.config.hitRate ?? 0.8;
              const isHit = Math.random() < hitRate;
              if (isHit) {
                return {
                  ...p,
                  isResponse: true,
                  progress: 0,
                  sourceNodeId: p.targetNodeId,
                  targetNodeId: p.sourceNodeId,
                };
              }
              const outgoingEdges = state.edges.filter((e) => e.sourceNodeId === targetNode.id);
              if (outgoingEdges.length > 0) {
                const nextEdge = outgoingEdges[0];
                return {
                  ...p,
                  sourceNodeId: targetNode.id,
                  targetNodeId: nextEdge.targetNodeId,
                  progress: 0,
                };
              }
              return {
                ...p,
                isResponse: true,
                progress: 0,
                sourceNodeId: p.targetNodeId,
                targetNodeId: p.sourceNodeId,
              };
            }

            if (targetNode.type === 'LOAD_BALANCER') {
              const outgoingEdges = state.edges.filter((e) => e.sourceNodeId === targetNode.id);
              if (outgoingEdges.length > 0) {
                const nextEdge = outgoingEdges[Math.floor(Math.random() * outgoingEdges.length)];
                return {
                  ...p,
                  sourceNodeId: targetNode.id,
                  targetNodeId: nextEdge.targetNodeId,
                  progress: 0,
                };
              }
              return {
                ...p,
                isResponse: true,
                status: 'ERROR',
                progress: 0,
                sourceNodeId: p.targetNodeId,
                targetNodeId: p.sourceNodeId,
              };
            }

            if (targetNode.type === 'DATABASE') {
              const latency = targetNode.config.latency ?? 200;
              const now = Date.now();
              if (p.waitTimestamp) {
                if (now >= p.waitTimestamp) {
                  const { waitTimestamp: _, ...cleanParticle } = p;
                  return {
                    ...cleanParticle,
                    isResponse: true,
                    progress: 0,
                    sourceNodeId: p.targetNodeId,
                    targetNodeId: p.sourceNodeId,
                  };
                }
                return p;
              }
              return { ...p, waitTimestamp: now + latency, progress: 1 };
            }

            return {
              ...p,
              isResponse: true,
              progress: 0,
              sourceNodeId: p.targetNodeId,
              targetNodeId: p.sourceNodeId,
            };
          }

          if (targetNode.type === 'LOAD_BALANCER' || targetNode.type === 'CACHE') {
            const incomingEdges = state.edges.filter((e) => e.targetNodeId === targetNode.id);
            if (incomingEdges.length > 0) {
              const backEdge = incomingEdges[Math.floor(Math.random() * incomingEdges.length)];
              return {
                ...p,
                sourceNodeId: targetNode.id,
                targetNodeId: backEdge.sourceNodeId,
                progress: 0,
              };
            }
            return null;
          }

          return null;
        }

        const newX = sourceNode.x + (targetNode.x - sourceNode.x) * newProgress;
        const newY = sourceNode.y + (targetNode.y - sourceNode.y) * newProgress;

        return { ...p, progress: newProgress, x: newX, y: newY } as RequestParticle;
      })
      .filter(Boolean) as RequestParticle[];

    useLoadBalancerStore.getState().setParticles(nextParticles);
    animationFrameId.current = requestAnimationFrame(updatePhysics);
  };

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);
}
