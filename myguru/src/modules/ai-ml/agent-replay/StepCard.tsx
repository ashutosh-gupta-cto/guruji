import {
  Brain,
  CornerDownRight,
  Sparkles,
  TriangleAlert,
  User,
  Wrench,
} from 'lucide-react';
import type { Step } from './types';
import { prettyJSON } from './parse';

interface Props {
  step: Step;
  active: boolean;
  last: boolean;
}

const META: Record<
  Step['kind'],
  { label: string; colorVar: string; icon: React.ReactNode }
> = {
  user: { label: 'User', colorVar: '--aiml-user', icon: <User size={13} /> },
  assistant: {
    label: 'Assistant',
    colorVar: '--aiml-assistant',
    icon: <Sparkles size={13} />,
  },
  thinking: {
    label: 'Thinking',
    colorVar: '--aiml-think',
    icon: <Brain size={13} />,
  },
  tool_call: {
    label: 'Tool call',
    colorVar: '--aiml-tool',
    icon: <Wrench size={13} />,
  },
  tool_result: {
    label: 'Result',
    colorVar: '--aiml-result',
    icon: <CornerDownRight size={13} />,
  },
};

export function StepCard({ step, active, last }: Props) {
  const meta = META[step.kind];
  const colorVar =
    step.kind === 'tool_result' && step.isError
      ? '--aiml-danger'
      : meta.colorVar;

  return (
    <div className="aiml-step-card">
      <div className="aiml-step-card__rail">
        <span
          className={
            active
              ? 'aiml-step-card__dot aiml-step-card__dot--active'
              : 'aiml-step-card__dot'
          }
          style={{ borderColor: `var(${colorVar})`, background: active ? `var(${colorVar})` : 'var(--aiml-bg)' }}
        />
        {!last && <span className="aiml-step-card__line" />}
      </div>

      <div
        className={
          active
            ? 'aiml-step-card__body aiml-step-card__body--active'
            : 'aiml-step-card__body'
        }
        style={
          active
            ? {
                borderColor: `var(${colorVar})`,
                boxShadow: `0 0 0 1px color-mix(in srgb, var(${colorVar}) 20%, transparent)`,
              }
            : undefined
        }
      >
        <div className="aiml-step-card__header">
          <span style={{ color: `var(${colorVar})` }}>{meta.icon}</span>
          <span
            className="aiml-step-card__label"
            style={{ color: `var(${colorVar})` }}
          >
            {meta.label}
          </span>
          {step.kind === 'tool_call' && step.toolName && (
            <code className="aiml-step-card__tool-name">{step.toolName}()</code>
          )}
          {step.kind === 'tool_result' && (
            <>
              {step.toolName && (
                <code className="aiml-step-card__tool-ref">{step.toolName}</code>
              )}
              {step.isError && (
                <span className="aiml-step-card__error">
                  <TriangleAlert size={11} /> error
                </span>
              )}
            </>
          )}
        </div>

        {step.kind === 'tool_call' ? (
          <pre className="aiml-step-card__code">
            {prettyJSON(step.toolInput ?? {})}
          </pre>
        ) : step.kind === 'tool_result' ? (
          <pre
            className="aiml-step-card__code"
            style={{
              color: step.isError
                ? 'var(--aiml-danger)'
                : 'var(--aiml-fg-muted)',
            }}
          >
            {step.text}
          </pre>
        ) : (
          <p
            className={
              step.kind === 'thinking'
                ? 'aiml-step-card__text aiml-step-card__text--thinking'
                : 'aiml-step-card__text'
            }
          >
            {step.text}
          </p>
        )}
      </div>
    </div>
  );
}
