/**
 * Memory Model lab — number representation and virtual memory.
 */
import { useState } from 'react';
import BinaryConverter from '../binary-converter/BinaryConverter';
import PageReplacement from '../page-replacement/PageReplacement';
import '../cs-fundamentals.css';

type Tab = 'numbers' | 'pages';

export default function MemoryModelLab() {
  const [tab, setTab] = useState<Tab>('numbers');

  return (
    <div className="csf-lab">
      <header className="csf-lab__header">
        <p className="csf-lab__eyebrow">CS Fundamentals</p>
        <h2 className="csf-lab__title">Memory Model</h2>
        <p className="csf-lab__desc">
          See how values are stored in binary and hex, then simulate FIFO/LRU page
          replacement when physical frames are scarce.
        </p>
      </header>

      <nav className="csf-lab__tabs" aria-label="Memory model modules">
        <button
          type="button"
          className={`csf-lab__tab${tab === 'numbers' ? ' csf-lab__tab--active' : ''}`}
          onClick={() => setTab('numbers')}
        >
          Number systems
        </button>
        <button
          type="button"
          className={`csf-lab__tab${tab === 'pages' ? ' csf-lab__tab--active' : ''}`}
          onClick={() => setTab('pages')}
        >
          Page replacement
        </button>
      </nav>

      <div className="csf-panel">
        {tab === 'numbers' ? <BinaryConverter /> : <PageReplacement />}
      </div>

      <p className="csf-lab__attribution">
        Number converter inspired by{' '}
        <a href="https://github.com/solst-ice/bin-hex-dec" target="_blank" rel="noreferrer">
          solst-ice/bin-hex-dec
        </a>
        . Page replacement from{' '}
        <a
          href="https://github.com/MUMEi-28/VirtualMemorySimulator"
          target="_blank"
          rel="noreferrer"
        >
          MUMEi-28/VirtualMemorySimulator
        </a>
        .
      </p>
    </div>
  );
}
