/**
 * Discrete-event simulation engine for metastable failure / retry storm.
 * Core DES logic ported from marcbrooker/stability-sim.
 */

export interface SimEvent {
  id: string;
  timestamp: number;
  kind: 'arrival' | 'departure' | 'crash' | 'recover';
  targetId: string;
  workId: string;
  originId: string;
  retryCount: number;
  failed?: boolean;
}

export interface TimeSeriesPoint {
  time: number;
  completed: number;
  failed: number;
  inFlight: number;
  retries: number;
  serverUtil: number;
}

export interface StabilityConfig {
  arrivalRate: number;
  maxRetries: number;
  serverConcurrency: number;
  serviceTimeMean: number;
  crashAt: number;
  recoverAt: number;
  endTime: number;
  seed: number;
}

export interface StabilityMetrics {
  currentTime: number;
  completed: number;
  failed: number;
  inFlight: number;
  retries: number;
  serverAActive: number;
  serverBActive: number;
  serverACrashed: boolean;
  serverBCrashed: boolean;
  timeSeries: TimeSeriesPoint[];
  status: 'idle' | 'running' | 'completed';
}

interface ServerState {
  id: string;
  active: number;
  concurrency: number;
  crashed: boolean;
}

class SeededRng {
  private state: number;
  constructor(seed: number) {
    this.state = seed >>> 0 || 1;
  }
  next(): number {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }
  exponential(mean: number): number {
    return -Math.log(Math.max(this.next(), 1e-10)) * mean;
  }
}

class MinHeap {
  private items: { event: SimEvent; order: number }[] = [];
  private counter = 0;

  get size(): number {
    return this.items.length;
  }

  peek(): SimEvent | undefined {
    return this.items[0]?.event;
  }

  push(event: SimEvent): void {
    this.items.push({ event, order: this.counter++ });
    this.bubbleUp(this.items.length - 1);
  }

  pop(): SimEvent | undefined {
    if (this.items.length === 0) return undefined;
    const min = this.items[0].event;
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      this.sinkDown(0);
    }
    return min;
  }

  clear(): void {
    this.items = [];
    this.counter = 0;
  }

  private less(i: number, j: number): boolean {
    const a = this.items[i];
    const b = this.items[j];
    if (a.event.timestamp !== b.event.timestamp) return a.event.timestamp < b.event.timestamp;
    return a.order < b.order;
  }

  private swap(i: number, j: number): void {
    [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.less(i, p)) {
        this.swap(i, p);
        i = p;
      } else break;
    }
  }

  private sinkDown(i: number): void {
    const n = this.items.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.less(l, smallest)) smallest = l;
      if (r < n && this.less(r, smallest)) smallest = r;
      if (smallest === i) break;
      this.swap(i, smallest);
      i = smallest;
    }
  }
}

export class StabilityEngine {
  private config: StabilityConfig;
  private queue = new MinHeap();
  private rng: SeededRng;
  private eventId = 0;
  private workId = 0;
  private currentTime = 0;
  private lbRoundRobin = 0;

  private completed = 0;
  private failed = 0;
  private inFlight = 0;
  private retries = 0;
  private timeSeries: TimeSeriesPoint[] = [];
  private lastSampleTime = -1;
  private status: StabilityMetrics['status'] = 'idle';
  private resolvedWork = new Set<string>();

  private serverA: ServerState;
  private serverB: ServerState;

  constructor(config: Partial<StabilityConfig> = {}) {
    this.config = {
      arrivalRate: 70,
      maxRetries: 3,
      serverConcurrency: 5,
      serviceTimeMean: 0.1,
      crashAt: 5,
      recoverAt: 10,
      endTime: 60,
      seed: 42,
      ...config,
    };
    this.rng = new SeededRng(this.config.seed);
    this.serverA = this.makeServer('srv-a');
    this.serverB = this.makeServer('srv-b');
  }

  private makeServer(id: string): ServerState {
    return {
      id,
      active: 0,
      concurrency: this.config.serverConcurrency,
      crashed: false,
    };
  }

  reset(): void {
    this.queue.clear();
    this.rng = new SeededRng(this.config.seed);
    this.eventId = 0;
    this.workId = 0;
    this.currentTime = 0;
    this.lbRoundRobin = 0;
    this.completed = 0;
    this.failed = 0;
    this.inFlight = 0;
    this.retries = 0;
    this.timeSeries = [];
    this.lastSampleTime = -1;
    this.status = 'idle';
    this.resolvedWork.clear();
    this.serverA = this.makeServer('srv-a');
    this.serverB = this.makeServer('srv-b');
  }

  start(): void {
    this.reset();
    this.status = 'running';
    this.enqueue({
      timestamp: this.config.crashAt,
      kind: 'crash',
      targetId: 'srv-a',
      workId: '',
      originId: 'client',
      retryCount: 0,
    });
    this.enqueue({
      timestamp: this.config.recoverAt,
      kind: 'recover',
      targetId: 'srv-a',
      workId: '',
      originId: 'client',
      retryCount: 0,
    });
    this.scheduleNextClientArrival(0);
  }

  /** Advance simulation clock by deltaSimTime seconds. */
  advance(deltaSimTime: number): StabilityMetrics {
    if (this.status !== 'running') return this.getMetrics();

    const limit = Math.min(this.currentTime + deltaSimTime, this.config.endTime);

    while (this.queue.size > 0) {
      const next = this.queue.peek();
      if (!next || next.timestamp > limit) break;
      this.queue.pop();
      this.currentTime = next.timestamp;
      this.dispatch(next);
      this.sampleIfNeeded();
    }

    this.currentTime = limit;
    this.sampleIfNeeded();

    if (this.currentTime >= this.config.endTime) {
      this.status = 'completed';
    }

    return this.getMetrics();
  }

  getMetrics(): StabilityMetrics {
    return {
      currentTime: this.currentTime,
      completed: this.completed,
      failed: this.failed,
      inFlight: this.inFlight,
      retries: this.retries,
      serverAActive: this.serverA.active,
      serverBActive: this.serverB.active,
      serverACrashed: this.serverA.crashed,
      serverBCrashed: this.serverB.crashed,
      timeSeries: [...this.timeSeries],
      status: this.status,
    };
  }

  private enqueue(partial: Omit<SimEvent, 'id'>): void {
    this.queue.push({ ...partial, id: `e${++this.eventId}` });
  }

  private scheduleNextClientArrival(fromTime: number): void {
    if (fromTime >= this.config.endTime) return;
    const inter = this.rng.exponential(1 / this.config.arrivalRate);
    this.enqueue({
      timestamp: fromTime + inter,
      kind: 'arrival',
      targetId: 'client',
      workId: '',
      originId: 'client',
      retryCount: 0,
    });
  }

  private dispatch(event: SimEvent): void {
    switch (event.kind) {
      case 'arrival':
        if (event.targetId === 'client') {
          this.handleClientGenerate();
          this.scheduleNextClientArrival(event.timestamp);
        } else {
          this.handleServerArrival(event);
        }
        break;
      case 'departure':
        this.handleServerDeparture(event);
        break;
      case 'crash':
        if (event.targetId === 'srv-a') this.serverA.crashed = true;
        break;
      case 'recover':
        if (event.targetId === 'srv-a') this.serverA.crashed = false;
        break;
    }
  }

  private handleClientGenerate(): void {
    const workId = `w${++this.workId}`;
    this.inFlight += 1;
    const serverId = this.lbRoundRobin % 2 === 0 ? 'srv-a' : 'srv-b';
    this.lbRoundRobin += 1;
    this.enqueue({
      timestamp: this.currentTime,
      kind: 'arrival',
      targetId: serverId,
      workId,
      originId: 'client',
      retryCount: 0,
    });
  }

  private handleServerArrival(event: SimEvent): void {
    const server = event.targetId === 'srv-a' ? this.serverA : this.serverB;
    if (server.crashed || server.active >= server.concurrency) {
      this.respondToClient(event.workId, event.retryCount, true);
      return;
    }
    server.active += 1;
    const serviceTime = this.rng.exponential(this.config.serviceTimeMean);
    this.enqueue({
      timestamp: this.currentTime + serviceTime,
      kind: 'departure',
      targetId: server.id,
      workId: event.workId,
      originId: 'client',
      retryCount: event.retryCount,
    });
  }

  private handleServerDeparture(event: SimEvent): void {
    const server = event.targetId === 'srv-a' ? this.serverA : this.serverB;
    server.active = Math.max(0, server.active - 1);
    this.respondToClient(event.workId, event.retryCount, false);
  }

  private respondToClient(workId: string, retryCount: number, failed: boolean): void {
    if (this.resolvedWork.has(workId)) return;

    if (!failed) {
      this.resolvedWork.add(workId);
      this.completed += 1;
      this.inFlight = Math.max(0, this.inFlight - 1);
      return;
    }

    if (retryCount < this.config.maxRetries) {
      this.retries += 1;
      const serverId = this.lbRoundRobin % 2 === 0 ? 'srv-a' : 'srv-b';
      this.lbRoundRobin += 1;
      this.enqueue({
        timestamp: this.currentTime,
        kind: 'arrival',
        targetId: serverId,
        workId,
        originId: 'client',
        retryCount: retryCount + 1,
      });
    } else {
      this.resolvedWork.add(workId);
      this.failed += 1;
      this.inFlight = Math.max(0, this.inFlight - 1);
    }
  }

  private sampleIfNeeded(): void {
    const t = Math.floor(this.currentTime);
    if (t === this.lastSampleTime) return;
    this.lastSampleTime = t;
    const cap = 2 * this.config.serverConcurrency;
    this.timeSeries.push({
      time: t,
      completed: this.completed,
      failed: this.failed,
      inFlight: this.inFlight,
      retries: this.retries,
      serverUtil: cap > 0 ? ((this.serverA.active + this.serverB.active) / cap) * 100 : 0,
    });
    if (this.timeSeries.length > 120) {
      this.timeSeries = this.timeSeries.slice(-120);
    }
  }
}

export const DEFAULT_STABILITY_CONFIG: StabilityConfig = {
  arrivalRate: 70,
  maxRetries: 3,
  serverConcurrency: 5,
  serviceTimeMean: 0.1,
  crashAt: 5,
  recoverAt: 10,
  endTime: 60,
  seed: 42,
};
