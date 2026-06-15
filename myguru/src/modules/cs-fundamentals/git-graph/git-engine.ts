/**
 * Simplified git commit graph engine.
 *
 * Inspired by pcottle/learnGitBranching and explain-git-with-d3 —
 * commits form a DAG; branches are movable refs.
 *
 * @see https://github.com/pcottle/learnGitBranching
 */

export interface Commit {
  id: string;
  message: string;
  parents: string[];
  x: number;
  y: number;
}

export interface Branch {
  name: string;
  target: string;
}

export interface GitState {
  commits: Record<string, Commit>;
  branches: Record<string, Branch>;
  head: string;
  history: string[];
}

let commitCounter = 0;

function nextId(): string {
  commitCounter += 1;
  return `C${commitCounter}`;
}

export function createInitialState(): GitState {
  const rootId = nextId();
  return {
    commits: {
      [rootId]: {
        id: rootId,
        message: 'Initial commit',
        parents: [],
        x: 0,
        y: 0,
      },
    },
    branches: { main: { name: 'main', target: rootId } },
    head: 'main',
    history: [],
  };
}

export function getHeadCommit(state: GitState): Commit {
  const branch = state.branches[state.head];
  return state.commits[branch.target];
}

export function commit(state: GitState, message: string): GitState {
  const parent = getHeadCommit(state);
  const id = nextId();
  const newCommit: Commit = {
    id,
    message: message || `Commit ${id}`,
    parents: [parent.id],
    x: parent.x + 1,
    y: parent.y,
  };
  const branches = { ...state.branches };
  branches[state.head] = { ...branches[state.head], target: id };
  return {
    commits: { ...state.commits, [id]: newCommit },
    branches,
    head: state.head,
    history: [...state.history, `git commit -m "${newCommit.message}"`],
  };
}

export function branch(state: GitState, name: string): GitState {
  if (!name || state.branches[name]) return state;
  const target = getHeadCommit(state).id;
  return {
    ...state,
    branches: { ...state.branches, [name]: { name, target } },
    history: [...state.history, `git branch ${name}`],
  };
}

export function checkout(state: GitState, ref: string): GitState {
  if (state.branches[ref]) {
    return {
      ...state,
      head: ref,
      history: [...state.history, `git checkout ${ref}`],
    };
  }
  if (state.commits[ref]) {
    const detached = `detached@${ref}`;
    return {
      ...state,
      branches: { ...state.branches, [detached]: { name: detached, target: ref } },
      head: detached,
      history: [...state.history, `git checkout ${ref}`],
    };
  }
  return state;
}

export function merge(state: GitState, branchName: string): GitState {
  const source = state.branches[branchName];
  if (!source || branchName === state.head) return state;

  const headCommit = getHeadCommit(state);
  const sourceCommit = state.commits[source.target];
  if (headCommit.id === sourceCommit.id) return state;

  const id = nextId();
  const mergeCommit: Commit = {
    id,
    message: `Merge ${branchName} into ${state.head}`,
    parents: [headCommit.id, sourceCommit.id],
    x: Math.max(headCommit.x, sourceCommit.x) + 1,
    y: headCommit.y,
  };

  const branches = { ...state.branches };
  branches[state.head] = { ...branches[state.head], target: id };

  return {
    commits: { ...state.commits, [id]: mergeCommit },
    branches,
    head: state.head,
    history: [...state.history, `git merge ${branchName}`],
  };
}

/** Walk from tip back to (but not including) ancestor set */
function commitsSince(state: GitState, tipId: string, stopIds: Set<string>): Commit[] {
  const chain: Commit[] = [];
  const seen = new Set<string>();
  let cur: string | undefined = tipId;
  while (cur !== undefined && !stopIds.has(cur) && !seen.has(cur)) {
    seen.add(cur);
    const node = state.commits[cur] as Commit | undefined;
    if (node === undefined) break;
    chain.unshift(node);
    cur = node.parents[0] ?? undefined;
  }
  return chain;
}

function ancestorSet(state: GitState, tipId: string): Set<string> {
  const set = new Set<string>();
  const stack = [tipId];
  while (stack.length) {
    const id = stack.pop()!;
    if (set.has(id)) continue;
    set.add(id);
    const c = state.commits[id];
    if (c) stack.push(...c.parents);
  }
  return set;
}

/** Rebase branch onto current HEAD — replay commits linearly */
export function rebase(state: GitState, branchName: string): GitState {
  const source = state.branches[branchName];
  if (!source || branchName === state.head) return state;

  let s = state;
  const headAncestors = ancestorSet(s, getHeadCommit(s).id);
  const toReplay = commitsSince(s, source.target, headAncestors);
  if (toReplay.length === 0) return s;

  for (const c of toReplay) {
    s = commit(s, c.message);
  }
  const branches = { ...s.branches, [branchName]: { name: branchName, target: getHeadCommit(s).id } };
  return {
    ...s,
    branches,
    history: [...s.history.slice(0, -1), `git rebase ${branchName}`],
  };
}

/** Cherry-pick a commit onto current HEAD */
export function cherryPick(state: GitState, commitId: string): GitState {
  const picked = state.commits[commitId];
  if (!picked) return state;

  const parent = getHeadCommit(state);
  const id = nextId();
  const newCommit: Commit = {
    id,
    message: picked.message,
    parents: [parent.id],
    x: parent.x + 1,
    y: parent.y + (picked.y !== parent.y ? 1 : 0),
  };

  const branches = { ...state.branches };
  branches[state.head] = { ...branches[state.head], target: id };

  return {
    commits: { ...state.commits, [id]: newCommit },
    branches,
    head: state.head,
    history: [...state.history, `git cherry-pick ${commitId}`],
  };
}

export function layoutCommits(state: GitState): Commit[] {
  const commits = Object.values(state.commits);
  const laneById = new Map<string, number>();

  const sorted = [...commits].sort((a, b) => {
    if (a.x !== b.x) return a.x - b.x;
    return a.id.localeCompare(b.id);
  });

  let nextLane = 0;
  for (const c of sorted) {
    if (c.parents.length === 0) {
      laneById.set(c.id, 0);
      c.y = 0;
    } else if (c.parents.length === 1) {
      const parentLane = laneById.get(c.parents[0]) ?? 0;
      laneById.set(c.id, parentLane);
      c.y = parentLane;
    } else {
      const lanes = c.parents.map((p) => laneById.get(p) ?? 0);
      const lane = Math.min(...lanes);
      laneById.set(c.id, lane);
      c.y = lane;
      for (const p of c.parents) {
        const parent = state.commits[p];
        if (parent && laneById.get(p) !== lane) {
          parent.y = Math.max(parent.y, lane + 1);
        }
      }
    }
    c.x = sorted.indexOf(c);
    if (!laneById.has(c.id)) {
      nextLane += 1;
      laneById.set(c.id, nextLane);
      c.y = nextLane;
    }
  }

  return sorted;
}

export function resetDemo(): GitState {
  commitCounter = 0;
  return createInitialState();
}
