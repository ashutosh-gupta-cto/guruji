/**
 * Basic architecture canvas with draggable nodes.
 * Inspired by ozers/system-design-canvas (Canvas.tsx, NodePalette, node-registry)
 * @see https://github.com/ozers/system-design-canvas
 */

import { useCallback, useRef, useState, type DragEvent, type MouseEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ArchEdge, ArchNode, ArchNodeType } from './types';
import { NODE_META } from './types';
import './drag-drop.css';

const PALETTE_TYPES: ArchNodeType[] = [
  'CLIENT',
  'LOAD_BALANCER',
  'CACHE',
  'DATABASE',
  'QUEUE',
];

export function ArchitectureCanvas() {
  const [nodes, setNodes] = useState<ArchNode[]>([
    { id: 'n1', type: 'CLIENT', x: 80, y: 200, label: 'Client' },
    { id: 'n2', type: 'LOAD_BALANCER', x: 280, y: 200, label: 'Load Balancer' },
    { id: 'n3', type: 'CACHE', x: 480, y: 140, label: 'Cache' },
    { id: 'n4', type: 'DATABASE', x: 480, y: 260, label: 'Database' },
  ]);
  const [edges, setEdges] = useState<ArchEdge[]>([
    { id: 'e1', sourceId: 'n1', targetId: 'n2' },
    { id: 'e2', sourceId: 'n2', targetId: 'n3' },
    { id: 'e3', sourceId: 'n2', targetId: 'n4' },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addNode = (type: ArchNodeType, x: number, y: number) => {
    const meta = NODE_META[type];
    setNodes((prev) => [
      ...prev,
      { id: uuidv4(), type, x, y, label: meta.label },
    ]);
  };

  const handlePaletteDragStart = (e: DragEvent, type: ArchNodeType) => {
    e.dataTransfer.setData('archNodeType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasDrop = (e: DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('archNodeType') as ArchNodeType;
    if (!type || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    addNode(type, e.clientX - rect.left - 60, e.clientY - rect.top - 30);
  };

  const handleNodeMouseDown = (e: MouseEvent, node: ArchNode) => {
    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      id: node.id,
      offsetX: e.clientX - rect.left - node.x,
      offsetY: e.clientY - rect.top - node.y,
    };
    setSelectedId(node.id);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragRef.current.offsetX;
    const y = e.clientY - rect.top - dragRef.current.offsetY;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === dragRef.current!.id ? { ...n, x: Math.max(0, x), y: Math.max(0, y) } : n,
      ),
    );
  }, []);

  const handleMouseUp = () => {
    dragRef.current = null;
  };

  const handleNodeClick = (e: MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (!connectFrom) {
      setConnectFrom(nodeId);
    } else if (connectFrom === nodeId) {
      setConnectFrom(null);
    } else {
      const exists = edges.some(
        (ed) => ed.sourceId === connectFrom && ed.targetId === nodeId,
      );
      if (!exists) {
        setEdges((prev) => [
          ...prev,
          { id: uuidv4(), sourceId: connectFrom, targetId: nodeId },
        ]);
      }
      setConnectFrom(null);
    }
  };

  const removeSelected = () => {
    if (!selectedId) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedId));
    setEdges((prev) =>
      prev.filter((e) => e.sourceId !== selectedId && e.targetId !== selectedId),
    );
    setSelectedId(null);
    setConnectFrom(null);
  };

  const getNodeCenter = (id: string) => {
    const n = nodes.find((node) => node.id === id);
    return n ? { x: n.x + 60, y: n.y + 30 } : { x: 0, y: 0 };
  };

  return (
    <div className="arch-simulator">
      <aside className="arch-palette">
        <h3>Components</h3>
        {PALETTE_TYPES.map((type) => {
          const meta = NODE_META[type];
          return (
            <div
              key={type}
              className="arch-palette-item"
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, type)}
              style={{ borderColor: meta.color }}
            >
              <span className="arch-palette-dot" style={{ background: meta.color }} />
              {meta.label}
            </div>
          );
        })}
        <p className="arch-hint">Drag onto canvas. Click two nodes to connect.</p>
        {selectedId && (
          <button type="button" className="arch-delete-btn" onClick={removeSelected}>
            Delete selected
          </button>
        )}
      </aside>

      <div
        ref={canvasRef}
        className="arch-canvas"
        onDrop={handleCanvasDrop}
        onDragOver={(e) => e.preventDefault()}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => {
          setSelectedId(null);
          setConnectFrom(null);
        }}
      >
        <svg className="arch-edges">
          {edges.map((edge) => {
            const from = getNodeCenter(edge.sourceId);
            const to = getNodeCenter(edge.targetId);
            return (
              <line
                key={edge.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#64748b"
                strokeWidth={2}
                markerEnd="url(#arrow)"
              />
            );
          })}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
            </marker>
          </defs>
        </svg>

        {nodes.map((node) => {
          const meta = NODE_META[node.type];
          const isSelected = selectedId === node.id;
          const isConnect = connectFrom === node.id;
          return (
            <div
              key={node.id}
              className={`arch-node ${isSelected ? 'arch-node-selected' : ''} ${isConnect ? 'arch-node-connect' : ''}`}
              style={{
                left: node.x,
                top: node.y,
                borderColor: meta.color,
                background: meta.bg,
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onClick={(e) => handleNodeClick(e, node.id)}
            >
              <span className="arch-node-type" style={{ color: meta.color }}>
                {node.type.replace('_', ' ')}
              </span>
              <span className="arch-node-label">{node.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
