import type { LessonContent } from '../types';

export const bubbleSortContent: LessonContent = {
  moduleId: 'bubble-sort',
  title: 'Bubble Sort',
  sections: [
    {
      heading: 'The core idea',
      body:
        'Bubble sort is the simplest comparison-based sorter: walk the array, compare neighbors, and swap when they are out of order. After each full pass, the largest unsorted value "bubbles" to its final position at the end.',
      bullets: [
        'Stable — equal elements keep their relative order.',
        'In-place — only a constant amount of extra memory.',
        'Adaptive with an early-exit flag when a pass makes zero swaps.',
      ],
    },
    {
      heading: 'How it works',
      body:
        'Use nested loops: the outer loop tracks how many elements are already sorted at the tail; the inner loop compares adjacent pairs in the unsorted prefix and swaps when the left value is greater.',
      code: `function bubbleSort(arr: number[]): void {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // already sorted
  }
}`,
    },
    {
      heading: 'Complexity',
      body:
        'Each pass scans the shrinking unsorted region, so you do roughly n + (n−1) + … + 1 comparisons in the worst case.',
      bullets: [
        'Time — best O(n) with early exit on sorted input; average and worst O(n²).',
        'Space — O(1) extra; swaps happen inside the original array.',
        'Interview framing — mention it to show you understand invariants, then pivot to faster sorts.',
      ],
    },
    {
      heading: 'When to use it',
      body:
        'Rarely in production. Reach for bubble sort when the dataset is tiny, nearly sorted, or when an interviewer asks you to explain a baseline comparison sort before discussing merge or quick sort.',
      tip: 'If the prompt says "optimize later," start with bubble sort verbally, then upgrade to O(n log n).',
    },
    {
      heading: 'Common pitfalls',
      body:
        'Forgetting to shrink the inner loop bound (n − i − 1) repeats work on already-sorted suffixes. Skipping the swapped flag loses the O(n) best case. Confusing stability with in-place — bubble sort is both, but selection sort is in-place yet unstable.',
    },
  ],
  keyTakeaways: [
    'Repeated adjacent swaps move the maximum element to the end each pass.',
    'Worst-case time is O(n²); a single early-exit pass yields O(n) on sorted input.',
    'Useful as a teaching baseline — production code prefers O(n log n) sorts.',
  ],
  sourceAttribution: [
    {
      repo: 'ChazWyllie/data-structure-visualizer',
      url: 'https://github.com/ChazWyllie/data-structure-visualizer',
    },
    {
      repo: 'TamimEhsan/AlgorithmVisualizer',
      url: 'https://github.com/TamimEhsan/AlgorithmVisualizer',
    },
    {
      repo: 'midudev/alg0.dev',
      url: 'https://github.com/midudev/alg0.dev',
    },
  ],
  quiz: [
    {
      question: 'After the first complete pass of bubble sort on an arbitrary array, what is guaranteed?',
      options: [
        'The entire array is sorted',
        'The largest element is in its final position',
        'The smallest element is at index 0',
        'No swaps occurred',
      ],
      correctIndex: 1,
      explanation:
        'One full pass compares adjacent pairs left-to-right, pushing the maximum value to the last index. Other elements may still be out of order.',
    },
    {
      question: 'What is bubble sort\'s best-case time complexity when the input is already sorted (with an early-exit optimization)?',
      options: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'],
      correctIndex: 1,
      explanation:
        'A single pass with zero swaps triggers early exit after n−1 comparisons, giving linear time.',
    },
  ],
};

export const mergeSortContent: LessonContent = {
  moduleId: 'merge-sort',
  title: 'Merge Sort',
  sections: [
    {
      heading: 'The core idea',
      body:
        'Merge sort is a divide-and-conquer algorithm: split the array in half until subarrays have one element, then merge sorted halves back together. The merge step is where ordering is restored.',
      bullets: [
        'Guaranteed O(n log n) regardless of input shape.',
        'Stable when the merge prefers the left element on ties.',
        'Not in-place — merging into auxiliary buffers uses O(n) extra space.',
      ],
    },
    {
      heading: 'How it works',
      body:
        'Recursively split at mid, sort each half, then merge two sorted ranges with two pointers. The merge writes the smaller head element to the output and advances that pointer.',
      code: `function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(a: number[], b: number[]): number[] {
  const out: number[] = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  return out.concat(a.slice(i), b.slice(j));
}`,
    },
    {
      heading: 'Complexity',
      body:
        'The recursion tree has log n levels; each level processes all n elements during merge, giving O(n log n) time. The iterative bottom-up variant avoids call-stack overhead but keeps the same asymptotics.',
      bullets: [
        'Time — O(n log n) best, average, and worst.',
        'Space — O(n) for the auxiliary merge buffer; O(log n) call stack for recursive versions.',
        'External sorting — merge sort shines when data lives on disk and sequential merges are cheap.',
      ],
    },
    {
      heading: 'When to use it',
      body:
        'Choose merge sort when you need predictable O(n log n) performance, stability, or linked-list sorting. Many language runtimes use Timsort (merge + insertion hybrid) for general-purpose sorting.',
    },
    {
      heading: 'Common pitfalls',
      body:
        'Off-by-one errors at the midpoint split create unequal or empty subarrays. Forgetting the <= tie-break in merge breaks stability. Implementing merge in-place is possible but tricky — interview answers usually accept O(n) auxiliary space.',
    },
  ],
  keyTakeaways: [
    'Divide in half, sort recursively, merge sorted halves with two pointers.',
    'Always O(n log n) time; stability depends on merge tie-breaking.',
    'Trades O(n) extra space for predictable performance — great for linked lists and external sort.',
  ],
  sourceAttribution: [
    {
      repo: 'ChazWyllie/data-structure-visualizer',
      url: 'https://github.com/ChazWyllie/data-structure-visualizer',
    },
    {
      repo: 'TamimEhsan/AlgorithmVisualizer',
      url: 'https://github.com/TamimEhsan/AlgorithmVisualizer',
    },
    {
      repo: 'algorithm-visualizer/algorithm-visualizer',
      url: 'https://github.com/algorithm-visualizer/algorithm-visualizer',
    },
  ],
  quiz: [
    {
      question: 'Why is merge sort stable?',
      options: [
        'It never swaps elements in place',
        'The merge step takes from the left subarray when values are equal',
        'It uses a heap',
        'It only works on sorted input',
      ],
      correctIndex: 1,
      explanation:
        'When merging, preferring the left element on equal keys preserves the original relative order of duplicates.',
    },
    {
      question: 'What is the space complexity of a typical recursive merge sort implementation?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctIndex: 2,
      explanation:
        'The merge step needs an auxiliary array of size n (plus O(log n) recursion stack).',
    },
  ],
};

export const binarySearchContent: LessonContent = {
  moduleId: 'binary-search',
  title: 'Binary Search',
  sections: [
    {
      heading: 'The core idea',
      body:
        'Binary search locates a target in a sorted collection by comparing against the middle element and discarding half the remaining range. One comparison eliminates half the candidates.',
      bullets: [
        'Requires sorted or monotonic data so "left vs right" is meaningful.',
        'Generalizes beyond arrays — any structure with O(1) random access works.',
        'The template extends to "search on answer" problems (first true in a predicate range).',
      ],
      tip: 'If you can halve the search space after one check, binary search is likely the right pattern.',
    },
    {
      heading: 'How it works',
      body:
        'Maintain bounds low and high. Compute mid, compare array[mid] to target, then narrow: move low past mid if the target is larger, or high before mid if smaller. Stop when found or the range is empty.',
      code: `function binarySearch(arr: number[], target: number): number {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
    },
    {
      heading: 'Complexity',
      body:
        'Each step halves the search interval, so you need at most ⌊log₂ n⌋ + 1 comparisons. Iterative binary search uses O(1) extra space.',
      bullets: [
        'Time — O(log n).',
        'Space — O(1) iterative; O(log n) recursive call stack.',
        'Versus linear scan — O(n) vs O(log n) is the entire reason sorted arrays matter.',
      ],
    },
    {
      heading: 'When to use it',
      body:
        'Use binary search for exact lookup in sorted arrays, finding boundaries (first/last occurrence), or minimizing/maximizing a value subject to a monotonic feasibility check (e.g., "smallest capacity that works").',
    },
    {
      heading: 'Common pitfalls',
      body:
        'Off-by-one errors from mixing inclusive [low, high] with exclusive bounds. Integer overflow in mid = (low + high) / 2 — use low + (high - low) / 2. Returning mid when the problem asks for insertion index or lower bound.',
    },
  ],
  keyTakeaways: [
    'Sorted input lets you discard half the range per comparison.',
    'O(log n) time, O(1) space for the iterative form.',
    'Pick one loop invariant (inclusive vs half-open) and stick to it.',
  ],
  sourceAttribution: [
    {
      repo: 'TamimEhsan/AlgorithmVisualizer',
      url: 'https://github.com/TamimEhsan/AlgorithmVisualizer',
    },
    {
      repo: 'midudev/alg0.dev',
      url: 'https://github.com/midudev/alg0.dev',
    },
    {
      repo: 'algorithm-visualizer/algorithm-visualizer',
      url: 'https://github.com/algorithm-visualizer/algorithm-visualizer',
    },
  ],
  quiz: [
    {
      question: 'What is the time complexity of binary search on n elements?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      correctIndex: 1,
      explanation: 'Halving the search space each step yields logarithmic time.',
    },
    {
      question: 'Which precondition is required for standard binary search?',
      options: [
        'The collection must be sorted (or monotonic)',
        'All values must be unique',
        'The array must fit in cache',
        'The array must have even length',
      ],
      correctIndex: 0,
      explanation:
        'Ordering lets the midpoint comparison tell you which half can contain the target.',
    },
  ],
};

export const graphBfsContent: LessonContent = {
  moduleId: 'graph-bfs',
  title: 'Breadth-First Search',
  sections: [
    {
      heading: 'The core idea',
      body:
        'BFS explores a graph layer by layer starting from a source node. A queue holds the frontier: dequeue the oldest discovered node, mark it visited, then enqueue unvisited neighbors. First visit order equals shortest hop count in unweighted graphs.',
      bullets: [
        'Queue = FIFO → nodes at distance d are processed before distance d+1.',
        'Visiting a node the first time guarantees shortest path in unweighted graphs.',
        'Works on adjacency lists, matrices, or implicit grids.',
      ],
    },
    {
      heading: 'How it works',
      body:
        'Seed the queue with the start node and mark it visited. While the queue is non-empty, dequeue front, process it, and enqueue each unvisited neighbor (mark on enqueue, not on dequeue, to avoid duplicates).',
      code: `function bfs(graph: Map<string, string[]>, start: string): string[] {
  const order: string[] = [];
  const visited = new Set<string>([start]);
  const queue = [start];

  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}`,
    },
    {
      heading: 'Complexity',
      body:
        'Every vertex is enqueued at most once and each edge is examined once.',
      bullets: [
        'Time — O(V + E) with adjacency lists; O(V²) with dense adjacency matrices.',
        'Space — O(V) for the queue and visited set.',
        'Grid BFS — treat each cell as a vertex; 4- or 8-connected neighbors are edges.',
      ],
    },
    {
      heading: 'When to use it',
      body:
        'Reach for BFS for shortest path in unweighted graphs, level-order tree traversal, connected-component discovery, bipartite checking, and multi-source spreading (rotting oranges, word ladder).',
    },
    {
      heading: 'Common pitfalls',
      body:
        'Marking visited on dequeue instead of enqueue can enqueue the same node multiple times. Using a stack instead of a queue turns BFS into DFS. Forgetting to handle disconnected components — restart BFS from each unvisited node.',
    },
  ],
  keyTakeaways: [
    'Queue-driven traversal visits nodes in increasing distance from the source.',
    'O(V + E) time — the standard graph scan bound.',
    'First visit = shortest edge count in unweighted graphs.',
  ],
  sourceAttribution: [
    {
      repo: 'TamimEhsan/AlgorithmVisualizer',
      url: 'https://github.com/TamimEhsan/AlgorithmVisualizer',
    },
    {
      repo: 'ChazWyllie/data-structure-visualizer',
      url: 'https://github.com/ChazWyllie/data-structure-visualizer',
    },
    {
      repo: 'midudev/alg0.dev',
      url: 'https://github.com/midudev/alg0.dev',
    },
  ],
  quiz: [
    {
      question: 'Which data structure drives the BFS frontier?',
      options: ['Stack (LIFO)', 'Queue (FIFO)', 'Priority queue', 'Hash set only'],
      correctIndex: 1,
      explanation: 'FIFO ordering processes all nodes at distance d before distance d+1.',
    },
    {
      question: 'In an unweighted graph, what does BFS guarantee about the first time a node is dequeued?',
      options: [
        'It is on a minimum-weight path',
        'It is reached in the minimum number of edges from the source',
        'It has the highest degree',
        'It is a leaf node',
      ],
      correctIndex: 1,
      explanation:
        'Layer-by-layer expansion discovers nodes in order of increasing hop count, which is optimal for unweighted shortest paths.',
    },
  ],
};

export const heapContent: LessonContent = {
  moduleId: 'heap',
  title: 'Heap / Priority Queue',
  sections: [
    {
      heading: 'The core idea',
      body:
        'A binary heap is a complete binary tree stored in an array where every parent satisfies the heap property: min-heap parents ≤ children (max-heap reverses this). It gives O(1) access to the extremum and O(log n) insert/extract.',
      bullets: [
        'Index math — parent at (i−1)/2, children at 2i+1 and 2i+2.',
        'Complete tree shape keeps the array compact with no gaps.',
        'Priority queues power Dijkstra, Prim, task schedulers, and top-K problems.',
      ],
    },
    {
      heading: 'How it works',
      body:
        'Insert appends at the end and bubble-up (sift-up) until the heap property holds. Extract-min swaps root with the last element, removes the tail, then bubble-down (sift-down) the new root.',
      code: `function siftUp(arr: number[], i: number): void {
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (arr[parent] <= arr[i]) break;
    [arr[parent], arr[i]] = [arr[i], arr[parent]];
    i = parent;
  }
}

function insert(arr: number[], val: number): void {
  arr.push(val);
  siftUp(arr, arr.length - 1);
}`,
    },
    {
      heading: 'Complexity',
      body:
        'Bubble-up and bubble-down traverse at most the tree height.',
      bullets: [
        'peek — O(1); insert / extract — O(log n).',
        'build-heap from n items — O(n) with bottom-up heapify (Floyd).',
        'heap sort — O(n log n) time, O(1) extra if in-place (unstable).',
      ],
    },
    {
      heading: 'When to use it',
      body:
        'Use a heap when you repeatedly need the smallest or largest element, maintain a running top-K, merge K sorted streams, or run graph algorithms that relax edges by increasing distance.',
    },
    {
      heading: 'Common pitfalls',
      body:
        'Off-by-one in parent/child index formulas. Confusing heap order with sorted array — only the root is globally min/max. Using push/pop on a sorted array instead of heapify — that is O(n log n) per build vs O(n) Floyd heapify.',
    },
  ],
  keyTakeaways: [
    'Array-backed complete binary tree with parent/child index arithmetic.',
    'Insert and extract-min are O(log n); peek is O(1).',
    'The go-to structure for priority queues and many graph algorithms.',
  ],
  sourceAttribution: [
    {
      repo: 'ChazWyllie/data-structure-visualizer',
      url: 'https://github.com/ChazWyllie/data-structure-visualizer',
    },
    {
      repo: 'midudev/alg0.dev',
      url: 'https://github.com/midudev/alg0.dev',
    },
    {
      repo: 'TamimEhsan/AlgorithmVisualizer',
      url: 'https://github.com/TamimEhsan/AlgorithmVisualizer',
    },
  ],
  quiz: [
    {
      question: 'In a min-heap stored in array `h`, where is the parent of node at index i (i > 0)?',
      options: ['i / 2', '(i - 1) / 2', '2i + 1', 'i - 1'],
      correctIndex: 1,
      explanation: 'Zero-based indexing: parent index is floor((i − 1) / 2).',
    },
    {
      question: 'What is the time complexity of inserting into a binary heap of n elements?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctIndex: 1,
      explanation: 'Append is O(1); sift-up walks at most the tree height — O(log n).',
    },
  ],
};

export const bstContent: LessonContent = {
  moduleId: 'bst',
  title: 'Binary Search Tree',
  sections: [
    {
      heading: 'The core idea',
      body:
        'A binary search tree orders keys so that for every node: all keys in the left subtree are smaller, all keys in the right subtree are larger. Search, insert, and delete follow the same compare-and-branch pattern.',
      bullets: [
        'In-order traversal yields sorted order.',
        'Average height is O(log n) with random inserts; worst case O(n) if sorted input creates a chain.',
        'Self-balancing variants (AVL, red-black) restore O(log n) guarantees.',
      ],
    },
    {
      heading: 'How it works',
      body:
        'Start at the root. If the target equals the current key, done. If smaller, go left; if larger, go right. Insert walks to a null child and attaches a new node. Delete has three cases: leaf, one child, or two children (replace with in-order successor).',
      code: `function search(node: Node | null, key: number): Node | null {
  if (!node || node.key === key) return node;
  return key < node.key ? search(node.left, key) : search(node.right, key);
}

function insert(node: Node | null, key: number): Node {
  if (!node) return { key, left: null, right: null };
  if (key < node.key) node.left = insert(node.left, key);
  else if (key > node.key) node.right = insert(node.right, key);
  return node;
}`,
    },
    {
      heading: 'Complexity',
      body:
        'Operations follow root-to-leaf paths whose length equals tree height h.',
      bullets: [
        'Average — O(log n) search, insert, delete.',
        'Worst — O(n) when the tree degenerates to a linked list.',
        'Space — O(n) nodes; O(h) recursion stack.',
      ],
    },
    {
      heading: 'When to use it',
      body:
        'BSTs suit dynamic ordered sets with interleaved inserts and lookups. Interview follow-ups often ask for successor/predecessor, range queries, or conversion to sorted array via in-order traversal.',
    },
    {
      heading: 'Common pitfalls',
      body:
        'Allowing duplicates without a convention (left vs right) breaks search logic. Delete with two children — forgetting to copy successor key then delete successor node. Assuming O(log n) without mentioning balance — call out the skewed-input worst case.',
    },
  ],
  keyTakeaways: [
    'Left subtree < node < right subtree — the invariant every operation preserves.',
    'Average O(log n) operations; sorted inserts degrade to O(n).',
    'In-order traversal prints keys in sorted order.',
  ],
  sourceAttribution: [
    {
      repo: 'ChazWyllie/data-structure-visualizer',
      url: 'https://github.com/ChazWyllie/data-structure-visualizer',
    },
    {
      repo: 'TamimEhsan/AlgorithmVisualizer',
      url: 'https://github.com/TamimEhsan/AlgorithmVisualizer',
    },
    {
      repo: 'midudev/alg0.dev',
      url: 'https://github.com/midudev/alg0.dev',
    },
  ],
  quiz: [
    {
      question: 'What traversal visits BST keys in ascending sorted order?',
      options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
      correctIndex: 1,
      explanation: 'In-order (left, node, right) visits keys from smallest to largest.',
    },
    {
      question: 'What is the worst-case search time in an unbalanced BST of n nodes?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctIndex: 2,
      explanation:
        'Inserting sorted keys creates a chain of height n, so search walks all nodes.',
    },
  ],
};

export const hashTableContent: LessonContent = {
  moduleId: 'hash-table',
  title: 'Hash Table',
  sections: [
    {
      heading: 'The core idea',
      body:
        'A hash table maps keys to array indices via a hash function, aiming for O(1) average lookup. Collisions — when two keys hash to the same bucket — are resolved with chaining (linked lists per bucket) or open addressing (probe for the next free slot).',
      bullets: [
        'Hash function spreads keys uniformly across buckets.',
        'Load factor (n / buckets) triggers resize/rehash when too high.',
        'Trade memory for speed — typical engineering sweet spot: load factor ~0.7.',
      ],
    },
    {
      heading: 'How it works',
      body:
        'Compute index = hash(key) mod bucketCount. On insert, place at that bucket (append to chain or probe until empty). On lookup, hash the key and scan only that bucket\'s chain or probe sequence.',
      code: `class HashMap<K, V> {
  private buckets: Array<[K, V][]> = Array.from({ length: 16 }, () => []);

  private index(key: K): number {
    return hash(key) % this.buckets.length;
  }

  set(key: K, value: V): void {
    const i = this.index(key);
    const bucket = this.buckets[i];
    const found = bucket.find(([k]) => k === key);
    if (found) found[1] = value;
    else bucket.push([key, value]);
  }
}`,
    },
    {
      heading: 'Complexity',
      body:
        'With a good hash and load factor kept constant, buckets stay short.',
      bullets: [
        'Average — O(1) get, set, delete.',
        'Worst — O(n) if all keys collide into one bucket.',
        'Resize — O(n) when rehashing, amortized over many inserts.',
      ],
    },
    {
      heading: 'When to use it',
      body:
        'Hash tables are the default for frequency counts, deduplication, caching, two-sum style complement lookup, and implementing dict/set semantics in interviews.',
    },
    {
      heading: 'Common pitfalls',
      body:
        'Mutable keys whose hash changes after insert break lookup. Ignoring load factor — chains grow without resize. Using object identity hash on strings incorrectly. Open-addressing deletion needs tombstones, not naive erase.',
    },
  ],
  keyTakeaways: [
    'Hash function + bucket array maps keys to indices in O(1) average time.',
    'Collisions require chaining or probing — uniform hashing keeps chains short.',
    'Watch load factor and rehash to maintain performance guarantees.',
  ],
  sourceAttribution: [
    {
      repo: 'ChazWyllie/data-structure-visualizer',
      url: 'https://github.com/ChazWyllie/data-structure-visualizer',
    },
    {
      repo: 'midudev/alg0.dev',
      url: 'https://github.com/midudev/alg0.dev',
    },
    {
      repo: 'algorithm-visualizer/algorithm-visualizer',
      url: 'https://github.com/algorithm-visualizer/algorithm-visualizer',
    },
  ],
  quiz: [
    {
      question: 'What problem does chaining solve in a hash table?',
      options: [
        'Slow hash computation',
        'Multiple keys mapping to the same bucket index',
        'Sorted iteration',
        'Memory fragmentation only',
      ],
      correctIndex: 1,
      explanation:
        'Chaining stores all keys that hash to the same index in a linked list (or dynamic array) at that bucket.',
    },
    {
      question: 'What is the average-case time complexity of hash table lookup?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctIndex: 0,
      explanation:
        'With uniform hashing and bounded load factor, expected chain length is constant.',
    },
  ],
};

export const topoSortContent: LessonContent = {
  moduleId: 'topo-sort',
  title: 'Topological Sort',
  sections: [
    {
      heading: 'The core idea',
      body:
        'Topological sort produces a linear ordering of vertices in a directed acyclic graph (DAG) such that for every edge u → v, u appears before v. It models task dependencies: prerequisites must finish before dependents.',
      bullets: [
        'Only defined for DAGs — a cycle means no valid ordering.',
        'Often not unique — many valid orderings may exist.',
        'Two classic approaches: Kahn\'s (BFS by in-degree) and DFS post-order.',
      ],
    },
    {
      heading: 'How it works — Kahn\'s algorithm',
      body:
        'Compute in-degree for each node. Enqueue all nodes with in-degree 0. Repeatedly dequeue a node, append to result, and decrement in-degree of its neighbors; enqueue neighbors that reach 0.',
      code: `function topoSort(graph: Map<string, string[]>): string[] {
  const inDeg = new Map<string, number>();
  for (const [u, neighbors] of graph) {
    inDeg.set(u, inDeg.get(u) ?? 0);
    for (const v of neighbors) inDeg.set(v, (inDeg.get(v) ?? 0) + 1);
  }
  const queue = [...inDeg.entries()].filter(([, d]) => d === 0).map(([u]) => u);
  const order: string[] = [];
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    for (const v of graph.get(u) ?? []) {
      inDeg.set(v, inDeg.get(v)! - 1);
      if (inDeg.get(v) === 0) queue.push(v);
    }
  }
  return order.length === inDeg.size ? order : []; // empty if cycle
}`,
    },
    {
      heading: 'Complexity',
      body:
        'Each vertex and edge is processed once.',
      bullets: [
        'Time — O(V + E).',
        'Space — O(V) for in-degree map and queue.',
        'Cycle detection — if result length < V, a cycle exists.',
      ],
    },
    {
      heading: 'When to use it',
      body:
        'Course scheduling, build systems, dependency resolution, alien dictionary problems, and any "process prerequisites first" scenario on a DAG.',
    },
    {
      heading: 'Common pitfalls',
      body:
        'Running topo sort on a graph with cycles without checking result size. Forgetting nodes with zero outgoing edges (they still need in-degree tracking). Confusing topo order with shortest path — ordering respects edges, not weights.',
    },
  ],
  keyTakeaways: [
    'Valid only on DAGs — outputs a dependency-respecting linear order.',
    'Kahn\'s algorithm peels off in-degree-zero nodes with a queue.',
    'O(V + E) time; fewer than V nodes in the result signals a cycle.',
  ],
  sourceAttribution: [
    {
      repo: 'ChazWyllie/data-structure-visualizer',
      url: 'https://github.com/ChazWyllie/data-structure-visualizer',
    },
    {
      repo: 'midudev/alg0.dev',
      url: 'https://github.com/midudev/alg0.dev',
    },
    {
      repo: 'TamimEhsan/AlgorithmVisualizer',
      url: 'https://github.com/TamimEhsan/AlgorithmVisualizer',
    },
  ],
  quiz: [
    {
      question: 'When does a directed graph have no valid topological ordering?',
      options: [
        'It has more than V edges',
        'It contains a directed cycle',
        'It is disconnected',
        'It has weighted edges',
      ],
      correctIndex: 1,
      explanation:
        'A cycle creates mutual dependencies — no vertex can come first for all edges in the cycle.',
    },
    {
      question: 'In Kahn\'s algorithm, which nodes enter the queue initially?',
      options: [
        'All nodes',
        'Nodes with out-degree 0',
        'Nodes with in-degree 0',
        'The largest-degree node',
      ],
      correctIndex: 2,
      explanation:
        'Nodes with no incoming edges have no unmet prerequisites and can be processed first.',
    },
  ],
};

export const aStarContent: LessonContent = {
  moduleId: 'a-star',
  title: 'A* Pathfinding',
  sections: [
    {
      heading: 'The core idea',
      body:
        'A* finds a shortest path on a weighted grid (or graph) by combining actual cost from the start (g) with a heuristic estimate to the goal (h). It expands the node with lowest f = g + h first, biasing search toward the target while preserving optimality when h is admissible.',
      bullets: [
        'g(n) — cost from start to n; h(n) — estimated cost from n to goal.',
        'Admissible heuristic never overestimates true cost (Manhattan on grids with unit steps).',
        'Consistent heuristics (triangle inequality) simplify correctness proofs.',
      ],
    },
    {
      heading: 'How it works',
      body:
        'Initialize start with g = 0. Use a priority queue ordered by f = g + h. Pop the lowest-f node, stop if it is the goal, otherwise relax each neighbor: if path through current improves g, update g, parent pointer, and push/update in the open set.',
      code: `// Grid pathfinding with Manhattan heuristic
function fScore(g: number, node: Cell, goal: Cell): number {
  const h = Math.abs(node.row - goal.row) + Math.abs(node.col - goal.col);
  return g + h;
}

// Pop min f from open set, relax 4-neighbors with g + 1 edge cost
// Reconstruct path by following parent pointers from goal`,
    },
    {
      heading: 'Complexity',
      body:
        'Worst case explores many nodes like Dijkstra; a good heuristic prunes aggressively.',
      bullets: [
        'Time — O(E log V) with a binary heap; depends heavily on heuristic quality.',
        'Space — O(V) for g-scores, parent map, and open/closed sets.',
        'h = 0 reduces A* to Dijkstra; perfect h jumps straight along the optimal path.',
      ],
    },
    {
      heading: 'When to use it',
      body:
        'Grid games, robotics, map routing on sparse graphs, puzzle solvers — anywhere you need shortest paths and can define a meaningful underestimate of remaining cost.',
    },
    {
      heading: 'Common pitfalls',
      body:
        'Inadmissible heuristics (overestimating) can skip the optimal path. Forgetting to update nodes already in the open set when a better g is found. Using Euclidean distance on grids that allow only 4-directional moves — still admissible but weaker than Manhattan.',
    },
  ],
  keyTakeaways: [
    'A* = Dijkstra guided by f(n) = g(n) + h(n).',
    'Admissible heuristics guarantee optimal paths.',
    'Manhattan distance is the standard heuristic for unit-cost grid movement.',
  ],
  sourceAttribution: [
    {
      repo: 'ChazWyllie/data-structure-visualizer',
      url: 'https://github.com/ChazWyllie/data-structure-visualizer',
    },
    {
      repo: 'TamimEhsan/AlgorithmVisualizer',
      url: 'https://github.com/TamimEhsan/AlgorithmVisualizer',
    },
    {
      repo: 'AbdallahHemdan/Pathfinding-Visualizer',
      url: 'https://github.com/AbdallahHemdan/Pathfinding-Visualizer',
    },
  ],
  quiz: [
    {
      question: 'What makes a heuristic admissible for A*?',
      options: [
        'It equals the true cost',
        'It never overestimates the true cost to the goal',
        'It is always zero',
        'It must be negative',
      ],
      correctIndex: 1,
      explanation:
        'Underestimating (or matching) true remaining cost ensures the optimal path is never pruned incorrectly.',
    },
    {
      question: 'On a grid with 4-directional unit-cost moves, which heuristic is commonly used?',
      options: ['Bubble sort passes', 'Manhattan distance', 'Merge count', 'Hash mod prime'],
      correctIndex: 1,
      explanation:
        'Manhattan distance |Δrow| + |Δcol| never overestimates steps needed on a 4-connected grid.',
    },
  ],
};

export const dpTableContent: LessonContent = {
  moduleId: 'dp-table',
  title: 'DP Memo Table',
  sections: [
    {
      heading: 'The core idea',
      body:
        'Dynamic programming solves overlapping subproblems by storing results instead of recomputing them. Bottom-up tabulation fills a table iteratively from base cases; top-down memoization caches recursive calls. Fibonacci is the canonical introduction.',
      bullets: [
        'Optimal substructure — optimal answer built from optimal sub-answers.',
        'Overlapping subproblems — same subproblem appears many times in naive recursion.',
        'State definition is the hardest part — dp[i] or dp[i][j] must capture the subproblem.',
      ],
    },
    {
      heading: 'How it works',
      body:
        'For Fibonacci: set dp[0] = 0, dp[1] = 1, then fill dp[i] = dp[i−1] + dp[i−2] for i from 2 to n. Each cell depends only on prior entries — no recursion stack needed.',
      code: `function fib(n: number): number {
  if (n <= 1) return n;
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}

// Space-optimized: track only last two values → O(1) space`,
    },
    {
      heading: 'Complexity',
      body:
        'Tabulation visits each subproblem once.',
      bullets: [
        'Naive recursion — O(2ⁿ) time; memo/table reduces to O(n).',
        'Space — O(n) table; often reducible to O(1) when only recent rows matter.',
        '2D DP (knapsack, LCS) — O(n·m) time and space typical.',
      ],
    },
    {
      heading: 'When to use it',
      body:
        'Counting paths, knapsack variants, longest common subsequence, edit distance, coin change — whenever brute force revisits the same states. Interview signal: "Can I define a recurrence and fill a table?"',
    },
    {
      heading: 'Common pitfalls',
      body:
        'Wrong base cases (off-by-one on empty input). Filling order that reads uninitialized cells. Chasing O(1) space before correctness. Confusing memoization with caching arbitrary function results — DP needs a structured state space.',
    },
  ],
  keyTakeaways: [
    'Define state, recurrence, and base cases before coding.',
    'Bottom-up tabulation turns exponential recursion into polynomial iteration.',
    'Fibonacci demonstrates overlapping subproblems — dp[i] reused instead of recomputing.',
  ],
  sourceAttribution: [
    {
      repo: 'easyhard/dpv',
      url: 'https://github.com/easyhard/dpv',
    },
    {
      repo: 'midudev/alg0.dev',
      url: 'https://github.com/midudev/alg0.dev',
    },
    {
      repo: 'algorithm-visualizer/algorithm-visualizer',
      url: 'https://github.com/algorithm-visualizer/algorithm-visualizer',
    },
  ],
  quiz: [
    {
      question: 'Why is naive recursive Fibonacci O(2ⁿ) while bottom-up DP is O(n)?',
      options: [
        'DP uses a faster CPU',
        'Recursion recomputes the same subproblems exponentially many times',
        'DP sorts the input first',
        'Recursion always uses more memory',
      ],
      correctIndex: 1,
      explanation:
        'fib(n) calls fib(n−1) and fib(n−2), creating overlapping subproblems. The table computes each F(i) once.',
    },
    {
      question: 'What are the base cases for the Fibonacci DP table?',
      options: [
        'dp[0] = 0, dp[1] = 1',
        'dp[0] = 1, dp[1] = 1',
        'dp[0] = 0, dp[1] = 0',
        'No base cases needed',
      ],
      correctIndex: 0,
      explanation: 'Standard definition: F(0) = 0, F(1) = 1, then F(n) = F(n−1) + F(n−2).',
    },
  ],
};

export const quickSortContent: LessonContent = {
  moduleId: 'quick-sort',
  title: 'Quick Sort',
  sections: [
    {
      heading: 'The core idea',
      body:
        'Quick sort picks a pivot, partitions the array so elements smaller than the pivot sit left and larger sit right, then recursively sorts each partition. In-place partitioning makes it memory-efficient in practice.',
      bullets: [
        'Divide-and-conquer — partition once, recurse on subarrays.',
        'Pivot choice affects performance — last element, random, or median-of-three.',
        'Unstable — swaps can reorder equal elements.',
      ],
    },
    {
      heading: 'How it works',
      body:
        'The partition scan uses two pointers: expand the "less than pivot" region by swapping out-of-place elements, then place the pivot in its final index. Recurse on [low..pivot−1] and [pivot+1..high].',
      code: `function partition(arr: number[], low: number, high: number): number {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
    },
    {
      heading: 'Complexity',
      body:
        'Balanced partitions halve the array each level → O(n log n). Sorted input with a naive last-element pivot degrades to O(n²).',
      bullets: [
        'Time — best/average O(n log n); worst O(n²) with bad pivots.',
        'Space — O(log n) recursion stack on average.',
        'Randomized pivot or introsort hybrids avoid worst-case paths in production.',
      ],
    },
    {
      heading: 'When to use it',
      body:
        'Default in-place sort for arrays when average-case speed matters and stability is not required. Libraries often fall back to insertion sort for tiny subarrays.',
    },
  ],
  keyTakeaways: [
    'Partition around a pivot, then recurse on left and right subarrays.',
    'Average O(n log n) in-place; worst case O(n²) without careful pivot selection.',
    'Unstable but cache-friendly — common choice for general-purpose array sorting.',
  ],
  sourceAttribution: [
    {
      repo: 'ChazWyllie/data-structure-visualizer',
      url: 'https://github.com/ChazWyllie/data-structure-visualizer',
    },
  ],
  quiz: [
    {
      question: 'After one partition step, where does the pivot end up?',
      options: ['Always at index 0', 'At its final sorted position within the subarray', 'At the middle index', 'Removed from the array'],
      correctIndex: 1,
      explanation: 'Partition places the pivot so all smaller elements are left and all larger are right — its index is final for that subarray.',
    },
  ],
};

export const stackQueueContent: LessonContent = {
  moduleId: 'stack-queue',
  title: 'Stack & Queue',
  sections: [
    {
      heading: 'Stack (LIFO)',
      body:
        'A stack adds and removes from the top only — Last-In-First-Out. Function call stacks, undo buffers, and DFS all use this discipline.',
      code: `stack.push(x);  // O(1)
const top = stack.pop();  // O(1)`,
      bullets: ['Push adds to top', 'Pop removes from top', 'Overflow when capacity exceeded'],
    },
    {
      heading: 'Queue (FIFO)',
      body:
        'A queue adds at the rear and removes from the front — First-In-First-Out. BFS, job schedulers, and print queues follow this pattern.',
      code: `queue.enqueue(x);  // O(1)
const front = queue.dequeue();  // O(1)`,
      bullets: ['Enqueue at rear', 'Dequeue at front', 'Circular buffers avoid shift cost in array implementations'],
    },
    {
      heading: 'Complexity',
      body: 'Both support O(1) push/pop or enqueue/dequeue with proper implementations (array+pointer or linked nodes).',
      bullets: ['Time — O(1) per operation', 'Space — O(n) for n stored elements'],
    },
  ],
  keyTakeaways: [
    'Stack = LIFO at the top; Queue = FIFO at front/rear.',
    'BFS uses a queue; DFS uses a stack (or recursion).',
    'Watch overflow/underflow on bounded implementations.',
  ],
  sourceAttribution: [
    {
      repo: 'ChazWyllie/data-structure-visualizer',
      url: 'https://github.com/ChazWyllie/data-structure-visualizer',
    },
  ],
  quiz: [
    {
      question: 'Which traversal does BFS use internally?',
      options: ['Stack', 'Queue', 'Priority queue', 'Hash map'],
      correctIndex: 1,
      explanation: 'BFS processes nodes in FIFO order — the earliest discovered node is expanded first.',
    },
  ],
};

export const linkedListContent: LessonContent = {
  moduleId: 'linked-list',
  title: 'Singly Linked List',
  sections: [
    {
      heading: 'The core idea',
      body:
        'A singly linked list stores values in nodes linked by next pointers. Insert/delete at known positions is O(1); finding a position requires O(n) traversal from head.',
      bullets: ['Head pointer marks the list start', 'Last node points to null', 'No random access by index'],
    },
    {
      heading: 'How it works',
      body:
        'Insert at tail: walk to the last node, set its next to the new node. Delete by value: walk while tracking previous, unlink the matching node.',
      code: `function insertAtTail(head: ListNode | null, val: number): ListNode {
  const node = new ListNode(val);
  if (!head) return node;
  let cur = head;
  while (cur.next) cur = cur.next;
  cur.next = node;
  return head;
}`,
    },
    {
      heading: 'Complexity',
      bullets: [
        'Insert/delete at head — O(1)',
        'Insert/delete at tail (without tail pointer) — O(n)',
        'Search — O(n)',
      ],
      body: 'Traversal dominates when the tail is not cached.',
    },
  ],
  keyTakeaways: [
    'Nodes + next pointers; head is the entry point.',
    'Dynamic size without reallocation — unlike dynamic arrays.',
    'Tail insert needs traversal unless you keep a tail reference.',
  ],
  sourceAttribution: [
    {
      repo: 'ChazWyllie/data-structure-visualizer',
      url: 'https://github.com/ChazWyllie/data-structure-visualizer',
    },
  ],
  quiz: [
    {
      question: 'What is the time to insert at the tail without a tail pointer?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctIndex: 2,
      explanation: 'You must traverse from head to the last node before linking the new node.',
    },
  ],
};

export const trieContent: LessonContent = {
  moduleId: 'trie',
  title: 'Trie (Prefix Tree)',
  sections: [
    {
      heading: 'The core idea',
      body:
        'A trie stores strings character-by-character along root-to-leaf paths. Shared prefixes collapse into one path — efficient for autocomplete, spell-check, and prefix search.',
      bullets: [
        'Each edge represents one character',
        'isEndOfWord marks complete dictionary entries',
        'Children often stored as maps or arrays indexed by character',
      ],
    },
    {
      heading: 'How it works',
      body:
        'Insert walks from root, creating missing child nodes per character, then marks the terminal node. Search follows the same path and checks isEndOfWord at the end.',
      code: `insert(word: string): void {
  let node = root;
  for (const ch of word) {
    if (!node.children[ch]) node.children[ch] = new TrieNode();
    node = node.children[ch];
  }
  node.isEndOfWord = true;
}`,
    },
    {
      heading: 'Complexity',
      body: 'Operations are O(m) for word length m, independent of how many words are stored (unlike hash tables that degrade with collisions).',
      bullets: ['Time — O(m) insert/search per word', 'Space — O(n·m) worst case with little prefix sharing'],
    },
  ],
  keyTakeaways: [
    'Prefix tree — shared prefixes share nodes.',
    'O(m) per operation where m is word length.',
    'Powers autocomplete: collect all words under a prefix subtree.',
  ],
  sourceAttribution: [
    {
      repo: 'ChazWyllie/data-structure-visualizer',
      url: 'https://github.com/ChazWyllie/data-structure-visualizer',
    },
  ],
  quiz: [
    {
      question: 'Why is trie search O(m) instead of O(n) over n stored words?',
      options: [
        'It hashes each word',
        'It walks at most m character edges regardless of dictionary size',
        'It sorts words first',
        'It uses binary search on characters',
      ],
      correctIndex: 1,
      explanation: 'Path length equals word length m; total dictionary size does not multiply traversal cost.',
    },
  ],
};

export const mstContent: LessonContent = {
  moduleId: 'mst',
  title: 'Minimum Spanning Tree',
  sections: [
    {
      heading: 'The core idea',
      body:
        'A minimum spanning tree (MST) connects all vertices in a weighted undirected graph with minimum total edge weight and no cycles — exactly V−1 edges.',
      bullets: [
        'Greedy algorithms work because of the cut property',
        'Used in network design, clustering, and approximation algorithms',
        'MST is unique only when all edge weights are distinct',
      ],
    },
    {
      heading: "Prim's algorithm",
      body:
        'Grow a tree from a start node. Maintain a min-priority queue of edges crossing from the tree to outside vertices; repeatedly add the cheapest edge that reaches a new vertex.',
      bullets: ['Best with dense graphs and adjacency matrices', 'Time O((V+E) log V) with a binary heap'],
    },
    {
      heading: "Kruskal's algorithm",
      body:
        'Sort all edges by weight. Greedily add the next lightest edge that does not form a cycle, using Union-Find to test connectivity.',
      bullets: ['Best with sparse graphs as edge lists', 'Time O(E log E) dominated by sorting'],
    },
  ],
  keyTakeaways: [
    'MST spans all nodes with minimum total weight and no cycles.',
    "Prim grows from a seed node; Kruskal sorts edges globally.",
    'Union-Find enables cycle detection in Kruskal.',
  ],
  sourceAttribution: [
    {
      repo: 'ChazWyllie/data-structure-visualizer',
      url: 'https://github.com/ChazWyllie/data-structure-visualizer',
    },
  ],
  quiz: [
    {
      question: 'How many edges does an MST of a connected graph with V vertices have?',
      options: ['V', 'V − 1', 'V + 1', 'E − 1'],
      correctIndex: 1,
      explanation: 'A tree on V vertices always has exactly V−1 edges.',
    },
  ],
};

export const dijkstraContent: LessonContent = {
  moduleId: 'dijkstra',
  title: "Dijkstra's Algorithm",
  sections: [
    {
      heading: 'The core idea',
      body:
        "Dijkstra's algorithm finds shortest paths from a single source in graphs with non-negative edge weights. It greedily settles the closest unvisited node and relaxes its outgoing edges.",
      bullets: [
        'Min-priority queue tracks tentative distances',
        'Relaxation: if dist[u] + w(u,v) < dist[v], update dist[v]',
        'Fails with negative edges — use Bellman-Ford instead',
      ],
    },
    {
      heading: 'How it works',
      body:
        'Initialize dist[source] = 0 and all others to ∞. Repeatedly extract the minimum-distance unvisited node, mark it settled, and relax each neighbor.',
      code: `while (!pq.isEmpty()) {
  const u = pq.extractMin();
  if (visited.has(u)) continue;
  visited.add(u);
  for (const [v, w] of neighbors(u)) {
    if (dist[u] + w < dist[v]) {
      dist[v] = dist[u] + w;
      pq.insert(v, dist[v]);
    }
  }
}`,
    },
    {
      heading: 'Complexity',
      bullets: [
        'Time — O((V+E) log V) with a binary heap',
        'Space — O(V) for distances and priority queue',
        'With non-negative weights, first settlement gives the final shortest distance',
      ],
      body: 'Each edge is relaxed at most once per extraction when using a proper priority queue.',
    },
  ],
  keyTakeaways: [
    'Single-source shortest paths on non-negative weighted graphs.',
    'Greedy settlement + edge relaxation with a min-heap.',
    'Foundation for GPS routing, network protocols (OSPF), and game pathfinding.',
  ],
  sourceAttribution: [
    {
      repo: 'ChazWyllie/data-structure-visualizer',
      url: 'https://github.com/ChazWyllie/data-structure-visualizer',
    },
  ],
  quiz: [
    {
      question: "Why doesn't Dijkstra work with negative edge weights?",
      options: [
        'The priority queue cannot store negatives',
        'A settled node might later get a shorter path via a negative edge',
        'It only works on trees',
        'Negative weights make graphs disconnected',
      ],
      correctIndex: 1,
      explanation: 'Once a node is extracted as minimum, Dijkstra assumes that distance is final — negative edges can violate that.',
    },
  ],
};

/** All DSA lab reading content keyed by moduleId. */
export const dsaLessons: Record<string, LessonContent> = {
  'bubble-sort': bubbleSortContent,
  'merge-sort': mergeSortContent,
  'quick-sort': quickSortContent,
  'binary-search': binarySearchContent,
  'graph-bfs': graphBfsContent,
  dijkstra: dijkstraContent,
  'stack-queue': stackQueueContent,
  'linked-list': linkedListContent,
  trie: trieContent,
  mst: mstContent,
  heap: heapContent,
  bst: bstContent,
  'hash-table': hashTableContent,
  'topo-sort': topoSortContent,
  'a-star': aStarContent,
  'dp-table': dpTableContent,
};

export function getDsaLesson(moduleId: string): LessonContent | undefined {
  return dsaLessons[moduleId];
}

export default dsaLessons;
