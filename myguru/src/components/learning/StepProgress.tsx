import { BookOpen, CheckCircle, FlaskConical } from 'lucide-react';

export type LearningPhase = 'learn' | 'try' | 'confirm';

interface StepProgressProps {
  current: LearningPhase;
}

const steps: { id: LearningPhase; label: string; icon: typeof BookOpen }[] = [
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'try', label: 'Try', icon: FlaskConical },
  { id: 'confirm', label: 'Confirm', icon: CheckCircle },
];

const phaseOrder: LearningPhase[] = ['learn', 'try', 'confirm'];

function phaseIndex(phase: LearningPhase): number {
  return phaseOrder.indexOf(phase);
}

export default function StepProgress({ current }: StepProgressProps) {
  const currentIdx = phaseIndex(current);

  return (
    <div className="step-progress" role="list" aria-label="Learning progress">
      {steps.map((step, idx) => {
        const stepIdx = phaseIndex(step.id);
        const isActive = step.id === current;
        const isDone = stepIdx < currentIdx;
        const Icon = step.icon;

        return (
          <div key={step.id} style={{ display: 'contents' }}>
            <div
              role="listitem"
              className={`step-progress__item${isActive ? ' step-progress__item--active' : ''}${isDone ? ' step-progress__item--done' : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="step-progress__dot">
                {isDone ? <CheckCircle size={16} /> : <Icon size={16} />}
              </span>
              <span className="step-progress__label">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`step-progress__connector${stepIdx < currentIdx ? ' step-progress__connector--done' : ''}`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
