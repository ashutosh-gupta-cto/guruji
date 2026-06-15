import { ExternalLink } from 'lucide-react';

import '../cs-fundamentals.css';

const EMBED_URL = 'https://ripes.me/';

export function CpuArchEmbed() {
  return (
    <div className="csf-embed">
      <aside className="csf-embed__intro">
        <h3>RISC-V CPU Simulator</h3>
        <p>
          Ripes is a visual processor simulator for RISC-V. Step through assembly
          instructions and see how data moves between registers, memory, and the ALU.
        </p>
        <ul className="csf-embed__list">
          <li>
            <span className="csf-embed__tag">Registers</span>
            General-purpose x-registers and program counter.
          </li>
          <li>
            <span className="csf-embed__tag">Pipeline</span>
            Fetch-decode-execute stages with hazard visualization.
          </li>
          <li>
            <span className="csf-embed__tag">Memory</span>
            Load/store instructions read and write data segments.
          </li>
          <li>
            <span className="csf-embed__tag">Cache</span>
            Optional cache hierarchy for memory latency study.
          </li>
        </ul>
        <p className="csf-embed__hint">
          Load a sample program, single-step or run, and inspect register and memory
          state after each instruction.
        </p>
        <a
          href={EMBED_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="csf-embed__link"
        >
          <ExternalLink size={14} />
          Open Ripes in new tab
        </a>
      </aside>
      <div className="csf-embed__frame-wrap">
        <iframe
          title="Ripes RISC-V Simulator by mortbopet"
          src={EMBED_URL}
          className="csf-embed__frame"
          sandbox="allow-scripts allow-same-origin allow-popups"
          loading="lazy"
        />
      </div>
    </div>
  );
}
