import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import StepProgress, { type LearningPhase } from '../components/learning/StepProgress';
import TryStepPanel from '../components/learning/TryStepPanel';
import { getLessonByModule } from '../data/tracks';
import { markModuleComplete } from '../lib/progress';
import { getLabModule } from '../modules/lab-registry';

export default function LabPage() {
  const { module: moduleId } = useParams<{ module: string }>();
  const [phase, setPhase] = useState<LearningPhase>('learn');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const lab = moduleId ? getLabModule(moduleId) : undefined;
  const context = moduleId ? getLessonByModule(moduleId) : undefined;

  if (!moduleId || !lab) {
    return (
      <div>
        <p>Lab module not found.</p>
        <Link to="/" className="page-header__back">
          <ArrowLeft size={16} />
          Back to home
        </Link>
      </div>
    );
  }

  const LabComponent = lab.component;
  const lesson = context?.lesson;
  const track = context?.track;

  const handleConfirm = () => {
    if (selectedAnswer === 0) {
      markModuleComplete(moduleId);
      setConfirmed(true);
    }
  };

  return (
    <>
      <header className="page-header">
        {track && (
          <Link to={`/learn/${track.id}`} className="page-header__back">
            <ArrowLeft size={16} />
            {track.subtitle}
          </Link>
        )}
        <h1 className="page-header__title">{lesson?.title ?? lab.title}</h1>
        {lesson && <p className="page-header__desc">{lesson.description}</p>}
      </header>

      <StepProgress current={phase} />

      {phase === 'learn' && (
        <div className="learn-panel">
          <h2>Overview</h2>
          <p>
            {lesson?.description ??
              'This lesson introduces a core CS concept through guided explanation and hands-on practice.'}
          </p>
          <p>
            Read through the key ideas, then move to the Try phase where you will interact
            with a live visualization. Finish with Confirm to check your understanding.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setPhase('try')}
            style={{ marginTop: '0.5rem' }}
          >
            Start Try phase
          </button>
        </div>
      )}

      {phase === 'try' && (
        <TryStepPanel
          title={lab.title}
          onBack={() => setPhase('learn')}
          onNext={() => setPhase('confirm')}
        >
          <LabComponent />
        </TryStepPanel>
      )}

      {phase === 'confirm' && (
        <div className="confirm-panel">
          <h2>Check your understanding</h2>
          <p>
            What is the main takeaway from this lesson? (Placeholder question — agents
            will replace with module-specific quizzes.)
          </p>
          <div className="confirm-panel__options">
            {[
              `I understand the core concept behind ${lab.title}.`,
              'I need to review this topic again.',
              'This topic is unrelated to the lab.',
            ].map((option, idx) => (
              <button
                key={option}
                type="button"
                className={`confirm-option${selectedAnswer === idx ? ' confirm-option--selected' : ''}`}
                onClick={() => setSelectedAnswer(idx)}
              >
                {option}
              </button>
            ))}
          </div>
          {confirmed ? (
            <p style={{ color: 'var(--success)', fontWeight: 600 }}>
              Lesson marked complete! Progress saved.
            </p>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setPhase('try')}
              >
                Back to Try
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleConfirm}
                disabled={selectedAnswer === null}
              >
                Submit answer
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
