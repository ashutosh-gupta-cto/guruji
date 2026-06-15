import type { LessonContent } from '../types';

const capTheoremContent: LessonContent = {
  moduleId: 'cap-theorem',
  title: 'CAP Theorem',
  sections: [
    {
      heading: 'The three properties',
      body:
        'Eric Brewer\'s CAP theorem states that a distributed data store cannot simultaneously provide all three guarantees when a network partition occurs. You must choose which property to sacrifice.',
      bullets: [
        'Consistency (C): every read returns the most recent write or an error — the system behaves as a single copy.',
        'Availability (A): every request to a non-failing node receives a response (not an error, not a timeout).',
        'Partition tolerance (P): the system continues operating when messages are lost or delayed between nodes.',
      ],
      tip: 'In practice, partitions happen — so the real choice is C vs A during a partition, not whether to tolerate P.',
    },
    {
      heading: 'CP vs AP under partition',
      body:
        'When the network splits, CP systems reject requests rather than serve potentially inconsistent data. AP systems accept reads and writes on both sides of the partition, accepting that replicas may diverge until the partition heals.',
      bullets: [
        'CP example: Hazelcast CPSubsystem with AtomicLong — minority partition cannot reach quorum, operations timeout.',
        'AP example: Hazelcast PNCounter (CRDT) — both sides accept increments; values merge on heal.',
        'CA systems (no partition tolerance) only work on a single node — not realistic for distributed systems.',
      ],
    },
    {
      heading: 'Observing CP behavior',
      body:
        'In a 3-node CP cluster, isolating one node leaves a 2-node majority that can still commit operations. Isolating all nodes from each other means no quorum exists — every node rejects writes with "timeout, no quorum." Healing the partition triggers Raft leader election and log reconciliation so all nodes converge to one value.',
      bullets: [
        'Quorum for N nodes: majority = (N + 1) / 2; tolerates (N - 1) / 2 failures.',
        '3-node CP group: commits at 2 replicas; tolerates 1 failure.',
        '5-node CP group: commits at 3 replicas; tolerates 2 failures.',
      ],
    },
    {
      heading: 'Eventual consistency and CRDTs',
      body:
        'AP systems use eventual consistency: replicas converge over time without strong guarantees during the partition. CRDTs (Conflict-free Replicated Data Types) like PNCounter merge concurrent updates automatically — increments on both sides of a partition sum correctly after heal. Session guarantees (read-your-writes, monotonic reads) provide per-client consistency without global linearizability.',
      bullets: [
        'PNCounter: add-only counter with per-replica positive/negative counts; merge is commutative.',
        'Read-your-writes: a client always sees its own prior updates — a session guarantee, not global.',
        'PACELC extension: if no partition, choose between Latency and Consistency.',
      ],
    },
  ],
  keyTakeaways: [
    'During a network partition, distributed systems choose between consistency and availability.',
    'CP systems require quorum; minority partitions become unavailable.',
    'AP systems stay available but may serve divergent state until reconciliation.',
    'CRDTs enable safe merges for AP counters and sets without coordination.',
  ],
  sourceAttribution: [
    {
      repo: 'dice-dydakt/capdemo',
      url: 'https://github.com/dice-dydakt/capdemo',
    },
    {
      repo: 'hazelcast/hazelcast',
      url: 'https://docs.hazelcast.com/hazelcast/5.3/architecture/architecture#apcp',
    },
  ],
  quiz: [
    {
      question: 'During a network partition, a CP system prioritizes:',
      options: [
        'Always returning a response, even if stale',
        'Consistency over availability — may reject writes or reads',
        'Neither consistency nor availability',
        'Deleting all replicas',
      ],
      correctIndex: 1,
      explanation:
        'CP systems refuse to serve requests when they cannot guarantee consistency, rather than return potentially divergent data.',
    },
    {
      question: 'Why can both sides of a partition accept writes in an AP system with PNCounter?',
      options: [
        'PNCounter uses Raft for every increment',
        'PNCounter is a CRDT that merges concurrent increments without conflict',
        'AP systems never allow writes during partitions',
        'The load balancer routes all writes to one side',
      ],
      correctIndex: 1,
      explanation:
        'PNCounter is a conflict-free replicated data type — increments on isolated partitions merge by summing per-replica counts when connectivity returns.',
    },
  ],
};

export default capTheoremContent;
