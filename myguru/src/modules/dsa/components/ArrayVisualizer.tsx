/**
 * SVG bar-chart visualizer with step playback controls.
 *
 * Uses the step engine ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { StepEngine } from '../core/step-engine';
import {
  CANVAS_BACKGROUND_COLOR,
  CANVAS_PADDING,
  BAR_GAP_RATIO,
  MIN_BAR_WIDTH,
  MAX_BAR_WIDTH,
  BAR_CORNER_RADIUS,
} from '../core/constants';
import type { SortingData, Step } from '../core/types';
import { STATE_COLORS } from '../visualizers/sorting-shared';

export interface ArrayVisualizerProps {
  steps: Step<SortingData>[];
  speed?: number;
  width?: number;
  height?: number;
  className?: string;
}

interface BarGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  color: string;
}

function computeBars(
  elements: SortingData['elements'],
  width: number,
  height: number
): BarGeometry[] {
  if (elements.length === 0) {
    return [];
  }

  const availableWidth = width - CANVAS_PADDING * 2;
  const availableHeight = height - CANVAS_PADDING * 2;
  const totalBars = elements.length;
  const rawBarWidth = availableWidth / totalBars;
  const barWidth = Math.max(
    MIN_BAR_WIDTH,
    Math.min(MAX_BAR_WIDTH, rawBarWidth * (1 - BAR_GAP_RATIO))
  );
  const gap = rawBarWidth - barWidth;
  const maxValue = Math.max(...elements.map((e) => e.value));

  return elements.map((element, index) => {
    const barHeight = maxValue > 0 ? (element.value / maxValue) * availableHeight : 0;
    const x = CANVAS_PADDING + index * (barWidth + gap);
    const y = height - CANVAS_PADDING - barHeight;

    return {
      x,
      y,
      width: barWidth,
      height: barHeight,
      value: element.value,
      color: STATE_COLORS[element.state],
    };
  });
}

const controlButtonStyle: CSSProperties = {
  padding: '0.45rem 0.85rem',
  borderRadius: '6px',
  border: '1px solid #3f3f46',
  background: '#18181b',
  color: '#fafafa',
  cursor: 'pointer',
  fontSize: '0.875rem',
};

const primaryButtonStyle: CSSProperties = {
  ...controlButtonStyle,
  background: '#2563eb',
  borderColor: '#2563eb',
};

export function ArrayVisualizer({
  steps,
  speed = 300,
  width = 720,
  height = 320,
  className,
}: ArrayVisualizerProps) {
  const engineRef = useRef<StepEngine | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step<SortingData> | null>(null);

  useEffect(() => {
    const engine = new StepEngine();
    engineRef.current = engine;

    const unsubscribe = engine.subscribe((event) => {
      if (event.type === 'step-change') {
        setStepIndex(event.index);
        setCurrentStep(event.step as Step<SortingData>);
      }
      if (event.type === 'play') {
        setPlaying(true);
      }
      if (event.type === 'pause' || event.type === 'complete') {
        setPlaying(false);
      }
    });

    return () => {
      unsubscribe();
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    engine.setSpeed(speed);
    engine.loadSteps(steps);
    setStepIndex(0);
    setPlaying(false);
    setCurrentStep((steps[0] as Step<SortingData>) ?? null);
  }, [steps, speed]);

  const elements = currentStep?.snapshot.data.elements ?? [];
  const bars = useMemo(() => computeBars(elements, width, height), [elements, width, height]);

  const handlePlayPause = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    if (engine.isPlaying()) {
      engine.pause();
    } else {
      engine.play();
    }
  }, []);

  const handleStepBack = useCallback(() => {
    engineRef.current?.pause();
    engineRef.current?.stepBack();
  }, []);

  const handleStepForward = useCallback(() => {
    engineRef.current?.pause();
    engineRef.current?.stepForward();
  }, []);

  const handleReset = useCallback(() => {
    engineRef.current?.reset();
  }, []);

  const totalSteps = steps.length;
  const meta = currentStep?.meta;

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Array sorting visualization"
        style={{
          background: CANVAS_BACKGROUND_COLOR,
          borderRadius: '8px',
          border: '1px solid #27272a',
        }}
      >
        {bars.map((bar, index) => (
          <g key={index}>
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              rx={BAR_CORNER_RADIUS}
              fill={bar.color}
            />
            {bar.width >= 20 && (
              <text
                x={bar.x + bar.width / 2}
                y={bar.y - 4}
                textAnchor="middle"
                fill="#e4e4e7"
                fontSize={10}
                fontFamily="system-ui, sans-serif"
              >
                {bar.value}
              </text>
            )}
          </g>
        ))}
      </svg>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
        }}
      >
        <button type="button" style={primaryButtonStyle} onClick={handlePlayPause}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" style={controlButtonStyle} onClick={handleStepBack}>
          Step back
        </button>
        <button type="button" style={controlButtonStyle} onClick={handleStepForward}>
          Step forward
        </button>
        <button type="button" style={controlButtonStyle} onClick={handleReset}>
          Reset
        </button>
        <span style={{ color: '#a1a1aa', fontSize: '0.875rem', marginLeft: '0.25rem' }}>
          Step {totalSteps === 0 ? 0 : stepIndex + 1} / {totalSteps}
        </span>
      </div>

      {currentStep && (
        <div style={{ color: '#d4d4d8', fontSize: '0.9rem' }}>
          <p style={{ margin: '0 0 0.35rem' }}>{currentStep.description}</p>
          {meta && (
            <p style={{ margin: 0, color: '#71717a', fontSize: '0.8rem' }}>
              Comparisons: {meta.comparisons}
              {meta.swaps > 0 ? ` · Swaps: ${meta.swaps}` : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
