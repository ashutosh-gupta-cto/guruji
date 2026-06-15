export interface RagEvidence {
  id: string;
  source: string;
  text: string;
  relevance: number;
  summary?: string;
  sourceEntity: string;
  answerEntity: string;
  relatedChunkType: string;
  relatedChunkIndex: number;
  impactMetric: number;
}

export interface RagChunk {
  id: string;
  name: string;
  content: string;
  relevance: number;
}

export interface RagTraceData {
  query: string;
  answer: string;
  model: string;
  confidence: number;
  chunks: RagChunk[];
  evidences: RagEvidence[];
}

export const SAMPLE_RAG_TRACE: RagTraceData = {
  query: '如何改进RAG系统的检索效果？',
  answer:
    '改进RAG检索效果的关键策略包括：选择合适的向量数据库、合理的文档分块、混合检索与重排序，以及针对领域选择嵌入模型。评估时可使用召回率、MRR等指标持续迭代。',
  model: 'GPT-4',
  confidence: 0.87,
  chunks: [
    {
      id: 'chunk-o1',
      name: 'Chunk O1',
      content:
        '选择合适的向量数据库对RAG系统的检索效果有重要影响。不同的向量数据库有不同的特性和性能，需要根据具体应用场景进行选择。',
      relevance: 0.95,
    },
    {
      id: 'chunk-o2',
      name: 'Chunk O2',
      content:
        '合理的文档分块策略对检索质量至关重要。分块过大会导致检索不精确，分块过小则可能导致上下文信息丢失。',
      relevance: 0.82,
    },
    {
      id: 'chunk-o3',
      name: 'Chunk O3',
      content:
        '混合检索和重排序是提高RAG系统检索效果的有效策略。混合检索结合了多种检索方法的优势，而重排序则可以进一步优化检索结果的排序。',
      relevance: 0.76,
    },
    {
      id: 'chunk-o4',
      name: 'Chunk O4',
      content:
        '嵌入模型的选择会影响最终的检索效果。针对不同语言和领域的数据，可能需要选择不同的嵌入模型。',
      relevance: 0.63,
    },
    {
      id: 'chunk-o5',
      name: 'Chunk O5',
      content: '评估RAG系统的检索效果可以使用多种指标，如召回率、准确率、MRR等。',
      relevance: 0.45,
    },
    {
      id: 'chunk-o6',
      name: 'Chunk O6',
      content:
        '检索增强生成的效果与预训练模型的性能有关，这并不直接涉及检索效果改进。',
      relevance: 0.31,
    },
  ],
  evidences: [
    {
      id: 'ev-1',
      source: 'Chunk O1',
      text: '选择合适的向量数据库对RAG系统的检索效果有重要影响。',
      relevance: 0.95,
      summary: '向量数据库选型直接影响检索召回与延迟。',
      sourceEntity: 'Vector DB',
      answerEntity: 'Retrieval Quality',
      relatedChunkType: 'O',
      relatedChunkIndex: 0,
      impactMetric: 1,
    },
    {
      id: 'ev-2',
      source: 'Chunk O2',
      text: '合理的文档分块策略对检索质量至关重要。',
      relevance: 0.82,
      summary: 'Chunk size 影响精确度与上下文完整性。',
      sourceEntity: 'Chunking',
      answerEntity: 'Precision',
      relatedChunkType: 'O',
      relatedChunkIndex: 1,
      impactMetric: 1,
    },
    {
      id: 'ev-3',
      source: 'Chunk O3',
      text: '混合检索和重排序是提高RAG系统检索效果的有效策略。',
      relevance: 0.76,
      summary: 'Hybrid search + rerank 提升 top-k 质量。',
      sourceEntity: 'Hybrid Search',
      answerEntity: 'Ranking',
      relatedChunkType: 'O',
      relatedChunkIndex: 2,
      impactMetric: 1,
    },
    {
      id: 'ev-4',
      source: 'Chunk O4',
      text: '嵌入模型的选择会影响最终的检索效果。',
      relevance: 0.63,
      summary: 'Domain-specific embeddings 提升语义匹配。',
      sourceEntity: 'Embeddings',
      answerEntity: 'Semantic Match',
      relatedChunkType: 'O',
      relatedChunkIndex: 3,
      impactMetric: 0,
    },
    {
      id: 'ev-5',
      source: 'Chunk O5',
      text: '评估RAG系统的检索效果可以使用召回率、准确率、MRR等。',
      relevance: 0.45,
      summary: '离线指标驱动迭代优化。',
      sourceEntity: 'Metrics',
      answerEntity: 'Evaluation',
      relatedChunkType: 'O',
      relatedChunkIndex: 4,
      impactMetric: 0,
    },
  ],
};
