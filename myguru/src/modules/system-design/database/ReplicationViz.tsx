/**
 * Single-leader replication visualization.
 * Ported from PatrickKoss/database-internals-visualized
 * @see https://github.com/PatrickKoss/database-internals-visualized
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  generateReplicationFrames,
  type ReplicationFrame,
  type ReplicationConfig,
} from './replication-engine';
import './database.css';

const CANVAS_W = 860;
const CANVAS_H = 420;
const NODE_R = 28;

function drawLogPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  log: { key: string; value: string }[],
  label: string,
): void {
  const w = 88;
  const entryH = 14;
  const headerH = 16;
  const visible = log.slice(-4);
  const h = headerH + visible.length * entryH + 4;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#475569';
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + 11);

  visible.forEach((e, i) => {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`${e.key}=${e.value}`, x + w / 2, y + headerH + i * entryH + 10);
  });
}

function renderFrame(ctx: CanvasRenderingContext2D, frame: ReplicationFrame): void {
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Single-Leader Replication', CANVAS_W / 2, 24);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText(frame.annotation.slice(0, 90), CANVAS_W / 2, 44);

  const { leader, followers } = frame;
  const leaderX = CANVAS_W / 2;
  const leaderY = 90;

  const leaderColor = !leader.alive
    ? '#64748b'
    : frame.highlightId === leader.id
      ? '#fbbf24'
      : '#2563eb';

  ctx.fillStyle = leaderColor;
  ctx.beginPath();
  ctx.arc(leaderX, leaderY, NODE_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(leader.id, leaderX, leaderY);
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillStyle = leader.alive ? '#93c5fd' : '#94a3b8';
  ctx.fillText(leader.alive ? 'Leader' : 'DEAD', leaderX, leaderY + NODE_R + 14);

  drawLogPanel(ctx, leaderX + NODE_R + 12, leaderY - 28, leader.log, 'Log');

  const followerY = 260;
  const spacing = Math.min(160, (CANVAS_W - 120) / Math.max(followers.length, 1));
  const startX = CANVAS_W / 2 - ((followers.length - 1) * spacing) / 2;

  followers.forEach((follower, i) => {
    const fx = startX + i * spacing;

    if (leader.alive) {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leaderX, leaderY + NODE_R);
      ctx.lineTo(fx, followerY - NODE_R);
      ctx.stroke();
    }

    let color = follower.role === 'leader' ? '#2563eb' : '#059669';
    if (frame.highlightId === follower.id) {
      color = frame.staleRead ? '#dc2626' : '#fbbf24';
    }
    if (!follower.alive) color = '#64748b';

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(fx, followerY, NODE_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(follower.id, fx, followerY);
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText(follower.role === 'leader' ? 'New Leader' : 'Follower', fx, followerY + NODE_R + 14);

    if (frame.highlightId === follower.id && frame.staleRead) {
      ctx.fillStyle = '#fef2f2';
      ctx.fillRect(fx - 36, followerY + NODE_R + 22, 72, 16);
      ctx.fillStyle = '#dc2626';
      ctx.font = '9px system-ui, sans-serif';
      ctx.fillText('STALE READ!', fx, followerY + NODE_R + 33);
    }

    drawLogPanel(ctx, fx - 44, followerY + NODE_R + 40, follower.log, 'Log');
  });

  for (const msg of frame.messages) {
    const fromX = msg.fromId === 'L' ? leaderX : startX;
    const fromY = msg.fromId === 'L' ? leaderY + NODE_R : followerY + NODE_R;
    const fi = followers.findIndex((f) => f.id === msg.toId);
    if (fi < 0) continue;
    const tx = startX + fi * spacing;
    const ty = followerY - NODE_R;
    const mx = fromX + (tx - fromX) * msg.progress;
    const my = fromY + (ty - fromY) * msg.progress;

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(mx, my, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '9px system-ui, sans-serif';
    ctx.fillText(`${msg.entry.key}=${msg.entry.value}`, mx, my - 10);
  }

  ctx.fillStyle = '#64748b';
  ctx.font = '10px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`t=${frame.clock}`, 16, CANVAS_H - 12);
}

export function ReplicationViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useState<ReplicationConfig>({ numFollowers: 3, replicationLag: 3 });
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frames = useMemo(() => generateReplicationFrames(config), [config]);
  const frame = frames[frameIndex] ?? frames[0];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frame) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderFrame(ctx, frame);
  }, [frame]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    setFrameIndex(0);
    setPlaying(false);
  }, [config]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setFrameIndex((i) => {
        if (i >= frames.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 900);
    return () => clearInterval(id);
  }, [playing, frames.length]);

  return (
    <div className="replication-viz">
      <header className="replication-viz__header">
        <h2>Database Replication</h2>
        <p>Single-leader async replication — PatrickKoss/database-internals-visualized</p>
      </header>

      <div className="replication-viz__config">
        <label>
          Followers
          <input
            type="range"
            min={2}
            max={5}
            value={config.numFollowers}
            onChange={(e) =>
              setConfig((c) => ({ ...c, numFollowers: Number(e.target.value) }))
            }
          />
          {config.numFollowers}
        </label>
        <label>
          Replication lag (frames)
          <input
            type="range"
            min={1}
            max={5}
            value={config.replicationLag}
            onChange={(e) =>
              setConfig((c) => ({ ...c, replicationLag: Number(e.target.value) }))
            }
          />
          {config.replicationLag}
        </label>
      </div>

      <div className="replication-viz__controls">
        <button
          type="button"
          className="replication-viz__btn"
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="replication-viz__btn"
          disabled={frameIndex <= 0}
          onClick={() => setFrameIndex((i) => Math.max(0, i - 1))}
        >
          Prev
        </button>
        <button
          type="button"
          className="replication-viz__btn"
          disabled={frameIndex >= frames.length - 1}
          onClick={() => setFrameIndex((i) => Math.min(frames.length - 1, i + 1))}
        >
          Next
        </button>
        <span className="replication-viz__frame-info">
          Frame {frameIndex + 1} / {frames.length}
        </span>
      </div>

      <div className="replication-viz__canvas-wrap">
        <canvas ref={canvasRef} className="replication-viz__canvas" width={CANVAS_W} height={CANVAS_H} />
      </div>

      <p className={`replication-viz__annotation${frame.staleRead ? ' replication-viz__annotation--stale' : ''}`}>
        {frame.annotation}
      </p>
    </div>
  );
}
