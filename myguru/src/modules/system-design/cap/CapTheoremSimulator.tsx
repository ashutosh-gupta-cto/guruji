/**
 * CAP theorem CP vs AP partition demo.
 * Inspired by dice-dydakt/capdemo (Hazelcast CP/AP exercises)
 * @see https://github.com/dice-dydakt/capdemo
 */

import { useCallback, useState } from 'react';
import './cap.css';

type CapMode = 'cp' | 'ap';

interface NodeState {
  id: number;
  value: number;
  isolated: boolean;
}

function initialNodes(): NodeState[] {
  return [
    { id: 1, value: 0, isolated: false },
    { id: 2, value: 0, isolated: false },
    { id: 3, value: 0, isolated: false },
  ];
}

export function CapTheoremSimulator() {
  const [mode, setMode] = useState<CapMode>('cp');
  const [nodes, setNodes] = useState<NodeState[]>(initialNodes);
  const [partitioned, setPartitioned] = useState(false);
  const [log, setLog] = useState<string[]>([
    'Cluster ready. CP = consistency over availability during partition.',
  ]);

  const appendLog = useCallback((msg: string, kind: 'ok' | 'error' | 'info' = 'info') => {
    setLog((prev) => [...prev.slice(-11), `[${kind}] ${msg}`]);
  }, []);

  const majorityNodes = nodes.filter((n) => !n.isolated);
  const isolatedNode = nodes.find((n) => n.isolated);

  const increment = (nodeId: number) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;

    if (partitioned && mode === 'cp') {
      if (target.isolated) {
        appendLog(`CP: Node ${nodeId} isolated — increment rejected (no quorum).`, 'error');
        return;
      }
      const nextVal = majorityNodes[0]?.value ?? 0;
      const newVal = nextVal + 1;
      setNodes((prev) =>
        prev.map((n) => (n.isolated ? n : { ...n, value: newVal })),
      );
      appendLog(`CP: Increment on node ${nodeId} → ${newVal} (majority quorum).`, 'ok');
      return;
    }

    if (partitioned && mode === 'ap') {
      const newVal = target.value + 1;
      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, value: newVal } : n)),
      );
      appendLog(`AP: Node ${nodeId} incremented locally → ${newVal} (available, may diverge).`, 'ok');
      return;
    }

    const newVal = nodes[0].value + 1;
    setNodes((prev) => prev.map((n) => ({ ...n, value: newVal })));
    appendLog(`Increment → ${newVal} on all nodes (consistent).`, 'ok');
  };

  const read = (nodeId: number) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;

    if (partitioned && mode === 'cp' && target.isolated) {
      appendLog(`CP: Read from isolated node ${nodeId} — error (no quorum).`, 'error');
      return;
    }

    appendLog(`Read node ${nodeId}: value = ${target.value}`, 'ok');
  };

  const startPartition = () => {
    setPartitioned(true);
    setNodes((prev) =>
      prev.map((n, i) => ({ ...n, isolated: i === 0 })),
    );
    appendLog('Network partition: Node 1 isolated from Nodes 2 & 3.', 'info');
  };

  const healPartition = () => {
    if (mode === 'cp') {
      const merged = Math.max(...nodes.map((n) => n.value));
      setNodes((prev) => prev.map((n) => ({ ...n, value: merged, isolated: false })));
      appendLog(`CP: Partition healed. Values merged to ${merged} (consistent).`, 'ok');
    } else {
      const sum = nodes.reduce((acc, n) => acc + n.value, 0);
      setNodes((prev) =>
        prev.map((n) => ({ ...n, value: sum, isolated: false })),
      );
      appendLog(`AP: Partition healed. CRDT-style merge → total ${sum} (eventual consistency).`, 'ok');
    }
    setPartitioned(false);
  };

  const reset = () => {
    setNodes(initialNodes());
    setPartitioned(false);
    setLog(['Cluster reset.']);
  };

  const switchMode = (next: CapMode) => {
    setMode(next);
    reset();
    appendLog(
      next === 'cp'
        ? 'CP mode: rejects ops without quorum during partition.'
        : 'AP mode: accepts local writes; values may diverge.',
    );
  };

  return (
    <div className="cap-viz">
      <header className="cap-viz__header">
        <h2>CAP Theorem Demo</h2>
        <p>Toggle CP vs AP behavior during network partition — inspired by dice-dydakt/capdemo</p>
      </header>

      <div className="cap-viz__mode-toggle">
        <button
          type="button"
          className={`cap-viz__mode-btn${mode === 'cp' ? ' cap-viz__mode-btn--active cp' : ''}`}
          onClick={() => switchMode('cp')}
        >
          CP — Consistency + Partition tolerance
        </button>
        <button
          type="button"
          className={`cap-viz__mode-btn${mode === 'ap' ? ' cap-viz__mode-btn--active ap' : ''}`}
          onClick={() => switchMode('ap')}
        >
          AP — Availability + Partition tolerance
        </button>
      </div>

      <div className="cap-viz__controls">
        <button type="button" className="cap-viz__btn" onClick={() => increment(1)}>
          Inc Node 1
        </button>
        <button type="button" className="cap-viz__btn" onClick={() => increment(2)}>
          Inc Node 2
        </button>
        <button type="button" className="cap-viz__btn" onClick={() => increment(3)}>
          Inc Node 3
        </button>
        <button type="button" className="cap-viz__btn" onClick={() => read(1)}>
          Read All
        </button>
        {!partitioned ? (
          <button type="button" className="cap-viz__btn cap-viz__btn--danger" onClick={startPartition}>
            Partition
          </button>
        ) : (
          <button type="button" className="cap-viz__btn cap-viz__btn--success" onClick={healPartition}>
            Heal
          </button>
        )}
        <button type="button" className="cap-viz__btn" onClick={reset}>
          Reset
        </button>
      </div>

      {partitioned ? (
        <div className="cap-viz__cluster">
          <div className="cap-viz__node cap-viz__node--isolated">
            <div className="cap-viz__node-id">Node 1</div>
            <div className="cap-viz__node-value">{isolatedNode?.value ?? 0}</div>
            <div className="cap-viz__node-status">Isolated minority</div>
          </div>
          <div className="cap-viz__partition-line">NETWORK PARTITION</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {majorityNodes.map((n) => (
              <div key={n.id} className="cap-viz__node cap-viz__node--majority">
                <div className="cap-viz__node-id">Node {n.id}</div>
                <div className="cap-viz__node-value">{n.value}</div>
                <div className="cap-viz__node-status">Majority quorum</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="cap-viz__cluster">
          {nodes.map((n) => (
            <div key={n.id} className="cap-viz__node">
              <div className="cap-viz__node-id">Node {n.id}</div>
              <div className="cap-viz__node-value">{n.value}</div>
              <div className="cap-viz__node-status">Connected</div>
            </div>
          ))}
        </div>
      )}

      <div className="cap-viz__log">
        {log.map((entry, i) => (
          <div
            key={`${i}-${entry}`}
            className={
              entry.includes('[error]')
                ? 'cap-viz__log-entry--error'
                : entry.includes('[ok]')
                  ? 'cap-viz__log-entry--ok'
                  : undefined
            }
          >
            {entry.replace(/^\[(ok|error|info)\]\s*/, '')}
          </div>
        ))}
      </div>
    </div>
  );
}
