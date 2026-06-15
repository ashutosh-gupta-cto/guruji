/**
 * Consistent hashing ring logic.
 * Ported from ionmx/consistent-hashing-simulator (hashring.js)
 * @see https://github.com/ionmx/consistent-hashing-simulator
 */

export interface RingServer {
  server_name: string;
  keys_size: number;
  keys: Map<number, string[]>;
}

export interface RealServer {
  keys_size: number;
}

export type SimulationLogFn = (message: string) => void;

const servers = new Map<number, RingServer>();
const realServers = new Map<string, RealServer>();
let serverQty = 0;
let logFn: SimulationLogFn = () => {};

const crc32 = (r: string): number => {
  const o: number[] = [];
  for (let c = 0; c < 256; c++) {
    let a = c;
    for (let f = 0; f < 8; f++) {
      a = 1 & a ? 3988292384 ^ (a >>> 1) : a >>> 1;
    }
    o[c] = a;
  }
  let n = -1;
  for (let t = 0; t < r.length; t++) {
    n = (n >>> 8) ^ o[255 & (n ^ r.charCodeAt(t))];
  }
  return (-1 ^ n) >>> 0;
};

export function hashFunction(string: string): number {
  return crc32(string) % 360;
}

export function setSimulationLog(fn: SimulationLogFn): void {
  logFn = fn;
}

function binarySearch(arr: number[], target: number, lo = 0, hi = arr.length - 1): number {
  if (target < arr[lo]) return arr[0];
  if (target > arr[hi]) return arr[hi];

  const mid = Math.floor((hi + lo) / 2);

  return hi - lo < 2
    ? target - arr[lo] < arr[hi] - target
      ? arr[lo]
      : arr[hi]
    : target < arr[mid]
      ? binarySearch(arr, target, lo, mid)
      : target > arr[mid]
        ? binarySearch(arr, target, mid, hi)
        : arr[mid];
}

function getClosest(hash: number): number {
  const keys = Array.from(servers.keys()).sort((a, b) => a - b);
  return binarySearch(keys, hash);
}

export function addServer(vnodes: number): void {
  const serverName = 'S' + serverQty;
  const prevSizes = new Map<string, { keys_size: number }>();
  logFn('[ + ] Add new server ' + serverName);
  serverQty += 1;

  let hash = hashFunction(serverName);
  realServers.set(serverName, { keys_size: 0 });
  servers.set(hash, { server_name: serverName, keys_size: 0, keys: new Map() });

  for (let i = 0; i < vnodes; i++) {
    const sn = serverName + ' Virtual ' + i;
    hash = hashFunction(sn);
    servers.set(hash, { server_name: serverName, keys_size: 0, keys: new Map() });
  }

  realServers.forEach((s, key) => {
    prevSizes.set(key, { keys_size: s.keys_size });
  });

  servers.forEach((s, key) => {
    s.keys.forEach((v, k) => {
      const closest = getClosest(k);
      if (closest !== key) {
        s.keys_size -= s.keys.get(k)!.length;

        const prevRs = realServers.get(s.server_name)!;
        prevRs.keys_size -= s.keys.get(k)!.length;

        const ns = servers.get(closest)!;
        ns.keys.set(k, v);
        ns.keys_size += v.length;
        s.keys.delete(k);

        const newRs = realServers.get(ns.server_name)!;
        newRs.keys_size += v.length;
      }
    });
  });

  realServers.forEach((s, key) => {
    const prev = prevSizes.get(key)!;
    if (key !== serverName && prev.keys_size !== s.keys_size) {
      logFn('Move ' + (prev.keys_size - s.keys_size) + ' keys from ' + key + ' to ' + serverName);
    }
  });
}

export function removeServer(serverName: string): boolean {
  logFn('[ - ] Remove server ' + serverName);

  if (realServers.size === 1) {
    return false;
  }

  const removedServerKeys = new Map<number, { keys_size: number; keys: Map<number, string[]> }>();

  servers.forEach((value, key) => {
    if (value.server_name === serverName) {
      removedServerKeys.set(key, { keys_size: value.keys_size, keys: value.keys });
    }
  });

  removedServerKeys.forEach((_v, k) => {
    servers.delete(k);
  });

  removedServerKeys.forEach((v) => {
    const ns = servers.get(getClosest(Array.from(removedServerKeys.keys())[0]))!;
    ns.keys_size += v.keys_size;
    ns.keys = v.keys;
    const rs = realServers.get(ns.server_name)!;
    rs.keys_size += v.keys_size;
    logFn('Move ' + v.keys_size + ' keys from ' + serverName + ' to ' + ns.server_name);
  });

  realServers.delete(serverName);
  return true;
}

export function addData(str: string): [number, string, number, number] {
  const hash = hashFunction(str);
  const k = getClosest(hash);
  const server = servers.get(k)!;
  const rs = realServers.get(server.server_name)!;

  server.keys_size += 1;
  rs.keys_size += 1;

  if (server.keys.has(hash)) {
    const c = server.keys.get(hash)!;
    c.push(str);
  } else {
    server.keys.set(hash, [str]);
  }

  return [k, server.server_name, server.keys_size, rs.keys_size];
}

export function getServers(): Map<number, RingServer> {
  return servers;
}

export function getRealServers(): Map<string, RealServer> {
  return realServers;
}

export function resetRing(): void {
  servers.clear();
  realServers.clear();
  serverQty = 0;
}

export const SERVER_COLORS = [
  '#f44336', '#f06292', '#ab47bc', '#673ab7', '#5c6bc0', '#2196f3',
  '#01579b', '#00acc1', '#00897b', '#43a047', '#aed581', '#f4ff81',
  '#fff59d', '#ffc109', '#ff9800', '#ff5722',
];
