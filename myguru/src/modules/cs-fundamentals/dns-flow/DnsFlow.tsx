/**
 * Animated DNS → HTTP request journey.
 *
 * Inspired by jsg0000/dns-trace — step through cache, DNS resolution,
 * TCP handshake, TLS, and HTTP without external API dependencies.
 *
 * @see https://github.com/jsg0000/dns-trace
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Globe,
  Monitor,
  Network,
  Play,
  Server,
  Shield,
  Terminal,
} from 'lucide-react';
import {
  cleanDomain,
  getTld,
  INITIAL_STEPS,
  simulatedIp,
  STEP_DELAYS_MS,
  STEP_LOGS,
  stepResults,
  StepStatus,
  type LogEntry,
  type TraceStep,
} from './types';

const SERVER_ICONS: Record<string, ReactNode> = {
  client: <Monitor size={16} />,
  resolver: <Network size={16} />,
  root: <Globe size={16} />,
  tld: <Server size={16} />,
  authoritative: <Server size={16} />,
  tcp: <Network size={16} />,
  tls: <Shield size={16} />,
  http: <Globe size={16} />,
};

function StepNode({
  step,
  isActive,
}: {
  step: TraceStep;
  isActive: boolean;
}) {
  const statusClass =
    step.status === StepStatus.COMPLETED
      ? 'df-step--done'
      : step.status === StepStatus.ACTIVE
        ? 'df-step--active'
        : '';

  return (
    <div className={`df-step ${statusClass}${isActive ? ' df-step--current' : ''}`}>
      <div className="df-step__icon">{SERVER_ICONS[step.serverType]}</div>
      <div className="df-step__body">
        <div className="df-step__title">{step.title}</div>
        <div className="df-step__desc">{step.description}</div>
        {step.liveResult && (
          <div className="df-step__results">
            {step.liveResult.map((r, i) => (
              <span key={i} className="df-result-tag">
                {r}
              </span>
            ))}
          </div>
        )}
        {step.latency !== undefined && (
          <span className="df-latency">{step.latency}ms</span>
        )}
      </div>
    </div>
  );
}

export default function DnsFlow() {
  const [domainInput, setDomainInput] = useState('example.com');
  const [isTracing, setIsTracing] = useState(false);
  const [steps, setSteps] = useState<TraceStep[]>(INITIAL_STEPS);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const addLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    setLogs((prev) => [...prev, { msg, type }]);
  }, []);

  const runTrace = async () => {
    if (!domainInput.trim() || isTracing) return;
    const domain = cleanDomain(domainInput);
    const tld = getTld(domain);
    const ip = simulatedIp(domain);
    const results = stepResults(tld, ip);

    cancelRef.current = false;
    setIsTracing(true);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: StepStatus.IDLE, liveResult: undefined, latency: undefined })));
    setLogs([]);
    setActiveIndex(-1);

    addLog(`Initializing trace for: ${domain}`, 'info');

    for (let i = 0; i < INITIAL_STEPS.length; i++) {
      if (cancelRef.current) break;
      const stepId = INITIAL_STEPS[i].id;

      setActiveIndex(i);
      setSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: StepStatus.ACTIVE } : s)),
      );

      for (const logMsg of STEP_LOGS[stepId] ?? []) {
        addLog(logMsg, logMsg.startsWith('[') ? 'pkt' : 'info');
        await delay(STEP_DELAYS_MS[i] / (STEP_LOGS[stepId]?.length ?? 1));
      }

      const latency = 5 + Math.floor(Math.random() * 40) + i * 3;
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i
            ? {
                ...s,
                status: StepStatus.COMPLETED,
                liveResult: results[stepId],
                latency,
              }
            : s,
        ),
      );
      addLog(`✓ ${INITIAL_STEPS[i].title} complete (${latency}ms)`, 'success');
      await delay(200);
    }

    setActiveIndex(INITIAL_STEPS.length);
    setIsTracing(false);
  };

  return (
    <div className="df-root">
      <div className="df-search">
        <input
          className="csf-input"
          placeholder="domain (e.g. cloudflare.com)"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          disabled={isTracing}
        />
        <button
          type="button"
          className="csf-btn csf-btn--primary"
          onClick={runTrace}
          disabled={isTracing || !domainInput.trim()}
        >
          <Play size={14} />
          {isTracing ? 'Tracing…' : 'Start trace'}
        </button>
      </div>

      <div className="df-layout">
        <div className="df-topology">
          <h3 className="df-section-title">
            <Network size={14} /> Route topology
          </h3>
          <div className="df-steps">
            <div
              className="df-progress-line"
              style={{
                height: `${activeIndex >= 0 ? (activeIndex / (steps.length - 1)) * 100 : 0}%`,
              }}
            />
            {steps.map((step, idx) => (
              <StepNode key={step.id} step={step} isActive={activeIndex === idx} />
            ))}
          </div>
        </div>

        <div className="df-log-panel">
          <h3 className="df-section-title">
            <Terminal size={14} /> Protocol stream
          </h3>
          <div ref={logRef} className="df-log">
            {logs.length === 0 ? (
              <span className="df-log-empty">Awaiting trace…</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`df-log-line df-log-line--${log.type}`}>
                  <span className="df-log-prompt">›</span> {log.msg}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .df-root { display: flex; flex-direction: column; gap: 1rem; }
        .df-search { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .df-search .csf-input { flex: 1; min-width: 12rem; }
        .df-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 720px) { .df-layout { grid-template-columns: 1fr; } }
        .df-topology, .df-log-panel { background: var(--csf-bg-elev); border: 1px solid var(--csf-border); border-radius: 10px; padding: 1rem; }
        .df-section-title { display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--csf-teal); margin-bottom: 0.75rem; font-weight: 600; }
        .df-steps { position: relative; display: flex; flex-direction: column; gap: 0.75rem; }
        .df-progress-line { position: absolute; left: 15px; top: 8px; width: 2px; background: var(--csf-teal); transition: height 0.5s ease; z-index: 0; }
        .df-step { display: flex; gap: 0.75rem; position: relative; z-index: 1; opacity: 0.35; transition: opacity 0.4s; }
        .df-step--done, .df-step--active, .df-step--current { opacity: 1; }
        .df-step__icon { width: 32px; height: 32px; border-radius: 8px; background: var(--csf-bg-card); border: 1px solid var(--csf-border); display: flex; align-items: center; justify-content: center; color: var(--csf-fg-muted); flex-shrink: 0; }
        .df-step--active .df-step__icon, .df-step--current .df-step__icon { border-color: var(--csf-teal); color: var(--csf-teal); background: var(--csf-teal-dim); }
        .df-step--done .df-step__icon { border-color: var(--csf-green); color: var(--csf-green); }
        .df-step__title { font-size: 0.8rem; font-weight: 600; color: var(--csf-fg); }
        .df-step__desc { font-size: 0.7rem; color: var(--csf-fg-muted); }
        .df-step__results { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.25rem; }
        .df-result-tag { font-family: var(--csf-mono); font-size: 0.65rem; padding: 0.15rem 0.4rem; background: var(--csf-bg-card); border: 1px solid var(--csf-border); border-radius: 4px; color: var(--csf-teal); }
        .df-latency { font-family: var(--csf-mono); font-size: 0.65rem; color: var(--csf-fg-faint); }
        .df-log { font-family: var(--csf-mono); font-size: 0.75rem; max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.25rem; }
        .df-log-empty { color: var(--csf-fg-faint); }
        .df-log-line { color: var(--csf-fg-muted); }
        .df-log-line--pkt { color: var(--csf-cyan); }
        .df-log-line--success { color: var(--csf-green); }
        .df-log-line--err { color: var(--csf-red); }
        .df-log-prompt { color: var(--csf-fg-faint); margin-right: 0.25rem; }
      `}</style>
    </div>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
