import type { LessonContent } from '../types';

const kafkaContent: LessonContent = {
  moduleId: 'kafka',
  title: 'Apache Kafka Deep Dive',
  sections: [
    {
      heading: 'Kafka as a distributed log',
      body:
        'Unlike a traditional queue that deletes messages after consumption, Kafka appends records to a durable, partitioned log. Consumers track their read position (offset) independently. This design enables replay, multiple consumer groups reading the same stream, and high-throughput batch processing.',
      bullets: [
        'Producers send batches of records to topic partitions.',
        'Brokers replicate partitions across the cluster for fault tolerance.',
        'Consumers pull records at their own rate — Kafka does not push.',
      ],
    },
    {
      heading: 'Partitioning and message keys',
      body:
        'When a producer sends a record with a key, Kafka hashes the key to pick a partition. Records with the same key always land in the same partition, preserving order for that key. Null keys round-robin across partitions.',
      code: `partition = hash(key) % numPartitions
// Same key → same partition → ordered delivery for that key`,
      tip: 'In interviews, say "user_id as key ensures all events for one user stay ordered."',
    },
    {
      heading: 'Replication and ISR',
      body:
        'Each partition has one leader broker and zero or more followers. Producers write to the leader; followers replicate. The In-Sync Replica (ISR) set contains followers caught up within a configurable lag. A record is committed when all ISR members acknowledge (acks=all).',
      bullets: [
        'acks=0 — fire and forget; highest throughput, no durability guarantee.',
        'acks=1 — leader ack only; survives leader failure if ISR has replicas.',
        'acks=all — wait for full ISR; strongest durability, higher latency.',
        'Leader failure: a follower in ISR is elected as the new leader.',
      ],
    },
    {
      heading: 'Consumer groups and rebalance',
      body:
        'Scaling consumption means adding consumers to a group. Kafka assigns partitions across group members — typically round-robin or range assignment. When you add or remove a consumer, the group rebalances: partitions revoke from old owners and assign to new ones. During rebalance, consumption pauses (stop-the-world in classic protocol).',
      bullets: [
        'Max consumers in a group = partition count (extra consumers idle).',
        'Static membership reduces unnecessary rebalances on rolling restarts.',
        'Cooperative sticky assignor rebalances incrementally instead of revoking all partitions.',
      ],
    },
    {
      heading: 'Operational patterns',
      body:
        'Kafka powers event sourcing, CDC (Change Data Capture), log aggregation, and stream processing (Kafka Streams, Flink). Retention policies (time or size based) control how long data lives. Compacted topics keep only the latest value per key — useful for config and state snapshots.',
      bullets: [
        'Consumer lag: difference between log end offset and consumer offset — key health metric.',
        'Schema Registry: enforce Avro/Protobuf schemas for evolution-safe serialization.',
        'Tiered storage: move old segments to S3 for cost-effective long retention.',
      ],
    },
  ],
  keyTakeaways: [
    'Kafka is an append-only partitioned log, not a traditional point-to-point queue.',
    'Message keys route related records to the same partition for ordering.',
    'Replication and ISR configuration determine durability vs latency.',
    'Consumer group size and partition count jointly determine read parallelism.',
  ],
  sourceAttribution: [
    {
      repo: 'idsulik/kafka-concepts-visualizer',
      url: 'https://github.com/idsulik/kafka-concepts-visualizer',
    },
    {
      repo: 'apache/kafka',
      url: 'https://kafka.apache.org/documentation/',
    },
  ],
  quiz: [
    {
      question: 'What determines the maximum parallel consumers in a single consumer group?',
      options: [
        'Number of brokers in the cluster',
        'Number of partitions in the topic',
        'Replication factor',
        'Producer batch size',
      ],
      correctIndex: 1,
      explanation:
        'Each partition can be consumed by at most one consumer in a group, so parallelism is capped at the partition count.',
    },
    {
      question: 'Why use a message key when producing to Kafka?',
      options: [
        'To encrypt the message payload',
        'To route related messages to the same partition for ordering',
        'To set the TTL of the message',
        'To select which broker stores the topic',
      ],
      correctIndex: 1,
      explanation:
        'Kafka hashes the key to select a partition, so all records with the same key stay ordered within that partition.',
    },
  ],
};

export default kafkaContent;
