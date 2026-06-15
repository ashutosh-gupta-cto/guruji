import { OsSimulatorEmbed } from '../os-simulator/OsSimulatorEmbed';
import '../cs-fundamentals.css';

export default function OsSimulatorLab() {
  return (
    <div className="csf-lab">
      <header className="csf-lab__header">
        <p className="csf-lab__eyebrow">CS Fundamentals</p>
        <h2 className="csf-lab__title">OS Memory Simulator</h2>
        <p className="csf-lab__desc">
          Translate virtual addresses into page numbers and offsets, then compare FIFO,
          LRU, and OPT page replacement on a reference string.
        </p>
      </header>
      <div className="csf-panel">
        <OsSimulatorEmbed />
      </div>
      <p className="csf-lab__attribution">
        Paging concepts from{' '}
        <a
          href="https://github.com/Ayushkumar418/OS_SIMULATOR-Web_App"
          target="_blank"
          rel="noreferrer"
        >
          Ayushkumar418/OS_SIMULATOR-Web_App
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
