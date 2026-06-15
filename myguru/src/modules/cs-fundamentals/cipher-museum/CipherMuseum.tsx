/**
 * Interactive classic cipher demos — curated subset from cipher-museum.
 */

import { useMemo, useState } from 'react';

import {
  CIPHER_CATALOG,
  type CipherId,
  runCipher,
} from './ciphers';

export default function CipherMuseum() {
  const [cipherId, setCipherId] = useState<CipherId>('caesar');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [plaintext, setPlaintext] = useState('ATTACK AT DAWN');
  const [key, setKey] = useState('3');

  const meta = CIPHER_CATALOG.find((c) => c.id === cipherId)!;

  const output = useMemo(
    () => runCipher(cipherId, plaintext, key, mode),
    [cipherId, plaintext, key, mode],
  );

  function selectCipher(id: CipherId) {
    const next = CIPHER_CATALOG.find((c) => c.id === id)!;
    setCipherId(id);
    setPlaintext(next.demoPlaintext);
    setKey(next.defaultKey ?? '');
    if (id === 'rot13' || id === 'atbash' || id === 'enigma') setMode('encode');
  }

  return (
    <div className="cm-root">
      <div className="cm-gallery">
        {CIPHER_CATALOG.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`cm-card${cipherId === c.id ? ' cm-card--active' : ''}`}
            onClick={() => selectCipher(c.id)}
          >
            <span className="cm-card__era">{c.era}</span>
            <span className="cm-card__name">{c.name}</span>
          </button>
        ))}
      </div>

      <div className="cm-exhibit">
        <header className="cm-exhibit__header">
          <h3>{meta.name}</h3>
          <p>{meta.description}</p>
        </header>

        <div className="cm-controls">
          {cipherId !== 'rot13' && cipherId !== 'atbash' && cipherId !== 'enigma' && (
            <div className="cm-mode">
              <button
                type="button"
                className={`csf-btn${mode === 'encode' ? ' csf-btn--primary' : ''}`}
                onClick={() => setMode('encode')}
              >
                Encrypt
              </button>
              <button
                type="button"
                className={`csf-btn${mode === 'decode' ? ' csf-btn--primary' : ''}`}
                onClick={() => setMode('decode')}
              >
                Decrypt
              </button>
            </div>
          )}
          {meta.needsKey && (
            <div className="cm-field">
              <label className="csf-label" htmlFor="cipher-key">
                {meta.keyLabel}
              </label>
              <input
                id="cipher-key"
                className="csf-input"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={meta.keyPlaceholder}
              />
            </div>
          )}
        </div>

        <div className="cm-io">
          <div className="cm-field">
            <label className="csf-label" htmlFor="cipher-input">
              {mode === 'encode' ? 'Plaintext' : 'Ciphertext'}
            </label>
            <textarea
              id="cipher-input"
              className="csf-input cm-textarea"
              rows={3}
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
            />
          </div>
          <div className="cm-field">
            <span className="csf-label">Output</span>
            <output className="cm-output csf-mono">{output || '—'}</output>
          </div>
        </div>

        {cipherId === 'enigma' && (
          <p className="cm-hint">
            Simplified 3-rotor Enigma I (rotors I–II–III, reflector B). Set initial rotor
            positions; encryption is self-inverse when re-run with the same settings.
          </p>
        )}
      </div>

      <style>{`
        .cm-root { display: flex; flex-direction: column; gap: 1rem; }
        .cm-gallery { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .cm-card {
          display: flex; flex-direction: column; align-items: flex-start;
          padding: 0.55rem 0.75rem; border-radius: 8px;
          border: 1px solid var(--csf-border); background: var(--csf-bg-elev);
          cursor: pointer; font-family: inherit; text-align: left;
          transition: border-color 0.15s, background 0.15s;
        }
        .cm-card:hover { border-color: var(--csf-border-strong); }
        .cm-card--active { border-color: var(--csf-teal); background: var(--csf-teal-dim); }
        .cm-card__era { font-size: 0.65rem; color: var(--csf-fg-faint); text-transform: uppercase; letter-spacing: 0.06em; }
        .cm-card__name { font-size: 0.8rem; color: var(--csf-fg); font-weight: 600; margin-top: 0.15rem; }
        .cm-exhibit__header h3 { margin: 0 0 0.35rem; font-size: 1rem; }
        .cm-exhibit__header p { margin: 0; font-size: 0.82rem; color: var(--csf-fg-muted); line-height: 1.45; }
        .cm-controls { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: flex-end; margin: 0.75rem 0; }
        .cm-mode { display: flex; gap: 0.35rem; }
        .cm-field { flex: 1; min-width: 140px; }
        .cm-io { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        @media (max-width: 640px) { .cm-io { grid-template-columns: 1fr; } }
        .cm-textarea { resize: vertical; min-height: 4.5rem; font-family: var(--csf-mono); }
        .cm-output {
          display: block; padding: 0.55rem 0.75rem; border-radius: 8px;
          border: 1px solid var(--csf-border-strong); background: var(--csf-bg-elev);
          min-height: 4.5rem; font-size: 0.85rem; word-break: break-all;
        }
        .cm-hint { font-size: 0.75rem; color: var(--csf-fg-faint); margin: 0.5rem 0 0; line-height: 1.4; }
      `}</style>
    </div>
  );
}
