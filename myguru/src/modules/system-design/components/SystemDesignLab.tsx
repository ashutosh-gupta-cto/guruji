/**
 * Tabbed interface for system design simulators.
 */

import { useState } from 'react';
import { ConsistentHashingSimulator } from '../consistent-hashing/ConsistentHashingSimulator';
import { LoadBalancerSimulator } from '../load-balancer/LoadBalancerSimulator';
import { ArchitectureSimulator } from '../drag-drop/ArchitectureSimulator';
import './system-design-lab.css';

type TabId = 'hashing' | 'load-balancer' | 'architecture';

const TABS: { id: TabId; label: string; description: string }[] = [
  {
    id: 'hashing',
    label: 'Consistent Hashing',
    description: 'Hash ring with virtual nodes — ionmx/consistent-hashing-simulator',
  },
  {
    id: 'load-balancer',
    label: 'Load Balancer',
    description: 'Particle traffic sim — pronzzz/sysarch-interactive',
  },
  {
    id: 'architecture',
    label: 'Architecture Canvas',
    description: 'Drag-drop builder — ozers/system-design-canvas',
  },
];

export function SystemDesignLab() {
  const [activeTab, setActiveTab] = useState<TabId>('hashing');

  return (
    <div className="sdl-lab">
      <header className="sdl-header">
        <h1>System Design Lab</h1>
        <p>Interactive simulators ported from open-source visualizers</p>
      </header>

      <nav className="sdl-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`sdl-tab ${activeTab === tab.id ? 'sdl-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <p className="sdl-tab-desc">
        {TABS.find((t) => t.id === activeTab)?.description}
      </p>

      <div className="sdl-panel" role="tabpanel">
        {activeTab === 'hashing' && <ConsistentHashingSimulator />}
        {activeTab === 'load-balancer' && <LoadBalancerSimulator />}
        {activeTab === 'architecture' && <ArchitectureSimulator />}
      </div>

      <footer className="sdl-attribution">
        Sources:{' '}
        <a href="https://github.com/ionmx/consistent-hashing-simulator" target="_blank" rel="noreferrer">
          ionmx/consistent-hashing-simulator
        </a>
        {' · '}
        <a href="https://github.com/pronzzz/sysarch-interactive" target="_blank" rel="noreferrer">
          pronzzz/sysarch-interactive
        </a>
        {' · '}
        <a href="https://github.com/ozers/system-design-canvas" target="_blank" rel="noreferrer">
          ozers/system-design-canvas
        </a>
      </footer>
    </div>
  );
}
