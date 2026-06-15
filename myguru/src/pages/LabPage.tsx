import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import ConfirmQuiz from '../components/learning/ConfirmQuiz';
import LearnPanel from '../components/learning/LearnPanel';
import StepProgress, { type LearningPhase } from '../components/learning/StepProgress';
import TryStepPanel from '../components/learning/TryStepPanel';
import { getLessonContent } from '../content';
import { getLessonByModule } from '../data/tracks';
import { getLabModule } from '../modules/lab-registry';

export default function LabPage() {
  const { module: moduleId } = useParams<{ module: string }>();
  const [phase, setPhase] = useState<LearningPhase>('learn');

  const lab = moduleId ? getLabModule(moduleId) : undefined;
  const context = moduleId ? getLessonByModule(moduleId) : undefined;
  const lessonContent = moduleId ? getLessonContent(moduleId) : undefined;

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

  return (
    <>
      <header className="page-header">
        {track && (
          <Link to={`/learn/${track.id}`} className="page-header__back">
            <ArrowLeft size={16} />
            {track.subtitle}
          </Link>
        )}
        <h1 className="page-header__title">
          {lessonContent?.title ?? lesson?.title ?? lab.title}
        </h1>
        {lesson && <p className="page-header__desc">{lesson.description}</p>}
      </header>

      <StepProgress current={phase} />

      {phase === 'learn' &&
        (lessonContent ? (
          <LearnPanel content={lessonContent} onNext={() => setPhase('try')} />
        ) : (
          <div className="learn-panel">
            <h2>Overview</h2>
            <p>
              {lesson?.description ??
                'This lesson introduces a core CS concept through guided explanation and hands-on practice.'}
            </p>
            <p>
              Reading material for this module is coming soon. Move to the Try phase to
              interact with the live visualization, then Confirm to check your understanding.
            </p>
            <div className="learn-panel__footer">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setPhase('try')}
              >
                Start Try phase
              </button>
            </div>
          </div>
        ))}

      {phase === 'try' && (
        <TryStepPanel
          title={lab.title}
          onBack={() => setPhase('learn')}
          onNext={() => setPhase('confirm')}
        >
          <LabComponent />
        </TryStepPanel>
      )}

      {phase === 'confirm' &&
        (lessonContent && lessonContent.quiz.length > 0 ? (
          <ConfirmQuiz
            moduleId={moduleId}
            quiz={lessonContent.quiz}
            onBack={() => setPhase('try')}
          />
        ) : (
          <div className="confirm-panel">
            <h2>Check your understanding</h2>
            <p>
              Quiz content for this module is coming soon. Review the Try phase and return
              when lesson material is available.
            </p>
            <div className="confirm-quiz__actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setPhase('try')}
              >
                Back to Try
              </button>
            </div>
          </div>
        ))}
    </>
  );
}
