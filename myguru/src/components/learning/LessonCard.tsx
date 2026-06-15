import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';

import type { Lesson } from '../../data/tracks';
import { isModuleComplete } from '../../lib/progress';

interface LessonCardProps {
  lesson: Lesson;
  trackId: string;
}

export default function LessonCard({ lesson, trackId }: LessonCardProps) {
  const completed = isModuleComplete(lesson.labModule);

  return (
    <Link
      to={`/lab/${lesson.labModule}`}
      state={{ trackId, lessonId: lesson.id }}
      className={`lesson-card${completed ? ' lesson-card--completed' : ''}`}
    >
      <div className="lesson-card__status">
        {completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      </div>

      <div className="lesson-card__body">
        <p className="lesson-card__title">{lesson.title}</p>
        <p className="lesson-card__desc">{lesson.description}</p>
      </div>

      <div className="lesson-card__meta">
        <span className="lesson-card__duration">{lesson.duration}</span>
        <span className="lesson-card__badge">{lesson.difficulty}</span>
        <ArrowRight size={16} className="lesson-card__arrow" />
      </div>
    </Link>
  );
}
