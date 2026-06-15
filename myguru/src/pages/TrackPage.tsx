import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import LessonCard from '../components/learning/LessonCard';
import { getTrack, getTrackProgress } from '../data/tracks';
import { getCompletedModules } from '../lib/progress';

export default function TrackPage() {
  const { track: trackId } = useParams<{ track: string }>();
  const track = trackId ? getTrack(trackId) : undefined;
  const completed = getCompletedModules();

  if (!track) {
    return (
      <div>
        <p>Track not found.</p>
        <Link to="/" className="page-header__back">
          <ArrowLeft size={16} />
          Back to home
        </Link>
      </div>
    );
  }

  const progress = getTrackProgress(track.id, completed);

  return (
    <>
      <header className="page-header">
        <Link to="/" className="page-header__back">
          <ArrowLeft size={16} />
          All tracks
        </Link>
        <h1 className="page-header__title">{track.title}</h1>
        <p className="page-header__desc">{track.description}</p>
        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              flex: 1,
              maxWidth: 240,
              height: 6,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--accent-purple)',
                borderRadius: 3,
                transition: 'width 400ms ease',
              }}
            />
          </div>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {progress}% · {track.lessons.filter((l) => completed.includes(l.labModule)).length}/
            {track.lessons.length} lessons
          </span>
        </div>
      </header>

      <div className="lesson-list">
        {track.lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} trackId={track.id} />
        ))}
      </div>
    </>
  );
}
