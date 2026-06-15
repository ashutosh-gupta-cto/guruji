import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface Point {
  x: number;
  y: number;
  label: number;
}

interface Weights {
  ih: number[][];
  ho: number[];
  bh: number[];
  bo: number;
}

const CANVAS = 280;
const DOMAIN: [number, number] = [-6, 6];

function tanh(x: number) {
  return Math.tanh(x);
}

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function generateCircleData(n = 80): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2;
    const r = 3.5 + (Math.random() - 0.5) * 0.8;
    pts.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r, label: 1 });
  }
  for (let i = 0; i < n; i++) {
    const x = (Math.random() - 0.5) * 10;
    const y = (Math.random() - 0.5) * 10;
    if (Math.hypot(x, y) > 4.2) pts.push({ x, y, label: 0 });
  }
  return pts;
}

function forward(x: number, y: number, w: Weights): number {
  const hidden = w.bh.map((b, i) => {
    const sum = b + w.ih[i]![0]! * x + w.ih[i]![1]! * y;
    return tanh(sum);
  });
  let out = w.bo;
  hidden.forEach((h, i) => {
    out += w.ho[i]! * h;
  });
  return sigmoid(out);
}

function defaultWeights(): Weights {
  return {
    ih: [
      [0.8, -0.6],
      [-0.5, 0.9],
    ],
    ho: [1.2, -1.1],
    bh: [0.1, -0.2],
    bo: 0.05,
  };
}

function lerpColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  if (clamped < 0.5) {
    const u = clamped * 2;
    const r = Math.round(245 * (1 - u) + 232 * u);
    const g = Math.round(147 * (1 - u) + 234 * u);
    const b = Math.round(34 * (1 - u) + 235 * u);
    return `rgb(${r},${g},${b})`;
  }
  const u = (clamped - 0.5) * 2;
  const r = Math.round(232 * (1 - u) + 8 * u);
  const g = Math.round(234 * (1 - u) + 119 * u);
  const b = Math.round(235 * (1 - u) + 189 * u);
  return `rgb(${r},${g},${b})`;
}

export function NeuralPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [weights, setWeights] = useState<Weights>(defaultWeights);
  const [data] = useState(() => generateCircleData());

  const accuracy = useMemo(() => {
    let correct = 0;
    for (const p of data) {
      const pred = forward(p.x, p.y, weights) >= 0.5 ? 1 : 0;
      if (pred === p.label) correct++;
    }
    return ((correct / data.length) * 100).toFixed(1);
  }, [data, weights]);

  const drawBoundary = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const [min, max] = DOMAIN;
    const res = 4;
    const img = ctx.createImageData(CANVAS, CANVAS);

    for (let py = 0; py < CANVAS; py += res) {
      for (let px = 0; px < CANVAS; px += res) {
        const x = min + (px / CANVAS) * (max - min);
        const y = max - (py / CANVAS) * (max - min);
        const prob = forward(x, y, weights);
        const color = lerpColor(prob);
        const [r, g, b] = color.match(/\d+/g)!.map(Number);

        for (let dy = 0; dy < res; dy++) {
          for (let dx = 0; dx < res; dx++) {
            const idx = ((py + dy) * CANVAS + (px + dx)) * 4;
            img.data[idx] = r!;
            img.data[idx + 1] = g!;
            img.data[idx + 2] = b!;
            img.data[idx + 3] = 255;
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);

    for (const p of data) {
      const sx = ((p.x - min) / (max - min)) * CANVAS;
      const sy = CANVAS - ((p.y - min) / (max - min)) * CANVAS;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 1 ? '#0877bd' : '#f59322';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
    }
  }, [data, weights]);

  useEffect(() => {
    drawBoundary();
  }, [drawBoundary]);

  const updateWeight = (
    path: 'ih' | 'ho' | 'bh' | 'bo',
    i: number,
    j: number | null,
    value: number,
  ) => {
    setWeights((prev) => {
      const next = structuredClone(prev);
      if (path === 'bo') next.bo = value;
      else if (path === 'bh') next.bh[i] = value;
      else if (path === 'ho') next.ho[i] = value;
      else if (path === 'ih' && j !== null) next.ih[i]![j] = value;
      return next;
    });
  };

  return (
    <div className="aiml-playground">
      <header className="aiml-playground__header">
        <div>
          <h3>Neural Network Playground</h3>
          <p>
            A simplified 2-layer network (2 inputs → 2 hidden → 1 output). Adjust
            weights and watch the decision boundary shift — inspired by TensorFlow Playground.
          </p>
        </div>
        <div className="aiml-playground__stats">
          <span>Accuracy: <strong>{accuracy}%</strong></span>
          <button type="button" className="aiml-btn" onClick={() => setWeights(defaultWeights())}>
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </header>

      <div className="aiml-playground__grid">
        <div className="aiml-playground__viz">
          <canvas ref={canvasRef} width={CANVAS} height={CANVAS} className="aiml-playground__canvas" />
          <div className="aiml-playground__legend">
            <span><i className="dot dot--orange" /> Class 0</span>
            <span><i className="dot dot--blue" /> Class 1</span>
          </div>
        </div>

        <div className="aiml-playground__net">
          <div className="aiml-playground__layer">
            <h4>Input → Hidden</h4>
            {weights.ih.map((row, i) => (
              <div key={`ih-${i}`} className="aiml-playground__row">
                <span>H{i + 1}</span>
                {row.map((w, j) => (
                  <label key={`ih-${i}-${j}`}>
                    x{j + 1}
                    <input
                      type="range"
                      min={-2}
                      max={2}
                      step={0.1}
                      value={w}
                      onChange={(e) => updateWeight('ih', i, j, Number(e.target.value))}
                    />
                    <code>{w.toFixed(1)}</code>
                  </label>
                ))}
                <label>
                  bias
                  <input
                    type="range"
                    min={-2}
                    max={2}
                    step={0.1}
                    value={weights.bh[i]}
                    onChange={(e) => updateWeight('bh', i, null, Number(e.target.value))}
                  />
                  <code>{weights.bh[i]!.toFixed(1)}</code>
                </label>
              </div>
            ))}
          </div>

          <div className="aiml-playground__layer">
            <h4>Hidden → Output</h4>
            {weights.ho.map((w, i) => (
              <label key={`ho-${i}`}>
                H{i + 1} → out
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.1}
                  value={w}
                  onChange={(e) => updateWeight('ho', i, null, Number(e.target.value))}
                />
                <code>{w.toFixed(1)}</code>
              </label>
            ))}
            <label>
              output bias
              <input
                type="range"
                min={-2}
                max={2}
                step={0.1}
                value={weights.bo}
                onChange={(e) => updateWeight('bo', 0, null, Number(e.target.value))}
              />
              <code>{weights.bo.toFixed(1)}</code>
            </label>
          </div>

          <p className="aiml-muted">
            Activation: tanh (hidden), sigmoid (output). Orange/blue regions show predicted class probability.
          </p>
        </div>
      </div>
    </div>
  );
}
