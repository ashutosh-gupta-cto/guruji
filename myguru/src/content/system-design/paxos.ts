import type { LessonContent } from '../types';

const paxosContent: LessonContent = {
  moduleId: 'paxos',
  title: 'Paxos Consensus',
  sections: [
    {
      heading: 'Why Paxos?',
      body:
        'Paxos is the foundational consensus algorithm for distributed systems. It guarantees that a group of nodes agree on a single value even when messages are delayed, reordered, or nodes fail. Unlike Raft, Paxos separates roles strictly: proposers initiate, acceptors vote, and learners observe the outcome.',
      bullets: [
        'Tolerates up to (N−1)/2 acceptor failures in a cluster of N acceptors.',
        'Two-phase protocol: prepare/promise, then accept/learn.',
        'Only one value is chosen per Paxos instance (slot).',
      ],
    },
    {
      heading: 'Phase 1: Prepare and Promise',
      body:
        'A proposer selects a unique, monotonically increasing proposal number n and sends Prepare(n) to a quorum of acceptors. Each acceptor promises not to accept proposals numbered less than n, and replies with Promise(n, prior_accepted) if it can promise. Once the proposer receives promises from a majority, it may proceed to Phase 2.',
      bullets: [
        'Higher proposal numbers supersede lower ones.',
        'If an acceptor previously accepted a value, the proposer must use the highest-numbered accepted value.',
        'Competing proposers can cause livelock — use randomized backoff or Multi-Paxos with a stable leader.',
      ],
      tip: 'Click "Start Prepare" in the simulator to broadcast Prepare messages and watch promises return.',
    },
    {
      heading: 'Phase 2: Accept and Learn',
      body:
        'The proposer sends Accept(n, value) to acceptors. Acceptors accept if n ≥ their promised number, persist the value, and send Accepted to learners. When a learner sees Accepted from a quorum for the same (n, value), the value is chosen and safe to apply.',
      code: `// Simplified Paxos decision rule
if promises >= quorum:
  value = highest_prior_accepted or proposed_value
  broadcast Accept(n, value)
if accepts >= quorum:
  DECIDED(value)`,
    },
    {
      heading: 'Paxos vs Raft',
      body:
        'Raft decomposes consensus into leader election and log replication for understandability. Paxos is more general — Classic Paxos decides one value; Multi-Paxos runs repeated instances for a replicated log. Both require majority quorums and provide safety under partial synchrony assumptions.',
      bullets: [
        'Paxos roles can colocate on the same physical node.',
        'Raft is easier to implement; Paxos is more flexible for custom deployments.',
        'Both prevent split-brain via quorum intersection.',
      ],
    },
  ],
  keyTakeaways: [
    'Prepare/Promise establishes which proposal number wins.',
    'Accept/Learn commits a single value once a quorum agrees.',
    'Acceptors are the fault-tolerant memory of Paxos.',
    'Proposers must reuse previously accepted values when re-proposing.',
  ],
  sourceAttribution: [
    {
      repo: 'jivimberg/paxos-playground',
      url: 'https://github.com/jivimberg/paxos-playground',
    },
    {
      repo: 'Lamport, Paxos Made Simple',
      url: 'https://lamport.azurewebsites.net/pubs/paxos-simple.pdf',
    },
  ],
  quiz: [
    {
      question: 'What must a proposer do if acceptors promise prior accepted values?',
      options: [
        'Always use its own proposed value',
        'Use the value from the highest-numbered prior acceptance',
        'Restart Phase 1 with n=0',
        'Abort and wait for a new leader',
      ],
      correctIndex: 1,
      explanation:
        'Paxos safety requires the proposer to propagate any previously accepted value — it picks the one tied to the highest proposal number seen in promises.',
    },
    {
      question: 'When is a value considered chosen in Paxos?',
      options: [
        'When the proposer sends Prepare',
        'When one acceptor accepts it',
        'When a learner receives Accepted from a quorum',
        'When the client receives HTTP 200',
      ],
      correctIndex: 2,
      explanation:
        'A value is chosen once a quorum of acceptors has accepted the same proposal number and value; learners detect this and broadcast the decision.',
    },
  ],
};

export default paxosContent;
