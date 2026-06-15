import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

interface Document {
  id: string;
  text: string;
  embedding: number[];
}

interface RankedDocument {
  id: string;
  text: string;
  score: number;
}

const SAMPLE_DOCS: Document[] = [
  {
    id: 'mars',
    text: 'Mars is the fourth planet from the Sun and is often called the Red Planet.',
    embedding: [0.2, 0.8, 0.1, 0.4, 0.6],
  },
  {
    id: 'jupiter',
    text: 'Jupiter is the largest planet in our solar system and has a Great Red Spot.',
    embedding: [0.15, 0.75, 0.2, 0.35, 0.55],
  },
  {
    id: 'python',
    text: 'Python is a popular programming language known for readable syntax.',
    embedding: [-0.5, 0.1, 0.9, 0.2, -0.3],
  },
  {
    id: 'react',
    text: 'React is a JavaScript library for building user interfaces with components.',
    embedding: [-0.45, 0.05, 0.85, 0.25, -0.2],
  },
];

const DEFAULT_QUERY = 'Which planet is known as the Red Planet?';

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function mockEmbed(text: string): number[] {
  const seed = text.length / 100;
  return [seed, seed * 0.7, 1 - seed, seed * 0.4, seed * 0.2];
}

function EmbeddingBar({ vector }: { vector: number[] }) {
  return (
    <div className="aiml-embed-bar" aria-hidden="true">
      {vector.map((v, i) => (
        <span
          key={i}
          style={{
            height: `${Math.max(12, Math.abs(v) * 100)}%`,
            opacity: 0.4 + Math.abs(v) * 0.6,
          }}
        />
      ))}
    </div>
  );
}

function ResultCard({ doc, rank }: { doc: RankedDocument; rank: number }) {
  const pct = (doc.score * 100).toFixed(1);
  const barTone =
    doc.score > 0.7 ? 'high' : doc.score > 0.45 ? 'mid' : 'low';

  return (
    <article className="aiml-search-result">
      <header>
        <span>Rank #{rank}</span>
        <strong>{pct}% similar</strong>
      </header>
      <p>{doc.text}</p>
      <div className="aiml-search-result__bar">
        <div
          className={`aiml-search-result__fill aiml-search-result__fill--${barTone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </article>
  );
}

export function SemanticSearchDemo() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [searched, setSearched] = useState(false);

  const queryVector = useMemo(() => mockEmbed(query), [query]);

  const results = useMemo<RankedDocument[]>(() => {
    if (!searched || !query.trim()) return [];
    return SAMPLE_DOCS.map((doc) => ({
      id: doc.id,
      text: doc.text,
      score: cosineSimilarity(queryVector, doc.embedding),
    }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [query, queryVector, searched]);

  return (
    <div className="aiml-search">
      <header className="aiml-search__header">
        <h3>Semantic search</h3>
        <p>
          Static embedding vectors — UI patterns from EmbeddingGemma semantic search,
          no model download required.
        </p>
      </header>

      <div className="aiml-search__grid">
        <section className="aiml-search__panel">
          <label htmlFor="aiml-query">Search query</label>
          <div className="aiml-search__input-wrap">
            <Search size={16} />
            <input
              id="aiml-query"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearched(false);
              }}
              placeholder="Ask a natural-language question…"
            />
          </div>
          <EmbeddingBar vector={queryVector} />
          <button
            type="button"
            className="aiml-btn aiml-btn--primary aiml-search__submit"
            onClick={() => setSearched(true)}
            disabled={!query.trim()}
          >
            Find similar documents
          </button>

          <div className="aiml-search__docs">
            <p className="aiml-search__docs-label">Indexed documents</p>
            {SAMPLE_DOCS.map((doc) => (
              <div key={doc.id} className="aiml-search__doc">
                <p>{doc.text}</p>
                <EmbeddingBar vector={doc.embedding} />
              </div>
            ))}
          </div>
        </section>

        <section className="aiml-search__panel">
          <h4>Results</h4>
          {!searched && (
            <p className="aiml-muted aiml-search__empty">
              Run a search to see cosine-ranked matches.
            </p>
          )}
          {searched && results.length === 0 && (
            <p className="aiml-muted aiml-search__empty">No matches.</p>
          )}
          {results.map((doc, i) => (
            <ResultCard key={doc.id} doc={doc} rank={i + 1} />
          ))}
        </section>
      </div>
    </div>
  );
}
