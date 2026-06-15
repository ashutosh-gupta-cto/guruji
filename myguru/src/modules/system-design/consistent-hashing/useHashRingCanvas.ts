/**
 * Canvas rendering for consistent hashing ring.
 * Ported from ionmx/consistent-hashing-simulator (canvas.js)
 * @see https://github.com/ionmx/consistent-hashing-simulator
 */

import { useCallback, useRef } from 'react';
import type { RingServer } from './hashring';
import { SERVER_COLORS } from './hashring';

const W = 400;
const H = 400;
const R = W / 2 - 40;

export interface ServerPoint {
  server_name: string;
  x: number;
  y: number;
  color: string;
  angle: number;
}

export function useHashRingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const serverPointsRef = useRef<Map<number, ServerPoint>>(new Map());
  const prevBlinkRef = useRef<[number, number]>([0, 0]);

  const drawRing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = W;
    canvas.height = H;
    ctx.strokeStyle = '#dddddd';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(0.5, 0.5);
    ctx.beginPath();
    ctx.arc(W / 2, W / 2, R, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, []);

  const drawServer = useCallback(
    (ctx: CanvasRenderingContext2D, label: string, angle: number, color: string, hash: number) => {
      const pointSize = 12;
      const fontSize = '9px';
      const x = W / 2 + R * Math.cos((-angle * Math.PI) / 180);
      const y = W / 2 + R * Math.sin((-angle * Math.PI) / 180);

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = fontSize;
      ctx.fillText(label, x - 6, y + 3);
      serverPointsRef.current.set(hash, { server_name: label, x, y, color, angle });
    },
    [],
  );

  const drawServers = useCallback(
    (servers: Map<number, RingServer>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      serverPointsRef.current.clear();
      drawRing();

      let prev = 'S0';
      let ns = 0;
      servers.forEach((value, key) => {
        const angle = key;
        if (value.server_name !== prev) ns += 1;
        drawServer(ctx, value.server_name, angle, SERVER_COLORS[ns % SERVER_COLORS.length], key);
        prev = value.server_name;
      });
    },
    [drawRing, drawServer],
  );

  const blinkServer = useCallback((hash: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const p = serverPointsRef.current.get(hash);
    if (!p) return;

    const pointSize = 2;
    const x = W / 2 + R * Math.cos((-p.angle * Math.PI) / 180);
    const y = W / 2 + R * Math.sin((-p.angle * Math.PI) / 180) - 20;

    const [prevX, prevY] = prevBlinkRef.current;
    if (prevX > 0 && prevY > 0) {
      ctx.beginPath();
      ctx.fillStyle = '#ffffff';
      ctx.arc(prevX, prevY, pointSize + 1, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
    ctx.fill();
    prevBlinkRef.current = [x, y];
  }, []);

  return { canvasRef, drawRing, drawServers, blinkServer, canvasSize: { W, H } };
}
