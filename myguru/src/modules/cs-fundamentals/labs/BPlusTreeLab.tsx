import BPlusTreeViz from '../bplus-tree/BPlusTreeViz';
import '../cs-fundamentals.css';

export default function BPlusTreeLab() {
  return (
    <div className="csf-lab">
      <header className="csf-lab__header">
        <p className="csf-lab__eyebrow">CS Fundamentals</p>
        <h2 className="csf-lab__title">B+ Tree Index</h2>
        <p className="csf-lab__desc">
          Step through insert, find, and delete on a B+ tree — the index structure behind
          InnoDB and most databases.
        </p>
      </header>
      <div className="csf-panel">
        <BPlusTreeViz />
      </div>
      <p className="csf-lab__attribution">
        B+ tree logic from{' '}
        <a href="https://github.com/Yusux/BPlusTreeVisualizer" target="_blank" rel="noreferrer">
          Yusux/BPlusTreeVisualizer
        </a>
        .
      </p>
    </div>
  );
}
