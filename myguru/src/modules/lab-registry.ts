import type { ComponentType } from 'react';

import BubbleSortLab from './dsa/labs/BubbleSortLab';
import MergeSortLab from './dsa/labs/MergeSortLab';
import QuickSortLab from './dsa/labs/QuickSortLab';
import BinarySearchLab from './dsa/labs/BinarySearchLab';
import GraphBfsLab from './dsa/labs/GraphBfsLab';
import DijkstraLab from './dsa/labs/DijkstraLab';
import StackQueueLab from './dsa/labs/StackQueueLab';
import LinkedListLab from './dsa/labs/LinkedListLab';
import TrieLab from './dsa/labs/TrieLab';
import MstLab from './dsa/labs/MstLab';
import HeapLab from './dsa/labs/HeapLab';
import BstLab from './dsa/labs/BstLab';
import HashTableLab from './dsa/labs/HashTableLab';
import TopoSortLab from './dsa/labs/TopoSortLab';
import AStarLab from './dsa/labs/AStarLab';
import DpTableLab from './dsa/labs/DpTableLab';
import LoadBalancerLab from './system-design/labs/LoadBalancerLab';
import CachingLab from './system-design/labs/CachingLab';
import MessageQueueLab from './system-design/labs/MessageQueueLab';
import DatabaseShardingLab from './system-design/labs/DatabaseShardingLab';
import KafkaLab from './system-design/labs/KafkaLab';
import RaftLab from './system-design/labs/RaftLab';
import DatabaseInternalsLab from './system-design/labs/DatabaseInternalsLab';
import CapTheoremLab from './system-design/labs/CapTheoremLab';
import PaxosLab from './system-design/labs/PaxosLab';
import StabilityLab from './system-design/labs/StabilityLab';
import InterviewSimulatorLab from './system-design/labs/InterviewSimulatorLab';
import NeuralNetworkLab from './ai-ml/labs/NeuralNetworkLab';
import GradientDescentLab from './ai-ml/labs/GradientDescentLab';
import AttentionLab from './ai-ml/labs/AttentionLab';
import DiffusionLab from './ai-ml/labs/DiffusionLab';
import AgentReplayLab from './ai-ml/labs/AgentReplayLab';
import GraphRagLab from './ai-ml/labs/GraphRagLab';
import TransformerLab from './ai-ml/labs/TransformerLab';
import NeuralPlaygroundLab from './ai-ml/labs/NeuralPlaygroundLab';
import CnnExplainerLab from './ai-ml/labs/CnnExplainerLab';
import RagTraceLab from './ai-ml/labs/RagTraceLab';
import KvCacheLab from './ai-ml/labs/KvCacheLab';
import MemoryModelLab from './cs-fundamentals/labs/MemoryModelLab';
import ConcurrencyLab from './cs-fundamentals/labs/ConcurrencyLab';
import NetworkingLab from './cs-fundamentals/labs/NetworkingLab';
import CompilersLab from './cs-fundamentals/labs/CompilersLab';
import BPlusTreeLab from './cs-fundamentals/labs/BPlusTreeLab';
import CryptoLab from './cs-fundamentals/labs/CryptoLab';
import OsSchedulerLab from './cs-fundamentals/labs/OsSchedulerLab';
import RoutingLab from './cs-fundamentals/labs/RoutingLab';
import AutomataLab from './cs-fundamentals/labs/AutomataLab';
import GitGameLab from './cs-fundamentals/labs/GitGameLab';
import CpuArchLab from './cs-fundamentals/labs/CpuArchLab';
import CipherMuseumLab from './cs-fundamentals/labs/CipherMuseumLab';
import OsSimulatorLab from './cs-fundamentals/labs/OsSimulatorLab';

export interface LabModuleEntry {
  id: string;
  title: string;
  component: ComponentType;
}

export const labRegistry: Record<string, LabModuleEntry> = {
  'bubble-sort': { id: 'bubble-sort', title: 'Bubble Sort', component: BubbleSortLab },
  'merge-sort': { id: 'merge-sort', title: 'Merge Sort', component: MergeSortLab },
  'quick-sort': { id: 'quick-sort', title: 'Quick Sort', component: QuickSortLab },
  'binary-search': { id: 'binary-search', title: 'Binary Search', component: BinarySearchLab },
  'graph-bfs': { id: 'graph-bfs', title: 'Breadth-First Search', component: GraphBfsLab },
  dijkstra: { id: 'dijkstra', title: "Dijkstra's Algorithm", component: DijkstraLab },
  'stack-queue': { id: 'stack-queue', title: 'Stack & Queue', component: StackQueueLab },
  'linked-list': { id: 'linked-list', title: 'Singly Linked List', component: LinkedListLab },
  trie: { id: 'trie', title: 'Trie (Prefix Tree)', component: TrieLab },
  mst: { id: 'mst', title: 'Minimum Spanning Tree', component: MstLab },
  heap: { id: 'heap', title: 'Heap / Priority Queue', component: HeapLab },
  bst: { id: 'bst', title: 'Binary Search Tree', component: BstLab },
  'hash-table': { id: 'hash-table', title: 'Hash Table', component: HashTableLab },
  'topo-sort': { id: 'topo-sort', title: 'Topological Sort', component: TopoSortLab },
  'a-star': { id: 'a-star', title: 'A* Pathfinding', component: AStarLab },
  'dp-table': { id: 'dp-table', title: 'DP Memo Table', component: DpTableLab },
  'load-balancer': { id: 'load-balancer', title: 'Load Balancing', component: LoadBalancerLab },
  caching: { id: 'caching', title: 'Caching Layers', component: CachingLab },
  'message-queue': { id: 'message-queue', title: 'Message Queues', component: MessageQueueLab },
  'database-sharding': {
    id: 'database-sharding',
    title: 'Database Sharding',
    component: DatabaseShardingLab,
  },
  kafka: { id: 'kafka', title: 'Apache Kafka', component: KafkaLab },
  raft: { id: 'raft', title: 'Raft Consensus', component: RaftLab },
  'database-internals': {
    id: 'database-internals',
    title: 'Database Internals',
    component: DatabaseInternalsLab,
  },
  'cap-theorem': { id: 'cap-theorem', title: 'CAP Theorem', component: CapTheoremLab },
  paxos: { id: 'paxos', title: 'Paxos Consensus', component: PaxosLab },
  stability: { id: 'stability', title: 'Metastable Failures', component: StabilityLab },
  'interview-simulator': {
    id: 'interview-simulator',
    title: 'Interview Simulator',
    component: InterviewSimulatorLab,
  },
  'neural-network': { id: 'neural-network', title: 'Neural Networks', component: NeuralNetworkLab },
  'gradient-descent': {
    id: 'gradient-descent',
    title: 'Gradient Descent',
    component: GradientDescentLab,
  },
  attention: { id: 'attention', title: 'Attention Mechanism', component: AttentionLab },
  diffusion: { id: 'diffusion', title: 'Diffusion Models', component: DiffusionLab },
  'agent-replay': { id: 'agent-replay', title: 'Agent Trace Replay', component: AgentReplayLab },
  'graphrag-hybrid': {
    id: 'graphrag-hybrid',
    title: 'GraphRAG & Hybrid Retrieval',
    component: GraphRagLab,
  },
  transformer: { id: 'transformer', title: 'Transformer Architecture', component: TransformerLab },
  'neural-playground': {
    id: 'neural-playground',
    title: 'Neural Network Playground',
    component: NeuralPlaygroundLab,
  },
  'cnn-explainer': { id: 'cnn-explainer', title: 'CNN Explainer', component: CnnExplainerLab },
  'rag-trace': { id: 'rag-trace', title: 'RAG Evidence Trace', component: RagTraceLab },
  'kv-cache': { id: 'kv-cache', title: 'LLM Inference & KV Cache', component: KvCacheLab },
  'memory-model': { id: 'memory-model', title: 'Memory Model', component: MemoryModelLab },
  concurrency: { id: 'concurrency', title: 'Concurrency Basics', component: ConcurrencyLab },
  networking: { id: 'networking', title: 'Networking Stack', component: NetworkingLab },
  compilers: { id: 'compilers', title: 'How Compilers Work', component: CompilersLab },
  'bplus-tree': { id: 'bplus-tree', title: 'B+ Tree Index', component: BPlusTreeLab },
  crypto: { id: 'crypto', title: 'Cryptography', component: CryptoLab },
  'os-scheduler': { id: 'os-scheduler', title: 'CPU Scheduling', component: OsSchedulerLab },
  routing: { id: 'routing', title: 'Network Routing', component: RoutingLab },
  automata: { id: 'automata', title: 'Regex & Automata', component: AutomataLab },
  'git-game': { id: 'git-game', title: 'Git Branching Game', component: GitGameLab },
  'cpu-arch': { id: 'cpu-arch', title: 'CPU Architecture', component: CpuArchLab },
  'cipher-museum': { id: 'cipher-museum', title: 'Cipher Museum', component: CipherMuseumLab },
  'os-simulator': { id: 'os-simulator', title: 'OS Memory Simulator', component: OsSimulatorLab },
};

export function getLabModule(moduleId: string): LabModuleEntry | undefined {
  return labRegistry[moduleId];
}
