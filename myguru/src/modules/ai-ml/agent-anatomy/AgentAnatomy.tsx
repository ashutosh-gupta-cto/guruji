import { useCallback, useEffect, useState } from 'react';
import { Play, RefreshCw, StepForward } from 'lucide-react';
import { ANATOMY_LANES, ANATOMY_STEPS } from './content';

const STEP_DELAY = 1800;
const START_HINT = 'Press Play to walk through User ↔ Agent ↔ LLM message flow.';

export function AgentAnatomy() {
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [insight, setInsight] = useState(START_HINT);

  const visible = ANATOMY_STEPS.slice(0, cursor);
  const dataSteps = ANATOMY_STEPS.filter((s) => !s.turn).length;
  const currentDataStep = visible.filter((s) => !s.turn).length;

  useEffect(() => {
    if (!playing || cursor >= ANATOMY_STEPS.length) return;
    const t = setTimeout(() => {
      const next = ANATOMY_STEPS[cursor];
      if (next?.insight) setInsight(next.insight);
      setCursor((c) => {
        const updated = c + 1;
        if (updated >= ANATOMY_STEPS.length) {
          setPlaying(false);
          setInsight(
            'Agent = while(true) { assemble context → call LLM → parse → execute → append }. Context engineering is agent engineering.',
          );
        }
        return updated;
      });
    }, STEP_DELAY);
    return () => clearTimeout(t);
  }, [playing, cursor]);

  const play = useCallback(() => {
    if (cursor >= ANATOMY_STEPS.length) {
      setCursor(0);
      setInsight(START_HINT);
      setPlaying(true);
    } else {
      setPlaying(true);
    }
  }, [cursor]);

  const stepOnce = useCallback(() => {
    if (cursor >= ANATOMY_STEPS.length) return;
    setPlaying(false);
    const next = ANATOMY_STEPS[cursor];
    if (next?.insight) setInsight(next.insight);
    setCursor((c) => c + 1);
  }, [cursor]);

  const reset = useCallback(() => {
    setPlaying(false);
    setCursor(0);
    setInsight(START_HINT);
  }, []);

  return (
    <div className="aiml-anatomy">
      <div className="aiml-anatomy__controls">
        <button type="button" className="aiml-btn aiml-btn--primary" onClick={play}>
          <Play size={14} /> {playing ? 'Playing…' : 'Play'}
        </button>
        <button
          type="button"
          className="aiml-btn aiml-btn--ghost"
          onClick={stepOnce}
          disabled={cursor >= ANATOMY_STEPS.length}
        >
          <StepForward size={14} /> Step
        </button>
        <button type="button" className="aiml-btn aiml-btn--ghost" onClick={reset}>
          <RefreshCw size={14} /> Reset
        </button>
        <span className="aiml-anatomy__counter">
          Step <strong>{currentDataStep}</strong> / <strong>{dataSteps}</strong>
        </span>
      </div>

      <div className="aiml-anatomy__lanes">
        {ANATOMY_LANES.map((lane, i) => (
          <div key={lane} className={`aiml-anatomy__lane aiml-anatomy__lane--${i + 1}`}>
            {lane}
          </div>
        ))}
      </div>

      <div className="aiml-anatomy__sequence">
        {visible.map((step, idx) => (
          <AnatomyStepView key={idx} step={step} />
        ))}
      </div>

      <footer className="aiml-anatomy__insight">
        <span className="aiml-anatomy__badge">Insight</span>
        <p>{insight}</p>
      </footer>
    </div>
  );
}

function AnatomyStepView({ step }: { step: (typeof ANATOMY_STEPS)[number] }) {
  if (step.turn) {
    return (
      <div className="aiml-anatomy__turn">
        Turn {step.turn} — {step.turnLabel}
      </div>
    );
  }

  return (
    <div className="aiml-anatomy__block">
      {step.arrows?.map((arrow, i) => (
        <div
          key={i}
          className={`aiml-anatomy__arrow aiml-anatomy__arrow--${arrow.from}-${arrow.to}`}
          style={{ '--arrow-color': arrow.color } as React.CSSProperties}
        >
          <span>{arrow.label}</span>
        </div>
      ))}
      {step.cards?.map((card, i) => (
        <div key={i} className={`aiml-anatomy__card aiml-anatomy__card--${card.lane}`}>
          <div className="aiml-anatomy__tags">
            {card.tags.map((tag) => (
              <span key={tag.label} className={`aiml-anatomy__tag aiml-anatomy__tag--${tag.tone}`}>
                {tag.label}
              </span>
            ))}
          </div>
          <p>{card.text}</p>
          {card.json && <pre>{card.json}</pre>}
        </div>
      ))}
    </div>
  );
}
