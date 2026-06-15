import type { RagDemo } from './types';

export const RAG_DEMO: RagDemo = {
  question: 'How does chunk size affect retrieval quality?',
  document: `Retrieval-Augmented Generation (RAG) combines search with language models.
Documents are split into chunks before indexing. Smaller chunks improve precision for
specific facts but may lose surrounding context. Larger chunks preserve narrative flow
but dilute relevance signals. Overlap between chunks helps avoid cutting sentences
mid-thought. Embedding models map each chunk to a dense vector. At query time, the
question is embedded and nearest neighbors are retrieved by cosine similarity.`,
  chunks: [
    'Retrieval-Augmented Generation (RAG) combines search with language models.',
    'Documents are split into chunks before indexing.',
    'Smaller chunks improve precision for specific facts but may lose surrounding context.',
    'Larger chunks preserve narrative flow but dilute relevance signals.',
    'Overlap between chunks helps avoid cutting sentences mid-thought.',
    'Embedding models map each chunk to a dense vector.',
    'At query time, the question is embedded and nearest neighbors are retrieved by cosine similarity.',
  ],
  embeddingPreview: '[0.12, -0.33, 0.41, 0.09, 0.27, -0.18, …]  (768 dims)',
  retrievedChunks: [
    {
      text: 'Smaller chunks improve precision for specific facts but may lose surrounding context.',
      score: 0.91,
    },
    {
      text: 'Larger chunks preserve narrative flow but dilute relevance signals.',
      score: 0.87,
    },
    {
      text: 'Overlap between chunks helps avoid cutting sentences mid-thought.',
      score: 0.74,
    },
  ],
  prompt: `CONTEXT:
- Smaller chunks improve precision for specific facts but may lose surrounding context.
- Larger chunks preserve narrative flow but dilute relevance signals.
- Overlap between chunks helps avoid cutting sentences mid-thought.

QUESTION: How does chunk size affect retrieval quality?

Answer using only the context above.`,
  answer:
    'Chunk size trades off precision vs. context: smaller chunks retrieve sharper matches for specific facts, while larger chunks keep more narrative context but can rank less precisely. Overlap between chunks reduces the risk of splitting important sentences across boundaries.',
};

export const RAG_STEPS = [
  {
    id: 'chunk',
    title: 'Chunk',
    description: 'Split source documents into searchable text chunks.',
  },
  {
    id: 'embed',
    title: 'Embed',
    description: 'Convert each chunk and the query into vector embeddings.',
  },
  {
    id: 'retrieve',
    title: 'Retrieve',
    description: 'Find the most similar chunks via vector search.',
  },
  {
    id: 'generate',
    title: 'Generate',
    description: 'Send retrieved context + question to the LLM for an answer.',
  },
] as const;
