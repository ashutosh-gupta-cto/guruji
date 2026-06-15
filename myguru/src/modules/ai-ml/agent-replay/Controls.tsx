import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react';

interface Props {
  playing: boolean;
  cursor: number;
  total: number;
  speed: number;
  onTogglePlay: () => void;
  onStep: (dir: -1 | 1) => void;
  onRestart: () => void;
  onSeek: (cursor: number) => void;
  onSpeed: (s: number) => void;
}

const SPEEDS = [0.5, 1, 2];

export function Controls({
  playing,
  cursor,
  total,
  speed,
  onTogglePlay,
  onStep,
  onRestart,
  onSeek,
  onSpeed,
}: Props) {
  return (
    <div className="aiml-replay-controls">
      <div className="aiml-replay-controls__group">
        <IconButton label="Restart" onClick={onRestart}>
          <RotateCcw size={15} />
        </IconButton>
        <IconButton
          label="Step back"
          onClick={() => onStep(-1)}
          disabled={cursor <= 0}
        >
          <SkipBack size={15} />
        </IconButton>
        <button
          type="button"
          onClick={onTogglePlay}
          className="aiml-replay-controls__play"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
        </button>
        <IconButton
          label="Step forward"
          onClick={() => onStep(1)}
          disabled={cursor >= total}
        >
          <SkipForward size={15} />
        </IconButton>
      </div>

      <input
        type="range"
        min={0}
        max={total}
        value={cursor}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="aiml-replay-controls__scrubber"
        aria-label="Timeline position"
      />

      <span className="aiml-replay-controls__counter">
        {cursor} / {total}
      </span>

      <div className="aiml-replay-controls__speeds">
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSpeed(s)}
            className={
              speed === s
                ? 'aiml-replay-controls__speed aiml-replay-controls__speed--active'
                : 'aiml-replay-controls__speed'
            }
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="aiml-replay-controls__icon"
    >
      {children}
    </button>
  );
}
