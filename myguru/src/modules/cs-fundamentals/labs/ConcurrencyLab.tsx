/**
 * Concurrency lab — branching and parallel development via git graph.
 */
import GitGraph from '../git-graph/GitGraph';
import '../cs-fundamentals.css';

export default function ConcurrencyLab() {
  return (
    <div className="csf-lab">
      <header className="csf-lab__header">
        <p className="csf-lab__eyebrow">CS Fundamentals</p>
        <h2 className="csf-lab__title">Concurrency Basics</h2>
        <p className="csf-lab__desc">
          Explore how parallel workstreams interact — branch, commit, checkout, merge, rebase,
          and cherry-pick on an interactive commit graph.
        </p>
      </header>

      <div className="csf-panel">
        <GitGraph />
      </div>

      <p className="csf-lab__attribution">
        Git graph inspired by{' '}
        <a href="https://github.com/pcottle/learnGitBranching" target="_blank" rel="noreferrer">
          pcottle/learnGitBranching
        </a>{' '}
        and explain-git-with-d3.
      </p>
    </div>
  );
}
