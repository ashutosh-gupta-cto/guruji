/**
 * Raft consensus visualization — leader election & log replication (simplified).
 * Ported from AarjavPatni/raft-visualization
 * @see https://github.com/AarjavPatni/raft-visualization
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RaftSimulation,
  stateColor,
  type RaftNodeModel,
} from './raft-engine';
import './raft.css';

const CANVAS_W = 720;
const CANVAS_H = 480;
const NODE_RADIUS = 36;

function drawCluster(
  ctx: CanvasRenderingContext2D,
  sim: RaftSimulation,
  nodes: RaftNodeModel[],
): void {
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  for (let x = 0; x < CANVAS_W; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_H);
    ctx.stroke();
  }
  for (let y = 0; y < CANVAS_H; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_W, y);
    ctx.stroke();
  }

  const leader = nodes.find((n) => n.state === 'leader' && n.isAlive);
  if (leader) {
    for (const node of nodes) {
      if (node.id !== leader.id && node.isAlive) {
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leader.x, leader.y);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();
      }
    }
  }

  for (const msg of sim.messages) {
    const from = nodes[msg.from];
    const to = nodes[msg.to];
    if (!from || !to) continue;
    const t = msg.progress;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    ctx.fillStyle =
      msg.type === 'RequestVote' ? '#ff9800' : msg.type === 'VoteGranted' ? '#4caf50' : '#ffd700';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const node of nodes) {
    ctx.fillStyle = stateColor(node.state);
    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = node.state === 'leader' ? '#fff' : '#1e293b';
    ctx.lineWidth = node.state === 'leader' ? 3 : 1;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(node.id), node.x, node.y);

    ctx.font = '10px system-ui, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(node.state, node.x, node.y + NODE_RADIUS + 12);

    if (node.log.length > 0) {
      ctx.fillStyle = '#64748b';
      ctx.fillText(`log:${node.log.length}`, node.x, node.y + NODE_RADIUS + 24);
    }
  }
}

export function RaftSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<RaftSimulation>(new RaftSimulation(5, CANVAS_W, CANVAS_H));
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [stats, setStats] = useState(simRef.current.getStats());
  const [, tick] = useState(0);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const sim = simRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawCluster(ctx, sim, sim.nodes);
    setStats(sim.getStats());
  }, []);

  useEffect(() => {
    simRef.current.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    const loop = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (running) {
        simRef.current.update(delta);
        render();
        tick((n) => n + 1);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, render]);

  const handleReset = () => {
    simRef.current.reset();
    lastTimeRef.current = 0;
    render();
  };

  const handleRequest = () => {
    simRef.current.addClientRequest();
    render();
  };

  const handleKill = () => {
    simRef.current.killRandomNode();
    render();
  };

  const handleRevive = () => {
    simRef.current.reviveAll();
    render();
  };

  return (
    <div className="raft-sim">
      <div className="raft-sim__toolbar">
        <button type="button" className="raft-sim__btn" onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : 'Resume'}
        </button>
        <button type="button" className="raft-sim__btn" onClick={handleReset}>
          Reset
        </button>
        <button type="button" className="raft-sim__btn raft-sim__btn--primary" onClick={handleRequest}>
          Client Request
        </button>
        <button type="button" className="raft-sim__btn" onClick={handleKill}>
          Kill Random Node
        </button>
        <button type="button" className="raft-sim__btn" onClick={handleRevive}>
          Revive All
        </button>
        <label className="raft-sim__speed">
          Speed {speed}x
          <input
            type="range"
            min={1}
            max={5}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="raft-sim__canvas-wrap">
        <canvas
          ref={canvasRef}
          className="raft-sim__canvas"
          width={CANVAS_W}
          height={CANVAS_H}
        />
        <div className="raft-sim__stats">
          Term: {stats.currentTerm}
          <br />
          Leader: {stats.leader}
          <br />
          Nodes: {stats.aliveNodes}/{stats.totalNodes}
          <br />
          Messages: {stats.activeMessages}
        </div>
      </div>

      <footer className="raft-sim__footer">
        Simplified Raft: followers timeout → candidate → leader election → heartbeats &amp; log
        replication.
        <div className="raft-sim__legend">
          <span className="raft-sim__legend-item">
            <span className="raft-sim__legend-dot" style={{ background: '#2196f3' }} />
            Follower
          </span>
          <span className="raft-sim__legend-item">
            <span className="raft-sim__legend-dot" style={{ background: '#ff9800' }} />
            Candidate
          </span>
          <span className="raft-sim__legend-item">
            <span className="raft-sim__legend-dot" style={{ background: '#ffd700' }} />
            Leader
          </span>
          <span className="raft-sim__legend-item">
            <span className="raft-sim__legend-dot" style={{ background: '#666' }} />
            Dead
          </span>
        </div>
      </footer>
    </div>
  );
}
