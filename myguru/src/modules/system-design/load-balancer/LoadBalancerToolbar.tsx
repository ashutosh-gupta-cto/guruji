/**
 * Draggable node palette for load balancer sim.
 * Ported from pronzzz/sysarch-interactive (src/components/Toolbar.tsx)
 * @see https://github.com/pronzzz/sysarch-interactive
 */

import type { DragEvent } from 'react';
import type { NodeType } from './types';

const tools: { type: NodeType; label: string; color: string }[] = [
  { type: 'CLIENT', label: 'Client', color: '#3b82f6' },
  { type: 'LOAD_BALANCER', label: 'Load Balancer', color: '#a855f7' },
  { type: 'SERVER', label: 'Server', color: '#6366f1' },
  { type: 'DATABASE', label: 'Database', color: '#10b981' },
  { type: 'CACHE', label: 'Cache', color: '#f59e0b' },
];

export function LoadBalancerToolbar() {
  const handleDragStart = (e: DragEvent, type: NodeType) => {
    e.dataTransfer.setData('nodeType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="lb-toolbar">
      <div className="lb-toolbar-logo">LB</div>
      {tools.map((tool) => (
        <div
          key={tool.type}
          draggable
          onDragStart={(e) => handleDragStart(e, tool.type)}
          className="lb-tool"
          title={tool.label}
        >
          <div className="lb-tool-icon" style={{ background: tool.color }}>
            {tool.label[0]}
          </div>
        </div>
      ))}
    </div>
  );
}
