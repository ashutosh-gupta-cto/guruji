/**
 * Thompson construction: regex → NFA (simplified).
 * Inspired by Royal-lobster/stateforge and AmirHossein812002/Regex2FA.
 */

export interface AutoState {
  id: string;
  label: string;
  x: number;
  y: number;
  isInitial: boolean;
  isFinal: boolean;
}

export interface AutoTransition {
  from: string;
  to: string;
  symbol: string;
}

export interface NfaResult {
  states: AutoState[];
  transitions: AutoTransition[];
  alphabet: string[];
}

export interface RegexBuildStep {
  message: string;
  states: AutoState[];
  transitions: AutoTransition[];
}

let uid = 0;
function newId(): string {
  return `q${uid++}`;
}

interface Fragment {
  start: string;
  end: string;
  states: AutoState[];
  transitions: AutoTransition[];
}

function epsTransition(from: string, to: string): AutoTransition {
  return { from, to, symbol: 'ε' };
}

function charFragment(ch: string, x: number): Fragment {
  const s = newId();
  const e = newId();
  return {
    start: s,
    end: e,
    states: [
      { id: s, label: s, x, y: 80, isInitial: false, isFinal: false },
      { id: e, label: e, x: x + 60, y: 80, isInitial: false, isFinal: false },
    ],
    transitions: [{ from: s, to: e, symbol: ch }],
  };
}

function concat(a: Fragment, b: Fragment): Fragment {
  return {
    start: a.start,
    end: b.end,
    states: [...a.states, ...b.states],
    transitions: [...a.transitions, ...b.transitions, epsTransition(a.end, b.start)],
  };
}

function union(a: Fragment, b: Fragment, x: number): Fragment {
  const s = newId();
  const e = newId();
  return {
    start: s,
    end: e,
    states: [
      { id: s, label: s, x, y: 40, isInitial: false, isFinal: false },
      ...a.states,
      ...b.states,
      { id: e, label: e, x: x + 120, y: 120, isInitial: false, isFinal: false },
    ],
    transitions: [
      ...a.transitions,
      ...b.transitions,
      epsTransition(s, a.start),
      epsTransition(s, b.start),
      epsTransition(a.end, e),
      epsTransition(b.end, e),
    ],
  };
}

function star(f: Fragment, x: number): Fragment {
  const s = newId();
  const e = newId();
  return {
    start: s,
    end: e,
    states: [
      { id: s, label: s, x, y: 40, isInitial: false, isFinal: false },
      ...f.states,
      { id: e, label: e, x: x + 80, y: 120, isInitial: false, isFinal: false },
    ],
    transitions: [
      ...f.transitions,
      epsTransition(s, f.start),
      epsTransition(s, e),
      epsTransition(f.end, f.start),
      epsTransition(f.end, e),
    ],
  };
}

function tokenize(regex: string): string[] {
  const tokens: string[] = [];
  for (let i = 0; i < regex.length; i++) {
    const c = regex[i];
    if ('()|*+?'.includes(c)) tokens.push(c);
    else if (c === '\\' && i + 1 < regex.length) tokens.push(regex[++i]);
    else if (!/\s/.test(c)) tokens.push(c);
  }
  return tokens;
}

export function regexToNfa(regex: string): NfaResult {
  uid = 0;
  const tokens = tokenize(regex);
  if (tokens.length === 0) {
    const s = newId();
    return {
      states: [{ id: s, label: s, x: 40, y: 80, isInitial: true, isFinal: true }],
      transitions: [],
      alphabet: [],
    };
  }

  const stack: (Fragment | string)[] = [];
  let x = 40;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === '*') {
      const f = stack.pop() as Fragment;
      stack.push(star(f, x));
      x += 40;
    } else if (t === '(') stack.push('(');
    else if (t === ')') {
      const parts: Fragment[] = [];
      while (stack.length && stack[stack.length - 1] !== '(') {
        parts.unshift(stack.pop() as Fragment);
      }
      stack.pop();
      let merged = parts[0];
      for (let j = 1; j < parts.length; j++) merged = concat(merged, parts[j]);
      stack.push(merged);
    } else if (t === '|') {
      /* handled in post-pass */
      stack.push('|');
    } else if (t !== '|') {
      stack.push(charFragment(t, x));
      x += 80;
    }
  }

  const segments: Fragment[] = [];
  let buf: Fragment[] = [];
  for (const item of stack) {
    if (item === '|') {
      if (buf.length) {
        let m = buf[0];
        for (let j = 1; j < buf.length; j++) m = concat(m, buf[j]);
        segments.push(m);
        buf = [];
      }
    } else buf.push(item as Fragment);
  }
  if (buf.length) {
    let m = buf[0];
    for (let j = 1; j < buf.length; j++) m = concat(m, buf[j]);
    segments.push(m);
  }

  let result = segments[0];
  for (let j = 1; j < segments.length; j++) result = union(result, segments[j], x);

  result.states.find((s) => s.id === result.start)!.isInitial = true;
  result.states.find((s) => s.id === result.end)!.isFinal = true;

  const alphabet = [
    ...new Set(result.transitions.filter((t) => t.symbol !== 'ε').map((t) => t.symbol)),
  ].sort();

  return { states: result.states, transitions: result.transitions, alphabet };
}

export function regexToNfaSteps(regex: string): RegexBuildStep[] {
  try {
    const result = regexToNfa(regex);
    return [
      {
        message: `Built NFA for /${regex}/ — ${result.states.length} states, alphabet {${result.alphabet.join(', ')}}`,
        states: result.states,
        transitions: result.transitions,
      },
    ];
  } catch {
    return [{ message: `Invalid regex: ${regex}`, states: [], transitions: [] }];
  }
}
