export interface RagStep {
  id: string;
  title: string;
  description: string;
  sampleData: string;
  detail?: string;
}

export interface RagDemo {
  question: string;
  document: string;
  chunks: string[];
  embeddingPreview: string;
  retrievedChunks: { text: string; score: number }[];
  prompt: string;
  answer: string;
}
