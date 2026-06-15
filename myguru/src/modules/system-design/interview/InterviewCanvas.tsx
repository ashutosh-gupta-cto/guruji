/**
 * Lightweight system design interview canvas — drag-drop + checklist scoring.
 * Inspired by vijaygupta18/system-design-simulator
 */

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  INTERVIEW_PROBLEMS,
  NODE_META,
  scoreDesign,
  type InterviewEdge,
  type InterviewNode,
  type InterviewNodeType,
} from './interview-data';
import './interview.css';

export function InterviewCanvas() {
  const [problemIdx, setProblemIdx] = useState(0);
  const problem = INTERVIEW_PROBLEMS[problemIdx];

  const [nodes, setNodes] = useState<InterviewNode[]>([]);
  const [edges, setEdges] = useState<InterviewEdge[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const score = useMemo(
    () => scoreDesign(problem, nodes, edges),
    [problem, nodes, edges],
  );

  const loadProblem = (idx: number) => {
    setProblemIdx(idx);
    setNodes([]);
    setEdges([]);
    setSelectedId(null);
    setConnectFrom(null);
  };

  const addNode = (type: InterviewNodeType, x: number, y: number) => {
    const meta = NODE_META[type];
    setNodes((prev) => [
      ...prev,
      { id: uuidv4(), type, x, y, label: meta.label },
    ]);
  };

  const handlePaletteDragStart = (e: DragEvent, type: InterviewNodeType) => {
    e.dataTransfer.setData('nodeType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleBoardDrop = (e: DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('nodeType') as InterviewNodeType;
    if (!type || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    addNode(type, e.clientX - rect.left - 60, e.clientY - rect.top - 20);
  };

  const handleNodeMouseDown = (e: MouseEvent, node: InterviewNode) => {
    e.stopPropagation();
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      id: node.id,
      offsetX: e.clientX - rect.left - node.x,
      offsetY: e.clientY - rect.top - node.y,
    };
    setSelectedId(node.id);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragRef.current.offsetX;
    const y = e.clientY - rect.top - dragRef.current.offsetY;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === dragRef.current!.id
          ? { ...n, x: Math.max(0, x), y: Math.max(0, y) }
          : n,
      ),
    );
  }, []);

  const handleMouseUp = () => {
    dragRef.current = null;
  };

  const handleNodeClick = (e: MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectFrom === null) {
      setConnectFrom(nodeId);
      setSelectedId(nodeId);
    } else if (connectFrom !== nodeId) {
      const exists = edges.some(
        (ed) =>
          (ed.sourceId === connectFrom && ed.targetId === nodeId) ||
          (ed.sourceId === nodeId && ed.targetId === connectFrom),
      );
      if (!exists) {
        setEdges((prev) => [
          ...prev,
          { id: uuidv4(), sourceId: connectFrom, targetId: nodeId },
        ]);
      }
      setConnectFrom(null);
    } else {
      setConnectFrom(null);
    }
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedId));
    setEdges((prev) =>
      prev.filter((e) => e.sourceId !== selectedId && e.targetId !== selectedId),
    );
    setSelectedId(null);
    setConnectFrom(null);
  };

  const nodeCenter = (id: string) => {
    const n = nodes.find((x) => x.id === id);
    return n ? { x: n.x + 60, y: n.y + 24 } : { x: 0, y: 0 };
  };

  return (
    <div className="interview-canvas">
      <div className="interview-canvas__header">
        <select
          className="interview-canvas__problem-select"
          value={problemIdx}
          onChange={(e) => loadProblem(Number(e.target.value))}
        >
          {INTERVIEW_PROBLEMS.map((p, i) => (
            <option key={p.id} value={i}>
              {p.title}
            </option>
          ))}
        </select>
        <span className={`interview-canvas__difficulty interview-canvas__difficulty--${problem.difficulty}`}>
          {problem.difficulty}
        </span>
        <button type="button" className="interview-canvas__btn" onClick={deleteSelected}>
          Delete selected
        </button>
        <span
          className={`interview-canvas__score${score.percent >= 51 ? ' interview-canvas__score--good' : ''}`}
        >
          {score.percent}% — {score.verdict}
        </span>
      </div>

      <div className="interview-canvas__body">
        <aside className="interview-canvas__palette">
          <p className="interview-canvas__palette-title">Components</p>
          {problem.palette.map((type) => {
            const meta = NODE_META[type];
            return (
              <div
                key={type}
                className="interview-canvas__palette-item"
                style={{ background: meta.bg, color: meta.color, borderColor: meta.color }}
                draggable
                onDragStart={(e) => handlePaletteDragStart(e, type)}
              >
                {meta.label}
              </div>
            );
          })}
        </aside>

        <div
          ref={boardRef}
          className="interview-canvas__board"
          onDrop={handleBoardDrop}
          onDragOver={(e) => e.preventDefault()}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => {
            setSelectedId(null);
            setConnectFrom(null);
          }}
        >
          <svg className="interview-canvas__edges">
            {edges.map((edge) => {
              const from = nodeCenter(edge.sourceId);
              const to = nodeCenter(edge.targetId);
              return (
                <line
                  key={edge.id}
                  className="interview-canvas__edge"
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  markerEnd="url(#arrow)"
                />
              );
            })}
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" />
              </marker>
            </defs>
          </svg>

          {nodes.map((node) => {
            const meta = NODE_META[node.type];
            return (
              <div
                key={node.id}
                className={`interview-canvas__node${selectedId === node.id ? ' interview-canvas__node--selected' : ''}${connectFrom === node.id ? ' interview-canvas__node--selected' : ''}`}
                style={{
                  left: node.x,
                  top: node.y,
                  borderColor: meta.color,
                  background: meta.bg,
                  color: meta.color,
                }}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onClick={(e) => handleNodeClick(e, node.id)}
              >
                {node.label}
              </div>
            );
          })}
        </div>

        <aside className="interview-canvas__checklist">
          <p className="interview-canvas__checklist-title">Scoring checklist</p>
          {score.items.map((item) => (
            <div
              key={item.id}
              className={`interview-canvas__check-item${item.passed ? ' interview-canvas__check-item--pass' : ' interview-canvas__check-item--fail'}`}
            >
              <span>{item.passed ? '✓' : '○'}</span>
              <span>
                {item.label} ({item.earned}/{item.max})
              </span>
            </div>
          ))}
        </aside>
      </div>

      <p className="interview-canvas__desc">{problem.description}</p>
      <p className="interview-canvas__hint">
        Drag components onto the canvas. Click two nodes to connect them. Score updates live.
      </p>
    </div>
  );
}
