/**
 * Classic cipher engines — curated subset ported from systemslibrarian/cipher-museum.
 *
 * @see https://github.com/systemslibrarian/cipher-museum
 */

const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const mod = (a: number, m: number) => ((a % m) + m) % m;
const clean = (t: string) => t.toUpperCase().replace(/[^A-Z]/g, '');

export type CipherId =
  | 'caesar'
  | 'rot13'
  | 'atbash'
  | 'vigenere'
  | 'playfair'
  | 'railfence'
  | 'enigma';

export interface CipherMeta {
  id: CipherId;
  name: string;
  era: string;
  description: string;
  needsKey: boolean;
  keyLabel?: string;
  keyPlaceholder?: string;
  defaultKey?: string;
  demoPlaintext: string;
}

export const CIPHER_CATALOG: CipherMeta[] = [
  {
    id: 'caesar',
    name: 'Caesar Cipher',
    era: '~58 BC',
    description: 'Shift each letter by a fixed amount in the alphabet.',
    needsKey: true,
    keyLabel: 'Shift (0–25)',
    keyPlaceholder: '3',
    defaultKey: '3',
    demoPlaintext: 'ATTACK AT DAWN',
  },
  {
    id: 'rot13',
    name: 'ROT13',
    era: '~1980',
    description: 'Caesar with shift 13 — self-inverse on the Latin alphabet.',
    needsKey: false,
    demoPlaintext: 'HELLO WORLD',
  },
  {
    id: 'atbash',
    name: 'Atbash',
    era: '~500 BC',
    description: 'Reflect the alphabet: A↔Z, B↔Y, and so on.',
    needsKey: false,
    demoPlaintext: 'MEET AT NOON',
  },
  {
    id: 'vigenere',
    name: 'Vigenère',
    era: '1553',
    description: 'Polyalphabetic substitution — each letter uses a different Caesar shift from the key.',
    needsKey: true,
    keyLabel: 'Keyword',
    keyPlaceholder: 'LEMON',
    defaultKey: 'LEMON',
    demoPlaintext: 'ATTACK AT DAWN',
  },
  {
    id: 'playfair',
    name: 'Playfair',
    era: '1854',
    description: 'Encrypt letter pairs on a 5×5 keyed grid — defeats simple frequency analysis.',
    needsKey: true,
    keyLabel: 'Keyword',
    keyPlaceholder: 'MONARCHY',
    defaultKey: 'MONARCHY',
    demoPlaintext: 'HIDE THE GOLD',
  },
  {
    id: 'railfence',
    name: 'Rail Fence',
    era: 'Ancient',
    description: 'Write plaintext in a zigzag across rails, then read row by row.',
    needsKey: true,
    keyLabel: 'Rails (2–6)',
    keyPlaceholder: '3',
    defaultKey: '3',
    demoPlaintext: 'WEAREDISCOVERED',
  },
  {
    id: 'enigma',
    name: 'Enigma (simplified)',
    era: 'WWII',
    description:
      'Three rotor machine with reflector — same settings encrypt and decrypt. Non-letters dropped.',
    needsKey: true,
    keyLabel: 'Rotor positions (e.g. AAA)',
    keyPlaceholder: 'AAA',
    defaultKey: 'AAA',
    demoPlaintext: 'HELLO',
  },
];

function shiftText(text: string, n: number, encode: boolean): string {
  const s = encode ? mod(n, 26) : mod(26 - n, 26);
  return text
    .split('')
    .map((ch) => {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90) return String.fromCharCode(mod(c - 65 + s, 26) + 65);
      if (c >= 97 && c <= 122) return String.fromCharCode(mod(c - 97 + s, 26) + 97);
      return ch;
    })
    .join('');
}

export function caesarEncode(text: string, key: string): string {
  return shiftText(text, parseInt(key, 10) || 3, true);
}

export function caesarDecode(text: string, key: string): string {
  return shiftText(text, parseInt(key, 10) || 3, false);
}

export function rot13(text: string): string {
  return shiftText(text, 13, true);
}

export function atbash(text: string): string {
  return text
    .split('')
    .map((ch) => {
      const u = ch.toUpperCase();
      const idx = A.indexOf(u);
      if (idx < 0) return ch;
      const out = A[25 - idx];
      return ch === u ? out : out.toLowerCase();
    })
    .join('');
}

export function vigenere(text: string, key: string, encode: boolean): string {
  const t = clean(text);
  const k = clean(key) || 'KEY';
  let out = '';
  for (let i = 0; i < t.length; i++) {
    const p = t.charCodeAt(i) - 65;
    const ki = k.charCodeAt(i % k.length) - 65;
    const c = encode ? mod(p + ki, 26) : mod(p - ki, 26);
    out += A[c];
  }
  return out;
}

function playfairGrid(key: string): string {
  const k = clean(key || 'MONARCHY').replace(/J/g, 'I');
  const seen = new Set<string>();
  let grid = '';
  for (const c of k) {
    if (!seen.has(c)) {
      seen.add(c);
      grid += c;
    }
  }
  for (const c of A) {
    if (c !== 'J' && !seen.has(c)) grid += c;
  }
  return grid;
}

function playfairPos(grid: string, ch: string): [number, number] {
  const i = grid.indexOf(ch);
  return [Math.floor(i / 5), i % 5];
}

function playfairPairs(text: string): [string, string][] {
  let t = clean(text).replace(/J/g, 'I');
  const pairs: [string, string][] = [];
  let i = 0;
  while (i < t.length) {
    const a = t[i];
    const b = i + 1 < t.length && t[i + 1] !== a ? t[++i] : 'X';
    pairs.push([a, b]);
    i++;
  }
  return pairs;
}

function playfairProcess(pairs: [string, string][], grid: string, encode: boolean): string {
  const d = encode ? 1 : 4;
  return pairs
    .map(([a, b]) => {
      const [ra, ca] = playfairPos(grid, a);
      const [rb, cb] = playfairPos(grid, b);
      if (ra === rb) {
        return grid[ra * 5 + mod(ca + d, 5)] + grid[rb * 5 + mod(cb + d, 5)];
      }
      if (ca === cb) {
        return grid[mod(ra + d, 5) * 5 + ca] + grid[mod(rb + d, 5) * 5 + cb];
      }
      return grid[ra * 5 + cb] + grid[rb * 5 + ca];
    })
    .join('');
}

export function playfairEncode(text: string, key: string): string {
  return playfairProcess(playfairPairs(text), playfairGrid(key), true);
}

export function playfairDecode(text: string, key: string): string {
  const raw = playfairProcess(playfairPairs(text), playfairGrid(key), false);
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === 'X' && i > 0 && i < raw.length - 1 && raw[i - 1] === raw[i + 1]) continue;
    out += raw[i];
  }
  if (out.endsWith('X')) out = out.slice(0, -1);
  return out;
}

export function railFenceEncode(text: string, rails: number): string {
  const t = clean(text);
  if (rails < 2) return t;
  const fence: string[][] = Array.from({ length: rails }, () => []);
  let rail = 0;
  let dir = 1;
  for (const ch of t) {
    fence[rail].push(ch);
    if (rail === 0) dir = 1;
    else if (rail === rails - 1) dir = -1;
    rail += dir;
  }
  return fence.map((r) => r.join('')).join('');
}

export function railFenceDecode(text: string, rails: number): string {
  const n = text.length;
  if (rails < 2) return text;
  const pattern = Array<number>(n).fill(0);
  let rail = 0;
  let dir = 1;
  for (let i = 0; i < n; i++) {
    pattern[i] = rail;
    if (rail === 0) dir = 1;
    else if (rail === rails - 1) dir = -1;
    rail += dir;
  }
  const indices = Array.from({ length: rails }, (_, r) =>
    pattern.map((p, i) => (p === r ? i : -1)).filter((x) => x >= 0),
  );
  const result = Array<string>(n);
  let pos = 0;
  for (let r = 0; r < rails; r++) {
    for (const idx of indices[r]) {
      result[idx] = text[pos++];
    }
  }
  return result.join('');
}

const ROTOR_WIRINGS: Record<string, { wiring: string; notch: string }> = {
  I: { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },
  II: { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
  III: { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' },
};

const REFLECTOR_B = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';

function buildWiringCache() {
  const cache: Record<string, { fwd: Int8Array; inv: Int8Array; notch: number }> = {};
  for (const [name, { wiring, notch }] of Object.entries(ROTOR_WIRINGS)) {
    const fwd = new Int8Array(26);
    const inv = new Int8Array(26);
    for (let i = 0; i < 26; i++) {
      const o = wiring.charCodeAt(i) - 65;
      fwd[i] = o;
      inv[o] = i;
    }
    cache[name] = { fwd, inv, notch: notch.charCodeAt(0) - 65 };
  }
  return cache;
}

const WIRING_CACHE = buildWiringCache();
const REFLECTOR = new Int8Array(26);
for (let i = 0; i < 26; i++) REFLECTOR[i] = REFLECTOR_B.charCodeAt(i) - 65;

function enigmaEncrypt(text: string, positions: string): string {
  const posStr = positions.toUpperCase().padEnd(3, 'A').slice(0, 3);
  const rotorNames = ['I', 'II', 'III'];
  const pos = [posStr.charCodeAt(0) - 65, posStr.charCodeAt(1) - 65, posStr.charCodeAt(2) - 65];
  const wirings = rotorNames.map((n) => WIRING_CACHE[n]);
  let out = '';

  for (const ch of text.toUpperCase()) {
    const code = ch.charCodeAt(0);
    if (code < 65 || code > 90) continue;

    if (wirings[2].notch === pos[2]) pos[1] = mod(pos[1] + 1, 26);
    if (wirings[1].notch === pos[1]) pos[0] = mod(pos[0] + 1, 26);
    pos[2] = mod(pos[2] + 1, 26);

    let c = code - 65;
    for (let r = 2; r >= 0; r--) {
      c = wirings[r].fwd[mod(c + pos[r], 26)];
    }
    c = REFLECTOR[c];
    for (let r = 0; r <= 2; r++) {
      c = wirings[r].inv[mod(c - pos[r], 26)];
    }
    out += A[c];
  }
  return out;
}

export function runCipher(
  id: CipherId,
  text: string,
  key: string,
  mode: 'encode' | 'decode',
): string {
  switch (id) {
    case 'caesar':
      return mode === 'encode' ? caesarEncode(text, key) : caesarDecode(text, key);
    case 'rot13':
      return rot13(text);
    case 'atbash':
      return atbash(text);
    case 'vigenere':
      return vigenere(text, key, mode === 'encode');
    case 'playfair':
      return mode === 'encode' ? playfairEncode(text, key) : playfairDecode(text, key);
    case 'railfence': {
      const rails = Math.max(2, Math.min(6, parseInt(key, 10) || 3));
      return mode === 'encode'
        ? railFenceEncode(text, rails)
        : railFenceDecode(clean(text), rails);
    }
    case 'enigma':
      return enigmaEncrypt(text, key);
    default:
      return text;
  }
}
