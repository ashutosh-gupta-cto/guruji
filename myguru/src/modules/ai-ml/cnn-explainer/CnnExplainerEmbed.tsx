import { ExternalLink } from 'lucide-react';

const EMBED_URL = 'https://poloclub.github.io/cnn-explainer/';

export function CnnExplainerEmbed() {
  return (
    <div className="aiml-embed">
      <aside className="aiml-embed__intro">
        <h3>Convolutional Neural Networks</h3>
        <p>
          CNNs detect local patterns — edges, textures, shapes — by sliding
          learnable filters across an image. Stacked conv layers build
          hierarchical features from pixels to classes.
        </p>
        <ul className="aiml-embed__list">
          <li>
            <span className="aiml-embed__tag">Conv</span>
            A kernel multiplies a patch of pixels and sums the result.
          </li>
          <li>
            <span className="aiml-embed__tag">ReLU</span>
            Non-linearity keeps only positive activations.
          </li>
          <li>
            <span className="aiml-embed__tag">Pool</span>
            Down-sampling reduces spatial size and noise.
          </li>
          <li>
            <span className="aiml-embed__tag">Softmax</span>
            Final layer outputs class probabilities.
          </li>
        </ul>
        <p className="aiml-muted">
          Click through each layer in the embed below to watch a 2-D convolution
          animate over a digit image.
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
          title="CNN Explainer by Georgia Tech Polo Club"
          src={EMBED_URL}
          className="aiml-embed__frame"
          sandbox="allow-scripts allow-same-origin allow-popups"
          loading="lazy"
        />
      </div>
    </div>
  );
}
