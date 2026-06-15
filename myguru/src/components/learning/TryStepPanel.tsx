import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface TryStepPanelProps {
  title?: string;
  hint?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
}

export default function TryStepPanel({
  title = 'Interactive Lab',
  hint = 'Experiment with the visualization below.',
  children,
  onBack,
  onNext,
  backLabel = 'Back to Learn',
  nextLabel = 'Continue to Confirm',
}: TryStepPanelProps) {
  return (
    <div className="try-step-panel">
      <div className="try-step-panel__header">
        <p className="try-step-panel__title">{title}</p>
        <p className="try-step-panel__hint">{hint}</p>
      </div>

      <div className="try-step-panel__body">{children}</div>

      <div className="try-step-panel__footer">
        {onBack ? (
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            <ArrowLeft size={16} />
            {backLabel}
          </button>
        ) : (
          <span />
        )}
        {onNext && (
          <button type="button" className="btn btn--primary" onClick={onNext}>
            {nextLabel}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
