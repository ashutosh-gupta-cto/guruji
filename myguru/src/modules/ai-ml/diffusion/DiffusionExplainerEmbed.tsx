import { ExternalLink } from 'lucide-react';

const EMBED_URL = 'https://poloclub.github.io/diffusion-explainer/';

export function DiffusionExplainerEmbed() {
  return (
    <div className="aiml-embed">
      <aside className="aiml-embed__intro">
        <h3>How Diffusion Models Work</h3>
        <p>
          Diffusion models learn to generate images by reversing a noise process —
          gradually denoising random pixels into coherent structure. This approach
          powers Stable Diffusion, DALL·E, and modern image synthesis.
        </p>
        <ul className="aiml-embed__list">
          <li>
            <span className="aiml-embed__tag">Forward</span>
            Training adds Gaussian noise step-by-step until the image is pure noise.
          </li>
          <li>
            <span className="aiml-embed__tag">Reverse</span>
            A U-Net predicts and removes noise conditioned on a text prompt.
          </li>
          <li>
            <span className="aiml-embed__tag">Timestep</span>
            Each denoising step operates at a specific noise level t.
          </li>
          <li>
            <span className="aiml-embed__tag">Guidance</span>
            Classifier-free guidance steers generation toward the prompt.
          </li>
        </ul>
        <p className="aiml-muted">
          Use the interactive explainer below to scrub through denoising steps and
          see how latent pixels converge into a final image.
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
          title="Diffusion Explainer by Georgia Tech Polo Club"
          src={EMBED_URL}
          className="aiml-embed__frame"
          sandbox="allow-scripts allow-same-origin allow-popups"
          loading="lazy"
        />
      </div>
    </div>
  );
}
