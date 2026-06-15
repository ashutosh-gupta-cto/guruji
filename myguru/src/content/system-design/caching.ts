import type { LessonContent } from '../types';

const cachingContent: LessonContent = {
  moduleId: 'caching',
  title: 'Caching Layers',
  sections: [
    {
      heading: 'The latency problem',
      body:
        'Database reads are orders of magnitude slower than in-memory lookups. When every request hits the database, particles stack up at the DB node while waiting for simulated latency — the entire system throughput collapses. Caching stores frequently accessed data closer to the application so most reads never reach the slow tier.',
      bullets: [
        'Cache hit: data found in cache, returned immediately to the client.',
        'Cache miss: data not in cache, request forwarded to the database, result stored for next time.',
        'Hit rate of 90% means only ~10% of requests incur database latency.',
      ],
    },
    {
      heading: 'Cache-aside pattern',
      body:
        'The application manages the cache explicitly. On read: check cache first; on miss, load from DB and populate cache. On write: update DB, then invalidate or update the cache entry.',
      code: `// Cache-aside read path
value = cache.get(key)
if value is None:
    value = db.query(key)
    cache.set(key, value, ttl=300)
return value`,
      tip: 'Cache-aside is the default interview answer — simple, works with any DB, and the app controls consistency.',
    },
    {
      heading: 'Eviction and TTL',
      body:
        'Caches have bounded memory. When full, something must go. Time-to-live (TTL) expires stale entries automatically; eviction policies decide what to remove under pressure.',
      bullets: [
        'LRU (Least Recently Used) — evict the entry accessed longest ago; good general default.',
        'LFU (Least Frequently Used) — keep hot keys; better for skewed access patterns.',
        'TTL — expire entries after N seconds; balances freshness vs hit rate.',
        'Write-through vs write-back — sync writes to cache+DB immediately, or buffer writes and flush later.',
      ],
    },
    {
      heading: 'Cache invalidation and consistency',
      body:
        'There are only two hard things in computer science: cache invalidation and naming things. Stale cache entries serve outdated data until TTL expires or an explicit invalidation fires. For read-heavy workloads with tolerable staleness, caching wins dramatically. For financial balances or inventory counts, you need shorter TTLs, write-through, or event-driven invalidation.',
      bullets: [
        'Thundering herd: cache expires, thousands of requests miss simultaneously — use request coalescing or stale-while-revalidate.',
        'Cache stampede: single hot key expires; one request rebuilds while others wait or also miss.',
        'Multi-layer: browser cache → CDN → app cache (Redis) → DB — each layer cuts load on the next.',
      ],
    },
  ],
  keyTakeaways: [
    'Caching intercepts reads before they reach slow storage tiers.',
    'Cache-aside is the most common pattern: app reads cache, falls back to DB on miss.',
    'Hit rate directly determines how much backend load remains.',
    'Invalidation strategy is the hardest part — match TTL and eviction to freshness requirements.',
  ],
  sourceAttribution: [
    {
      repo: 'pronzzz/sysarch-interactive',
      url: 'https://github.com/pronzzz/sysarch-interactive',
    },
  ],
  quiz: [
    {
      question: 'With a cache hit rate of 0.9, approximately what fraction of requests reach the database?',
      options: ['90%', '50%', '10%', '0%'],
      correctIndex: 2,
      explanation:
        'A 90% hit rate means 90% of requests are served from cache; only the remaining ~10% miss through to the database.',
    },
    {
      question: 'In the cache-aside pattern, who is responsible for populating the cache on a miss?',
      options: [
        'The database automatically pushes updates',
        'The application reads from DB and writes into cache',
        'The load balancer',
        'The CDN edge node exclusively',
      ],
      correctIndex: 1,
      explanation:
        'Cache-aside puts the application in control: on miss it loads from DB and stores the result in cache for subsequent reads.',
    },
  ],
};

export default cachingContent;
