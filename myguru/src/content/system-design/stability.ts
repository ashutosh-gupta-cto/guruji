import type { LessonContent } from '../types';

const stabilityContent: LessonContent = {
  moduleId: 'stability',
  title: 'Metastable Failures & Retry Storms',
  sections: [
    {
      heading: 'What is a metastable failure?',
      body:
        'A metastable failure is a sustained overload that persists after the original trigger is removed. The system has two stable states — healthy and overloaded — and retry amplification can push it from healthy through a brief trigger into the overloaded state, where it remains trapped.',
      bullets: [
        'Trigger: a short outage, latency spike, or cache flush.',
        'Amplifier: client retries, load balancer misrouting, or queue buildup.',
        'Recovery requires reducing load below a tipping point, not just fixing the trigger.',
      ],
    },
    {
      heading: 'Retry storms',
      body:
        'When requests fail or time out, well-meaning clients retry — often immediately and multiple times. During an outage, retries multiply effective load: 1000 RPS with 3 retries becomes 4000 RPS. When the server recovers, the retry backlog keeps utilization high, causing more failures and more retries — a positive feedback loop.',
      bullets: [
        'Fixed-N retries are simple but dangerous under overload.',
        'Token-bucket and circuit breakers limit retry amplification.',
        'Jittered exponential backoff spreads retry load over time.',
      ],
      tip: 'Run the simulator and watch retries climb after Server A recovers at t=10s.',
    },
    {
      heading: 'Discrete-event simulation',
      body:
        'Stability Sim models systems as components (client, load balancer, queue, server) connected by event flows. A priority-queue engine processes arrivals, departures, failures, and recoveries in timestamp order — the same DES approach used in the original stability-sim project.',
      code: `// Event-driven loop (simplified)
while queue not empty:
  event = queue.extractMin()
  clock = event.timestamp
  newEvents = component.handle(event)
  queue.insertAll(newEvents)`,
    },
    {
      heading: 'Design mitigations',
      body:
        'Production systems combine load shedding, adaptive concurrency limits, retry budgets, and backpressure. Monitor goodput (successful work) separately from throughput — high throughput with zero goodput signals a metastable state. Kill switches that disable retries cluster-wide can break the feedback loop.',
      bullets: [
        'Set client timeouts longer than server p99 to avoid false timeouts.',
        'Use load shedding at the edge before queues fill.',
        'Graceful degradation beats retry storms for user-facing paths.',
      ],
    },
  ],
  keyTakeaways: [
    'Metastable failures outlast their original trigger.',
    'Aggressive retries amplify load and sustain overload.',
    'DES simulation reveals emergent behavior before production.',
    'Circuit breakers and backoff are essential overload defenses.',
  ],
  sourceAttribution: [
    {
      repo: 'marcbrooker/stability-sim',
      url: 'https://github.com/marcbrooker/stability-sim',
    },
    {
      repo: 'Bronson et al., Metastable Failures in the Wild',
      url: 'https://research.facebook.com/publications/metastable-failures-in-the-wild/',
    },
  ],
  quiz: [
    {
      question: 'Why can a system remain overloaded after a crashed server recovers?',
      options: [
        'The server permanently loses data',
        'Retry amplification sustains load above capacity',
        'Load balancers stop routing traffic',
        'DNS cache prevents reconnection',
      ],
      correctIndex: 1,
      explanation:
        'Retries generated during the outage keep effective load high after recovery, preventing the system from returning to its healthy stable state.',
    },
    {
      question: 'Which retry strategy best limits amplification under overload?',
      options: [
        'Fixed 10 retries immediately',
        'Circuit breaker that stops retries when failure rate is high',
        'Retry every 1ms until success',
        'No timeout on client requests',
      ],
      correctIndex: 1,
      explanation:
        'Circuit breakers detect sustained failure and stop sending retries, breaking the positive feedback loop that drives metastable failures.',
    },
  ],
};

export default stabilityContent;
