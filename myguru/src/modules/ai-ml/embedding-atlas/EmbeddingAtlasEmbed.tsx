import { ExternalLink } from 'lucide-react';

const EMBED_URL = 'https://apple.github.io/embedding-atlas/';

export function EmbeddingAtlasEmbed() {
  return (
    <div className="aiml-embed">
      <aside className="aiml-embed__intro">
        <h3>Embedding Atlas</h3>
        <p>
          Embedding Atlas visualizes high-dimensional vector spaces — cluster
          structure, density contours, and nearest-neighbor relationships become
          inspectable at scale.
        </p>
        <ul className="aiml-embed__list">
          <li>
            <span className="aiml-embed__tag">Projection</span>
            UMAP/t-SNE maps thousands of points into 2-D for exploration.
          </li>
          <li>
            <span className="aiml-embed__tag">Density</span>
            Contours reveal topic clusters and sparse outlier regions.
          </li>
          <li>
            <span className="aiml-embed__tag">k-NN</span>
            Click any point to see its semantic neighbors instantly.
          </li>
          <li>
            <span className="aiml-embed__tag">Filter</span>
            Cross-filter by metadata to debug retrieval quality.
          </li>
        </ul>
        <p className="aiml-muted">
          Load a sample dataset in the embed below, then pan, zoom, and inspect
          how semantically similar documents cluster together.
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
          title="Embedding Atlas by Apple"
          src={EMBED_URL}
          className="aiml-embed__frame"
          sandbox="allow-scripts allow-same-origin allow-popups"
          loading="lazy"
        />
      </div>
    </div>
  );
}
