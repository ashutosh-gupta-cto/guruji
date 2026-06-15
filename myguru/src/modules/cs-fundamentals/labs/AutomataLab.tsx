import RegexAutomataViz from '../automata/RegexAutomataViz';
import '../cs-fundamentals.css';

export default function AutomataLab() {
  return (
    <div className="csf-lab">
      <header className="csf-lab__header">
        <p className="csf-lab__eyebrow">CS Fundamentals</p>
        <h2 className="csf-lab__title">Regex &amp; Automata</h2>
        <p className="csf-lab__desc">
          Build an NFA from a regular expression using Thompson construction — see ε-transitions,
          union, and Kleene star.
        </p>
      </header>
      <div className="csf-panel">
        <RegexAutomataViz />
      </div>
      <p className="csf-lab__attribution">
        Automata construction inspired by{' '}
        <a href="https://github.com/Royal-lobster/stateforge" target="_blank" rel="noreferrer">
          Royal-lobster/stateforge
        </a>{' '}
        and{' '}
        <a href="https://github.com/AmirHossein812002/Regex2FA" target="_blank" rel="noreferrer">
          AmirHossein812002/Regex2FA
        </a>
        .
      </p>
    </div>
  );
}
