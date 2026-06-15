/**
 * Konva canvas for load balancer / cache particle simulation.
 * Ported from pronzzz/sysarch-interactive (src/components/GameCanvas.tsx)
 * @see https://github.com/pronzzz/sysarch-interactive
 */

import { useEffect, useRef, useState, type DragEvent } from 'react';
import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva';
import type Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import useLoadBalancerStore from './useLoadBalancerStore';
import { useGameLoop } from './useGameLoop';
import type { NodeType } from './types';
import { ParticleOverlay } from './ParticleOverlay';

const NODE_COLORS: Record<NodeType, string> = {
  CLIENT: '#3b82f6',
  LOAD_BALANCER: '#a855f7',
  SERVER: '#6366f1',
  DATABASE: '#10b981',
  CACHE: '#f59e0b',
};

export function LoadBalancerCanvas() {
  useGameLoop();

  const nodes = useLoadBalancerStore((s) => s.nodes);
  const edges = useLoadBalancerStore((s) => s.edges);
  const isPlaying = useLoadBalancerStore((s) => s.isPlaying);
  const setIsPlaying = useLoadBalancerStore((s) => s.setIsPlaying);
  const addNode = useLoadBalancerStore((s) => s.addNode);
  const updateNode = useLoadBalancerStore((s) => s.updateNode);
  const selectedNodeId = useLoadBalancerStore((s) => s.selectedNodeId);
  const selectNode = useLoadBalancerStore((s) => s.selectNode);
  const addEdge = useLoadBalancerStore((s) => s.addEdge);

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setDimensions({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);
    setDimensions({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const handleDragOver = (e: DragEvent) => e.preventDefault();

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('nodeType') as NodeType;
    if (!type || !stageRef.current) return;

    const stage = stageRef.current;
    stage.setPointersPositions(e);
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const x = (pointerPosition.x - stagePos.x) / stageScale;
    const y = (pointerPosition.y - stagePos.y) / stageScale;

    addNode({
      id: uuidv4(),
      type,
      x,
      y,
      config: {
        capacity: type === 'SERVER' ? 5 : undefined,
        latency: type === 'DATABASE' ? 200 : type === 'SERVER' ? 50 : 0,
        rps: type === 'CLIENT' ? 1 : undefined,
        hitRate: type === 'CACHE' ? 0.8 : undefined,
      },
      state: { currentLoad: 0, health: 100 },
    });
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    if (newScale < 0.2 || newScale > 5) return;

    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleNodeDragEnd = (e: Konva.KonvaEventObject<globalThis.DragEvent>, nodeId: string) => {
    updateNode(nodeId, { x: e.target.x(), y: e.target.y() });
  };

  const handleNodeClick = (e: Konva.KonvaEventObject<MouseEvent>, nodeId: string) => {
    e.cancelBubble = true;
    if (!selectedNodeId) {
      selectNode(nodeId);
    } else if (selectedNodeId === nodeId) {
      selectNode(null);
    } else {
      addEdge({ id: uuidv4(), sourceNodeId: selectedNodeId, targetNodeId: nodeId });
      selectNode(null);
    }
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === stageRef.current) selectNode(null);
  };

  return (
    <div
      ref={containerRef}
      className="lb-canvas-wrap"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        draggable
        ref={stageRef}
        onClick={handleStageClick}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            setStagePos({ x: e.target.x(), y: e.target.y() });
          }
        }}
      >
        <Layer>
          {edges.map((edge) => {
            const source = nodes.find((n) => n.id === edge.sourceNodeId);
            const target = nodes.find((n) => n.id === edge.targetNodeId);
            if (!source || !target) return null;
            return (
              <Line
                key={edge.id}
                points={[source.x, source.y, target.x, target.y]}
                stroke="#475569"
                strokeWidth={4}
                lineCap="round"
              />
            );
          })}

          {nodes.map((node) => (
            <Group
              key={node.id}
              x={node.x}
              y={node.y}
              draggable
              onDragEnd={(e) => handleNodeDragEnd(e, node.id)}
              onClick={(e) => handleNodeClick(e, node.id)}
            >
              <Rect
                x={-30}
                y={-30}
                width={60}
                height={60}
                fill={node.state.health < 50 ? '#ef4444' : NODE_COLORS[node.type]}
                cornerRadius={8}
                shadowColor="black"
                shadowBlur={10}
                shadowOpacity={0.3}
                stroke={selectedNodeId === node.id ? '#fbbf24' : undefined}
                strokeWidth={selectedNodeId === node.id ? 4 : 0}
              />
              <Text
                x={-40}
                y={35}
                text={node.type.replace('_', ' ')}
                width={80}
                align="center"
                fill="#e2e8f0"
                fontSize={9}
              />
              {node.state.currentLoad > 0 && (
                <Text
                  x={-30}
                  y={-45}
                  text={`${node.state.currentLoad}`}
                  width={60}
                  align="center"
                  fill="#fbbf24"
                  fontSize={10}
                  fontStyle="bold"
                />
              )}
            </Group>
          ))}
        </Layer>
      </Stage>

      <ParticleOverlay
        width={dimensions.width}
        height={dimensions.height}
        stageScale={stageScale}
        stagePos={stagePos}
      />

      <div className="lb-overlay-controls">
        <button
          type="button"
          className={isPlaying ? 'lb-btn lb-btn-stop' : 'lb-btn lb-btn-start'}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? 'STOP' : 'START TRAFFIC'}
        </button>
        <span className="lb-status">{isPlaying ? 'RUNNING' : 'PAUSED'}</span>
        <span className="lb-hint">Click two nodes to connect</span>
      </div>
    </div>
  );
}
