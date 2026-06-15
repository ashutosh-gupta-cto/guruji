/**
 * Networking lab — DNS resolution through HTTP.
 */
import DnsFlow from '../dns-flow/DnsFlow';
import '../cs-fundamentals.css';

export default function NetworkingLab() {
  return (
    <div className="csf-lab">
      <header className="csf-lab__header">
        <p className="csf-lab__eyebrow">CS Fundamentals</p>
        <h2 className="csf-lab__title">Networking Stack</h2>
        <p className="csf-lab__desc">
          Trace a request from browser cache through DNS, TCP, TLS, and HTTP —
          step by step with a live protocol log.
        </p>
      </header>

      <div className="csf-panel">
        <DnsFlow />
      </div>

      <p className="csf-lab__attribution">
        DNS flow inspired by{' '}
        <a href="https://github.com/jsg0000/dns-trace" target="_blank" rel="noreferrer">
          jsg0000/dns-trace
        </a>
        .
      </p>
    </div>
  );
}
