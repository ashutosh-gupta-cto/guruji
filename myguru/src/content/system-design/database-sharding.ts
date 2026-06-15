import type { LessonContent } from '../types';

const databaseShardingContent: LessonContent = {
  moduleId: 'database-sharding',
  title: 'Database Sharding',
  sections: [
    {
      heading: 'When one database is not enough',
      body:
        'A single database node has limits on storage, write throughput, and memory for indexes. Vertical scaling (bigger machine) hits a ceiling. Horizontal sharding splits data across multiple nodes, each holding a subset of the total dataset. Queries route to the correct shard via a partitioning key.',
      bullets: [
        'Shard key determines which node owns a row (user_id, tenant_id, geographic region).',
        'Each shard is an independent database — no cross-shard joins without application-level coordination.',
        'Rebalancing moves data when adding or removing shards.',
      ],
    },
    {
      heading: 'Hash-based vs range partitioning',
      body:
        'Hash partitioning applies hash(key) % N to spread rows evenly across N shards. Range partitioning assigns contiguous key ranges (A–M on shard 1, N–Z on shard 2). Hash gives even distribution; range enables efficient range scans but risks hot spots.',
      bullets: [
        'Hash-based: even load, but range queries hit all shards (scatter-gather).',
        'Key-range: efficient prefix/range queries, but uneven if access is skewed.',
        'Directory-based: lookup table maps keys to shards — flexible but the directory is a bottleneck.',
      ],
    },
    {
      heading: 'Consistent hashing',
      body:
        'Naive hash(key) % N remaps almost every key when N changes — catastrophic during rebalancing. Consistent hashing maps both servers and keys onto a ring (0–360°). Each key belongs to the first server encountered clockwise. Adding a server only moves keys in its arc; removing one redistributes only its keys.',
      bullets: [
        'Virtual nodes (vnodes): each physical server owns multiple points on the ring for even distribution.',
        'Minimal redistribution: only keys between the new node and its predecessor move.',
        'Used by DynamoDB, Cassandra, memcached, and CDN origin servers.',
      ],
      tip: 'In the simulator, watch how adding a server moves only a fraction of keys — contrast with modulo hashing where ~all keys would move.',
    },
    {
      heading: 'Hot partitions and rebalancing',
      body:
        'Even with consistent hashing, skewed access patterns create hot shards — one celebrity user\'s data gets all the traffic. Mitigations include splitting hot ranges, adding read replicas for hot shards, or salting keys (append random suffix to spread writes). Rebalancing — moving partitions between nodes — must happen online with minimal disruption.',
      bullets: [
        'Hot partition: one shard receives disproportionate read/write load.',
        'Rebalancing triggers: cluster resize, node failure, load imbalance detection.',
        'Dual-write or copy-then-switch strategies avoid downtime during migration.',
      ],
    },
  ],
  keyTakeaways: [
    'Sharding horizontally partitions data when a single node cannot scale further.',
    'Consistent hashing minimizes key movement when the cluster changes size.',
    'Virtual nodes improve load balance on the ring.',
    'Shard key choice and hot-partition handling make or break a sharded design.',
  ],
  sourceAttribution: [
    {
      repo: 'ionmx/consistent-hashing-simulator',
      url: 'https://github.com/ionmx/consistent-hashing-simulator',
    },
    {
      repo: 'PatrickKoss/database-internals-visualized',
      url: 'https://github.com/PatrickKoss/database-internals-visualized',
    },
  ],
  quiz: [
    {
      question: 'What is the main advantage of consistent hashing over hash(key) % N?',
      options: [
        'It eliminates the need for a shard key',
        'Adding or removing a node moves only a fraction of keys, not nearly all',
        'It guarantees ACID transactions across shards',
        'It removes hot partitions entirely',
      ],
      correctIndex: 1,
      explanation:
        'Consistent hashing localizes redistribution to keys near the changed node on the ring, avoiding a full remapping.',
    },
    {
      question: 'What problem do virtual nodes (vnodes) solve on a hash ring?',
      options: [
        'Encrypting data at rest',
        'Uneven key distribution when physical servers own too few ring positions',
        'Cross-shard JOIN performance',
        'Automatic schema migration',
      ],
      correctIndex: 1,
      explanation:
        'Virtual nodes give each physical server multiple positions on the ring, spreading keys more evenly across the cluster.',
    },
  ],
};

export default databaseShardingContent;
