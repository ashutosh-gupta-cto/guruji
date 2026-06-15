export type TrackId = 'dsa' | 'system-design' | 'ai-ml' | 'cs-fundamentals';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  labModule: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Track {
  id: TrackId;
  title: string;
  subtitle: string;
  description: string;
  accent: 'purple' | 'cyan' | 'violet' | 'teal';
  lessons: Lesson[];
}

export const tracks: Track[] = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    subtitle: 'DSA',
    description:
      'Build intuition for complexity, sorting, trees, and graphs through interactive visualizations.',
    accent: 'purple',
    lessons: [
      {
        id: 'bubble-sort',
        title: 'Bubble Sort',
        description: 'Watch comparisons and swaps bubble the largest values to the end.',
        duration: '12 min',
        labModule: 'bubble-sort',
        difficulty: 'beginner',
      },
      {
        id: 'merge-sort',
        title: 'Merge Sort',
        description: 'Divide arrays in half and merge sorted subarrays recursively.',
        duration: '18 min',
        labModule: 'merge-sort',
        difficulty: 'intermediate',
      },
      {
        id: 'binary-search',
        title: 'Binary Search',
        description: 'Halve the search space on sorted data in O(log n) time.',
        duration: '15 min',
        labModule: 'binary-search',
        difficulty: 'beginner',
      },
      {
        id: 'graph-bfs',
        title: 'Breadth-First Search',
        description: 'Explore graphs layer by layer with a queue-driven traversal.',
        duration: '20 min',
        labModule: 'graph-bfs',
        difficulty: 'intermediate',
      },
      {
        id: 'heap',
        title: 'Heap / Priority Queue',
        description: 'Watch bubble-up and bubble-down maintain the heap property on push and pop.',
        duration: '16 min',
        labModule: 'heap',
        difficulty: 'intermediate',
      },
      {
        id: 'bst',
        title: 'Binary Search Tree',
        description: 'Insert and search in a BST — left smaller, right larger, O(log n) average.',
        duration: '18 min',
        labModule: 'bst',
        difficulty: 'intermediate',
      },
      {
        id: 'hash-table',
        title: 'Hash Table',
        description: 'Hash keys into buckets and resolve collisions with chaining.',
        duration: '17 min',
        labModule: 'hash-table',
        difficulty: 'intermediate',
      },
      {
        id: 'topo-sort',
        title: 'Topological Sort',
        description: "Order DAG vertices with Kahn's algorithm — dependencies before dependents.",
        duration: '19 min',
        labModule: 'topo-sort',
        difficulty: 'advanced',
      },
      {
        id: 'a-star',
        title: 'A* Pathfinding',
        description: 'Find shortest grid paths using g-cost plus Manhattan heuristic.',
        duration: '22 min',
        labModule: 'a-star',
        difficulty: 'advanced',
      },
      {
        id: 'dp-table',
        title: 'DP Memo Table',
        description: 'Fill a bottom-up Fibonacci table and see each cell depend on prior entries.',
        duration: '15 min',
        labModule: 'dp-table',
        difficulty: 'intermediate',
      },
    ],
  },
  {
    id: 'system-design',
    title: 'System Design',
    subtitle: 'System Design',
    description:
      'Learn how large-scale systems handle traffic, consistency, and failure.',
    accent: 'cyan',
    lessons: [
      {
        id: 'load-balancer',
        title: 'Load Balancing',
        description: 'Distribute requests across servers with round-robin and health checks.',
        duration: '16 min',
        labModule: 'load-balancer',
        difficulty: 'beginner',
      },
      {
        id: 'caching',
        title: 'Caching Layers',
        description: 'Reduce latency with cache-aside, TTL, and eviction policies.',
        duration: '18 min',
        labModule: 'caching',
        difficulty: 'intermediate',
      },
      {
        id: 'message-queue',
        title: 'Message Queues & Kafka',
        description: 'Topics, partitions, consumer groups, and rebalance in Apache Kafka.',
        duration: '22 min',
        labModule: 'message-queue',
        difficulty: 'intermediate',
      },
      {
        id: 'kafka',
        title: 'Apache Kafka Deep Dive',
        description: 'Produce messages, scale consumers, and watch partition assignment rebalance.',
        duration: '20 min',
        labModule: 'kafka',
        difficulty: 'intermediate',
      },
      {
        id: 'raft',
        title: 'Raft Consensus',
        description: 'Leader election, heartbeats, and log replication in a distributed cluster.',
        duration: '24 min',
        labModule: 'raft',
        difficulty: 'advanced',
      },
      {
        id: 'database-internals',
        title: 'Database Replication',
        description: 'Single-leader replication, stale reads, and failover promotion.',
        duration: '22 min',
        labModule: 'database-internals',
        difficulty: 'advanced',
      },
      {
        id: 'cap-theorem',
        title: 'CAP Theorem',
        description: 'Compare CP vs AP trade-offs when the network partitions.',
        duration: '18 min',
        labModule: 'cap-theorem',
        difficulty: 'intermediate',
      },
      {
        id: 'database-sharding',
        title: 'Database Sharding',
        description: 'Partition data horizontally to scale beyond a single node.',
        duration: '25 min',
        labModule: 'database-sharding',
        difficulty: 'advanced',
      },
    ],
  },
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    subtitle: 'AI/ML',
    description:
      'Demystify models, training loops, and modern architectures step by step.',
    accent: 'violet',
    lessons: [
      {
        id: 'neural-network',
        title: 'Semantic Search & Embeddings',
        description: 'Rank documents by vector similarity — the foundation of modern retrieval.',
        duration: '20 min',
        labModule: 'neural-network',
        difficulty: 'beginner',
      },
      {
        id: 'gradient-descent',
        title: 'RAG Pipeline',
        description: 'Walk through chunk → embed → retrieve → generate with a live pipeline.',
        duration: '18 min',
        labModule: 'gradient-descent',
        difficulty: 'intermediate',
      },
      {
        id: 'attention',
        title: 'Agent Tool Loop',
        description: 'See how LLM agents assemble context, call tools, and return results.',
        duration: '24 min',
        labModule: 'attention',
        difficulty: 'advanced',
      },
      {
        id: 'diffusion',
        title: 'Agent Trace Replay',
        description: 'Scrub through real agent sessions — thinking, tool calls, and recovery.',
        duration: '28 min',
        labModule: 'diffusion',
        difficulty: 'advanced',
      },
      {
        id: 'transformer',
        title: 'Transformer Architecture',
        description: 'Explore self-attention, embeddings, and the forward pass step by step.',
        duration: '30 min',
        labModule: 'transformer',
        difficulty: 'intermediate',
      },
      {
        id: 'neural-playground',
        title: 'Neural Network Playground',
        description: 'Tune weights on a 2-layer net and watch the decision boundary move.',
        duration: '22 min',
        labModule: 'neural-playground',
        difficulty: 'beginner',
      },
      {
        id: 'cnn-explainer',
        title: 'CNN Explainer',
        description: 'Visualize convolutions, pooling, and how filters detect image features.',
        duration: '26 min',
        labModule: 'cnn-explainer',
        difficulty: 'intermediate',
      },
      {
        id: 'rag-trace',
        title: 'RAG Evidence Trace',
        description: 'Replay retrieval-to-answer flow and inspect chunk-to-span evidence chains.',
        duration: '24 min',
        labModule: 'rag-trace',
        difficulty: 'advanced',
      },
      {
        id: 'kv-cache',
        title: 'LLM Inference & KV Cache',
        description: 'Calculate KV-cache memory and compare prefill vs decode latency.',
        duration: '20 min',
        labModule: 'kv-cache',
        difficulty: 'intermediate',
      },
    ],
  },
  {
    id: 'cs-fundamentals',
    title: 'CS Fundamentals',
    subtitle: 'CS Fundamentals',
    description:
      'Core concepts every engineer needs: memory, OS, networking, crypto, and compilers.',
    accent: 'teal',
    lessons: [
      {
        id: 'memory-model',
        title: 'Memory Model',
        description: 'Stack vs heap, pointers, and how programs lay out data.',
        duration: '14 min',
        labModule: 'memory-model',
        difficulty: 'beginner',
      },
      {
        id: 'bplus-tree',
        title: 'B+ Tree Index',
        description: 'Insert, find, and delete keys in the balanced tree behind database indexes.',
        duration: '20 min',
        labModule: 'bplus-tree',
        difficulty: 'intermediate',
      },
      {
        id: 'concurrency',
        title: 'Git & Parallel Work',
        description: 'Branch, merge, rebase, and cherry-pick on an interactive commit graph.',
        duration: '22 min',
        labModule: 'concurrency',
        difficulty: 'intermediate',
      },
      {
        id: 'os-scheduler',
        title: 'CPU Scheduling',
        description: 'Compare FCFS, SJF, and round-robin with Gantt charts and step traces.',
        duration: '18 min',
        labModule: 'os-scheduler',
        difficulty: 'intermediate',
      },
      {
        id: 'networking',
        title: 'Networking Stack',
        description: 'Follow a packet from HTTP through TCP/IP to the wire.',
        duration: '18 min',
        labModule: 'networking',
        difficulty: 'intermediate',
      },
      {
        id: 'routing',
        title: 'Network Routing',
        description: "Run Dijkstra's algorithm and watch shortest paths emerge.",
        duration: '16 min',
        labModule: 'routing',
        difficulty: 'intermediate',
      },
      {
        id: 'crypto',
        title: 'Cryptography',
        description: 'Step through AES rounds — SubBytes, ShiftRows, and key mixing.',
        duration: '16 min',
        labModule: 'crypto',
        difficulty: 'intermediate',
      },
      {
        id: 'automata',
        title: 'Regex & Automata',
        description: 'Convert regular expressions to NFAs with Thompson construction.',
        duration: '18 min',
        labModule: 'automata',
        difficulty: 'advanced',
      },
      {
        id: 'compilers',
        title: 'How Compilers Work',
        description: 'Lex, parse, and lower source code into executable bytecode.',
        duration: '22 min',
        labModule: 'compilers',
        difficulty: 'advanced',
      },
    ],
  },
];

export function getTrack(id: string): Track | undefined {
  return tracks.find((t) => t.id === id);
}

export function getLessonByModule(moduleId: string): {
  track: Track;
  lesson: Lesson;
} | undefined {
  for (const track of tracks) {
    const lesson = track.lessons.find((l) => l.labModule === moduleId);
    if (lesson) return { track, lesson };
  }
  return undefined;
}

export function getTrackProgress(trackId: TrackId, completedModules: string[]): number {
  const track = getTrack(trackId);
  if (!track || track.lessons.length === 0) return 0;
  const done = track.lessons.filter((l) => completedModules.includes(l.labModule)).length;
  return Math.round((done / track.lessons.length) * 100);
}
