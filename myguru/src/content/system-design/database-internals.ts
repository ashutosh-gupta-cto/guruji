import type { LessonContent } from '../types';

const databaseInternalsContent: LessonContent = {
  moduleId: 'database-internals',
  title: 'Database Replication',
  sections: [
    {
      heading: 'Why replicate data',
      body:
        'Storing data on a single machine creates a single point of failure and caps read throughput. Replication copies data to multiple nodes for fault tolerance, geographic proximity, and read scaling. The hard part is keeping replicas consistent while remaining available under failure.',
      bullets: [
        'Leader-based: one node accepts writes, others replicate asynchronously or synchronously.',
        'Leaderless: any replica may accept reads/writes with quorum coordination.',
        'Replication lag: followers may serve stale data if updates propagate slowly.',
      ],
    },
    {
      heading: 'Single-leader replication',
      body:
        'All writes go to the leader; the leader sends the change log to followers. Followers apply entries in order, maintaining a copy of the data. Clients can read from followers for scale, but reads may be stale if replication lag is non-zero.',
      bullets: [
        'Synchronous replication: leader waits for follower ack before confirming write — strong durability, higher latency.',
        'Asynchronous replication: leader confirms immediately — lower latency, risk of lost writes on leader crash.',
        'Failover: promote a follower to leader when the current leader dies — must avoid split-brain.',
      ],
      tip: 'Single-leader is the default interview answer for Postgres, MySQL, MongoDB replica sets.',
    },
    {
      heading: 'Replication lag and read consistency',
      body:
        'Followers trailing the leader serve stale reads. Applications must decide whether stale reads are acceptable. Session guarantees like read-your-writes route a user\'s reads to the leader or a caught-up replica after their own write.',
      bullets: [
        'Monotonic reads: a user never sees time go backward across requests.',
        'Consistent prefix reads: if a series of writes happened in order, reads see them in that order.',
        'Linearizable reads: always see the latest committed write — requires reading from leader or quorum.',
      ],
    },
    {
      heading: 'Failover and split-brain',
      body:
        'When the leader fails, the system must elect a new leader from followers. This requires consensus (Raft, Paxos) or external coordination (ZooKeeper) to avoid two nodes both believing they are leader — split-brain leads to divergent data. Fencing (STONITH) forcibly isolates the old leader.',
      bullets: [
        'Automatic failover: faster recovery but risk of false positives (declaring alive leader dead).',
        'Manual failover: safer but longer downtime.',
        'Chain replication: writes propagate head-to-tail for strong consistency with simpler logic.',
      ],
    },
    {
      heading: 'Beyond single-leader',
      body:
        'Multi-leader replication allows writes on multiple nodes — useful for multi-datacenter but requires conflict resolution (last-write-wins, version vectors, CRDTs). Leaderless replication (Dynamo-style) uses quorum reads and writes: W + R > N guarantees overlap for consistency tuning.',
      bullets: [
        'Quorum: read from R replicas, write to W replicas; choose W and R based on consistency needs.',
        'Hinted handoff: temporarily store writes for unavailable nodes.',
        'Read repair: fix stale replicas during reads.',
      ],
    },
  ],
  keyTakeaways: [
    'Single-leader replication funnels writes through one node and fans out to followers.',
    'Sync vs async replication trades write latency for durability.',
    'Follower reads scale throughput but may return stale data.',
    'Failover requires consensus to prevent split-brain.',
  ],
  sourceAttribution: [
    {
      repo: 'PatrickKoss/database-internals-visualized',
      url: 'https://github.com/PatrickKoss/database-internals-visualized',
    },
  ],
  quiz: [
    {
      question: 'In single-leader replication, where do all write requests go?',
      options: [
        'Any follower chosen at random',
        'The leader only',
        'The node closest to the client',
        'All replicas simultaneously without coordination',
      ],
      correctIndex: 1,
      explanation:
        'Single-leader architecture centralizes writes on the leader, which then replicates changes to followers.',
    },
    {
      question: 'What is a primary risk of reading from asynchronous followers?',
      options: [
        'Reads are always more expensive than writes',
        'Followers may return stale data due to replication lag',
        'Followers cannot store indexes',
        'Reads automatically trigger a leader election',
      ],
      correctIndex: 1,
      explanation:
        'Async followers may not yet have the latest writes, so reads can return outdated values until replication catches up.',
    },
  ],
};

export default databaseInternalsContent;
