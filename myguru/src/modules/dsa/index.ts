/**
 * DSA visualizer module — public exports.
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

export type {
  Step,
  Snapshot,
  StepMeta,
  VisualizerConfig,
  SortingData,
  SortAlgorithm,
  ArrayElement,
  ElementState,
  ComplexityInfo,
  EngineState,
  EngineEvent,
} from './core/types';

export { createStepMeta } from './core/types';
export { StepEngine } from './core/step-engine';
export { DEFAULT_ANIMATION_SPEED_MS } from './core/constants';

export { generateBubbleSortSteps, bubbleSortConfig } from './visualizers/bubble-sort';
export { generateMergeSortSteps, mergeSortConfig } from './visualizers/merge-sort';
export { generateQuickSortSteps, quickSortConfig } from './visualizers/quick-sort';
export {
  generateDijkstraSteps,
  createSampleDijkstraGraph,
  dijkstraConfig,
  NODE_STATE_COLORS,
  EDGE_STATE_COLORS,
} from './visualizers/dijkstra';
export type { DijkstraData, GraphData, GraphNode, GraphEdge } from './visualizers/dijkstra';

export { generateRandomArray, STATE_COLORS } from './visualizers/sorting-shared';

export { ArrayVisualizer } from './components/ArrayVisualizer';
export { SortVisualizerPage, ALGORITHMS } from './components/SortVisualizerPage';
