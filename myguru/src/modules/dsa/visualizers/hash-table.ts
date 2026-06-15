/**
 * Hash table step generators (chaining collision resolution).
 *
 * Ported from ChazWyllie/data-structure-visualizer (MIT).
 *
 * @license MIT
 * @see https://github.com/ChazWyllie/data-structure-visualizer
 */

import type { Step } from '../core/types';
import { createStepMeta } from '../core/types';

export type EntryState = 'default' | 'hashing' | 'collision' | 'inserted' | 'found' | 'deleted';

export interface HashEntry {
  key: string;
  value: number;
  state: EntryState;
}

export interface HashBucket {
  entries: HashEntry[];
  state: 'default' | 'active' | 'collision';
}

export interface HashTableData {
  buckets: HashBucket[];
  size: number;
  capacity: number;
  loadFactor: number;
}

export const HASH_ENTRY_COLORS: Record<EntryState, string> = {
  default: '#60a5fa',
  hashing: '#fbbf24',
  collision: '#f97316',
  inserted: '#4ade80',
  found: '#22d3ee',
  deleted: '#ef4444',
};

export const HASH_BUCKET_COLORS: Record<string, string> = {
  default: '#374151',
  active: '#4b5563',
  collision: '#7c2d12',
};

export const DEFAULT_HASH_CAPACITY = 8;

export function hashKey(key: string, capacity: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % capacity;
  }
  return Math.abs(hash);
}

function cloneBuckets(buckets: HashBucket[]): HashBucket[] {
  return buckets.map((b) => ({
    entries: b.entries.map((e) => ({ ...e })),
    state: b.state,
  }));
}

function calculateLoadFactor(size: number, capacity: number): number {
  return size / capacity;
}

export function createEmptyTable(capacity: number): HashBucket[] {
  return Array.from({ length: capacity }, () => ({
    entries: [],
    state: 'default' as const,
  }));
}

export function createInitialHashTable(): HashTableData {
  const capacity = DEFAULT_HASH_CAPACITY;
  const buckets = createEmptyTable(capacity);
  const initialData = [
    { key: 'apple', value: 5 },
    { key: 'banana', value: 7 },
    { key: 'cherry', value: 3 },
    { key: 'date', value: 9 },
  ];
  let size = 0;
  for (const { key, value } of initialData) {
    const hash = hashKey(key, capacity);
    buckets[hash].entries.push({ key, value, state: 'default' });
    size++;
  }
  return { buckets, size, capacity, loadFactor: calculateLoadFactor(size, capacity) };
}

export function generateInsertSteps(
  buckets: HashBucket[],
  key: string,
  value: number,
  size: number,
  capacity: number
): Step<HashTableData>[] {
  const steps: Step<HashTableData>[] = [];
  let stepId = 0;
  let reads = 0;
  let writes = 0;
  const workingBuckets = cloneBuckets(buckets);
  let workingSize = size;

  steps.push({
    id: stepId++,
    description: `Inserting key "${key}" with value ${value}`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size: workingSize,
        capacity,
        loadFactor: calculateLoadFactor(workingSize, capacity),
      },
    },
    meta: createStepMeta({ reads, writes, highlightColor: HASH_ENTRY_COLORS.default }),
  });

  const hashValue = hashKey(key, capacity);
  workingBuckets[hashValue].state = 'active';

  steps.push({
    id: stepId++,
    description: `hash("${key}") = ${hashValue} (bucket index)`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size: workingSize,
        capacity,
        loadFactor: calculateLoadFactor(workingSize, capacity),
      },
    },
    meta: createStepMeta({ reads: ++reads, writes, highlightColor: HASH_ENTRY_COLORS.hashing }),
  });

  const existingIndex = workingBuckets[hashValue].entries.findIndex((e) => e.key === key);

  if (existingIndex !== -1) {
    workingBuckets[hashValue].entries[existingIndex].state = 'found';
    steps.push({
      id: stepId++,
      description: `Key "${key}" already exists, updating value`,
      snapshot: {
        data: {
          buckets: cloneBuckets(workingBuckets),
          size: workingSize,
          capacity,
          loadFactor: calculateLoadFactor(workingSize, capacity),
        },
      },
      meta: createStepMeta({ reads: ++reads, writes, highlightColor: HASH_ENTRY_COLORS.found }),
    });
    workingBuckets[hashValue].entries[existingIndex].value = value;
    workingBuckets[hashValue].entries[existingIndex].state = 'inserted';
    writes++;
    steps.push({
      id: stepId++,
      description: `Updated "${key}" = ${value}`,
      snapshot: {
        data: {
          buckets: cloneBuckets(workingBuckets),
          size: workingSize,
          capacity,
          loadFactor: calculateLoadFactor(workingSize, capacity),
        },
      },
      meta: createStepMeta({ reads, writes, highlightColor: HASH_ENTRY_COLORS.inserted }),
    });
  } else {
    if (workingBuckets[hashValue].entries.length > 0) {
      workingBuckets[hashValue].state = 'collision';
      workingBuckets[hashValue].entries.forEach((e) => (e.state = 'collision'));
      steps.push({
        id: stepId++,
        description: `Collision detected! Bucket ${hashValue} already has ${workingBuckets[hashValue].entries.length} entries`,
        snapshot: {
          data: {
            buckets: cloneBuckets(workingBuckets),
            size: workingSize,
            capacity,
            loadFactor: calculateLoadFactor(workingSize, capacity),
          },
        },
        meta: createStepMeta({ reads, writes, highlightColor: HASH_ENTRY_COLORS.collision }),
      });
    }
    workingBuckets[hashValue].entries.push({ key, value, state: 'inserted' });
    workingSize++;
    writes++;
    steps.push({
      id: stepId++,
      description: `Added "${key}" = ${value} to chain at bucket ${hashValue}`,
      snapshot: {
        data: {
          buckets: cloneBuckets(workingBuckets),
          size: workingSize,
          capacity,
          loadFactor: calculateLoadFactor(workingSize, capacity),
        },
      },
      meta: createStepMeta({ reads, writes, highlightColor: HASH_ENTRY_COLORS.inserted }),
    });
  }

  const newLoadFactor = calculateLoadFactor(workingSize, capacity);
  workingBuckets.forEach((b) => {
    b.state = 'default';
    b.entries.forEach((e) => (e.state = 'default'));
  });
  workingBuckets[hashValue].entries.find((e) => e.key === key)!.state = 'inserted';

  steps.push({
    id: stepId++,
    description: `Insert complete. Table size: ${workingSize}/${capacity}`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size: workingSize,
        capacity,
        loadFactor: newLoadFactor,
      },
    },
    meta: createStepMeta({ reads, writes, highlightColor: HASH_ENTRY_COLORS.inserted }),
  });

  return steps;
}

export function generateLookupSteps(
  buckets: HashBucket[],
  key: string,
  size: number,
  capacity: number
): Step<HashTableData>[] {
  const steps: Step<HashTableData>[] = [];
  let stepId = 0;
  let reads = 0;
  const workingBuckets = cloneBuckets(buckets);

  steps.push({
    id: stepId++,
    description: `Looking up key "${key}"`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size,
        capacity,
        loadFactor: calculateLoadFactor(size, capacity),
      },
    },
    meta: createStepMeta({ reads, highlightColor: HASH_ENTRY_COLORS.default }),
  });

  const hashValue = hashKey(key, capacity);
  workingBuckets[hashValue].state = 'active';
  reads++;

  steps.push({
    id: stepId++,
    description: `hash("${key}") = ${hashValue}`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size,
        capacity,
        loadFactor: calculateLoadFactor(size, capacity),
      },
    },
    meta: createStepMeta({ reads, highlightColor: HASH_ENTRY_COLORS.hashing }),
  });

  const bucket = workingBuckets[hashValue];
  if (bucket.entries.length === 0) {
    steps.push({
      id: stepId++,
      description: `Bucket ${hashValue} is empty. Key "${key}" not found.`,
      snapshot: {
        data: {
          buckets: cloneBuckets(workingBuckets),
          size,
          capacity,
          loadFactor: calculateLoadFactor(size, capacity),
        },
      },
      meta: createStepMeta({ reads, highlightColor: HASH_ENTRY_COLORS.deleted }),
    });
    return steps;
  }

  for (let i = 0; i < bucket.entries.length; i++) {
    reads++;
    bucket.entries[i].state = 'hashing';
    steps.push({
      id: stepId++,
      description: `Checking entry ${i + 1}/${bucket.entries.length}: "${bucket.entries[i].key}"`,
      snapshot: {
        data: {
          buckets: cloneBuckets(workingBuckets),
          size,
          capacity,
          loadFactor: calculateLoadFactor(size, capacity),
        },
      },
      meta: createStepMeta({ reads, highlightColor: HASH_ENTRY_COLORS.hashing }),
    });

    if (bucket.entries[i].key === key) {
      bucket.entries[i].state = 'found';
      steps.push({
        id: stepId++,
        description: `Found! "${key}" = ${bucket.entries[i].value}`,
        snapshot: {
          data: {
            buckets: cloneBuckets(workingBuckets),
            size,
            capacity,
            loadFactor: calculateLoadFactor(size, capacity),
          },
        },
        meta: createStepMeta({ reads, highlightColor: HASH_ENTRY_COLORS.found }),
      });
      return steps;
    }
    bucket.entries[i].state = 'default';
  }

  steps.push({
    id: stepId++,
    description: `Key "${key}" not found in bucket ${hashValue}`,
    snapshot: {
      data: {
        buckets: cloneBuckets(workingBuckets),
        size,
        capacity,
        loadFactor: calculateLoadFactor(size, capacity),
      },
    },
    meta: createStepMeta({ reads, highlightColor: HASH_ENTRY_COLORS.deleted }),
  });

  return steps;
}
