/**
 * Step-through compiler phase visualizer.
 *
 * Ported from danielace1/compiler-visualizer — lexical analysis through
 * code generation, using a local parser (no API keys).
 *
 * @see https://github.com/danielace1/compiler-visualizer
 */

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { analyzeCode, SAMPLE_SNIPPETS, type AstNode, type CompilerPhases } from './compiler';

const PHASES = [
  { id: 'lex', title: 'Lexical Analysis', desc: 'Break source into tokens' },
  { id: 'parse', title: 'Syntax Analysis', desc: 'Build an abstract syntax tree' },
  { id: 'semantic', title: 'Semantic Analysis', desc: 'Type check and symbol table' },
  { id: 'tac', title: 'Intermediate Code', desc: 'Three-address code generation' },
  { id: 'opt', title: 'Optimization', desc: 'Reduce temporaries' },
  { id: 'codegen', title: 'Code Generation', desc: 'Target assembly output' },
] as const;

type PhaseId = (typeof PHASES)[number]['id'];

function AstTree({ node, depth = 0 }: { node: AstNode; depth?: number }) {
  return (
    <div className="cp-ast-node" style={{ marginLeft: depth * 16 }}>
      <span className={`cp-ast-type cp-ast-type--${node.attributes.type}`}>{node.attributes.label}</span>
      <span className="cp-ast-name">{node.name}</span>
      {node.children?.map((child, i) => (
        <AstTree key={`${child.name}-${i}`} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

function PhaseContent({ phase, data }: { phase: PhaseId; data: CompilerPhases }) {
  switch (phase) {
    case 'lex':
      return (
        <div className="cp-token-grid">
          {data.tokens.map((tok, i) => (
            <span key={i} className="cp-token">
              {tok}
            </span>
          ))}
        </div>
      );
    case 'parse':
      return <AstTree node={data.treeData} />;
    case 'semantic':
      return (
        <div className="cp-semantic">
          <p className="cp-type-ok">{data.semanticAnalysis.typeChecking}</p>
          <table className="cp-sym-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Scope</th>
              </tr>
            </thead>
            <tbody>
              {data.semanticAnalysis.symbolTable.map((s) => (
                <tr key={s.name}>
                  <td>{s.name}</td>
                  <td>
                    <span className="cp-type-badge">{s.type}</span>
                  </td>
                  <td>{s.scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'tac':
      return (
        <pre className="cp-code">
          {data.intermediateCode.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </pre>
      );
    case 'opt':
      return (
        <div className="cp-opt">
          <div className="cp-opt-col">
            <span className="csf-label">Before</span>
            <pre className="cp-code cp-code--dim">
              {data.intermediateCode.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </pre>
          </div>
          <div className="cp-opt-col">
            <span className="csf-label">After</span>
            <pre className="cp-code">
              {data.optimizedCode.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </pre>
          </div>
        </div>
      );
    case 'codegen':
      return (
        <pre className="cp-code cp-code--asm">
          {data.assemblyCode.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </pre>
      );
  }
}

export default function CompilerPhases() {
  const [code, setCode] = useState(SAMPLE_SNIPPETS[0]);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [analyzed, setAnalyzed] = useState(false);

  const result = useMemo(() => (analyzed ? analyzeCode(code) : null), [analyzed, code]);
  const currentPhase = PHASES[phaseIndex];

  const runAnalysis = () => {
    setAnalyzed(true);
    setPhaseIndex(0);
  };

  return (
    <div className="cp-root">
      <label className="csf-label">Source expression</label>
      <textarea
        className="csf-input cp-textarea"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setAnalyzed(false);
        }}
        rows={2}
      />

      <div className="csf-toolbar">
        <button type="button" className="csf-btn csf-btn--primary" onClick={runAnalysis}>
          <Play size={14} />
          Analyze
        </button>
        {SAMPLE_SNIPPETS.map((snippet) => (
          <button
            key={snippet}
            type="button"
            className="csf-btn"
            onClick={() => {
              setCode(snippet);
              setAnalyzed(false);
            }}
          >
            {snippet.slice(0, 18)}…
          </button>
        ))}
      </div>

      {result && (
        <>
          <div className="cp-phase-nav">
            {PHASES.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className={`cp-phase-btn${phaseIndex === i ? ' cp-phase-btn--active' : ''}${i <= phaseIndex ? ' cp-phase-btn--visited' : ''}`}
                onClick={() => setPhaseIndex(i)}
              >
                <span className="cp-phase-num">{i + 1}</span>
                {p.title}
              </button>
            ))}
          </div>

          <div className="cp-phase-panel">
            <h3>{currentPhase.title}</h3>
            <p className="cp-phase-desc">{currentPhase.desc}</p>
            <PhaseContent phase={currentPhase.id} data={result} />
          </div>

          <div className="cp-step-nav">
            <button
              type="button"
              className="csf-btn"
              disabled={phaseIndex === 0}
              onClick={() => setPhaseIndex((i) => i - 1)}
            >
              <ChevronLeft size={14} />
              Previous phase
            </button>
            <span className="cp-step-indicator">
              Phase {phaseIndex + 1} of {PHASES.length}
            </span>
            <button
              type="button"
              className="csf-btn csf-btn--primary"
              disabled={phaseIndex === PHASES.length - 1}
              onClick={() => setPhaseIndex((i) => i + 1)}
            >
              Next phase
              <ChevronRight size={14} />
            </button>
          </div>
        </>
      )}

      {!result && (
        <p className="cp-hint">Enter an expression and click Analyze to step through compiler phases.</p>
      )}

      <style>{`
        .cp-root { display: flex; flex-direction: column; gap: 0.75rem; }
        .cp-textarea { resize: vertical; min-height: 3rem; font-family: var(--csf-mono); }
        .cp-phase-nav { display: flex; flex-wrap: wrap; gap: 0.35rem; }
        .cp-phase-btn { display: flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.65rem; border-radius: 8px; border: 1px solid var(--csf-border); background: var(--csf-bg-elev); color: var(--csf-fg-muted); font-size: 0.7rem; cursor: pointer; font-family: inherit; }
        .cp-phase-btn--visited { border-color: var(--csf-border-strong); }
        .cp-phase-btn--active { border-color: var(--csf-purple); background: var(--csf-purple-dim); color: var(--csf-purple); }
        .cp-phase-num { width: 1.1rem; height: 1.1rem; border-radius: 50%; background: var(--csf-bg-card); display: inline-flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; }
        .cp-phase-panel { background: var(--csf-bg-elev); border: 1px solid var(--csf-border); border-radius: 10px; padding: 1rem; min-height: 180px; }
        .cp-phase-panel h3 { font-size: 0.95rem; margin-bottom: 0.25rem; }
        .cp-phase-desc { font-size: 0.8rem; color: var(--csf-fg-muted); margin-bottom: 0.75rem; }
        .cp-token-grid { display: flex; flex-wrap: wrap; gap: 0.35rem; }
        .cp-token { font-family: var(--csf-mono); font-size: 0.8rem; padding: 0.25rem 0.5rem; background: var(--csf-bg-card); border: 1px solid var(--csf-border); border-radius: 4px; }
        .cp-ast-node { font-family: var(--csf-mono); font-size: 0.8rem; margin-bottom: 0.2rem; }
        .cp-ast-type { font-size: 0.65rem; padding: 0.1rem 0.35rem; border-radius: 3px; margin-right: 0.35rem; }
        .cp-ast-type--operator { background: var(--csf-purple-dim); color: var(--csf-purple); }
        .cp-ast-type--identifier { background: var(--csf-cyan-dim); color: var(--csf-cyan); }
        .cp-ast-type--literal { background: var(--csf-teal-dim); color: var(--csf-teal); }
        .cp-ast-name { color: var(--csf-fg); }
        .cp-type-ok { color: var(--csf-green); font-size: 0.85rem; margin-bottom: 0.75rem; }
        .cp-sym-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        .cp-sym-table th, .cp-sym-table td { border: 1px solid var(--csf-border); padding: 0.4rem 0.6rem; text-align: left; }
        .cp-sym-table th { background: var(--csf-bg-card); color: var(--csf-fg-muted); }
        .cp-type-badge { background: var(--csf-purple-dim); color: var(--csf-purple); padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.7rem; }
        .cp-code { font-family: var(--csf-mono); font-size: 0.8rem; line-height: 1.6; margin: 0; }
        .cp-code--dim { opacity: 0.5; }
        .cp-code--asm { color: var(--csf-green); }
        .cp-opt { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 600px) { .cp-opt { grid-template-columns: 1fr; } }
        .cp-step-nav { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; }
        .cp-step-indicator { font-size: 0.75rem; color: var(--csf-fg-muted); }
        .cp-hint { font-size: 0.85rem; color: var(--csf-fg-faint); text-align: center; padding: 2rem; }
      `}</style>
    </div>
  );
}
