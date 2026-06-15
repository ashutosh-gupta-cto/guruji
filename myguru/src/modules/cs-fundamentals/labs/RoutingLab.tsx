import RoutingViz from '../routing/RoutingViz';
import '../cs-fundamentals.css';

export default function RoutingLab() {
  return (
    <div className="csf-lab">
      <header className="csf-lab__header">
        <p className="csf-lab__eyebrow">CS Fundamentals</p>
        <h2 className="csf-lab__title">Network Routing</h2>
        <p className="csf-lab__desc">
          Run Dijkstra&apos;s algorithm step by step — relax edges, update distance tables, and
          trace the shortest path.
        </p>
      </header>
      <div className="csf-panel">
        <RoutingViz />
      </div>
      <p className="csf-lab__attribution">
        Routing visualization from{' '}
        <a
          href="https://github.com/G-Amar/Network-Routing-Visualized"
          target="_blank"
          rel="noreferrer"
        >
          G-Amar/Network-Routing-Visualized
        </a>
        .
      </p>
    </div>
  );
}
