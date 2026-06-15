/**
 * Simplified Paxos consensus engine — prepare, promise, accept, learn.
 * Ported from jivimberg/paxos-playground (core phase logic).
 */

export type PaxosPhase = 'idle' | 'prepare' | 'promise' | 'accept' | 'learn' | 'decided';

export type MessageType = 'Prepare' | 'Promise' | 'Accept' | 'Accepted' | 'Learn';

export interface PaxosMessage {
  id: string;
  type: MessageType;
  from: number;
  to: number;
  proposalNum: number;
  value?: string;
  progress: number;
}

export interface AcceptorState {
  id: number;
  promisedNum: number | null;
  acceptedNum: number | null;
  acceptedValue: string | null;
}

export interface PaxosNode {
  id: number;
  role: 'proposer' | 'acceptor' | 'learner';
  x: number;
  y: number;
}

export interface PaxosSnapshot {
  phase: PaxosPhase;
  proposalNum: number;
  proposedValue: string;
  decidedValue: string | null;
  acceptors: AcceptorState[];
  promisesReceived: number;
  acceptsReceived: number;
  messages: PaxosMessage[];
  log: string[];
}

const QUORUM = 2;
const ACCEPTOR_COUNT = 3;

export class PaxosSimulation {
  readonly nodes: PaxosNode[];
  readonly quorum = QUORUM;

  phase: PaxosPhase = 'idle';
  proposalNum = 1;
  proposedValue = 'SET x=42';
  decidedValue: string | null = null;
  acceptors: AcceptorState[];
  promisesReceived = 0;
  promiseValues: Map<number, { num: number | null; value: string | null }> = new Map();
  acceptsReceived = 0;
  messages: PaxosMessage[] = [];
  log: string[] = [];
  private msgCounter = 0;

  constructor(width = 720, height = 400) {
    this.nodes = [
      { id: 0, role: 'proposer', x: width * 0.15, y: height * 0.5 },
      { id: 1, role: 'acceptor', x: width * 0.45, y: height * 0.2 },
      { id: 2, role: 'acceptor', x: width * 0.45, y: height * 0.5 },
      { id: 3, role: 'acceptor', x: width * 0.45, y: height * 0.8 },
      { id: 4, role: 'learner', x: width * 0.8, y: height * 0.5 },
    ];
    this.acceptors = Array.from({ length: ACCEPTOR_COUNT }, (_, i) => ({
      id: i + 1,
      promisedNum: null,
      acceptedNum: null,
      acceptedValue: null,
    }));
  }

  reset(): void {
    this.phase = 'idle';
    this.proposalNum = 1;
    this.decidedValue = null;
    this.promisesReceived = 0;
    this.promiseValues.clear();
    this.acceptsReceived = 0;
    this.messages = [];
    this.log = [];
    this.acceptors = Array.from({ length: ACCEPTOR_COUNT }, (_, i) => ({
      id: i + 1,
      promisedNum: null,
      acceptedNum: null,
      acceptedValue: null,
    }));
  }

  private addLog(msg: string): void {
    this.log = [...this.log.slice(-19), msg];
  }

  private enqueueMessage(
    type: MessageType,
    from: number,
    to: number,
    proposalNum: number,
    value?: string,
  ): void {
    this.messages.push({
      id: `m${++this.msgCounter}`,
      type,
      from,
      to,
      proposalNum,
      value,
      progress: 0,
    });
  }

  /** Phase 1: Proposer broadcasts Prepare(n) to all acceptors. */
  startPrepare(): boolean {
    if (this.phase !== 'idle' && this.phase !== 'decided') return false;
    if (this.decidedValue) return false;

    this.phase = 'prepare';
    this.promisesReceived = 0;
    this.promiseValues.clear();
    this.acceptsReceived = 0;
    this.proposalNum += 1;

    this.addLog(`Proposer sends Prepare(${this.proposalNum}) to acceptors`);
    for (const acc of this.acceptors) {
      this.enqueueMessage('Prepare', 0, acc.id, this.proposalNum);
    }
    return true;
  }

  /** Process one in-flight message; returns true if state changed. */
  tickMessage(deltaMs: number): boolean {
    if (this.messages.length === 0) return false;

    let changed = false;
    const remaining: PaxosMessage[] = [];

    for (const msg of this.messages) {
      msg.progress += deltaMs * 0.002;
      if (msg.progress < 1) {
        remaining.push(msg);
        continue;
      }
      changed = true;
      this.deliverMessage(msg);
    }

    this.messages = remaining;
    return changed;
  }

  private deliverMessage(msg: PaxosMessage): void {
    switch (msg.type) {
      case 'Prepare':
        this.handlePrepare(msg);
        break;
      case 'Promise':
        this.handlePromise(msg);
        break;
      case 'Accept':
        this.handleAccept(msg);
        break;
      case 'Accepted':
        this.handleAccepted(msg);
        break;
      case 'Learn':
        break;
    }
  }

  private handlePrepare(msg: PaxosMessage): void {
    const acc = this.acceptors.find((a) => a.id === msg.to);
    if (!acc) return;

    const canPromise =
      acc.promisedNum === null || msg.proposalNum >= acc.promisedNum;

    if (canPromise) {
      acc.promisedNum = msg.proposalNum;
      this.addLog(
        `Acceptor ${acc.id} promises for n=${msg.proposalNum}` +
          (acc.acceptedValue ? ` (prior value: ${acc.acceptedValue})` : ''),
      );
      this.enqueueMessage('Promise', acc.id, 0, msg.proposalNum, acc.acceptedValue ?? undefined);
    } else {
      this.addLog(`Acceptor ${acc.id} rejects Prepare(${msg.proposalNum})`);
    }
  }

  private handlePromise(msg: PaxosMessage): void {
    if (this.phase !== 'prepare' && this.phase !== 'promise') return;
    if (msg.proposalNum !== this.proposalNum) return;

    this.phase = 'promise';
    this.promisesReceived += 1;
    const acc = this.acceptors.find((a) => a.id === msg.from);
    this.promiseValues.set(msg.from, {
      num: acc?.acceptedNum ?? null,
      value: acc?.acceptedValue ?? null,
    });

    if (this.promisesReceived >= this.quorum) {
      this.broadcastAccept();
    }
  }

  private broadcastAccept(): void {
    let value = this.proposedValue;
    let highestNum = -1;
    for (const [, prior] of this.promiseValues) {
      if (prior.num !== null && prior.num >= highestNum && prior.value) {
        highestNum = prior.num;
        value = prior.value;
      }
    }

    this.phase = 'accept';
    this.addLog(`Quorum reached — broadcast Accept(${this.proposalNum}, "${value}")`);
    for (const acc of this.acceptors) {
      this.enqueueMessage('Accept', 0, acc.id, this.proposalNum, value);
    }
  }

  private handleAccept(msg: PaxosMessage): void {
    const acc = this.acceptors.find((a) => a.id === msg.to);
    if (!acc || msg.value === undefined) return;

    if (acc.promisedNum !== null && msg.proposalNum >= acc.promisedNum) {
      acc.promisedNum = msg.proposalNum;
      acc.acceptedNum = msg.proposalNum;
      acc.acceptedValue = msg.value;
      this.addLog(`Acceptor ${acc.id} accepted ("${msg.value}")`);
      this.enqueueMessage('Accepted', acc.id, 4, msg.proposalNum, msg.value);
    }
  }

  private handleAccepted(msg: PaxosMessage): void {
    if (msg.proposalNum !== this.proposalNum) return;
    this.acceptsReceived += 1;

    if (this.acceptsReceived >= this.quorum && msg.value) {
      this.phase = 'learn';
      this.decidedValue = msg.value;
      this.addLog(`Learner decided: "${msg.value}"`);
      this.enqueueMessage('Learn', 4, 0, msg.proposalNum, msg.value);
      this.phase = 'decided';
    }
  }

  getSnapshot(): PaxosSnapshot {
    return {
      phase: this.phase,
      proposalNum: this.proposalNum,
      proposedValue: this.proposedValue,
      decidedValue: this.decidedValue,
      acceptors: this.acceptors.map((a) => ({ ...a })),
      promisesReceived: this.promisesReceived,
      acceptsReceived: this.acceptsReceived,
      messages: this.messages,
      log: this.log,
    };
  }
}

export function phaseLabel(phase: PaxosPhase): string {
  const labels: Record<PaxosPhase, string> = {
    idle: 'Idle',
    prepare: 'Phase 1: Prepare',
    promise: 'Phase 1: Promise',
    accept: 'Phase 2: Accept',
    learn: 'Phase 2: Learn',
    decided: 'Decided',
  };
  return labels[phase];
}

export function phaseColor(phase: PaxosPhase): string {
  const colors: Record<PaxosPhase, string> = {
    idle: '#64748b',
    prepare: '#f59e0b',
    promise: '#eab308',
    accept: '#3b82f6',
    learn: '#8b5cf6',
    decided: '#22c55e',
  };
  return colors[phase];
}
