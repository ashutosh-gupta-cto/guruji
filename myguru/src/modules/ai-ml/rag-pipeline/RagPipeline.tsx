import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  Bot,
  FileText,
  Layers,
  Pause,
  Play,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { RAG_DEMO, RAG_STEPS } from './sample-data';

const STEP_DELAY = 2200;

const STEP_ICONS = {
  chunk: Layers,
  embed: Sparkles,
  retrieve: Search,
  generate: Bot,
} as const;

export function RagPipeline() {
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing || activeStep >= RAG_STEPS.length - 1) return;
    const t = setTimeout(() => {
      setActiveStep((s) => {
        const next = s + 1;
        if (next >= RAG_STEPS.length - 1) setPlaying(false);
        return next;
      });
    }, STEP_DELAY);
    return () => clearTimeout(t);
  }, [playing, activeStep]);

  const progress = ((activeStep + 1) / RAG_STEPS.length) * 100;

  const handlePlay = useCallback(() => {
    if (activeStep >= RAG_STEPS.length - 1) {
      setActiveStep(0);
      setTimeout(() => setPlaying(true), 100);
    } else {
      setPlaying(true);
    }
  }, [activeStep]);

  const handleReset = useCallback(() => {
    setPlaying(false);
    setActiveStep(0);
  }, []);

  return (
    <div className="aiml-rag">
      <header className="aiml-rag__header">
        <div>
          <h3>RAG pipeline</h3>
          <p>Chunk → embed → retrieve → generate — no backend required.</p>
        </div>
        <div className="aiml-rag__controls">
          <button
            type="button"
            className="aiml-btn aiml-btn--ghost"
            onClick={playing ? () => setPlaying(false) : handlePlay}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            {playing ? 'Pause' : activeStep === RAG_STEPS.length - 1 ? 'Restart' : 'Play'}
          </button>
          <button
            type="button"
            className="aiml-btn aiml-btn--ghost"
            onClick={handleReset}
            disabled={activeStep === 0}
            aria-label="Reset"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      <div className="aiml-rag__progress">
        <div className="aiml-rag__progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="aiml-rag__query">
        <FileText size={14} />
        <span>{RAG_DEMO.question}</span>
      </div>

      <div className="aiml-rag__flow">
        {RAG_STEPS.map((step, index) => {
          const Icon = STEP_ICONS[step.id];
          const isActive = index === activeStep;
          const isPast = index < activeStep;
          return (
            <div key={step.id} className="aiml-rag__step-wrap">
              <button
                type="button"
                className={
                  isActive
                    ? 'aiml-rag__step aiml-rag__step--active'
                    : isPast
                      ? 'aiml-rag__step aiml-rag__step--past'
                      : 'aiml-rag__step'
                }
                onClick={() => {
                  setPlaying(false);
                  setActiveStep(index);
                }}
              >
                <div className="aiml-rag__step-icon">
                  <Icon size={18} />
                </div>
                <span className="aiml-rag__step-num">Step {index + 1}</span>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
                <StepPreview stepId={step.id} visible={isActive || isPast} />
              </button>
              {index < RAG_STEPS.length - 1 && (
                <ArrowRight className="aiml-rag__arrow" size={20} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepPreview({
  stepId,
  visible,
}: {
  stepId: (typeof RAG_STEPS)[number]['id'];
  visible: boolean;
}) {
  if (!visible) return null;

  switch (stepId) {
    case 'chunk':
      return (
        <ul className="aiml-rag__preview">
          {RAG_DEMO.chunks.slice(0, 4).map((chunk, i) => (
            <li key={i}>{chunk}</li>
          ))}
          <li className="aiml-muted">+{RAG_DEMO.chunks.length - 4} more chunks…</li>
        </ul>
      );
    case 'embed':
      return (
        <div className="aiml-rag__preview aiml-rag__preview--mono">
          <p>Query vector: {RAG_DEMO.embeddingPreview}</p>
          <p>{RAG_DEMO.chunks.length} chunk vectors indexed</p>
        </div>
      );
    case 'retrieve':
      return (
        <ul className="aiml-rag__preview">
          {RAG_DEMO.retrievedChunks.map((hit, i) => (
            <li key={i}>
              <span className="aiml-rag__score">{(hit.score * 100).toFixed(0)}%</span>{' '}
              {hit.text}
            </li>
          ))}
        </ul>
      );
    case 'generate':
      return (
        <div className="aiml-rag__preview">
          <pre className="aiml-rag__prompt">{RAG_DEMO.prompt}</pre>
          <p className="aiml-rag__answer">{RAG_DEMO.answer}</p>
        </div>
      );
    default:
      return null;
  }
}
