import { CpuArchEmbed } from '../cpu-arch/CpuArchEmbed';
import '../cs-fundamentals.css';

export default function CpuArchLab() {
  return (
    <div className="csf-lab">
      <header className="csf-lab__header">
        <p className="csf-lab__eyebrow">CS Fundamentals</p>
        <h2 className="csf-lab__title">CPU Architecture</h2>
        <p className="csf-lab__desc">
          Explore RISC-V assembly execution — registers, memory, pipeline stages, and
          cache behavior in a visual simulator.
        </p>
      </header>
      <CpuArchEmbed />
      <p className="csf-lab__attribution">
        Powered by{' '}
        <a href="https://github.com/mortbopet/Ripes" target="_blank" rel="noreferrer">
          mortbopet/Ripes
        </a>
        .
      </p>
    </div>
  );
}
