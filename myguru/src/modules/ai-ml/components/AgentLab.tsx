import { useState } from 'react';
import { Bot, GitBranch, Layers, Search } from 'lucide-react';
import { AgentReplayDemo } from '../agent-replay/AgentReplayDemo';
import { AgentAnatomy } from '../agent-anatomy/AgentAnatomy';
import { RagPipeline } from '../rag-pipeline/RagPipeline';
import { SemanticSearchDemo } from '../semantic-search/SemanticSearchDemo';
import '../ai-ml.css';

type TabId = 'replay' | 'anatomy' | 'rag' | 'search';

const TABS: { id: TabId; label: string; icon: React.ReactNode; blurb: string }[] = [
  {
    id: 'replay',
    label: 'Agent replay',
    icon: <Bot size={16} />,
    blurb: 'Step through Claude agent traces — thinking, tool calls, and recovery.',
  },
  {
    id: 'anatomy',
    label: 'Agent loop',
    icon: <GitBranch size={16} />,
    blurb: 'User ↔ Agent ↔ LLM sequence diagram of the tool-calling loop.',
  },
  {
    id: 'rag',
    label: 'RAG pipeline',
    icon: <Layers size={16} />,
    blurb: 'Chunk → embed → retrieve → generate with static sample data.',
  },
  {
    id: 'search',
    label: 'Semantic search',
    icon: <Search size={16} />,
    blurb: 'Rank documents by embedding similarity — no API keys.',
  },
];

export function AgentLab() {
  const [tab, setTab] = useState<TabId>('replay');
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="aiml-lab">
      <header className="aiml-lab__header">
        <div>
          <p className="aiml-lab__eyebrow">AI / ML learning lab</p>
          <h1>AgentLab</h1>
          <p className="aiml-lab__subtitle">{active.blurb}</p>
        </div>
      </header>

      <nav className="aiml-lab__tabs" aria-label="AI learning modules">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={
              tab === t.id ? 'aiml-lab__tab aiml-lab__tab--active' : 'aiml-lab__tab'
            }
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>

      <div className="aiml-lab__panel">
        {tab === 'replay' && <AgentReplayDemo />}
        {tab === 'anatomy' && <AgentAnatomy />}
        {tab === 'rag' && <RagPipeline />}
        {tab === 'search' && <SemanticSearchDemo />}
      </div>
    </div>
  );
}

export default AgentLab;
