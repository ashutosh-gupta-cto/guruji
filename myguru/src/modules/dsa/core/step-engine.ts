/**
 * Step playback engine for DSA visualizers.
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step, EngineState, EngineEvent, EngineListener } from './types';
import { DEFAULT_ANIMATION_SPEED_MS } from './constants';

export class StepEngine {
  private state: EngineState;
  private listeners = new Set<EngineListener>();
  private animationFrameId: number | null = null;

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): EngineState {
    return {
      steps: [],
      index: 0,
      playing: false,
      speed: DEFAULT_ANIMATION_SPEED_MS,
      lastTick: 0,
    };
  }

  loadSteps(steps: Step[]): void {
    this.stop();
    this.state = {
      ...this.createInitialState(),
      steps,
      speed: this.state.speed,
    };

    if (steps.length > 0) {
      this.emit({ type: 'step-change', index: 0, step: steps[0] });
    }
    this.emit({ type: 'reset' });
  }

  play(): void {
    if (this.state.steps.length === 0) {
      return;
    }

    if (this.state.index >= this.state.steps.length - 1) {
      this.state.index = 0;
      this.emit({ type: 'step-change', index: 0, step: this.state.steps[0] });
    }

    this.state.playing = true;
    this.state.lastTick = performance.now();
    this.emit({ type: 'play' });
    this.tick();
  }

  pause(): void {
    this.state.playing = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.emit({ type: 'pause' });
  }

  stop(): void {
    this.pause();
    this.state.index = 0;
    this.state.lastTick = 0;
  }

  stepForward(): void {
    if (this.state.index < this.state.steps.length - 1) {
      this.state.index++;
      this.emitCurrentStep();
    }
  }

  stepBack(): void {
    if (this.state.index > 0) {
      this.state.index--;
      this.emitCurrentStep();
    }
  }

  reset(): void {
    this.pause();
    this.state.index = 0;
    if (this.state.steps.length > 0) {
      this.emitCurrentStep();
    }
    this.emit({ type: 'reset' });
  }

  goToEnd(): void {
    this.pause();
    if (this.state.steps.length > 0) {
      this.state.index = this.state.steps.length - 1;
      this.emitCurrentStep();
      this.emit({ type: 'complete' });
    }
  }

  goToStep(index: number): void {
    if (index >= 0 && index < this.state.steps.length) {
      this.state.index = index;
      this.emitCurrentStep();
    }
  }

  setSpeed(speed: number): void {
    this.state.speed = speed;
  }

  getState(): Readonly<EngineState> {
    return this.state;
  }

  getCurrentStep(): Step | null {
    return this.state.steps[this.state.index] ?? null;
  }

  isPlaying(): boolean {
    return this.state.playing;
  }

  subscribe(listener: EngineListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private tick = (): void => {
    if (!this.state.playing) {
      return;
    }

    const now = performance.now();
    const elapsed = now - this.state.lastTick;

    if (elapsed >= this.state.speed) {
      this.state.lastTick = now;

      if (this.state.index < this.state.steps.length - 1) {
        this.state.index++;
        this.emitCurrentStep();
      } else {
        this.state.playing = false;
        this.emit({ type: 'complete' });
        return;
      }
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  private emitCurrentStep(): void {
    const step = this.state.steps[this.state.index];
    if (step) {
      this.emit({ type: 'step-change', index: this.state.index, step });
    }
  }

  private emit(event: EngineEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  dispose(): void {
    this.stop();
    this.listeners.clear();
  }
}
