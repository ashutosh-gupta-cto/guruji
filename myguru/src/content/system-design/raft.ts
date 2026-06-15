import type { LessonContent } from '../types';

const raftContent: LessonContent = {
  moduleId: 'raft',
  title: 'Raft Consensus',
  sections: [
    {
      heading: 'Why consensus matters',
      body:
        'Distributed systems replicate state across multiple nodes for fault tolerance. Consensus algorithms ensure all replicas agree on the same ordered log of commands, even when nodes crash or networks partition. Without consensus, replicas diverge and clients see inconsistent data.',
      bullets: [
        'Replicated state machines apply the same commands in the same order on every node.',
        'Fault tolerance requires a quorum (majority) of nodes to agree before committing.',
        'Raft was designed to be more understandable than Paxos while providing equivalent guarantees.',
      ],
    },
    {
      heading: 'Node states and leader election',
      body:
        'Every Raft node is a follower, candidate, or leader. Followers respond to RPCs from leaders and candidates. If a follower misses heartbeats for a randomized election timeout (typically 150–300 ms), it becomes a candidate, increments its term, votes for itself, and requests votes from peers. A candidate that receives votes from a majority becomes the new leader.',
      bullets: [
        'Randomized timeouts prevent split votes when multiple nodes start elections simultaneously.',
        'Each term has at most one leader; higher terms supersede stale leaders.',
        'Double-click a node in the simulator to kill it — watch the cluster elect a new leader.',
      ],
      tip: 'Only the leader accepts client writes. Followers are passive until they timeout and start an election.',
    },
    {
      heading: 'Log replication and commit',
      body:
        'The leader appends client commands to its log and sends AppendEntries RPCs to followers. Each entry has a term and index. An entry is committed once replicated on a majority; the leader applies it to its state machine and notifies followers via subsequent heartbeats.',
      code: `// Simplified commit rule
leader.append(entry)
if majority of followers replicate entry:
  commit(entry)
  apply to state machine`,
      bullets: [
        'Conflicting entries at the same index are overwritten by the leader with a higher term.',
        'Committed entries are durable — they survive future elections.',
        'Followers reject AppendEntries if their log does not match the leader\'s prior entry.',
      ],
    },
    {
      heading: 'Fault tolerance and partitions',
      body:
        'Raft tolerates up to (N−1)/2 failures in an N-node cluster. During a network partition, the majority side continues; the minority side cannot elect a leader or commit entries. When the partition heals, the minority\'s uncommitted entries are overwritten by the leader\'s log. Press P in the simulator to create a random partition and H to heal.',
      bullets: [
        'Split-brain prevention: only the partition with quorum can commit.',
        'Stale leader: a partitioned ex-leader cannot commit new entries; it steps down on seeing a higher term.',
        'Log repair: followers truncate conflicting suffixes and accept the leader\'s log.',
      ],
    },
  ],
  keyTakeaways: [
    'Raft elects a single leader that handles all client writes.',
    'Entries commit after replication to a majority of nodes.',
    'Terms and log indices detect stale leaders and resolve conflicts.',
    'Network partitions block the minority side from making progress.',
  ],
  sourceAttribution: [
    {
      repo: 'AarjavPatni/raft-visualization',
      url: 'https://github.com/AarjavPatni/raft-visualization',
    },
    {
      repo: 'raft.github.io',
      url: 'https://raft.github.io/raft.pdf',
    },
  ],
  quiz: [
    {
      question: 'In Raft, when is a log entry considered committed?',
      options: [
        'When the leader writes it locally',
        'When any single follower acknowledges it',
        'When a majority of nodes have replicated it',
        'When the client receives an HTTP 200 response',
      ],
      correctIndex: 2,
      explanation:
        'An entry commits once the leader has replicated it on a majority of nodes, guaranteeing durability through future elections.',
    },
    {
      question: 'What prevents split votes during leader election?',
      options: [
        'All nodes use the same fixed timeout',
        'Randomized election timeouts stagger candidate start times',
        'Followers never become candidates',
        'The client picks the leader directly',
      ],
      correctIndex: 1,
      explanation:
        'Randomized timeouts make it unlikely that multiple nodes become candidates simultaneously, allowing one to win a majority quickly.',
    },
  ],
};

export default raftContent;
