import { useCallback, useEffect, useMemo, useState } from 'react';
import sampleTraces from '../content/sample-traces.json';
import { ReplayStage } from './ReplayStage';
import { TraceInput } from './TraceInput';
import { parseTrace } from './parse';
import type { SampleTrace } from './types';

const BASE_INTERVAL = 1100;
const traces = sampleTraces.traces as SampleTrace[];

export function AgentReplayDemo() {
  const [traceId, setTraceId] = useState(traces[0]?.id ?? '');
  const activeTrace = traces.find((t) => t.id === traceId) ?? traces[0];
  const initialJson = JSON.stringify(activeTrace?.messages ?? [], null, 2);

  const [text, setText] = useState(initialJson);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const parsed = useMemo(() => parseTrace(text), [text]);
  const steps = parsed.steps;
  const total = steps.length;

  const displayCursor = Math.min(cursor, total);

  useEffect(() => {
    if (!playing || total === 0) return;
    const t = setTimeout(() => {
      setCursor((c) => {
        if (c >= total) return c;
        const next = c + 1;
        if (next >= total) setPlaying(false);
        return next;
      });
    }, BASE_INTERVAL / speed);
    return () => clearTimeout(t);
  }, [playing, cursor, total, speed]);

  const selectTrace = useCallback((id: string) => {
    const trace = traces.find((t) => t.id === id);
    if (!trace) return;
    setTraceId(id);
    setText(JSON.stringify(trace.messages, null, 2));
    setCursor(0);
    setPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (total === 0) return;
    if (cursor >= total) {
      setCursor(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  }, [cursor, total]);

  const step = useCallback(
    (dir: -1 | 1) => {
      setPlaying(false);
      setCursor((c) => Math.max(0, Math.min(total, c + dir)));
    },
    [total],
  );

  const restart = useCallback(() => {
    setPlaying(false);
    setCursor(0);
  }, []);

  const seek = useCallback((c: number) => {
    setPlaying(false);
    setCursor(c);
  }, []);

  const loadSample = useCallback(() => {
    if (!activeTrace) return;
    setText(JSON.stringify(activeTrace.messages, null, 2));
    setCursor(0);
    setPlaying(true);
  }, [activeTrace]);

  return (
    <div className="aiml-replay-demo">
      <aside className="aiml-replay-demo__sidebar">
        <div className="aiml-trace-picker">
          <p className="aiml-trace-picker__label">Sample traces</p>
          {traces.map((trace) => (
            <button
              key={trace.id}
              type="button"
              className={
                trace.id === traceId
                  ? 'aiml-trace-picker__item aiml-trace-picker__item--active'
                  : 'aiml-trace-picker__item'
              }
              onClick={() => selectTrace(trace.id)}
            >
              <strong>{trace.title}</strong>
              <span>{trace.description}</span>
            </button>
          ))}
        </div>
        <TraceInput
          text={text}
          onChange={setText}
          onLoadSample={loadSample}
          parseError={parsed.ok ? null : (parsed.error ?? null)}
          stats={parsed.ok ? parsed.stats : null}
          traceTitle={activeTrace?.title}
        />
      </aside>
      <section className="aiml-replay-demo__stage">
        <ReplayStage
          steps={steps}
          cursor={displayCursor}
          playing={playing}
          speed={speed}
          onTogglePlay={togglePlay}
          onStep={step}
          onRestart={restart}
          onSeek={seek}
          onSpeed={setSpeed}
        />
      </section>
    </div>
  );
}
