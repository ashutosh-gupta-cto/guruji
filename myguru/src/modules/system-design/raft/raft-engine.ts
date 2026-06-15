/**
 * Simplified Raft consensus engine for visualization.
 * Ported from AarjavPatni/raft-visualization (js/raftNode.js, raftNetwork.js)
 * @see https://github.com/AarjavPatni/raft-visualization
 */

export type RaftState = 'follower' | 'candidate' | 'leader' | 'dead';

export interface LogEntry {
  term: number;
  command: string;
}

export interface RaftMessage {
  id: number;
  from: number;
  to: number;
  type: 'RequestVote' | 'VoteGranted' | 'AppendEntries' | 'AppendReply';
  term: number;
  progress: number;
}

export interface RaftNodeModel {
  id: number;
  x: number;
  y: number;
  state: RaftState;
  term: number;
  votedFor: number | null;
  log: LogEntry[];
  commitIndex: number;
  votesReceived: number;
  isAlive: boolean;
  lastHeartbeat: number;
  electionTimeout: number;
}

export interface RaftClusterStats {
  currentTerm: number;
  leader: string;
  aliveNodes: number;
  totalNodes: number;
  activeMessages: number;
}

let messageId = 0;

function randomElectionTimeout(): number {
  return 2500 + Math.random() * 2500;
}

export function createCluster(nodeCount: number, width: number, height: number): RaftNodeModel[] {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.32;

  return Array.from({ length: nodeCount }, (_, i) => {
    const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2;
    return {
      id: i,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      state: 'follower' as RaftState,
      term: 0,
      votedFor: null,
      log: [],
      commitIndex: 0,
      votesReceived: 0,
      isAlive: true,
      lastHeartbeat: Date.now(),
      electionTimeout: randomElectionTimeout(),
    };
  });
}

export class RaftSimulation {
  nodes: RaftNodeModel[] = [];
  messages: RaftMessage[] = [];
  speedMultiplier = 1;
  private requestCounter = 0;

  constructor(nodeCount = 5, width = 720, height = 480) {
    this.nodes = createCluster(nodeCount, width, height);
  }

  reset(): void {
    messageId = 0;
    this.requestCounter = 0;
    this.messages = [];
    this.nodes = createCluster(this.nodes.length, 720, 480);
  }

  setSpeed(multiplier: number): void {
    this.speedMultiplier = multiplier;
  }

  getStats(): RaftClusterStats {
    const alive = this.nodes.filter((n) => n.isAlive);
    const leader = alive.find((n) => n.state === 'leader');
    const maxTerm = Math.max(...this.nodes.map((n) => n.term), 0);
    return {
      currentTerm: maxTerm,
      leader: leader ? `Node ${leader.id}` : 'None',
      aliveNodes: alive.length,
      totalNodes: this.nodes.length,
      activeMessages: this.messages.length,
    };
  }

  addClientRequest(command?: string): boolean {
    const leader = this.nodes.find((n) => n.isAlive && n.state === 'leader');
    if (!leader) return false;

    this.requestCounter += 1;
    const cmd = command ?? `REQ_${this.requestCounter}`;
    const entry: LogEntry = { term: leader.term, command: cmd };
    leader.log.push(entry);

    for (const node of this.nodes) {
      if (node.id !== leader.id && node.isAlive) {
        this.sendMessage(leader.id, node.id, 'AppendEntries', leader.term);
      }
    }
    leader.commitIndex = leader.log.length;
    return true;
  }

  killRandomNode(): number | null {
    const alive = this.nodes.filter((n) => n.isAlive);
    if (alive.length <= 1) return null;
    const target = alive[Math.floor(Math.random() * alive.length)];
    const wasLeader = target.state === 'leader';
    target.isAlive = false;
    target.state = 'dead';
    if (wasLeader) {
      /* leader killed — election will follow */
    }
    return target.id;
  }

  reviveAll(): void {
    for (const node of this.nodes) {
      node.isAlive = true;
      node.state = 'follower';
      node.lastHeartbeat = Date.now();
      node.electionTimeout = randomElectionTimeout();
    }
  }

  update(deltaMs: number): void {
    const now = Date.now();
    const dt = deltaMs * this.speedMultiplier;

    this.messages = this.messages
      .map((m) => ({ ...m, progress: Math.min(1, m.progress + dt / 400) }))
      .filter((m) => m.progress < 1);

    for (const node of this.nodes) {
      if (!node.isAlive) continue;

      if (node.state === 'follower' || node.state === 'candidate') {
        if (now - node.lastHeartbeat > node.electionTimeout / this.speedMultiplier) {
          this.startElection(node);
        }
      }

      if (node.state === 'leader') {
        if (now - node.lastHeartbeat > 900 / this.speedMultiplier) {
          this.sendHeartbeats(node);
          node.lastHeartbeat = now;
        }
      }
    }
  }

  private startElection(node: RaftNodeModel): void {
    node.state = 'candidate';
    node.term += 1;
    node.votedFor = node.id;
    node.votesReceived = 1;
    node.lastHeartbeat = Date.now();
    node.electionTimeout = randomElectionTimeout();

    const votesNeeded = Math.floor(this.nodes.filter((n) => n.isAlive).length / 2) + 1;
    let granted = 1;

    for (const peer of this.nodes) {
      if (peer.id === node.id || !peer.isAlive) continue;
      this.sendMessage(node.id, peer.id, 'RequestVote', node.term);

      if (peer.term <= node.term && (peer.votedFor === null || peer.votedFor === node.id)) {
        peer.votedFor = node.id;
        peer.term = node.term;
        peer.state = 'follower';
        peer.lastHeartbeat = Date.now();
        granted += 1;
        this.sendMessage(peer.id, node.id, 'VoteGranted', node.term);
      }
    }

    if (granted >= votesNeeded) {
      this.becomeLeader(node);
    }
  }

  private becomeLeader(node: RaftNodeModel): void {
    for (const n of this.nodes) {
      if (n.state === 'leader' && n.id !== node.id) {
        n.state = 'follower';
      }
    }
    node.state = 'leader';
    node.lastHeartbeat = Date.now();
    this.sendHeartbeats(node);
  }

  private sendHeartbeats(leader: RaftNodeModel): void {
    for (const peer of this.nodes) {
      if (peer.id !== leader.id && peer.isAlive) {
        peer.lastHeartbeat = Date.now();
        peer.state = 'follower';
        this.sendMessage(leader.id, peer.id, 'AppendEntries', leader.term);
      }
    }
  }

  private sendMessage(
    from: number,
    to: number,
    type: RaftMessage['type'],
    term: number,
  ): void {
    messageId += 1;
    this.messages.push({
      id: messageId,
      from,
      to,
      type,
      term,
      progress: 0,
    });

    if (type === 'AppendEntries' && from !== to) {
      const leader = this.nodes[from];
      const follower = this.nodes[to];
      if (leader?.state === 'leader' && follower?.isAlive) {
        const last = leader.log[leader.log.length - 1];
        if (last && (follower.log.length === 0 || follower.log[follower.log.length - 1]?.command !== last.command)) {
          follower.log.push({ ...last });
          follower.commitIndex = follower.log.length;
        }
      }
    }
  }
}

export function stateColor(state: RaftState): string {
  switch (state) {
    case 'follower':
      return '#2196f3';
    case 'candidate':
      return '#ff9800';
    case 'leader':
      return '#ffd700';
    case 'dead':
      return '#666666';
    default:
      return '#888888';
  }
}
