import type { LessonContent } from '../types';

const memoryModel: LessonContent = {
  moduleId: 'memory-model',
  title: 'Memory Model',
  sections: [
    {
      heading: 'How computers represent data',
      body:
        'All values in memory are bit patterns. Integers, floats, and characters differ only in how software interprets those bits. Understanding binary and hexadecimal is essential for debugging, bitwise ops, and systems interviews.',
      bullets: [
        'Binary (base 2): each bit is a power of two.',
        'Hex (base 16): compact shorthand for bytes (e.g., 0xFF = 11111111).',
        'Two\'s complement encodes signed integers; IEEE 754 encodes floats.',
      ],
      tip: 'Interview classic: explain why 0.1 + 0.2 ≠ 0.3 in floating point.',
    },
    {
      heading: 'Stack vs heap',
      body:
        'The stack holds function frames, local variables, and return addresses — fast, LIFO, limited size. The heap holds dynamically allocated objects with longer lifetimes, managed by malloc/free or a garbage collector.',
      bullets: [
        'Stack allocation is automatic; heap requires explicit or GC reclamation.',
        'Stack overflow from deep recursion; heap exhaustion from memory leaks.',
        'Pointers/references on the stack can point to heap objects.',
      ],
    },
    {
      heading: 'Virtual memory and paging',
      body:
        'Operating systems give each process a virtual address space mapped to physical RAM via page tables. When RAM is full, pages are swapped to disk — a page fault occurs when a needed page is not in memory.',
      code: `// Page fault: referenced page not in physical frames
if page not in RAM:
  evict page (FIFO / LRU / OPT)
  load requested page`,
    },
    {
      heading: 'Page replacement algorithms',
      body:
        'When all frames are full, the OS must evict a page. FIFO evicts the oldest; LRU evicts the least recently used; OPT (Belady\'s) evicts the page used farthest in the future — optimal but not implementable without foresight.',
      bullets: [
        'More frames can sometimes increase faults (Belady\'s anomaly) for FIFO.',
        'LRU approximates good locality with higher implementation cost.',
        'Page fault count is the key metric in replacement comparisons.',
      ],
    },
  ],
  keyTakeaways: [
    'All data is bits — binary/hex fluency is foundational for systems work.',
    'Stack is fast and scoped; heap is flexible and requires lifecycle management.',
    'Virtual memory + page replacement (FIFO/LRU/OPT) bridge RAM limits and process isolation.',
  ],
  sourceAttribution: [
    {
      repo: 'MUMEi-28/VirtualMemorySimulator',
      url: 'https://github.com/MUMEi-28/VirtualMemorySimulator',
    },
  ],
  quiz: [
    {
      question: 'Which page replacement algorithm is optimal but requires future knowledge?',
      options: ['FIFO', 'LRU', 'OPT (Optimal)', 'Random'],
      correctIndex: 2,
      explanation:
        'OPT evicts the page that will not be used for the longest time in the future — optimal but impractical without foresight.',
    },
    {
      question: 'Where are local variables of a function typically stored?',
      options: ['The heap', 'The call stack', 'The disk swap partition', 'The CPU cache permanently'],
      correctIndex: 1,
      explanation:
        'Function frames and their locals live on the stack, pushed on call and popped on return.',
    },
  ],
};

const concurrency: LessonContent = {
  moduleId: 'concurrency',
  title: 'Git & Parallel Work',
  sections: [
    {
      heading: 'Commits as snapshots',
      body:
        'Git records project history as a directed acyclic graph (DAG) of commits. Each commit points to a parent (or parents for merges), forming branches you can visualize as parallel timelines.',
      bullets: [
        'A branch is a movable pointer to a commit.',
        'HEAD marks your current checkout position.',
        'The working tree holds uncommitted changes.',
      ],
    },
    {
      heading: 'Branching and merging',
      body:
        'Branching creates independent lines of work. Merging combines histories — a fast-forward when linear, or a merge commit when histories diverged. Conflicts arise when the same lines changed on both sides.',
      code: `git checkout -b feature
git commit -m "add feature"
git checkout main
git merge feature   # fast-forward or merge commit`,
      tip: 'Draw the DAG when explaining merge vs rebase — interviewers reward visual reasoning.',
    },
    {
      heading: 'Rebase vs merge',
      body:
        'Rebase replays commits onto a new base, producing linear history. Merge preserves the true parallel timeline. Rebase rewrites history — never rebase shared public branches.',
      bullets: [
        'Rebase: cleaner log, rewritten commit SHAs.',
        'Merge: preserves context of parallel development.',
        'Cherry-pick copies individual commits across branches.',
      ],
    },
    {
      heading: 'Parallel workstreams as concurrency metaphor',
      body:
        'Git models concurrent development: multiple developers (or tasks) advance independent branches, synchronize via merge/rebase, and resolve conflicts — analogous to threads coordinating shared state, but with human-readable history.',
    },
  ],
  keyTakeaways: [
    'Git history is a DAG of commits; branches are pointers into that graph.',
    'Merge preserves parallel history; rebase linearizes by replaying commits.',
    'Visualizing the commit graph clarifies checkout, merge, rebase, and cherry-pick.',
  ],
  sourceAttribution: [
    {
      repo: 'pcottle/learnGitBranching',
      url: 'https://github.com/pcottle/learnGitBranching',
    },
  ],
  quiz: [
    {
      question: 'What does a fast-forward merge indicate?',
      options: [
        'Two branches modified the same lines',
        'The target branch simply moves forward — no divergent commits to combine',
        'All commits are deleted and recreated',
        'The repository is corrupted',
      ],
      correctIndex: 1,
      explanation:
        'Fast-forward occurs when the target branch has no unique commits — it just advances the pointer.',
    },
    {
      question: 'Why should you avoid rebasing commits already pushed to a shared branch?',
      options: [
        'Rebase is slower than merge',
        'Rebase rewrites history, breaking others\' local copies that reference old SHAs',
        'Rebase deletes all remote branches',
        'GitHub blocks all rebase operations',
      ],
      correctIndex: 1,
      explanation:
        'Rebase creates new commits; collaborators with the old history face painful divergence.',
    },
  ],
};

const networking: LessonContent = {
  moduleId: 'networking',
  title: 'Networking Stack',
  sections: [
    {
      heading: 'From URL to connection',
      body:
        'Typing a URL triggers a chain: DNS resolves the hostname to an IP, TCP establishes a connection, TLS encrypts the channel, and HTTP carries the application request. Each layer adds headers and semantics.',
      bullets: [
        'DNS: hostname → IP address (often iterative/recursive).',
        'TCP: reliable, ordered byte stream over IP.',
        'TLS: encryption + server authentication via certificates.',
      ],
    },
    {
      heading: 'DNS resolution path',
      body:
        'A stub resolver checks local cache, then asks a recursive resolver, which queries root (.), TLD (.com), and authoritative nameservers until it finds the A/AAAA record.',
      code: `browser cache → OS cache → recursive resolver
  → root (.) → TLD (.com) → authoritative → IP`,
      tip: 'Know TTL and caching — stale DNS records cause mysterious outages after migrations.',
    },
    {
      heading: 'TCP three-way handshake',
      body:
        'TCP connection setup: client sends SYN, server replies SYN-ACK, client sends ACK. Teardown uses FIN/ACK. Sequence numbers ensure ordered delivery and retransmission on loss.',
      bullets: [
        'SYN flood is a classic DoS vector against the handshake.',
        'TCP provides flow control (window) and congestion control.',
        'HTTP/2 multiplexes streams over one TCP connection.',
      ],
    },
    {
      heading: 'TLS 1.3 handshake',
      body:
        'Modern TLS negotiates cipher suites, authenticates the server certificate chain, and establishes session keys — often in one round trip. Forward secrecy ensures past sessions stay secure if long-term keys leak later.',
    },
  ],
  keyTakeaways: [
    'A web request traverses DNS → TCP → TLS → HTTP in order.',
    'DNS resolution is iterative through root, TLD, and authoritative servers.',
    'TCP handshake establishes reliable transport; TLS adds encryption and authentication.',
  ],
  sourceAttribution: [
    {
      repo: 'jsg0000/dns-trace',
      url: 'https://github.com/jsg0000/dns-trace',
    },
  ],
  quiz: [
    {
      question: 'What is the correct order of the TCP three-way handshake?',
      options: ['ACK, SYN, SYN-ACK', 'SYN, SYN-ACK, ACK', 'SYN, ACK, FIN', 'TLS, SYN, HTTP'],
      correctIndex: 1,
      explanation:
        'Client SYN → server SYN-ACK → client ACK establishes the connection.',
    },
    {
      question: 'Which DNS server type returns the final IP for a domain?',
      options: ['Root server', 'TLD server', 'Authoritative nameserver', 'Stub resolver only'],
      correctIndex: 2,
      explanation:
        'Authoritative nameservers hold the actual records for the domain being queried.',
    },
  ],
};

const compilers: LessonContent = {
  moduleId: 'compilers',
  title: 'How Compilers Work',
  sections: [
    {
      heading: 'The compilation pipeline',
      body:
        'A compiler transforms source code into executable machine code through distinct phases. Each phase has a well-defined input and output, making errors localizable to a specific stage.',
      bullets: [
        'Frontend: lexing, parsing, semantic analysis.',
        'Middle-end: intermediate representation (IR), optimizations.',
        'Backend: code generation for target architecture.',
      ],
    },
    {
      heading: 'Lexical and syntax analysis',
      body:
        'The lexer (scanner) breaks source into tokens — keywords, identifiers, literals, operators. The parser builds an Abstract Syntax Tree (AST) according to grammar rules, catching syntax errors.',
      code: `// Lexer output (tokens):
[IF, LPAREN, ID("x"), GT, NUM(0), RPAREN, LBRACE, ...]
// Parser output: AST rooted at IfStatement node`,
    },
    {
      heading: 'Semantic analysis and IR',
      body:
        'The semantic analyzer checks types, scopes, and declarations — building a symbol table. The AST lowers to Three-Address Code (TAC): simple instructions with at most one operator, easy to optimize.',
      tip: 'If asked "where are type errors caught?" — semantic analysis, not parsing.',
    },
    {
      heading: 'Optimization and code generation',
      body:
        'Optimizers apply constant folding, dead code elimination, loop unrolling, and register allocation on IR. The backend emits assembly or bytecode for the target CPU, respecting calling conventions and instruction sets.',
      bullets: [
        'SSA form simplifies many optimizations.',
        'Peephole optimization cleans up local instruction patterns.',
        'JIT compilers (JVM, V8) compile IR at runtime for hot paths.',
      ],
    },
  ],
  keyTakeaways: [
    'Compiler phases: lex → parse → semantic check → IR → optimize → codegen.',
    'Lexer produces tokens; parser builds the AST; semantic pass validates types/scopes.',
    'IR and optimization sit between the frontend and target-specific code generation.',
  ],
  sourceAttribution: [
    {
      repo: 'danielace1/compiler-visualizer',
      url: 'https://github.com/danielace1/compiler-visualizer',
    },
  ],
  quiz: [
    {
      question: 'At which phase are type mismatches typically detected?',
      options: ['Lexical analysis', 'Syntax analysis (parsing)', 'Semantic analysis', 'Code generation'],
      correctIndex: 2,
      explanation:
        'Semantic analysis validates types, scopes, and declarations after the AST is built.',
    },
    {
      question: 'What does the lexer produce?',
      options: [
        'Machine code',
        'A stream of tokens',
        'An optimized IR',
        'An executable binary',
      ],
      correctIndex: 1,
      explanation:
        'Lexical analysis scans source text and outputs categorized tokens for the parser.',
    },
  ],
};

const bplusTree: LessonContent = {
  moduleId: 'bplus-tree',
  title: 'B+ Tree Index',
  sections: [
    {
      heading: 'Why B+ trees in databases',
      body:
        'Database indexes must minimize disk I/O. B+ trees are balanced multi-way search trees where all data lives in leaves and internal nodes only route — ideal for block-oriented storage with high fanout.',
      bullets: [
        'Shallow trees → few disk reads even for millions of keys.',
        'Leaf nodes are linked for efficient range scans.',
        'Used in MySQL InnoDB, PostgreSQL, and most relational engines.',
      ],
    },
    {
      heading: 'Structure rules (order M)',
      body:
        'For order M: internal nodes (except root) have ⌈M/2⌉ to M children; leaves hold ⌈M/2⌉ to M keys; all leaves sit at the same depth. The root has 2–M children or is a leaf.',
      code: `// Search: start at root, compare keys, follow child pointer
// until reaching a leaf, then scan leaf keys`,
    },
    {
      heading: 'Insert and split',
      body:
        'Insert descends to the correct leaf. If the leaf is full, it splits — median key promoted to parent, possibly cascading splits up the tree. Splits keep the tree balanced without global rebalancing.',
      tip: 'Interview contrast: B-tree stores data in internal nodes; B+ tree keeps data only in leaves — better for range queries.',
    },
    {
      heading: 'Delete, borrow, and merge',
      body:
        'Deleting from a leaf may cause underflow (too few keys). The tree borrows from a sibling or merges nodes, adjusting parent keys. These local fixes maintain balance without rebuilding the entire tree.',
      bullets: [
        'Borrow: redistribute keys between siblings via parent.',
        'Merge: combine underflow node with sibling, remove separator from parent.',
        'Cascading merges can shrink tree height at the root.',
      ],
    },
  ],
  keyTakeaways: [
    'B+ trees are shallow, balanced indexes optimized for disk block reads.',
    'All records live in linked leaf nodes; internal nodes are pure routers.',
    'Insert splits and delete borrow/merge maintain balance locally.',
  ],
  sourceAttribution: [
    {
      repo: 'Yusux/BPlusTreeVisualizer',
      url: 'https://github.com/Yusux/BPlusTreeVisualizer',
    },
  ],
  quiz: [
    {
      question: 'Where are actual data records stored in a B+ tree?',
      options: [
        'Only in internal nodes',
        'Only in leaf nodes',
        'In the root node exclusively',
        'In a separate hash table',
      ],
      correctIndex: 1,
      explanation:
        'B+ trees store all data in leaves; internal nodes contain routing keys only, with leaves linked for range scans.',
    },
    {
      question: 'What happens when inserting into a full leaf node?',
      options: [
        'The entire tree is rebuilt from scratch',
        'The leaf splits and a key may propagate upward to the parent',
        'The insert is rejected permanently',
        'All sibling leaves are deleted',
      ],
      correctIndex: 1,
      explanation:
        'A full leaf splits into two, promoting a separator key to the parent — possibly cascading splits up the tree.',
    },
  ],
};

const crypto: LessonContent = {
  moduleId: 'crypto',
  title: 'Cryptography',
  sections: [
    {
      heading: 'Symmetric vs asymmetric',
      body:
        'Symmetric ciphers (AES, ChaCha20) use one shared key for encrypt and decrypt — fast, used for bulk data. Asymmetric (RSA, ECDH) uses key pairs for key exchange and signatures — slower, used for handshake setup.',
      bullets: [
        'TLS combines both: asymmetric handshake, symmetric session encryption.',
        'Never roll your own crypto — use vetted libraries.',
        'Key length and algorithm choice matter as attacks improve.',
      ],
    },
    {
      heading: 'AES block cipher rounds',
      body:
        'AES operates on 128-bit blocks with 128/192/256-bit keys. Each round applies SubBytes (S-box substitution), ShiftRows (permutation), MixColumns (linear mixing), and AddRoundKey (XOR with round key).',
      code: `state = input_block
for round in 1..N:
  state = SubBytes(state)
  state = ShiftRows(state)
  state = MixColumns(state)   // skipped in final round
  state = AddRoundKey(state, round_key)`,
    },
    {
      heading: 'Modes and practical use',
      body:
        'Block ciphers need modes (GCM, CBC) to handle messages longer than one block. GCM provides authenticated encryption — tampering is detected. IVs/nonces must never repeat with the same key.',
      tip: 'Interview mention: AES-GCM is the workhorse of TLS 1.3 record encryption.',
    },
    {
      heading: 'Hashing and integrity',
      body:
        'Cryptographic hashes (SHA-256) are one-way — used for integrity checks, password storage (with salt + slow KDF), and Merkle trees. They are not encryption.',
      bullets: [
        'HMAC combines a hash with a secret key for message authentication.',
        'Passwords: bcrypt/argon2, never plain SHA alone.',
        'Digital signatures use asymmetric keys over hash digests.',
      ],
    },
  ],
  keyTakeaways: [
    'Symmetric ciphers (AES) encrypt bulk data; asymmetric handles key exchange and signatures.',
    'AES rounds: SubBytes → ShiftRows → MixColumns → AddRoundKey on a 16-byte state.',
    'Use authenticated modes (GCM); hashes provide integrity, not confidentiality.',
  ],
  sourceAttribution: [
    {
      repo: 'powergr/cipherflow-visualizer',
      url: 'https://github.com/powergr/cipherflow-visualizer',
    },
  ],
  quiz: [
    {
      question: 'What does the SubBytes step in AES do?',
      options: [
        'Shifts rows of the state matrix',
        'Applies a non-linear S-box substitution to each byte',
        'XORs the state with the round key',
        'Mixes columns via matrix multiplication',
      ],
      correctIndex: 1,
      explanation:
        'SubBytes replaces each byte in the 4×4 state matrix using the AES S-box — the primary non-linear layer.',
    },
    {
      question: 'Why must IVs/nonces never repeat when using AES-GCM with the same key?',
      options: [
        'It slows down encryption',
        'Repeating a nonce breaks confidentiality and integrity guarantees',
        'It increases key size requirements',
        'The S-box becomes invalid',
      ],
      correctIndex: 1,
      explanation:
        'Nonce reuse in GCM is catastrophic — attackers can recover plaintext and forge tags.',
    },
  ],
};

const osScheduler: LessonContent = {
  moduleId: 'os-scheduler',
  title: 'CPU Scheduling',
  sections: [
    {
      heading: 'Why scheduling exists',
      body:
        'A CPU runs one thread at a time (per core). The OS scheduler picks which ready process runs next, multiplexing limited CPUs across many tasks — balancing throughput, latency, and fairness.',
      bullets: [
        'Context switch saves/restores register state.',
        'Scheduling decisions happen on timer interrupts and I/O events.',
        'Ready queue holds processes waiting for CPU time.',
      ],
    },
    {
      heading: 'FCFS (First-Come, First-Served)',
      body:
        'The simplest policy: run processes in arrival order. Non-preemptive — a long job blocks everyone behind it (convoy effect). Easy to implement but poor for interactive workloads.',
      tip: 'Convoy effect: one CPU-bound process delays all short jobs behind it in FCFS.',
    },
    {
      heading: 'Shortest Job First (SJF)',
      body:
        'Run the job with the smallest burst time next — minimizes average waiting time. Requires knowing burst lengths (or estimating). Preemptive variant (SRTF) can interrupt when a shorter job arrives.',
      bullets: [
        'Optimal for average wait time if burst times are known.',
        'Starvation possible for long jobs under continuous short arrivals.',
        'Aging can boost long-waiting processes\' priority.',
      ],
    },
    {
      heading: 'Round Robin (RR)',
      body:
        'Each process gets a fixed time quantum in a circular queue. Preemptive and fair for time-sharing. Quantum too large → behaves like FCFS; too small → excessive context switch overhead.',
      code: `ready_queue = circular(processes)
while processes remain:
  run(current, quantum)
  if not finished: enqueue(current)`,
    },
  ],
  keyTakeaways: [
    'The OS scheduler multiplexes CPU time across ready processes.',
    'FCFS is simple but suffers convoy effect; SJF minimizes average wait.',
    'Round Robin with a time quantum gives fair, preemptive time-sharing.',
  ],
  sourceAttribution: [
    {
      repo: 'AmirShakibafar/OS-Visualizer',
      url: 'https://github.com/AmirShakibafar/OS-Visualizer',
    },
  ],
  quiz: [
    {
      question: 'Which scheduling algorithm minimizes average waiting time when burst times are known?',
      options: ['FCFS', 'Round Robin', 'Shortest Job First', 'Random'],
      correctIndex: 2,
      explanation:
        'SJF always picks the shortest remaining job, minimizing average wait — but requires burst time knowledge.',
    },
    {
      question: 'What is the convoy effect in FCFS?',
      options: [
        'Processes finish in reverse arrival order',
        'A long CPU-bound job delays all shorter jobs queued behind it',
        'The scheduler randomly picks processes',
        'I/O devices become unavailable',
      ],
      correctIndex: 1,
      explanation:
        'Non-preemptive FCFS lets one long job monopolize the CPU, delaying all subsequent processes.',
    },
  ],
};

const routing: LessonContent = {
  moduleId: 'routing',
  title: 'Network Routing',
  sections: [
    {
      heading: 'Routing problem',
      body:
        'Routers forward packets toward destinations using routing tables. Given a weighted graph of networks, the goal is finding least-cost paths — the foundation of intra-domain routing algorithms.',
      bullets: [
        'Nodes = routers; edges = links with costs (latency, bandwidth).',
        'Static routing: tables configured manually.',
        'Dynamic routing: protocols (OSPF, BGP) adapt to topology changes.',
      ],
    },
    {
      heading: "Dijkstra's algorithm",
      body:
        'Single-source shortest path on non-negative edge weights. Maintain a set of finalized nodes with known shortest distances; repeatedly relax edges from the closest unvisited node.',
      code: `dist[source] = 0
while unvisited nodes remain:
  u = unvisited node with min dist
  for each neighbor v of u:
    dist[v] = min(dist[v], dist[u] + weight(u,v))`,
      tip: 'Dijkstra fails with negative edges — use Bellman-Ford instead. Mention this if probed.',
    },
    {
      heading: 'Relaxation step by step',
      body:
        'Each iteration picks the unvisited node with smallest tentative distance, marks it visited, and updates neighbors if a shorter path is found. Tracing this on a whiteboard is a common interview exercise.',
      bullets: [
        'Priority queue (min-heap) gives O((V+E) log V) time.',
        'Visited set prevents reprocessing finalized nodes.',
        'Path reconstruction uses a predecessor map.',
      ],
    },
    {
      heading: 'From algorithm to internet',
      body:
        'OSPF uses link-state flooding + Dijkstra within an autonomous system. BGP handles inter-domain policy routing between ASes — path vector, not pure shortest path. Know the distinction for system design interviews.',
    },
  ],
  keyTakeaways: [
    'Routing finds least-cost paths in a network graph.',
    "Dijkstra's algorithm relaxes edges greedily from the nearest unvisited node.",
    'OSPF uses link-state + Dijkstra internally; BGP handles inter-domain policy routing.',
  ],
  sourceAttribution: [
    {
      repo: 'G-Amar/Network-Routing-Visualized',
      url: 'https://github.com/G-Amar/Network-Routing-Visualized',
    },
  ],
  quiz: [
    {
      question: "Why doesn't Dijkstra's algorithm work with negative edge weights?",
      options: [
        'Negative weights make the graph disconnected',
        'A finalized node may later get a shorter path via a negative edge, breaking the greedy invariant',
        'Negative weights require exponential time always',
        'Priority queues cannot store negative numbers',
      ],
      correctIndex: 1,
      explanation:
        'Once a node is marked visited, Dijkstra assumes its distance is final — negative edges can violate that.',
    },
    {
      question: 'What does the relaxation step do in Dijkstra?',
      options: [
        'Deletes the heaviest edge',
        'Updates a neighbor\'s distance if a shorter path through the current node is found',
        'Encrypts the routing table',
        'Broadcasts the entire table to all routers',
      ],
      correctIndex: 1,
      explanation:
        'Relaxation checks whether dist[u] + weight(u,v) improves dist[v] and updates if so.',
    },
  ],
};

const automata: LessonContent = {
  moduleId: 'automata',
  title: 'Regex & Automata',
  sections: [
    {
      heading: 'Regular languages and regex',
      body:
        'Regular expressions describe regular languages — patterns matchable by finite automata. Operators: concatenation, union (|), and Kleene star (*) for zero-or-more repetition.',
      bullets: [
        'Regex engines in languages compile patterns to automata.',
        'Not all languages are regular (e.g., balanced parentheses).',
        'NFAs and DFAs recognize exactly the same class of languages.',
      ],
    },
    {
      heading: 'Thompson construction',
      body:
        'Thompson\'s algorithm builds an NFA from a regex recursively: base cases for empty string (ε) and literals; inductive rules for concatenation (series), union (parallel ε branches), and star (loop with ε).',
      code: `// Union of R and S:  ε → R ──→ accept
//                  ε → S ──↗
// Star of R:  ε → (R with ε-loop back) → accept`,
      tip: 'Thompson NFAs have at most 2n states for n regex symbols — good interview fact.',
    },
    {
      heading: 'NFA vs DFA',
      body:
        'An NFA allows multiple active states and ε-transitions; a DFA has exactly one state per input symbol with no ε-moves. Subset construction converts NFA → DFA, possibly with exponential state blowup.',
      bullets: [
        'DFA simulation is O(n) per character — fast matching.',
        'NFA is easier to build from regex; DFA is easier to execute.',
        'Practical engines use hybrids (DFA for simple parts, backtracking for extensions).',
      ],
    },
    {
      heading: 'Where this shows up',
      body:
        'Lexers in compilers use regex → NFA → DFA pipelines to tokenize source code. Understanding automata explains why some regex patterns are fast and others catastrophically backtrack (e.g., nested quantifiers).',
    },
  ],
  keyTakeaways: [
    'Regular expressions describe languages recognizable by finite automata.',
    'Thompson construction builds an NFA from regex using ε-transitions.',
    'NFAs and DFAs are equivalent in power; subset construction bridges them.',
  ],
  sourceAttribution: [
    {
      repo: 'Royal-lobster/stateforge',
      url: 'https://github.com/Royal-lobster/stateforge',
    },
    {
      repo: 'AmirHossein812002/Regex2FA',
      url: 'https://github.com/AmirHossein812002/Regex2FA',
    },
  ],
  quiz: [
    {
      question: 'What does Thompson construction produce from a regular expression?',
      options: [
        'A parse tree for context-free grammars',
        'An NFA with ε-transitions',
        'A binary search tree',
        'A Turing machine',
      ],
      correctIndex: 1,
      explanation:
        'Thompson\'s algorithm recursively composes NFAs with ε-transitions for concat, union, and star.',
    },
    {
      question: 'Which languages can regular expressions express?',
      options: [
        'All computable languages',
        'Exactly the regular languages',
        'Only palindromes of any length',
        'Context-free languages including nested parens',
      ],
      correctIndex: 1,
      explanation:
        'Regular expressions capture regular languages — those recognized by finite automata, not nested structures requiring a stack.',
    },
  ],
};

export const csFundamentalsLessons: Record<string, LessonContent> = {
  'memory-model': memoryModel,
  concurrency,
  networking,
  compilers,
  'bplus-tree': bplusTree,
  crypto,
  'os-scheduler': osScheduler,
  routing,
  automata,
};

export default csFundamentalsLessons;
