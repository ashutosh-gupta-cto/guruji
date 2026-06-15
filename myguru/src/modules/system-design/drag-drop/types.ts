/**
 * Types for architecture drag-drop canvas.
 * Inspired by ozers/system-design-canvas node palette
 * @see https://github.com/ozers/system-design-canvas
 */

export type ArchNodeType = 'CLIENT' | 'LOAD_BALANCER' | 'CACHE' | 'DATABASE' | 'QUEUE';

export interface ArchNode {
  id: string;
  type: ArchNodeType;
  x: number;
  y: number;
  label: string;
}

export interface ArchEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

export const NODE_META: Record<
  ArchNodeType,
  { label: string; color: string; bg: string }
> = {
  CLIENT: { label: 'Client', color: '#7c3aed', bg: '#ede9fe' },
  LOAD_BALANCER: { label: 'Load Balancer', color: '#4f46e5', bg: '#e0e7ff' },
  CACHE: { label: 'Cache', color: '#d97706', bg: '#fef3c7' },
  DATABASE: { label: 'Database', color: '#059669', bg: '#d1fae5' },
  QUEUE: { label: 'Queue', color: '#db2777', bg: '#fce7f3' },
};
