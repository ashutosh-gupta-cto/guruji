/**
 * Compilers lab — lex through codegen phases.
 */
import CompilerPhases from '../compiler-phases/CompilerPhases';
import '../cs-fundamentals.css';

export default function CompilersLab() {
  return (
    <div className="csf-lab">
      <header className="csf-lab__header">
        <p className="csf-lab__eyebrow">CS Fundamentals</p>
        <h2 className="csf-lab__title">How Compilers Work</h2>
        <p className="csf-lab__desc">
          Step through lexical analysis, parsing, semantic checks, intermediate
          code, optimization, and assembly generation.
        </p>
      </header>

      <div className="csf-panel">
        <CompilerPhases />
      </div>

      <p className="csf-lab__attribution">
        Compiler phases ported from{' '}
        <a
          href="https://github.com/danielace1/compiler-visualizer"
          target="_blank"
          rel="noreferrer"
        >
          danielace1/compiler-visualizer
        </a>
        .
      </p>
    </div>
  );
}
