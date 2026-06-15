import { GitGameEmbed } from '../git-game/GitGameEmbed';
import '../cs-fundamentals.css';

export default function GitGameLab() {
  return (
    <div className="csf-lab">
      <header className="csf-lab__header">
        <p className="csf-lab__eyebrow">CS Fundamentals</p>
        <h2 className="csf-lab__title">Git Branching Game</h2>
        <p className="csf-lab__desc">
          Master git through interactive levels — commit, branch, merge, rebase, and
          cherry-pick on a live commit graph.
        </p>
      </header>
      <GitGameEmbed />
      <p className="csf-lab__attribution">
        Powered by{' '}
        <a href="https://github.com/pcottle/learnGitBranching" target="_blank" rel="noreferrer">
          pcottle/learnGitBranching
        </a>
        .
      </p>
    </div>
  );
}
