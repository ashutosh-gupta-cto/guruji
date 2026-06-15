import type { LessonContent } from '../types';

const loadBalancerContent: LessonContent = {
  moduleId: 'load-balancer',
  title: 'Load Balancing',
  sections: [
    {
      heading: 'Why load balancers exist',
      body:
        'A single server has finite CPU, memory, and network bandwidth. When traffic exceeds that capacity, requests queue up, latency spikes, and the server turns red — overloaded. A load balancer sits between clients and a pool of identical backend servers, picking one target per request so work spreads across the fleet.',
      bullets: [
        'Horizontal scaling: add more servers instead of upgrading one giant machine.',
        'High availability: if one backend fails, traffic routes to healthy peers.',
        'Zero-downtime deploys: drain connections from old instances while new ones warm up.',
      ],
      tip: 'In interviews, name the bottleneck first (single server capacity), then introduce the LB as the traffic distribution layer.',
    },
    {
      heading: 'Routing algorithms',
      body:
        'The load balancer must pick a downstream node for every incoming request. Common strategies trade simplicity, fairness, and state awareness.',
      bullets: [
        'Round robin — cycle through servers in order; simple and stateless.',
        'Random — approximate round robin without maintaining state; good enough at high RPS.',
        'Least connections — send to the server with fewest active requests; better for long-lived connections.',
        'Consistent hashing — map keys to servers so adding/removing nodes moves minimal traffic (see Sharding lesson).',
        'Weighted — assign more traffic to larger instances.',
      ],
    },
    {
      heading: 'Layer 4 vs Layer 7',
      body:
        'Network load balancers (L4) route based on IP and port — fast and protocol-agnostic. Application load balancers (L7) inspect HTTP headers, paths, and cookies to make smarter routing decisions.',
      bullets: [
        'L4: TCP/UDP forwarding, lower latency, no TLS termination or path-based routing.',
        'L7: URL routing (/api → API servers, /static → CDN), sticky sessions, request rewriting.',
        'Health checks: periodic probes (GET /health) remove unhealthy backends from the pool.',
      ],
      tip: 'Say "L7 when you need content-based routing or TLS termination; L4 when you need raw throughput."',
    },
    {
      heading: 'Failure modes and observability',
      body:
        'Load balancers themselves can become single points of failure. Production systems use DNS round-robin to multiple LB instances, anycast IPs, or cloud-managed load balancers with built-in redundancy. Watch queue depth, error rates, and per-backend latency to detect hot spots before servers overload.',
      bullets: [
        'Thundering herd: all clients retry simultaneously after an outage — use jittered backoff.',
        'Sticky sessions: pinning users to one server complicates failover; prefer external session stores.',
        'Cold start: newly added servers need warm-up before receiving full traffic share.',
      ],
    },
  ],
  keyTakeaways: [
    'Load balancers distribute traffic across a server pool to increase throughput and availability.',
    'Algorithm choice depends on connection length, statefulness, and whether keys need sticky routing.',
    'L4 is fast and dumb; L7 is slower but can route on HTTP semantics.',
    'Health checks and graceful draining are essential for production reliability.',
  ],
  sourceAttribution: [
    {
      repo: 'pronzzz/sysarch-interactive',
      url: 'https://github.com/pronzzz/sysarch-interactive',
    },
  ],
  quiz: [
    {
      question: 'What happens when a backend server reaches its concurrent request capacity?',
      options: [
        'The load balancer automatically doubles its CPU',
        'The server becomes overloaded and may reject or queue requests',
        'Traffic is encrypted end-to-end',
        'The database latency drops to zero',
      ],
      correctIndex: 1,
      explanation:
        'When current load exceeds capacity, the server cannot accept more work — requests queue or fail, and the node signals overload.',
    },
    {
      question: 'What is the primary purpose of health checks behind a load balancer?',
      options: [
        'Encrypt traffic between client and server',
        'Remove unhealthy backends from rotation so traffic goes to healthy nodes',
        'Shard database rows across replicas',
        'Cache static assets at the edge',
      ],
      correctIndex: 1,
      explanation:
        'Health checks detect failed or degraded backends so the load balancer stops sending requests to them until they recover.',
    },
  ],
};

export default loadBalancerContent;
