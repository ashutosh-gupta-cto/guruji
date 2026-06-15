/**
 * DNS → HTTP request journey types.
 *
 * Inspired by jsg0000/dns-trace — educational step-by-step protocol flow.
 *
 * @see https://github.com/jsg0000/dns-trace
 */

export const StepStatus = {
  IDLE: 'idle',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;

export type StepStatus = (typeof StepStatus)[keyof typeof StepStatus];

export type ServerType =
  | 'client'
  | 'resolver'
  | 'root'
  | 'tld'
  | 'authoritative'
  | 'tcp'
  | 'tls'
  | 'http';

export interface TraceStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  serverType: ServerType;
  liveResult?: string[];
  latency?: number;
}

export interface LogEntry {
  msg: string;
  type: 'info' | 'pkt' | 'success' | 'err';
}

export const INITIAL_STEPS: TraceStep[] = [
  { id: 'browser', title: 'Browser', description: 'Local DNS cache lookup', status: StepStatus.IDLE, serverType: 'client' },
  { id: 'resolver', title: 'Resolver', description: 'Recursive resolver (1.1.1.1)', status: StepStatus.IDLE, serverType: 'resolver' },
  { id: 'root', title: 'Root', description: 'Root (.) zone delegation', status: StepStatus.IDLE, serverType: 'root' },
  { id: 'tld', title: 'TLD', description: 'Top-level domain registry', status: StepStatus.IDLE, serverType: 'tld' },
  { id: 'auth', title: 'Authoritative', description: 'Zone master A record', status: StepStatus.IDLE, serverType: 'authoritative' },
  { id: 'tcp', title: 'TCP', description: 'SYN / SYN-ACK handshake', status: StepStatus.IDLE, serverType: 'tcp' },
  { id: 'tls', title: 'TLS', description: 'Secure tunnel (TLS 1.3)', status: StepStatus.IDLE, serverType: 'tls' },
  { id: 'http', title: 'HTTP', description: 'Application layer GET', status: StepStatus.IDLE, serverType: 'http' },
];

export function cleanDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '');
}

export function getTld(domain: string): string {
  const parts = domain.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : 'com';
}

/** Simulated IP for educational demo (no live DNS). */
export function simulatedIp(domain: string): string {
  let hash = divmodHash(domain);
  const a = 104 + (hash % 20);
  hash = Math.floor(hash / 20);
  const b = hash % 256;
  hash = Math.floor(hash / 256);
  const c = hash % 256;
  const d = (hash >> 8) % 256;
  return `${a}.${b}.${c}.${d}`;
}

function divmodHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export const STEP_DELAYS_MS = [400, 600, 700, 700, 900, 500, 800, 500];

export const STEP_LOGS: Record<string, string[]> = {
  browser: ['L1/L2 cache probe…', 'Cache miss — query resolver'],
  resolver: ['DNS-over-HTTPS handshake…', 'Forwarding recursive query'],
  root: ['Querying root (.) servers…', 'Received TLD delegation hint'],
  tld: ['Traversing TLD registry…', 'Received authoritative NS'],
  auth: ['Authoritative resolution…', 'A record returned'],
  tcp: ['[TCP] Outbound: SYN', '[TCP] Inbound: SYN/ACK', 'Connection ESTABLISHED'],
  tls: ['[TLS 1.3] ClientHello', '[TLS 1.3] ECDHE key exchange', 'Cipher: AES_256_GCM'],
  http: ['[HTTP/2] GET / HTTP/2', 'Response: 200 OK'],
};

export function stepResults(tld: string, ip: string): Record<string, string[]> {
  return {
    browser: ['127.0.0.1 (cache miss)'],
    resolver: ['Cloudflare 1.1.1.1'],
    root: ['a.root-servers.net'],
    tld: [`.${tld} gtld-servers.net`],
    auth: [`A → ${ip}`],
    tcp: ['ESTABLISHED'],
    tls: ['TLS 1.3 AES_256'],
    http: ['200 OK'],
  };
}
