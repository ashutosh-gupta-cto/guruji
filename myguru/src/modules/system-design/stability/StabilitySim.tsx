/**
 * Metastable failure / retry storm browser simulator.
 * Ported from marcbrooker/stability-sim (core DES logic).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_STABILITY_CONFIG,
  StabilityEngine,
  type StabilityMetrics,
} from './stability-engine';
import './stability.css';

function Sparkline({
  data,
  field,
  color,
}: {
  data: StabilityMetrics['timeSeries'];
  field: 'inFlight' | 'retries' | 'serverUtil';
  color: string;
}) {
  const w = 240;
  const h = 80;
  if (data.length < 2) {
    return (
      <svg className="stability-sim__sparkline" viewBox={`0 0 ${w} ${h}`}>
        <text x={w / 2} y={h / 2} fill="#64748b" fontSize="10" textAnchor="middle">
          Run simulation…
        </text>
      </svg>
    );
  }

  const values = data.map((d) => d[field]);
  const max = Math.max(...values, 1);
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - (v / max) * (h - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="stability-sim__sparkline" viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}

export function StabilitySim() {
  const engineRef = useRef(new StabilityEngine(DEFAULT_STABILITY_CONFIG));
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [metrics, setMetrics] = useState<StabilityMetrics>(engineRef.current.getMetrics());

  const tick = useCallback(() => {
    const m = engineRef.current.advance(0.25 * speed);
    setMetrics(m);
    if (m.status === 'completed') setRunning(false);
  }, [speed]);

  useEffect(() => {
    if (!running) return;
    const loop = (ts: number) => {
      if (lastRef.current === 0) lastRef.current = ts;
      const delta = ts - lastRef.current;
      if (delta >= 50) {
        lastRef.current = ts;
        tick();
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, tick]);

  const start = () => {
    engineRef.current.start();
    setMetrics(engineRef.current.getMetrics());
    lastRef.current = 0;
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    engineRef.current.reset();
    setMetrics(engineRef.current.getMetrics());
  };

  const cfg = DEFAULT_STABILITY_CONFIG;
  const overloaded =
    metrics.serverAActive + metrics.serverBActive >= cfg.serverConcurrency * 2 * 0.85;

  return (
    <div className="stability-sim">
      <div className="stability-sim__toolbar">
        <button type="button" className="stability-sim__btn stability-sim__btn--primary" onClick={start}>
          Run Retry Storm
        </button>
        <button type="button" className="stability-sim__btn" onClick={reset}>
          Reset
        </button>
        <button type="button" className="stability-sim__btn" onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : 'Resume'}
        </button>
        <label className="stability-sim__time">
          Speed
          <input
            type="range"
            min={1}
            max={8}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ marginLeft: 8, verticalAlign: 'middle' }}
          />
        </label>
        <span className="stability-sim__time">t = {metrics.currentTime.toFixed(1)}s</span>
      </div>

      <div className="stability-sim__body">
        <div className="stability-sim__topology">
          <div className="stability-sim__diagram">
            <div className="stability-sim__node">Client (retries ×{cfg.maxRetries})</div>
            <span className="stability-sim__arrow">↓</span>
            <div className="stability-sim__node">Load Balancer</div>
            <span className="stability-sim__arrow">↓</span>
            <div className="stability-sim__servers">
              <div
                className={`stability-sim__node${metrics.serverACrashed ? ' stability-sim__node--crashed' : overloaded ? ' stability-sim__node--hot' : ''}`}
              >
                Server A
                <br />
                {metrics.serverACrashed ? 'CRASHED' : `${metrics.serverAActive}/${cfg.serverConcurrency}`}
              </div>
              <div
                className={`stability-sim__node${overloaded ? ' stability-sim__node--hot' : ''}`}
              >
                Server B
                <br />
                {metrics.serverBActive}/{cfg.serverConcurrency}
              </div>
            </div>
          </div>
        </div>

        <div className="stability-sim__chart">
          <div className="stability-sim__metrics">
            <div className="stability-sim__metric stability-sim__metric--ok">
              Completed
              <span className="stability-sim__metric-value">{metrics.completed}</span>
            </div>
            <div className="stability-sim__metric stability-sim__metric--fail">
              Failed
              <span className="stability-sim__metric-value">{metrics.failed}</span>
            </div>
            <div className="stability-sim__metric">
              In flight
              <span className="stability-sim__metric-value">{metrics.inFlight}</span>
            </div>
            <div className="stability-sim__metric stability-sim__metric--retry">
              Retries
              <span className="stability-sim__metric-value">{metrics.retries}</span>
            </div>
          </div>

          <p className="stability-sim__chart-title">In-flight requests</p>
          <Sparkline data={metrics.timeSeries} field="inFlight" color="#f59e0b" />

          <p className="stability-sim__chart-title">Retry count</p>
          <Sparkline data={metrics.timeSeries} field="retries" color="#f87171" />
        </div>
      </div>

      <p className="stability-sim__note">
        Server A crashes at t={cfg.crashAt}s and recovers at t={cfg.recoverAt}s. Aggressive client
        retries amplify load — watch retries climb even after recovery (metastable failure).
      </p>
    </div>
  );
}
