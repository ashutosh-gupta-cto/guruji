/**
 * CPU scheduler visualizer — FCFS, SJF, Round Robin.
 * Inspired by AmirShakibafar/OS-Visualizer.
 */

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Cpu } from 'lucide-react';
import {
  DEFAULT_PROCESSES,
  runScheduler,
  type SchedulerAlgo,
  type SchedulerStep,
} from './scheduler';

const ALGOS: { id: SchedulerAlgo; label: string }[] = [
  { id: 'fcfs', label: 'FCFS' },
  { id: 'sjf', label: 'SJF' },
  { id: 'rr', label: 'Round Robin' },
];

function GanttChart({ step }: { step: SchedulerStep }) {
  if (step.gantt.length === 0) return null;
  const minT = step.gantt[0].start;
  const maxT = Math.max(...step.gantt.map((g) => g.end), minT + 1);
  const span = maxT - minT || 1;
  const colors = ['var(--csf-teal)', 'var(--csf-purple)', 'var(--csf-cyan)', 'var(--csf-amber)'];

  return (
    <div className="sched-gantt">
      <span className="csf-label">Gantt chart</span>
      <div className="sched-gantt-track">
        {step.gantt.map((g, i) => (
          <div
            key={`${g.id}-${g.start}`}
            className="sched-gantt-bar"
            style={{
              left: `${((g.start - minT) / span) * 100}%`,
              width: `${((g.end - g.start) / span) * 100}%`,
              background: colors[i % colors.length],
            }}
            title={`P${g.id}: ${g.start}–${g.end}`}
          >
            P{g.id}
          </div>
        ))}
      </div>
      <div className="sched-gantt-axis">
        <span>t={minT}</span>
        <span>t={maxT}</span>
      </div>
    </div>
  );
}

export default function CpuSchedulerViz() {
  const [algo, setAlgo] = useState<SchedulerAlgo>('fcfs');
  const [quantum, setQuantum] = useState(2);
  const [stepIdx, setStepIdx] = useState(0);

  const steps = useMemo(
    () => runScheduler(algo, { processes: DEFAULT_PROCESSES, quantum }),
    [algo, quantum],
  );
  const step = steps[stepIdx] ?? steps[0];

  return (
    <div className="sched-root">
      <div className="csf-toolbar">
        <Cpu size={14} />
        {ALGOS.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`csf-btn${algo === a.id ? ' csf-btn--primary' : ''}`}
            onClick={() => {
              setAlgo(a.id);
              setStepIdx(0);
            }}
          >
            {a.label}
          </button>
        ))}
        {algo === 'rr' && (
          <>
            <span className="csf-label" style={{ margin: 0 }}>
              Quantum
            </span>
            <input
              type="number"
              min={1}
              max={8}
              value={quantum}
              onChange={(e) => {
                setQuantum(Math.max(1, parseInt(e.target.value, 10) || 2));
                setStepIdx(0);
              }}
              className="csf-input"
              style={{ width: '3rem' }}
            />
          </>
        )}
      </div>

      <table className="sched-table">
        <thead>
          <tr>
            <th>PID</th>
            <th>Arrival</th>
            <th>Burst</th>
          </tr>
        </thead>
        <tbody>
          {DEFAULT_PROCESSES.map((p) => (
            <tr key={p.id}>
              <td>P{p.id}</td>
              <td>{p.arrival}</td>
              <td>{p.burst}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="sched-status">
        <div>
          <span className="csf-label">Time</span>
          <strong>{step.time}</strong>
        </div>
        <div>
          <span className="csf-label">Running</span>
          <strong>{step.running ? `P${step.running}` : 'idle'}</strong>
        </div>
        <div>
          <span className="csf-label">Ready queue</span>
          <strong>{step.readyQueue.length ? step.readyQueue.map((id) => `P${id}`).join(', ') : '—'}</strong>
        </div>
        <div>
          <span className="csf-label">Completed</span>
          <strong>{step.completed.length ? step.completed.map((id) => `P${id}`).join(', ') : '—'}</strong>
        </div>
      </div>

      <p className="sched-msg">{step.message}</p>
      <GanttChart step={step} />

      <div className="sched-stepper">
        <button
          type="button"
          className="csf-btn"
          disabled={stepIdx <= 0}
          onClick={() => setStepIdx((i) => i - 1)}
        >
          <ChevronLeft size={14} />
        </button>
        <span>
          Step {stepIdx + 1}/{steps.length}
        </span>
        <button
          type="button"
          className="csf-btn"
          disabled={stepIdx >= steps.length - 1}
          onClick={() => setStepIdx((i) => i + 1)}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <style>{`
        .sched-root { display: flex; flex-direction: column; gap: 0.75rem; }
        .sched-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        .sched-table th, .sched-table td { padding: 0.4rem 0.6rem; border: 1px solid var(--csf-border); text-align: left; }
        .sched-table th { background: var(--csf-bg-elev); color: var(--csf-fg-muted); }
        .sched-status { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; }
        .sched-msg { font-size: 0.85rem; color: var(--csf-fg-muted); margin: 0; }
        .sched-gantt-track { position: relative; height: 2rem; background: var(--csf-bg-elev); border-radius: 6px; border: 1px solid var(--csf-border); margin-top: 0.35rem; }
        .sched-gantt-bar { position: absolute; top: 2px; bottom: 2px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; color: #042f2e; min-width: 1.5rem; }
        .sched-gantt-axis { display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--csf-fg-faint); margin-top: 0.25rem; }
        .sched-stepper { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--csf-fg-muted); }
      `}</style>
    </div>
  );
}
