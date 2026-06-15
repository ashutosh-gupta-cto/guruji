/**
 * OS memory simulator — paging, address translation, and page replacement.
 *
 * Page replacement expanded from MUMEi-28/VirtualMemorySimulator; paging concepts
 * inspired by Ayushkumar418/OS_SIMULATOR-Web_App.
 */

import { useMemo, useState } from 'react';

import PageReplacement from '../page-replacement/PageReplacement';
import { translateAddress } from '../page-replacement/algorithms';
import '../cs-fundamentals.css';

type Tab = 'paging' | 'replacement';

export function OsSimulatorEmbed() {
  const [tab, setTab] = useState<Tab>('paging');
  const [virtualAddress, setVirtualAddress] = useState('4096');
  const [pageSize, setPageSize] = useState(1024);

  const translation = useMemo(() => {
    const addr = parseInt(virtualAddress, 10);
    if (Number.isNaN(addr) || addr < 0) return null;
    return translateAddress(addr, pageSize);
  }, [virtualAddress, pageSize]);

  return (
    <div className="os-sim">
      <nav className="csf-lab__tabs" aria-label="OS simulator modules">
        <button
          type="button"
          className={`csf-lab__tab${tab === 'paging' ? ' csf-lab__tab--active' : ''}`}
          onClick={() => setTab('paging')}
        >
          Address translation
        </button>
        <button
          type="button"
          className={`csf-lab__tab${tab === 'replacement' ? ' csf-lab__tab--active' : ''}`}
          onClick={() => setTab('replacement')}
        >
          Page replacement
        </button>
      </nav>

      {tab === 'paging' ? (
        <div className="os-paging">
          <p className="os-paging__desc">
            Virtual memory splits each address into a page number and offset. The MMU uses
            the page table to map virtual pages to physical frames.
          </p>
          <div className="os-paging__inputs">
            <div>
              <label className="csf-label" htmlFor="os-va">
                Virtual address (decimal)
              </label>
              <input
                id="os-va"
                className="csf-input"
                value={virtualAddress}
                onChange={(e) => setVirtualAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="csf-label" htmlFor="os-ps">
                Page size (bytes)
              </label>
              <select
                id="os-ps"
                className="csf-input"
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              >
                <option value={256}>256 B</option>
                <option value={512}>512 B</option>
                <option value={1024}>1 KB</option>
                <option value={4096}>4 KB</option>
              </select>
            </div>
          </div>

          {translation && (
            <div className="os-paging__result">
              <div className="os-paging__formula csf-mono">
                VA = page × page_size + offset
              </div>
              <dl className="os-paging__dl">
                <div>
                  <dt>Virtual address</dt>
                  <dd className="csf-mono">{translation.virtualAddress}</dd>
                </div>
                <div>
                  <dt>Page number</dt>
                  <dd className="csf-mono">{translation.pageNumber}</dd>
                </div>
                <div>
                  <dt>Offset</dt>
                  <dd className="csf-mono">{translation.offset}</dd>
                </div>
                <div>
                  <dt>Hex</dt>
                  <dd className="csf-mono">0x{translation.virtualAddress.toString(16).toUpperCase()}</dd>
                </div>
              </dl>
              <p className="os-paging__check csf-mono">
                {translation.pageNumber} × {translation.pageSize} + {translation.offset} ={' '}
                {translation.pageNumber * translation.pageSize + translation.offset}
              </p>
            </div>
          )}
        </div>
      ) : (
        <PageReplacement />
      )}

      <style>{`
        .os-sim { display: flex; flex-direction: column; gap: 0.75rem; }
        .os-paging__desc { font-size: 0.85rem; color: var(--csf-fg-muted); margin: 0 0 0.75rem; line-height: 1.45; }
        .os-paging__inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }
        @media (max-width: 540px) { .os-paging__inputs { grid-template-columns: 1fr; } }
        .os-paging__result { padding: 1rem; border-radius: 8px; border: 1px solid var(--csf-border); background: var(--csf-bg-elev); }
        .os-paging__formula { font-size: 0.8rem; color: var(--csf-teal); margin-bottom: 0.75rem; }
        .os-paging__dl { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin: 0; }
        @media (max-width: 640px) { .os-paging__dl { grid-template-columns: repeat(2, 1fr); } }
        .os-paging__dl dt { font-size: 0.7rem; color: var(--csf-fg-faint); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem; }
        .os-paging__dl dd { margin: 0; font-size: 1.1rem; color: var(--csf-fg); }
        .os-paging__check { font-size: 0.78rem; color: var(--csf-fg-muted); margin: 0.75rem 0 0; }
      `}</style>
    </div>
  );
}
