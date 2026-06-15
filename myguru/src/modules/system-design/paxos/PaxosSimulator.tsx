/**
 * Paxos consensus visualization — prepare, promise, accept, learn.
 * Ported from jivimberg/paxos-playground
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PaxosSimulation,
  phaseColor,
  phaseLabel,
  type PaxosMessage,
  type PaxosNode,
} from './paxos-engine';
import './paxos.css';

const CANVAS_W = 720;
const CANVAS_H = 400;
const NODE_R = 32;

function msgColor(type: PaxosMessage['type']): string {
  switch (type) {
    case 'Prepare':
      return '#f59e0b';
    case 'Promise':
      return '#eab308';
    case 'Accept':
      return '#3b82f6';
    case 'Accepted':
      return '#8b5cf6';
    case 'Learn':
      return '#22c55e';
    default:
      return '#94a3b8';
  }
}

function draw(
  ctx: CanvasRenderingContext2D,
  sim: PaxosSimulation,
  nodes: PaxosNode[],
): void {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  for (const msg of sim.messages) {
    const from = nodes.find((n) => n.id === msg.from);
    const to = nodes.find((n) => n.id === msg.to);
    if (!from || !to) continue;
    const t = msg.progress;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    ctx.fillStyle = msgColor(msg.type);
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '9px system-ui';
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'center';
    ctx.fillText(msg.type, x, y - 10);
  }

  for (const node of nodes) {
    const roleColors = {
      proposer: '#2563eb',
      acceptor: '#7c3aed',
      learner: '#059669',
    };
    ctx.fillStyle = roleColors[node.role];
    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_R, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label =
      node.role === 'proposer' ? 'P' : node.role === 'learner' ? 'L' : `A${node.id}`;
    ctx.fillText(label, node.x, node.y);

    ctx.font = '10px system-ui';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(node.role, node.x, node.y + NODE_R + 12);

    if (node.role === 'acceptor') {
      const acc = sim.acceptors.find((a) => a.id === node.id);
      if (acc?.acceptedValue) {
        ctx.fillStyle = '#22c55e';
        ctx.fillText(`"${acc.acceptedValue}"`, node.x, node.y + NODE_R + 24);
      }
    }
  }

  if (sim.decidedValue) {
    ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
    ctx.fillRect(0, CANVAS_H - 36, CANVAS_W, 36);
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`Consensus reached: ${sim.decidedValue}`, CANVAS_W / 2, CANVAS_H - 14);
  }
}

export function PaxosSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef(new PaxosSimulation(CANVAS_W, CANVAS_H));
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const [, tick] = useState(0);
  const [running, setRunning] = useState(true);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const sim = simRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    draw(ctx, sim, sim.nodes);
  }, []);

  useEffect(() => {
    const loop = (ts: number) => {
      if (lastRef.current === 0) lastRef.current = ts;
      const delta = ts - lastRef.current;
      lastRef.current = ts;

      if (running) {
        simRef.current.tickMessage(delta);
        tick((n) => n + 1);
      }
      render();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, render]);

  const sim = simRef.current;
  const snap = sim.getSnapshot();

  return (
    <div className="paxos-sim">
      <div className="paxos-sim__toolbar">
        <button
          type="button"
          className="paxos-sim__btn paxos-sim__btn--primary"
          onClick={() => {
            sim.startPrepare();
            tick((n) => n + 1);
          }}
          disabled={snap.phase !== 'idle' && snap.phase !== 'decided'}
        >
          Start Prepare
        </button>
        <button
          type="button"
          className="paxos-sim__btn"
          onClick={() => {
            sim.reset();
            tick((n) => n + 1);
          }}
        >
          Reset
        </button>
        <button type="button" className="paxos-sim__btn" onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : 'Resume'}
        </button>
        <span className="paxos-sim__phase" style={{ color: phaseColor(snap.phase) }}>
          {phaseLabel(snap.phase)}
        </span>
      </div>

      <div className="paxos-sim__canvas-wrap">
        <canvas
          ref={canvasRef}
          className="paxos-sim__canvas"
          width={CANVAS_W}
          height={CANVAS_H}
        />
      </div>

      <div className="paxos-sim__stats">
        <span>Proposal n={snap.proposalNum}</span>
        <span>Promises: {snap.promisesReceived}/{sim.quorum}</span>
        <span>Accepts: {snap.acceptsReceived}/{sim.quorum}</span>
        <span>Value: {snap.proposedValue}</span>
      </div>

      <div className="paxos-sim__log">
        {snap.log.length === 0 ? (
          <p className="paxos-sim__log-entry">Click &quot;Start Prepare&quot; to begin Phase 1.</p>
        ) : (
          snap.log.map((entry, i) => (
            <p key={i} className="paxos-sim__log-entry">
              {entry}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
