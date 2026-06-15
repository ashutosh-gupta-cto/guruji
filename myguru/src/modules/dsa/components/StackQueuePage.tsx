import { useCallback, useEffect, useState } from 'react';

import { StepEngine } from '../core/step-engine';
import type { Step } from '../core/types';
import {
  generateDequeueSteps,
  generateEnqueueSteps,
  QUEUE_MAX_SIZE,
  QUEUE_STATE_COLORS,
  type QueueData,
  type QueueElement,
} from '../visualizers/queue';
import {
  generatePopSteps,
  generatePushSteps,
  STACK_MAX_SIZE,
  STACK_STATE_COLORS,
  type StackData,
  type StackElement,
} from '../visualizers/stack';

const BLOCK_W = 60;
const BLOCK_H = 50;
const GAP = 8;

type Tab = 'stack' | 'queue';

function toStackInitial(): Step<StackData> {
  return {
    id: 0,
    description: 'Stack ready — push or pop a value',
    snapshot: { data: { elements: [], maxSize: STACK_MAX_SIZE } },
    meta: { comparisons: 0, swaps: 0, reads: 0, writes: 0 },
  };
}

function toQueueInitial(): Step<QueueData> {
  return {
    id: 0,
    description: 'Queue ready — enqueue or dequeue a value',
    snapshot: { data: { elements: [], maxSize: QUEUE_MAX_SIZE } },
    meta: { comparisons: 0, swaps: 0, reads: 0, writes: 0 },
  };
}

export function StackQueuePage() {
  const [tab, setTab] = useState<Tab>('stack');
  const [value, setValue] = useState(42);
  const [stack, setStack] = useState<StackElement[]>([]);
  const [queue, setQueue] = useState<QueueElement[]>([]);
  const [stackSteps, setStackSteps] = useState<Step<StackData>[]>([toStackInitial()]);
  const [queueSteps, setQueueSteps] = useState<Step<QueueData>[]>([toQueueInitial()]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [engine] = useState(() => new StepEngine());

  useEffect(() => {
    return engine.subscribe((event) => {
      if (event.type === 'step-change') setIndex(event.index);
      if (event.type === 'play') setPlaying(true);
      if (event.type === 'pause' || event.type === 'complete') setPlaying(false);
    });
  }, [engine]);

  const runStackSteps = useCallback(
    (next: Step<StackData>[]) => {
      const final = next[next.length - 1]?.snapshot.data;
      if (final) setStack(final.elements.map((e) => ({ ...e, state: 'default' as const })));
      setStackSteps(next);
      engine.loadSteps(next);
      engine.reset();
    },
    [engine]
  );

  const runQueueSteps = useCallback(
    (next: Step<QueueData>[]) => {
      const final = next[next.length - 1]?.snapshot.data;
      if (final) setQueue(final.elements.map((e) => ({ ...e, state: 'default' as const })));
      setQueueSteps(next);
      engine.loadSteps(next);
      engine.reset();
    },
    [engine]
  );

  const switchTab = (next: Tab) => {
    setTab(next);
    setIndex(0);
    if (next === 'stack') {
      engine.loadSteps(stackSteps);
    } else {
      engine.loadSteps(queueSteps);
    }
    engine.reset();
  };

  const currentStack = stackSteps[index]?.snapshot.data;
  const currentQueue = queueSteps[index]?.snapshot.data;
  const description =
    tab === 'stack' ? stackSteps[index]?.description : queueSteps[index]?.description;

  return (
    <div className="viz-panel">
      <div className="viz-panel__controls">
        <button
          type="button"
          className={tab === 'stack' ? 'btn btn--primary' : 'btn btn--secondary'}
          onClick={() => switchTab('stack')}
        >
          Stack (LIFO)
        </button>
        <button
          type="button"
          className={tab === 'queue' ? 'btn btn--primary' : 'btn btn--secondary'}
          onClick={() => switchTab('queue')}
        >
          Queue (FIFO)
        </button>
        <label>
          Value
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="viz-input"
          />
        </label>
        {tab === 'stack' ? (
          <>
            <button type="button" className="btn btn--primary" onClick={() => runStackSteps(generatePushSteps(stack, value, STACK_MAX_SIZE))}>
              Push
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => runStackSteps(generatePopSteps(stack, STACK_MAX_SIZE))}>
              Pop
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setStack([]);
                runStackSteps([toStackInitial()]);
              }}
            >
              Clear
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn--primary" onClick={() => runQueueSteps(generateEnqueueSteps(queue, value, QUEUE_MAX_SIZE))}>
              Enqueue
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => runQueueSteps(generateDequeueSteps(queue, QUEUE_MAX_SIZE))}>
              Dequeue
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setQueue([]);
                runQueueSteps([toQueueInitial()]);
              }}
            >
              Clear
            </button>
          </>
        )}
      </div>

      <svg viewBox="0 0 600 320" className="viz-svg" role="img" aria-label={tab === 'stack' ? 'Stack visualization' : 'Queue visualization'}>
        {tab === 'stack' ? (
          <>
            <text x={300} y={24} fill="#9ca3af" fontSize={12} textAnchor="middle">
              Stack — size {(currentStack?.elements.length ?? 0)}/{STACK_MAX_SIZE}
            </text>
            <text x={300} y={290} fill="#71717a" fontSize={11} textAnchor="middle">
              bottom
            </text>
            <rect x={220} y={50} width={160} height={230} fill="none" stroke="#3f3f46" strokeWidth={2} />
            {(currentStack?.elements ?? []).map((el, i) => {
              const y = 260 - (i + 1) * (BLOCK_H + GAP);
              return (
                <g key={i}>
                  <rect x={240} y={y} width={120} height={BLOCK_H} rx={6} fill={STACK_STATE_COLORS[el.state]} />
                  <text x={300} y={y + BLOCK_H / 2 + 5} fill="#0f0f0f" fontSize={16} fontWeight={700} textAnchor="middle">
                    {el.value}
                  </text>
                  <text x={228} y={y + BLOCK_H / 2 + 4} fill="#71717a" fontSize={10} textAnchor="end">
                    [{i}]
                  </text>
                </g>
              );
            })}
            {(currentStack?.elements.length ?? 0) > 0 && (
              <text x={300} y={50} fill="#fbbf24" fontSize={12} fontWeight={700} textAnchor="middle">
                ↓ TOP
              </text>
            )}
          </>
        ) : (
          <>
            <text x={20} y={24} fill="#9ca3af" fontSize={12}>
              Queue — size {(currentQueue?.elements.length ?? 0)}/{QUEUE_MAX_SIZE}
            </text>
            <text x={70} y={170} fill="#71717a" fontSize={11} textAnchor="middle">
              FRONT →
            </text>
            <text x={530} y={170} fill="#71717a" fontSize={11} textAnchor="middle">
              ← REAR
            </text>
            <rect x={90} y={130} width={420} height={70} fill="none" stroke="#3f3f46" strokeWidth={2} />
            {(currentQueue?.elements ?? []).map((el, i) => {
              const x = 100 + i * (BLOCK_W + GAP);
              return (
                <g key={i}>
                  <rect x={x} y={140} width={BLOCK_W} height={BLOCK_H} rx={6} fill={QUEUE_STATE_COLORS[el.state]} />
                  <text x={x + BLOCK_W / 2} y={170} fill="#0f0f0f" fontSize={16} fontWeight={700} textAnchor="middle">
                    {el.value}
                  </text>
                  <text x={x + BLOCK_W / 2} y={220} fill="#71717a" fontSize={10} textAnchor="middle">
                    [{i}]
                  </text>
                </g>
              );
            })}
          </>
        )}
      </svg>

      <p className="viz-caption">{description}</p>

      <div className="viz-panel__controls">
        <button type="button" className="btn btn--secondary" onClick={() => engine.stepBack()}>
          Prev
        </button>
        <button type="button" className="btn btn--secondary" onClick={() => engine.stepForward()}>
          Next
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => (playing ? engine.pause() : engine.play())}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
}
