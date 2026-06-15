export type RetrievalMode = 'vector' | 'graph' | 'hybrid';

export interface GraphEdge {
  from: string;
  to: string;
  type: string;
}

export interface VectorChunk {
  id: string;
  title: string;
  text: string;
  score: number;
}

export interface GraphRagScenario {
  id: string;
  question: string;
  extractedEntities: string[];
  vectorChunks: VectorChunk[];
  graphEdges: GraphEdge[];
  answers: Record<RetrievalMode, string>;
  strengths: Record<RetrievalMode, string>;
}

export const RETRIEVAL_MODES: { id: RetrievalMode; label: string; blurb: string }[] = [
  {
    id: 'vector',
    label: 'Vector only',
    blurb: 'Qdrant semantic similarity — best for topical overlap.',
  },
  {
    id: 'graph',
    label: 'Graph only',
    blurb: 'Neo4j multi-hop traversal — best for entity relationships.',
  },
  {
    id: 'hybrid',
    label: 'Hybrid',
    blurb: 'Vector + graph combined — richest contextual answers.',
  },
];

export const SAMPLE_SCENARIOS: GraphRagScenario[] = [
  {
    id: 'curie-bohr',
    question: 'How are Marie Curie and Niels Bohr connected through their work?',
    extractedEntities: ['Marie Curie', 'Niels Bohr', 'radioactivity', 'quantum mechanics'],
    vectorChunks: [
      {
        id: 'v1',
        title: 'Marie Curie',
        text: 'Marie Curie pioneered research on radioactivity, discovering polonium and radium with Pierre Curie.',
        score: 0.91,
      },
      {
        id: 'v2',
        title: 'Niels Bohr',
        text: 'Niels Bohr developed the quantum model of the atom and mentored a generation of physicists in Copenhagen.',
        score: 0.88,
      },
      {
        id: 'v3',
        title: 'Radioactivity',
        text: 'Studies of radioactive decay bridged classical physics and the emerging quantum theory of the early 20th century.',
        score: 0.74,
      },
    ],
    graphEdges: [
      { from: 'Marie Curie', to: 'Pierre Curie', type: 'COLLABORATED_WITH' },
      { from: 'Marie Curie', to: 'radioactivity', type: 'KNOWN_FOR' },
      { from: 'Niels Bohr', to: 'quantum mechanics', type: 'DEVELOPED' },
      { from: 'Marie Curie', to: 'Niels Bohr', type: 'CORRESPONDED_WITH' },
      { from: 'Niels Bohr', to: 'Albert Einstein', type: 'INFLUENCED_BY' },
    ],
    answers: {
      vector:
        'Both Marie Curie and Niels Bohr worked on foundational physics in the early 1900s. Curie advanced radioactivity research; Bohr shaped quantum atomic theory. Their Wikipedia articles overlap on nuclear and quantum topics but do not spell out a direct personal link.',
      graph:
        'Marie Curie COLLABORATED_WITH Pierre Curie and is KNOWN_FOR radioactivity. Niels Bohr DEVELOPED quantum mechanics and CORRESPONDED_WITH Marie Curie. A 2-hop path links them through shared correspondence and the radioactivity → quantum mechanics bridge.',
      hybrid:
        'Marie Curie and Niels Bohr are connected both topically and relationally: Curie\'s radioactivity work informed the nuclear physics Bohr studied, and graph evidence shows they CORRESPONDED_WITH each other while Bohr DEVELOPED quantum mechanics — giving a fuller picture than either store alone.',
    },
    strengths: {
      vector: 'Finds topical chunks about each scientist independently.',
      graph: 'Surfaces the CORRESPONDED_WITH edge and multi-hop paths.',
      hybrid: 'Combines semantic chunks with explicit relationship chains.',
    },
  },
  {
    id: 'turing-influence',
    question: 'Who influenced Alan Turing\'s thinking in computer science?',
    extractedEntities: ['Alan Turing', 'Alonzo Church', 'computability'],
    vectorChunks: [
      {
        id: 'v1',
        title: 'Alan Turing',
        text: 'Alan Turing formalized computation with the Turing machine and cracked Enigma at Bletchley Park.',
        score: 0.93,
      },
      {
        id: 'v2',
        title: 'Alonzo Church',
        text: 'Alonzo Church created lambda calculus and the Church-Turing thesis with Turing.',
        score: 0.87,
      },
      {
        id: 'v3',
        title: 'Princeton 1936',
        text: 'Turing\'s 1936 paper on computable numbers responded to Hilbert\'s Entscheidungsproblem alongside Church\'s work.',
        score: 0.79,
      },
    ],
    graphEdges: [
      { from: 'Alan Turing', to: 'Alonzo Church', type: 'INFLUENCED_BY' },
      { from: 'Alan Turing', to: 'computability', type: 'KNOWN_FOR' },
      { from: 'Alonzo Church', to: 'lambda calculus', type: 'DEVELOPED' },
      { from: 'Alan Turing', to: 'Turing machine', type: 'INVENTED' },
    ],
    answers: {
      vector:
        'Alan Turing\'s work on computability closely parallels Alonzo Church\'s lambda calculus. Retrieved chunks mention their 1936 papers and the Entscheidungsproblem but rank by text similarity, not explicit mentorship edges.',
      graph:
        'Graph traversal finds Alan Turing INFLUENCED_BY Alonzo Church, who DEVELOPED lambda calculus. Turing INVENTED the Turing machine and is KNOWN_FOR computability — a clean influence chain from Church to Turing.',
      hybrid:
        'Vector search retrieves the 1936 Princeton context and Church-Turing thesis narrative, while the graph adds the explicit INFLUENCED_BY edge from Church to Turing — ideal for questions about intellectual lineage.',
    },
    strengths: {
      vector: 'Retrieves co-occurring historical context from article chunks.',
      graph: 'Exposes typed INFLUENCED_BY and DEVELOPED relationships.',
      hybrid: 'Merges narrative chunks with structured influence paths.',
    },
  },
];
