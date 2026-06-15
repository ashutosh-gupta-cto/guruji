import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

import { SAMPLE_RAG_TRACE, type RagEvidence } from './sample-data';

type ReplayPhase = 'query' | 'retrieve' | 'rank' | 'generate' | 'trace';

const PHASES: { id: ReplayPhase; label: string; blurb: string }[] = [
  { id: 'query', label: 'Query', blurb: 'User submits a question to the RAG system.' },
  { id: 'retrieve', label: 'Retrieve', blurb: 'Vector search returns candidate document chunks.' },
  { id: 'rank', label: 'Rank', blurb: 'Chunks are scored and ordered by relevance.' },
  { id: 'generate', label: 'Generate', blurb: 'LLM synthesizes an answer from top chunks.' },
  { id: 'trace', label: 'Trace', blurb: 'Evidence chains link answer spans to source chunks.' },
];

function relevanceClass(r: number) {
  if (r >= 0.8) return 'aiml-ragtrace__chunk--high';
  if (r >= 0.5) return 'aiml-ragtrace__chunk--mid';
  return 'aiml-ragtrace__chunk--low';
}

function impactLabel(metric: number) {
  if (metric > 0) return { icon: '↑', text: 'Positive', cls: 'positive' };
  if (metric === 0) return { icon: '―', text: 'Neutral', cls: 'neutral' };
  return { icon: '↓', text: 'Negative', cls: 'negative' };
}

export function RagTraceReplay() {
  const data = SAMPLE_RAG_TRACE;
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [referenced, setReferenced] = useState<Set<string>>(new Set());

  const phase = PHASES[phaseIdx]!;
  const rankedChunks = useMemo(
    () => [...data.chunks].sort((a, b) => b.relevance - a.relevance),
    [data.chunks],
  );
  const topChunks = rankedChunks.slice(0, 3);
  const activeEvidence = data.evidences.find((e) => e.id === selectedEvidenceId);

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      setPhaseIdx((i) => {
        if (i >= PHASES.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 2200);
    return () => clearTimeout(timer);
  }, [playing, phaseIdx]);

  const toggleReference = useCallback((id: string) => {
    setReferenced((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const renderEvidence = (item: RagEvidence) => {
    const impact = impactLabel(item.impactMetric);
    const selected = selectedEvidenceId === item.id;
    return (
      <button
        key={item.id}
        type="button"
        className={`aiml-ragtrace__evidence${selected ? ' aiml-ragtrace__evidence--selected' : ''}`}
        onClick={() => setSelectedEvidenceId(selected ? null : item.id)}
      >
        <div className="aiml-ragtrace__evidence-header">
          <strong>{item.source}</strong>
          <div className="aiml-ragtrace__evidence-actions">
            <span className={`aiml-ragtrace__impact aiml-ragtrace__impact--${impact.cls}`}>
              {impact.icon} {impact.text}
            </span>
            <span
              role="button"
              tabIndex={0}
              className={`aiml-btn aiml-ragtrace__ref-btn${referenced.has(item.id) ? ' aiml-ragtrace__ref-btn--active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleReference(item.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  toggleReference(item.id);
                }
              }}
            >
              {referenced.has(item.id) ? 'Referenced' : 'Add ref'}
            </span>
          </div>
        </div>
        <p>{item.summary ?? item.text}</p>
        <div className="aiml-ragtrace__connection">
          <span className="aiml-ragtrace__chip">{item.sourceEntity}</span>
          <span className="aiml-ragtrace__arrow">→</span>
          <span className="aiml-ragtrace__chip aiml-ragtrace__chip--answer">{item.answerEntity}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="aiml-ragtrace">
      <header className="aiml-ragtrace__header">
        <div>
          <h3>RAG Evidence Trace</h3>
          <p>Replay how retrieved chunks support a generated answer — inspired by RAGTrace.</p>
        </div>
        <div className="aiml-ragtrace__controls">
          <button
            type="button"
            className="aiml-btn"
            onClick={() => setPhaseIdx((i) => Math.max(0, i - 1))}
            disabled={phaseIdx === 0}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            className="aiml-btn aiml-btn--primary"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            {playing ? 'Pause' : 'Replay'}
          </button>
          <button
            type="button"
            className="aiml-btn"
            onClick={() => setPhaseIdx((i) => Math.min(PHASES.length - 1, i + 1))}
            disabled={phaseIdx === PHASES.length - 1}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </header>

      <div className="aiml-ragtrace__phases">
        {PHASES.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={`aiml-ragtrace__phase${i === phaseIdx ? ' aiml-ragtrace__phase--active' : ''}${i < phaseIdx ? ' aiml-ragtrace__phase--done' : ''}`}
            onClick={() => setPhaseIdx(i)}
          >
            <span className="aiml-ragtrace__phase-num">{i + 1}</span>
            {p.label}
          </button>
        ))}
      </div>
      <p className="aiml-ragtrace__phase-blurb">{phase.blurb}</p>

      <div className="aiml-ragtrace__body">
        <section className="aiml-ragtrace__panel">
          <h4>Query &amp; Chunks</h4>
          <div className="aiml-ragtrace__query">
            <span className="aiml-muted">Q:</span> {data.query}
          </div>

          {(phaseIdx >= 1 || phase.id === 'query') && (
            <ul className="aiml-ragtrace__chunk-list">
              {(phaseIdx >= 2 ? rankedChunks : data.chunks).map((chunk, i) => (
                <li
                  key={chunk.id}
                  className={`aiml-ragtrace__chunk ${relevanceClass(chunk.relevance)}${
                    activeEvidence?.relatedChunkIndex === i && phaseIdx >= 4
                      ? ' aiml-ragtrace__chunk--highlight'
                      : ''
                  }${phaseIdx >= 2 && i < 3 ? ' aiml-ragtrace__chunk--top' : ''}`}
                >
                  <header>
                    <strong>{chunk.name}</strong>
                    <span>{(chunk.relevance * 100).toFixed(0)}%</span>
                  </header>
                  <p>{chunk.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="aiml-ragtrace__panel">
          <h4>Answer &amp; Evidence</h4>

          {phaseIdx >= 3 && (
            <div className="aiml-ragtrace__answer">
              <div className="aiml-ragtrace__answer-meta">
                <span>{data.model}</span>
                <span>{(data.confidence * 100).toFixed(0)}% confidence</span>
              </div>
              <p>{data.answer}</p>
              {phaseIdx >= 2 && (
                <div className="aiml-ragtrace__sources">
                  Sources: {topChunks.map((c) => c.name).join(', ')}
                </div>
              )}
            </div>
          )}

          {phaseIdx >= 4 ? (
            <div className="aiml-ragtrace__evidence-list">
              {data.evidences.map(renderEvidence)}
            </div>
          ) : (
            <p className="aiml-muted aiml-ragtrace__placeholder">
              Advance to the Trace phase to inspect evidence chains linking chunks to answer spans.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
