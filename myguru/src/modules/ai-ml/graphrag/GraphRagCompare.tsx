import { useMemo, useState } from 'react';
import { GitBranch, Network, Search } from 'lucide-react';

import {
  RETRIEVAL_MODES,
  SAMPLE_SCENARIOS,
  type GraphRagScenario,
  type RetrievalMode,
} from './sample-data';

const MODE_ICONS: Record<RetrievalMode, typeof Search> = {
  vector: Search,
  graph: Network,
  hybrid: GitBranch,
};

function scoreClass(score: number) {
  if (score >= 0.85) return 'aiml-graphrag__chunk--high';
  if (score >= 0.7) return 'aiml-graphrag__chunk--mid';
  return 'aiml-graphrag__chunk--low';
}

function ScenarioPanel({ scenario, mode }: { scenario: GraphRagScenario; mode: RetrievalMode }) {
  const showVector = mode === 'vector' || mode === 'hybrid';
  const showGraph = mode === 'graph' || mode === 'hybrid';

  return (
    <div className="aiml-graphrag__body">
      <section className="aiml-graphrag__panel">
        <h4>Question &amp; entities</h4>
        <p className="aiml-graphrag__query">{scenario.question}</p>
        <div className="aiml-graphrag__entities">
          {scenario.extractedEntities.map((entity) => (
            <span key={entity} className="aiml-graphrag__entity">
              {entity}
            </span>
          ))}
        </div>
      </section>

      {showVector && (
        <section className="aiml-graphrag__panel">
          <h4>Vector retrieval (Qdrant)</h4>
          <ul className="aiml-graphrag__chunk-list">
            {scenario.vectorChunks.map((chunk) => (
              <li key={chunk.id} className={`aiml-graphrag__chunk ${scoreClass(chunk.score)}`}>
                <header>
                  <strong>{chunk.title}</strong>
                  <span>{chunk.score.toFixed(2)}</span>
                </header>
                <p>{chunk.text}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showGraph && (
        <section className="aiml-graphrag__panel">
          <h4>Graph traversal (Neo4j)</h4>
          <ul className="aiml-graphrag__edge-list">
            {scenario.graphEdges.map((edge, i) => (
              <li key={`${edge.from}-${edge.type}-${edge.to}-${i}`} className="aiml-graphrag__edge">
                <span className="aiml-graphrag__node">{edge.from}</span>
                <span className="aiml-graphrag__rel">{edge.type}</span>
                <span className="aiml-graphrag__node">{edge.to}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="aiml-graphrag__panel aiml-graphrag__panel--answer">
        <h4>Generated answer</h4>
        <p className="aiml-graphrag__strength">{scenario.strengths[mode]}</p>
        <p className="aiml-graphrag__answer">{scenario.answers[mode]}</p>
      </section>
    </div>
  );
}

export function GraphRagCompare() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [mode, setMode] = useState<RetrievalMode>('hybrid');

  const scenario = SAMPLE_SCENARIOS[scenarioIdx]!;
  const ModeIcon = MODE_ICONS[mode];

  const modeLabel = useMemo(
    () => RETRIEVAL_MODES.find((m) => m.id === mode)?.label ?? mode,
    [mode],
  );

  return (
    <div className="aiml-graphrag">
      <header className="aiml-graphrag__header">
        <div>
          <h3>GraphRAG retrieval compare</h3>
          <p>
            Static sample from the GraphRAG-Demo notebook pipeline — vector-only,
            graph-only, and hybrid retrieval side by side.
          </p>
        </div>
      </header>

      <div className="aiml-graphrag__scenario-tabs">
        {SAMPLE_SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`aiml-btn aiml-btn--ghost${i === scenarioIdx ? ' aiml-graphrag__tab--active' : ''}`}
            onClick={() => setScenarioIdx(i)}
          >
            {s.question.length > 48 ? `${s.question.slice(0, 48)}…` : s.question}
          </button>
        ))}
      </div>

      <div className="aiml-graphrag__modes">
        {RETRIEVAL_MODES.map((m) => {
          const Icon = MODE_ICONS[m.id];
          return (
            <button
              key={m.id}
              type="button"
              className={`aiml-graphrag__mode${mode === m.id ? ' aiml-graphrag__mode--active' : ''}`}
              onClick={() => setMode(m.id)}
            >
              <Icon size={16} />
              <div>
                <strong>{m.label}</strong>
                <span>{m.blurb}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="aiml-graphrag__mode-banner">
        <ModeIcon size={18} />
        <span>
          Viewing <strong>{modeLabel}</strong> results for the selected question.
        </span>
      </div>

      <ScenarioPanel scenario={scenario} mode={mode} />
    </div>
  );
}
