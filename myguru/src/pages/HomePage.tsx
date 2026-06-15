import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Cpu,
  Network,
  Sparkles,
} from 'lucide-react';

import { getTrackProgress, tracks } from '../data/tracks';
import { getCompletedModules } from '../lib/progress';

const trackIcons = {
  dsa: BookOpen,
  'system-design': Network,
  'ai-ml': Brain,
  'cs-fundamentals': Cpu,
} as const;

export default function HomePage() {
  const completed = getCompletedModules();

  return (
    <>
      <section className="hero">
        <span className="hero__badge">
          <Sparkles size={14} />
          Interactive CS learning
        </span>
        <h1 className="hero__title">Master CS concepts by doing</h1>
        <p className="hero__subtitle">
          Learn → Try → Confirm. Step through visual labs for DSA, system design,
          AI/ML, and CS fundamentals at your own pace.
        </p>
        <Link to="/learn/dsa" className="hero__cta">
          Start with DSA
          <ArrowRight size={18} />
        </Link>
      </section>

      <section>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '1.25rem',
            letterSpacing: '-0.01em',
          }}
        >
          Choose a track
        </h2>
        <div className="track-grid">
          {tracks.map((track) => {
            const Icon = trackIcons[track.id];
            const progress = getTrackProgress(track.id, completed);
            return (
              <Link
                key={track.id}
                to={`/learn/${track.id}`}
                className={`track-card track-card--${track.accent}`}
              >
                <div className="track-card__icon">
                  <Icon size={22} />
                </div>
                <h3 className="track-card__title">{track.title}</h3>
                <p className="track-card__desc">{track.description}</p>
                <div className="track-card__meta">
                  <span>{track.lessons.length} lessons</span>
                  <span>{progress}% complete</span>
                </div>
                <div className="track-card__progress-bar">
                  <div
                    className="track-card__progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
