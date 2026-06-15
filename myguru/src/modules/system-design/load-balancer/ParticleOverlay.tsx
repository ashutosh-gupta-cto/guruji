/**
 * Canvas overlay for request particles.
 * Ported from pronzzz/sysarch-interactive (src/components/ParticleOverlay.tsx)
 * @see https://github.com/pronzzz/sysarch-interactive
 */

import { useEffect, useRef } from 'react';
import useLoadBalancerStore from './useLoadBalancerStore';

interface ParticleOverlayProps {
  width: number;
  height: number;
  stageScale: number;
  stagePos: { x: number; y: number };
}

export function ParticleOverlay({ width, height, stageScale, stagePos }: ParticleOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.translate(stagePos.x, stagePos.y);
      ctx.scale(stageScale, stageScale);

      const particles = useLoadBalancerStore.getState().particles;

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        if (p.status === 'ERROR') {
          ctx.fillStyle = '#ef4444';
        } else if (p.isResponse) {
          ctx.fillStyle = '#10b981';
        } else {
          ctx.fillStyle = '#f59e0b';
        }
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [width, height, stageScale, stagePos]);

  return (
    <canvas
      ref={canvasRef}
      className="lb-particle-canvas"
      width={width}
      height={height}
    />
  );
}
