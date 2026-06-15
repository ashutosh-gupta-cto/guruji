import type { LessonContent } from '../types';

const messageQueueContent: LessonContent = {
  moduleId: 'message-queue',
  title: 'Message Queues & Kafka',
  sections: [
    {
      heading: 'Why decouple with queues',
      body:
        'Synchronous request-response ties the caller to the callee\'s availability and latency. Message queues decouple producers from consumers: the producer publishes an event and moves on; consumers process at their own pace. This absorbs traffic spikes, enables retries, and lets teams deploy services independently.',
      bullets: [
        'Point-to-point queue: one consumer per message (task distribution).',
        'Pub/sub topic: multiple subscribers receive the same event (notifications, analytics).',
        'Backpressure: consumers lagging behind build up a queue instead of crashing producers.',
      ],
    },
    {
      heading: 'Core Kafka concepts',
      body:
        'Apache Kafka is a distributed commit log, not a traditional message queue. Producers append records to topics; brokers persist them in ordered partitions; consumer groups read in parallel while Kafka tracks offsets.',
      bullets: [
        'Topic — named stream of records, split into partitions for parallelism.',
        'Partition — ordered, immutable sequence of messages; the unit of scale.',
        'Offset — monotonic position within a partition; consumers track how far they have read.',
        'Broker — server that stores partitions and serves produce/fetch requests.',
      ],
    },
    {
      heading: 'Consumer groups and parallelism',
      body:
        'Consumers with the same group ID cooperate: each partition is assigned to exactly one consumer in the group. Adding consumers increases parallelism up to the partition count; removing consumers triggers rebalance to redistribute partitions.',
      bullets: [
        'One partition → one consumer in the group at a time (ordering preserved per partition).',
        'More consumers than partitions means some consumers sit idle.',
        'Rebalance pauses consumption while partitions reassigned — minimize by cooperative protocols.',
      ],
      tip: 'Ordering is guaranteed within a partition, not across partitions. Use message keys to route related events to the same partition.',
    },
    {
      heading: 'Delivery guarantees',
      body:
        'Kafka offers configurable durability and delivery semantics. Producers can wait for acks from one or all replicas. Consumers commit offsets after processing — at-least-once (reprocess on failure), at-most-once (skip on failure), or exactly-once (idempotent producers + transactional writes).',
      bullets: [
        'At-least-once: default and safest; consumers must be idempotent.',
        'Retention: messages persist for days regardless of consumption — replay and reprocessing are first-class.',
        'Dead-letter queue: route poison messages after N failed attempts.',
      ],
    },
  ],
  keyTakeaways: [
    'Message queues decouple producers and consumers for resilience and independent scaling.',
    'Kafka topics split into partitions; consumer groups assign one consumer per partition.',
    'Ordering is per-partition; use keys to co-locate related events.',
    'Delivery semantics (at-least-once vs exactly-once) drive idempotency requirements.',
  ],
  sourceAttribution: [
    {
      repo: 'idsulik/kafka-concepts-visualizer',
      url: 'https://github.com/idsulik/kafka-concepts-visualizer',
    },
  ],
  quiz: [
    {
      question: 'In a Kafka consumer group, how many consumers can actively read the same partition?',
      options: ['Unlimited', 'Exactly one', 'Two for redundancy', 'One per broker'],
      correctIndex: 1,
      explanation:
        'Each partition is assigned to exactly one consumer within a group at a time, preserving per-partition ordering.',
    },
    {
      question: 'What triggers a consumer group rebalance?',
      options: [
        'Producing a new message to the topic',
        'Adding or removing a consumer in the group',
        'Increasing broker disk size',
        'Changing the message serialization format',
      ],
      correctIndex: 1,
      explanation:
        'When group membership changes, Kafka redistributes partition assignments so each partition still has one active consumer.',
    },
  ],
};

export default messageQueueContent;
