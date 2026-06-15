import { CircleCheck, FileJson, Sparkles, TriangleAlert } from 'lucide-react';
import type { TraceStats } from './types';

interface Props {
  text: string;
  onChange: (text: string) => void;
  onLoadSample: () => void;
  parseError: string | null;
  stats: TraceStats | null;
  traceTitle?: string;
}

export function TraceInput({
  text,
  onChange,
  onLoadSample,
  parseError,
  stats,
  traceTitle,
}: Props) {
  return (
    <div className="aiml-trace-input">
      <div className="aiml-trace-input__header">
        <div className="aiml-trace-input__title">
          <FileJson size={14} />
          <span>Trace{traceTitle ? `: ${traceTitle}` : ''}</span>
        </div>
        <button type="button" onClick={onLoadSample} className="aiml-btn aiml-btn--ghost">
          <Sparkles size={12} /> Load sample
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder='Paste a Claude agent trace — the messages array from a tool-use conversation…'
        className="aiml-trace-input__editor"
      />

      <div className="aiml-trace-input__footer">
        {parseError ? (
          <div className="aiml-trace-input__error">
            <TriangleAlert size={13} />
            <span>{parseError}</span>
          </div>
        ) : stats ? (
          <div className="aiml-trace-input__stats">
            <div className="aiml-trace-input__stats-row">
              <CircleCheck size={13} />
              <span>
                {stats.messages} messages · {stats.toolCalls} tool calls
                {stats.errors > 0 && (
                  <span className="aiml-danger"> · {stats.errors} error</span>
                )}
              </span>
            </div>
            {stats.tools.length > 0 && (
              <div className="aiml-trace-input__tools">
                {stats.tools.map((t) => (
                  <code key={t}>{t}</code>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span className="aiml-muted">Paste a trace, or load a sample to replay.</span>
        )}
      </div>
    </div>
  );
}
