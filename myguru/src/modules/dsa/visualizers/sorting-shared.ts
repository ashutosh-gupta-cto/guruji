/**
 * Shared utilities for sorting visualizers.
 *
 * Adapted from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { ArrayElement, ElementState, SortingData } from '../core/types';

export const STATE_COLORS: Record<ElementState, string> = {
  default: '#60a5fa',
  comparing: '#fbbf24',
  swapping: '#f87171',
  sorted: '#4ade80',
  pivot: '#a78bfa',
  active: '#22d3ee',
};

export function generateRandomArray(size: number): SortingData {
  const elements: ArrayElement<number>[] = [];
  for (let i = 0; i < size; i++) {
    elements.push({
      value: Math.floor(Math.random() * 95) + 5,
      state: 'default',
    });
  }
  return { elements };
}

export function cloneElements(elements: ArrayElement<number>[]): ArrayElement<number>[] {
  return elements.map((e) => ({ ...e }));
}
