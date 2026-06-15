import { ExternalLink, Lightbulb } from 'lucide-react';

import type { LessonContent } from '../../content/types';

interface LearnPanelProps {
  content: LessonContent;
  onNext: () => void;
}

export default function LearnPanel({ content, onNext }: LearnPanelProps) {
  return (
    <div className="learn-panel">
      {content.sections.map((section) => (
        <section key={section.heading} className="learn-panel__section">
          <h2 className="learn-panel__heading">{section.heading}</h2>
          <p className="learn-panel__body">{section.body}</p>

          {section.bullets && section.bullets.length > 0 && (
            <ul className="learn-panel__bullets">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}

          {section.code && (
            <pre className="learn-panel__code">
              <code>{section.code}</code>
            </pre>
          )}

          {section.tip && (
            <aside className="learn-panel__tip">
              <Lightbulb size={18} aria-hidden="true" />
              <p>{section.tip}</p>
            </aside>
          )}
        </section>
      ))}

      {content.keyTakeaways.length > 0 && (
        <div className="learn-panel__takeaways">
          <h3 className="learn-panel__takeaways-title">Key takeaways</h3>
          <ul>
            {content.keyTakeaways.map((takeaway) => (
              <li key={takeaway}>{takeaway}</li>
            ))}
          </ul>
        </div>
      )}

      {content.sourceAttribution.length > 0 && (
        <div className="learn-panel__sources">
          <h3 className="learn-panel__sources-title">Sources</h3>
          <ul>
            {content.sourceAttribution.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.repo}
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="learn-panel__footer">
        <button type="button" className="btn btn--primary" onClick={onNext}>
          Start Try phase
        </button>
      </div>
    </div>
  );
}
