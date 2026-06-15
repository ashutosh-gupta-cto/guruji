import { useEffect, useRef } from 'react';
import { Clapperboard } from 'lucide-react';
import { Controls } from './Controls';
import { StepCard } from './StepCard';
import type { Step } from './types';

interface Props {
  steps: Step[];
  cursor: number;
  playing: boolean;
  speed: number;
  onTogglePlay: () => void;
  onStep: (dir: -1 | 1) => void;
  onRestart: () => void;
  onSeek: (cursor: number) => void;
  onSpeed: (s: number) => void;
}

export function ReplayStage({
  steps,
  cursor,
  playing,
  speed,
  onTogglePlay,
  onStep,
  onRestart,
  onSeek,
  onSpeed,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [cursor]);

  const revealed = steps.slice(0, cursor);

  return (
    <div className="aiml-replay-stage">
      <Controls
        playing={playing}
        cursor={cursor}
        total={steps.length}
        speed={speed}
        onTogglePlay={onTogglePlay}
        onStep={onStep}
        onRestart={onRestart}
        onSeek={onSeek}
        onSpeed={onSpeed}
      />

      <div ref={scrollRef} className="aiml-replay-stage__scroll">
        {steps.length === 0 ? (
          <EmptyStage />
        ) : revealed.length === 0 ? (
          <div className="aiml-replay-stage__hint">
            <p>
              Press <span className="aiml-accent">play</span> to replay{' '}
              {steps.length} steps.
            </p>
          </div>
        ) : (
          <div className="aiml-replay-stage__timeline">
            {revealed.map((step, idx) => (
              <StepCard
                key={step.index}
                step={step}
                active={idx === revealed.length - 1}
                last={idx === revealed.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyStage() {
  return (
    <div className="aiml-replay-stage__empty">
      <Clapperboard size={28} />
      <p>
        Select a sample trace or paste a Claude agent trace. The tool-calling
        loop replays here step by step.
      </p>
    </div>
  );
}
