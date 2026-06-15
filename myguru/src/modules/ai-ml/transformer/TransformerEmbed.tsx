import { ExternalLink } from 'lucide-react';

const EMBED_URL = 'https://poloclub.github.io/transformer-explainer/';

export function TransformerEmbed() {
  return (
    <div className="aiml-embed">
      <aside className="aiml-embed__intro">
        <h3>How Transformers Work</h3>
        <p>
          Transformers process text with <strong>self-attention</strong> — each token
          learns which other tokens matter most. This architecture powers GPT, BERT,
          and modern LLMs.
        </p>
        <ul className="aiml-embed__list">
          <li>
            <span className="aiml-embed__tag">Embedding</span>
            Tokens become dense vectors the model can compute over.
          </li>
          <li>
            <span className="aiml-embed__tag">Attention</span>
            Query, Key, and Value projections score pairwise relevance.
          </li>
          <li>
            <span className="aiml-embed__tag">MLP</span>
            Feed-forward layers transform attended representations.
          </li>
          <li>
            <span className="aiml-embed__tag">Output</span>
            The final layer predicts the next token probability.
          </li>
        </ul>
        <p className="aiml-muted">
          Use the interactive explainer below to step through a live forward pass.
          Hover over blocks to see tensor shapes and data flow.
        </p>
        <a
          href={EMBED_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="aiml-btn aiml-btn--ghost"
        >
          <ExternalLink size={14} />
          Open in new tab
        </a>
      </aside>
      <div className="aiml-embed__frame-wrap">
        <iframe
          title="Transformer Explainer by Georgia Tech Polo Club"
          src={EMBED_URL}
          className="aiml-embed__frame"
          sandbox="allow-scripts allow-same-origin allow-popups"
          loading="lazy"
        />
      </div>
    </div>
  );
}
