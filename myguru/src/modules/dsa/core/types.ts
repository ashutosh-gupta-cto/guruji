/**
 * Core type definitions for DSA visualizers.
 *
 * Adapted from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

/** Snapshot of data structure state at a point in time */
export interface Snapshot<T = unknown> {
  data: T;
  metadata?: Record<string, unknown>;
}

/** Step metadata including counters and complexity */
export interface StepMeta {
  comparisons: number;
  swaps: number;
  reads: number;
  writes: number;
  highlightedLine?: number;
  highlightColor?: string;
  complexity?: string;
}

/** Creates a default StepMeta */
export function createStepMeta(overrides: Partial<StepMeta> = {}): StepMeta {
  return {
    comparisons: 0,
    swaps: 0,
    reads: 0,
    writes: 0,
    ...overrides,
  };
}

/** Represents a single step in the visualization */
export interface Step<T = unknown> {
  id: number;
  description: string;
  snapshot: Snapshot<T>;
  meta: StepMeta;
  activeIndices?: number[];
  modifiedIndices?: number[];
}

/** Configuration metadata for a visualizer */
export interface VisualizerConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultSpeed?: number;
}

/** Step Engine state */
export interface EngineState {
  steps: Step[];
  index: number;
  playing: boolean;
  speed: number;
  lastTick: number;
}

/** Step Engine event types */
export type EngineEvent =
  | { type: 'step-change'; index: number; step: Step }
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'reset' }
  | { type: 'complete' };

/** Step Engine event listener */
export type EngineListener = (event: EngineEvent) => void;

/** Element state for array rendering */
export type ElementState =
  | 'default'
  | 'comparing'
  | 'swapping'
  | 'sorted'
  | 'pivot'
  | 'active';

/** Array element with visual state */
export interface ArrayElement<T = number> {
  value: T;
  state: ElementState;
}

/** Array data used by sorting visualizers */
export interface SortingData {
  elements: ArrayElement<number>[];
}

/** Time and space complexity information */
export interface ComplexityInfo {
  time: {
    best: string;
    average: string;
    worst: string;
  };
  space: string;
}

/** Sort algorithm definition for the page selector */
export interface SortAlgorithm {
  id: string;
  name: string;
  description: string;
  complexity: ComplexityInfo;
  defaultSpeed: number;
  generateSteps: (values: number[]) => Step<SortingData>[];
}
