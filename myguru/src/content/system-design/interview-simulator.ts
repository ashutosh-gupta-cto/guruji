import type { LessonContent } from '../types';

const interviewSimulatorContent: LessonContent = {
  moduleId: 'interview-simulator',
  title: 'System Design Interview Practice',
  sections: [
    {
      heading: 'Active practice beats passive reading',
      body:
        'System design interviews evaluate how you decompose problems, choose components, wire data flows, and articulate trade-offs. This lab gives you a lightweight canvas to drag infrastructure blocks, connect them, and get instant checklist feedback — inspired by the SystemForge open-source interview simulator.',
      bullets: [
        'Three classic problems: URL shortener, news feed, and chat.',
        'Score against an interviewer-style checklist, not just component count.',
        'Iterate quickly — add a cache, rewire paths, watch your score change.',
      ],
    },
    {
      heading: 'URL Shortener (Easy)',
      body:
        'Bitly-style services are read-heavy (100:1 redirect-to-create ratio). The key decisions are cache strategy for hot links, unique key generation, and analytics without killing redirect latency. A strong design places a cache between the app and database on the read path.',
      bullets: [
        '301 vs 302 redirects trade browser caching for analytics visibility.',
        'CDN can edge-cache popular short links globally.',
        'Watch for cache stampede on viral link expiry.',
      ],
    },
    {
      heading: 'News Feed (Hard)',
      body:
        'Twitter-style timelines face the fan-out problem: celebrities with millions of followers cannot fan-out-on-write. Hybrid approaches pre-compute timelines for normal users and fan-out-on-read for high-follower accounts. Message queues decouple write amplification from the hot path.',
      bullets: [
        'Cache pre-computed timelines per user in Redis.',
        'Queue handles async fan-out to follower feeds.',
        'Graceful degradation: serve stale timelines under peak load.',
      ],
    },
    {
      heading: 'Chat System (Hard)',
      body:
        'Real-time chat requires persistent WebSocket connections for online users, message ordering per conversation, and store-and-forward for offline delivery. Presence (online/offline) fits naturally in a TTL-backed cache; durable messages land in a partitioned database.',
      bullets: [
        'WebSocket gateway maintains millions of long-lived connections.',
        'Message queue with per-conversation partitioning guarantees ordering.',
        'At-least-once delivery + client dedup via message IDs.',
      ],
      tip: 'Click two nodes to draw a connection between them. Delete a selected node with the toolbar button.',
    },
  ],
  keyTakeaways: [
    'Start with a clear read path and write path for each problem.',
    'Caching and queues appear in almost every high-scale design.',
    'Checklist scoring mirrors how interviewers evaluate completeness.',
    'Trade-off narration matters as much as the diagram.',
  ],
  sourceAttribution: [
    {
      repo: 'vijaygupta18/system-design-simulator',
      url: 'https://github.com/vijaygupta18/system-design-simulator',
    },
  ],
  quiz: [
    {
      question: 'For a URL shortener with 100:1 read/write ratio, what is the highest-impact optimization?',
      options: [
        'Shard writes across 100 databases',
        'Add a cache layer for redirect lookups',
        'Use synchronous replication on every create',
        'Disable analytics entirely',
      ],
      correctIndex: 1,
      explanation:
        'Reads dominate traffic; caching hot redirect mappings dramatically reduces database load and latency.',
    },
    {
      question: 'Why use fan-out-on-read for celebrity accounts in a news feed?',
      options: [
        'Celebrities have fewer followers',
        'Writing to millions of follower timelines per post is too expensive',
        'Celebrity posts are never cached',
        'Read paths do not need databases',
      ],
      correctIndex: 1,
      explanation:
        'Fan-out-on-write for a celebrity creates a write storm — millions of timeline inserts per post. Fan-out-on-read merges their posts at read time instead.',
    },
  ],
};

export default interviewSimulatorContent;
