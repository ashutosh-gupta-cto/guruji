/**
 * CPU scheduling simulators with step-by-step traces.
 * Inspired by AmirShakibafar/OS-Visualizer.
 */

export type SchedulerAlgo = 'fcfs' | 'sjf' | 'rr';

export interface Process {
  id: string;
  arrival: number;
  burst: number;
  remaining: number;
}

export interface SchedulerStep {
  time: number;
  running: string | null;
  readyQueue: string[];
  completed: string[];
  message: string;
  gantt: { id: string; start: number; end: number }[];
}

export interface SchedulerInput {
  processes: Process[];
  quantum?: number;
}

function cloneProcesses(procs: Process[]): Process[] {
  return procs.map((p) => ({ ...p, remaining: p.burst }));
}

export function runFcfs(input: SchedulerInput): SchedulerStep[] {
  const procs = cloneProcesses(input.processes).sort((a, b) => a.arrival - b.arrival);
  const steps: SchedulerStep[] = [];
  const gantt: { id: string; start: number; end: number }[] = [];
  const completed: string[] = [];
  let time = 0;

  steps.push({
    time: 0,
    running: null,
    readyQueue: [],
    completed: [],
    message: 'FCFS: processes run in arrival order.',
    gantt: [],
  });

  for (const p of procs) {
    if (time < p.arrival) {
      time = p.arrival;
      steps.push({
        time,
        running: null,
        readyQueue: procs.filter((x) => x.arrival <= time && !completed.includes(x.id)).map((x) => x.id),
        completed: [...completed],
        message: `CPU idle until P${p.id} arrives at t=${p.arrival}.`,
        gantt: [...gantt],
      });
    }
    const start = time;
    time += p.burst;
    gantt.push({ id: p.id, start, end: time });
    completed.push(p.id);
    steps.push({
      time,
      running: p.id,
      readyQueue: procs.filter((x) => !completed.includes(x.id) && x.arrival <= time).map((x) => x.id),
      completed: [...completed],
      message: `Run P${p.id} for ${p.burst}ms (t=${start}→${time}).`,
      gantt: [...gantt],
    });
  }

  return steps;
}

export function runSjf(input: SchedulerInput): SchedulerStep[] {
  const procs = cloneProcesses(input.processes);
  const steps: SchedulerStep[] = [];
  const gantt: { id: string; start: number; end: number }[] = [];
  const completed: string[] = [];
  let time = 0;

  steps.push({
    time: 0,
    running: null,
    readyQueue: [],
    completed: [],
    message: 'SJF: always pick shortest burst among ready processes.',
    gantt: [],
  });

  while (completed.length < procs.length) {
    const ready = procs.filter((p) => p.arrival <= time && !completed.includes(p.id));
    if (ready.length === 0) {
      const next = procs.filter((p) => !completed.includes(p.id)).sort((a, b) => a.arrival - b.arrival)[0];
      time = next.arrival;
      steps.push({
        time,
        running: null,
        readyQueue: [],
        completed: [...completed],
        message: `CPU idle — jump to t=${time}.`,
        gantt: [...gantt],
      });
      continue;
    }
    ready.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival);
    const p = ready[0];
    const start = time;
    time += p.burst;
    gantt.push({ id: p.id, start, end: time });
    completed.push(p.id);
    steps.push({
      time,
      running: p.id,
      readyQueue: ready.map((x) => x.id),
      completed: [...completed],
      message: `Shortest job P${p.id} (burst=${p.burst}) runs t=${start}→${time}.`,
      gantt: [...gantt],
    });
  }

  return steps;
}

export function runRoundRobin(input: SchedulerInput): SchedulerStep[] {
  const quantum = input.quantum ?? 2;
  const procs = cloneProcesses(input.processes);
  const steps: SchedulerStep[] = [];
  const gantt: { id: string; start: number; end: number }[] = [];
  const completed: string[] = [];
  const queue: Process[] = [];
  let time = 0;
  let idx = 0;

  steps.push({
    time: 0,
    running: null,
    readyQueue: [],
    completed: [],
    message: `Round Robin with quantum=${quantum}.`,
    gantt: [],
  });

  while (completed.length < procs.length) {
    while (idx < procs.length && procs[idx].arrival <= time) {
      queue.push(procs[idx]);
      idx++;
    }
    if (queue.length === 0) {
      const nextArr = procs.filter((p) => !completed.includes(p.id)).sort((a, b) => a.arrival - b.arrival)[0];
      if (!nextArr) break;
      time = nextArr.arrival;
      continue;
    }
    const p = queue.shift()!;
    const slice = Math.min(quantum, p.remaining);
    const start = time;
    time += slice;
    p.remaining -= slice;
    gantt.push({ id: p.id, start, end: time });
    while (idx < procs.length && procs[idx].arrival <= time) {
      queue.push(procs[idx]);
      idx++;
    }
    if (p.remaining > 0) queue.push(p);
    else completed.push(p.id);
    steps.push({
      time,
      running: p.id,
      readyQueue: queue.map((x) => x.id),
      completed: [...completed],
      message:
        p.remaining > 0
          ? `P${p.id} used ${slice}ms of quantum — ${p.remaining}ms left, re-queued.`
          : `P${p.id} finished at t=${time}.`,
      gantt: [...gantt],
    });
  }

  return steps;
}

export function runScheduler(algo: SchedulerAlgo, input: SchedulerInput): SchedulerStep[] {
  switch (algo) {
    case 'fcfs':
      return runFcfs(input);
    case 'sjf':
      return runSjf(input);
    case 'rr':
      return runRoundRobin(input);
  }
}

export const DEFAULT_PROCESSES: Process[] = [
  { id: '1', arrival: 0, burst: 5, remaining: 5 },
  { id: '2', arrival: 1, burst: 3, remaining: 3 },
  { id: '3', arrival: 2, burst: 8, remaining: 8 },
  { id: '4', arrival: 3, burst: 6, remaining: 6 },
];
