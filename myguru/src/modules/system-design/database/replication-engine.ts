/**
 * Single-leader replication engine (simplified).
 * Ported from PatrickKoss/database-internals-visualized
 * @see https://github.com/PatrickKoss/database-internals-visualized
 */

export interface LogEntry {
  key: string;
  value: string;
  timestamp: number;
}

export interface ReplicaNode {
  id: string;
  role: 'leader' | 'follower';
  log: LogEntry[];
  alive: boolean;
}

export interface ReplicationMessage {
  fromId: string;
  toId: string;
  entry: LogEntry;
  progress: number;
}

export interface ReplicationFrame {
  leader: ReplicaNode;
  followers: ReplicaNode[];
  annotation: string;
  highlightId: string | null;
  staleRead: boolean;
  messages: ReplicationMessage[];
  clock: number;
}

export interface ReplicationConfig {
  numFollowers: number;
  replicationLag: number;
}

function cloneNode(n: ReplicaNode): ReplicaNode {
  return { ...n, log: n.log.map((e) => ({ ...e })) };
}

export function generateReplicationFrames(config: ReplicationConfig): ReplicationFrame[] {
  const { numFollowers, replicationLag } = config;
  const frames: ReplicationFrame[] = [];

  const leader: ReplicaNode = { id: 'L', role: 'leader', log: [], alive: true };
  const followers: ReplicaNode[] = Array.from({ length: numFollowers }, (_, i) => ({
    id: `F${i + 1}`,
    role: 'follower' as const,
    log: [],
    alive: true,
  }));

  let clock = 0;

  const snapshot = (
    annotation: string,
    highlightId: string | null = null,
    staleRead = false,
    messages: ReplicationMessage[] = [],
  ): ReplicationFrame => ({
    leader: cloneNode(leader),
    followers: followers.map(cloneNode),
    annotation,
    highlightId,
    staleRead,
    messages,
    clock,
  });

  frames.push(
    snapshot(
      `Single-leader setup: leader (L) accepts writes, ${numFollowers} follower(s) replicate asynchronously.`,
    ),
  );

  const writes = [
    { key: 'x', value: '1' },
    { key: 'y', value: '2' },
    { key: 'x', value: '3' },
  ];

  for (const write of writes) {
    clock += 1;
    const entry: LogEntry = { key: write.key, value: write.value, timestamp: clock };
    leader.log.push(entry);

    frames.push(
      snapshot(
        `WRITE "${entry.key}" = "${entry.value}" appended to leader log (t=${clock}).`,
        'L',
      ),
    );

    const messages: ReplicationMessage[] = followers.map((f) => ({
      fromId: 'L',
      toId: f.id,
      entry: { ...entry },
      progress: 0,
    }));

    for (let step = 1; step <= replicationLag; step++) {
      const progress = step / replicationLag;
      frames.push(
        snapshot(
          `Replicating "${entry.key}" = "${entry.value}" to followers (${Math.round(progress * 100)}%).`,
          null,
          false,
          messages.map((m) => ({ ...m, progress })),
        ),
      );
    }

    for (const f of followers) {
      f.log.push({ ...entry });
    }

    frames.push(
      snapshot(`All followers received "${entry.key}" = "${entry.value}". Logs consistent.`),
    );
  }

  clock += 1;
  const staleEntry: LogEntry = { key: 'z', value: '42', timestamp: clock };
  leader.log.push(staleEntry);

  frames.push(
    snapshot(
      `WRITE "${staleEntry.key}" = "${staleEntry.value}" to leader. Followers haven't received it yet.`,
      'L',
    ),
  );

  frames.push(
    snapshot(
      `READ "${staleEntry.key}" from ${followers[0].id}: key not found. Leader has "${staleEntry.value}". STALE READ!`,
      followers[0].id,
      true,
    ),
  );

  const staleMessages = followers.map((f) => ({
    fromId: 'L',
    toId: f.id,
    entry: { ...staleEntry },
    progress: 1,
  }));

  frames.push(
    snapshot(
      `Replicating "${staleEntry.key}" = "${staleEntry.value}"…`,
      null,
      false,
      staleMessages,
    ),
  );

  for (const f of followers) {
    f.log.push({ ...staleEntry });
  }

  frames.push(
    snapshot(
      `Replication complete. Reading from ${followers[0].id} now returns "${staleEntry.value}".`,
      followers[0].id,
    ),
  );

  leader.alive = false;
  frames.push(snapshot('Leader (L) FAILED! Cluster must promote a follower.', 'L'));

  const newLeader = followers.reduce((best, f) => (f.log.length > best.log.length ? f : best));
  newLeader.role = 'leader';

  frames.push(
    snapshot(
      `${newLeader.id} promoted to leader (most up-to-date log, ${newLeader.log.length} entries).`,
      newLeader.id,
    ),
  );

  return frames;
}
