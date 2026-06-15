import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';

interface StandardParams {
  mode: 'standard';
  b: number;
  s: number;
  l: number;
  h: number;
  d: number;
  q: number;
}

interface SimplifiedParams {
  mode: 'simplified';
  b: number;
  s: number;
  l: number;
  hxd: number;
  q: number;
}

type Params = StandardParams | SimplifiedParams;

const PRESETS: { label: string; params: Omit<StandardParams, 'mode'> }[] = [
  { label: 'Llama-3 8B', params: { b: 1, s: 4096, l: 32, h: 32, d: 128, q: 16 } },
  { label: 'GPT-2 small', params: { b: 1, s: 1024, l: 12, h: 12, d: 64, q: 16 } },
  { label: 'Long context', params: { b: 1, s: 32768, l: 32, h: 32, d: 128, q: 16 } },
];

function kvCacheGb(params: Params): number {
  if (params.mode === 'standard') {
    return (2 * params.b * params.s * params.l * params.h * params.d * (params.q / 8)) / 1024 ** 3;
  }
  return (2 * params.b * params.s * params.l * params.hxd * (params.q / 8)) / 1024 ** 3;
}

function estimatePrefillMs(seqLen: number, layers: number) {
  return Math.round(12 + seqLen * 0.08 + layers * 2.5);
}

function estimateDecodeMs(tokens: number) {
  return Math.round(18 + tokens * 42);
}

export function KvCacheCalculator() {
  const [params, setParams] = useState<Params>({
    mode: 'standard',
    b: 1,
    s: 1024,
    l: 32,
    h: 32,
    d: 128,
    q: 16,
  });
  const [outputTokens, setOutputTokens] = useState(128);

  const kvGb = useMemo(() => kvCacheGb(params), [params]);
  const prefillMs = estimatePrefillMs(params.s, params.l);
  const decodeMs = estimateDecodeMs(outputTokens);
  const ttft = prefillMs;
  const totalLatency = prefillMs + decodeMs;

  const setCommon = (key: 'b' | 's' | 'l' | 'q', value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="aiml-inference">
      <header className="aiml-inference__header">
        <Calculator size={20} className="aiml-accent" />
        <div>
          <h3>LLM Inference: Prefill, Decode &amp; KV Cache</h3>
          <p>
            Estimate KV-cache memory and compare prefill vs decode latency — concepts from the
            BentoML LLM Inference Handbook.
          </p>
        </div>
      </header>

      <div className="aiml-inference__presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="aiml-btn"
            onClick={() => setParams({ mode: 'standard', ...p.params })}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="aiml-inference__grid">
        <section className="aiml-inference__panel">
          <h4>Model Parameters</h4>
          <div className="aiml-inference__mode">
            {(['standard', 'simplified'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={`aiml-btn${params.mode === m ? ' aiml-btn--primary' : ''}`}
                onClick={() =>
                  setParams(
                    m === 'standard'
                      ? { mode: 'standard', b: 1, s: 1024, l: 32, h: 32, d: 128, q: 16 }
                      : { mode: 'simplified', b: 1, s: 1024, l: 32, hxd: 4096, q: 16 },
                  )
                }
              >
                {m === 'standard' ? 'Standard (H × D)' : 'Simplified (H×D)'}
              </button>
            ))}
          </div>

          <label>
            Batch size (B)
            <input type="number" min={1} value={params.b} onChange={(e) => setCommon('b', Number(e.target.value))} />
          </label>
          <label>
            Sequence length (S)
            <input type="number" min={1} value={params.s} onChange={(e) => setCommon('s', Number(e.target.value))} />
          </label>
          <label>
            Layers (L)
            <input type="number" min={1} value={params.l} onChange={(e) => setCommon('l', Number(e.target.value))} />
          </label>
          {params.mode === 'standard' ? (
            <>
              <label>
                Heads (H)
                <input
                  type="number"
                  min={1}
                  value={params.h}
                  onChange={(e) => setParams({ ...params, h: Number(e.target.value) })}
                />
              </label>
              <label>
                Head dim (D)
                <input
                  type="number"
                  min={1}
                  value={params.d}
                  onChange={(e) => setParams({ ...params, d: Number(e.target.value) })}
                />
              </label>
            </>
          ) : (
            <label>
              Model dim (H × D)
              <input
                type="number"
                min={1}
                value={params.hxd}
                onChange={(e) => setParams({ ...params, hxd: Number(e.target.value) })}
              />
            </label>
          )}
          <label>
            Precision
            <select value={params.q} onChange={(e) => setCommon('q', Number(e.target.value))}>
              <option value={32}>FP32</option>
              <option value={16}>FP16</option>
              <option value={8}>INT8</option>
              <option value={4}>FP4</option>
            </select>
          </label>
          <label>
            Output tokens (decode)
            <input
              type="number"
              min={1}
              max={4096}
              value={outputTokens}
              onChange={(e) => setOutputTokens(Number(e.target.value))}
            />
          </label>
        </section>

        <section className="aiml-inference__panel">
          <h4>KV Cache Memory</h4>
          <div className="aiml-inference__result">
            <span className="aiml-inference__big">{kvGb.toFixed(2)} GB</span>
            <span className="aiml-muted">estimated KV cache</span>
          </div>
          <pre className="aiml-inference__formula">
            {params.mode === 'standard'
              ? `2 × B × S × L × H × D × (Q/8) / 1024³\n= 2 × ${params.b} × ${params.s} × ${params.l} × ${params.h} × ${params.d} × (${params.q}/8) / 1024³`
              : `2 × B × S × L × ModelDim × (Q/8) / 1024³\n= 2 × ${params.b} × ${params.s} × ${params.l} × ${params.hxd} × (${params.q}/8) / 1024³`}
          </pre>
          <p className="aiml-muted">
            KV cache grows linearly with sequence length — the main memory bottleneck for long chats.
          </p>
        </section>

        <section className="aiml-inference__panel aiml-inference__panel--wide">
          <h4>Prefill vs Decode Timeline</h4>
          <div className="aiml-inference__timeline">
            <div className="aiml-inference__bar aiml-inference__bar--prefill" style={{ flex: prefillMs }}>
              <span>Prefill</span>
              <strong>{prefillMs} ms</strong>
              <small>{params.s} input tokens processed in parallel</small>
            </div>
            <div className="aiml-inference__bar aiml-inference__bar--decode" style={{ flex: decodeMs }}>
              <span>Decode</span>
              <strong>{decodeMs} ms</strong>
              <small>{outputTokens} tokens, one at a time</small>
            </div>
          </div>
          <div className="aiml-inference__metrics">
            <div>
              <span className="aiml-muted">TTFT (time to first token)</span>
              <strong>{ttft} ms</strong>
            </div>
            <div>
              <span className="aiml-muted">Total latency</span>
              <strong>{totalLatency} ms</strong>
            </div>
            <div>
              <span className="aiml-muted">ITL (inter-token latency)</span>
              <strong>{Math.round(decodeMs / Math.max(outputTokens, 1))} ms/tok</strong>
            </div>
          </div>
          <p className="aiml-muted">
            Prefill processes all prompt tokens at once (compute-bound). Decode generates each new
            token autoregressively, reusing the growing KV cache (memory-bandwidth bound).
          </p>
        </section>
      </div>
    </div>
  );
}
