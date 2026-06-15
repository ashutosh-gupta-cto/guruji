import { ExternalLink } from 'lucide-react';

import '../cs-fundamentals.css';

const EMBED_URL = 'https://learngitbranching.js.org/';

export function GitGameEmbed() {
  return (
    <div className="csf-embed">
      <aside className="csf-embed__intro">
        <h3>Learn Git Branching</h3>
        <p>
          Git history is a directed acyclic graph of commits. Branches are movable pointers,
          and commands like merge, rebase, and cherry-pick reshape that graph.
        </p>
        <ul className="csf-embed__list">
          <li>
            <span className="csf-embed__tag">Commit</span>
            Snapshot your working tree and link it to a parent commit.
          </li>
          <li>
            <span className="csf-embed__tag">Branch</span>
            Create parallel lines of development from any commit.
          </li>
          <li>
            <span className="csf-embed__tag">Merge</span>
            Combine branch histories — fast-forward or merge commit.
          </li>
          <li>
            <span className="csf-embed__tag">Rebase</span>
            Replay commits onto a new base for linear history.
          </li>
        </ul>
        <p className="csf-embed__hint">
          Work through the sandbox levels below. Type git commands in the terminal and watch
          the commit graph update in real time.
        </p>
        <a
          href={EMBED_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="csf-embed__link"
        >
          <ExternalLink size={14} />
          Open in new tab
        </a>
      </aside>
      <div className="csf-embed__frame-wrap">
        <iframe
          title="Learn Git Branching by Peter Cottle"
          src={EMBED_URL}
          className="csf-embed__frame"
          sandbox="allow-scripts allow-same-origin allow-popups"
          loading="lazy"
        />
      </div>
    </div>
  );
}
