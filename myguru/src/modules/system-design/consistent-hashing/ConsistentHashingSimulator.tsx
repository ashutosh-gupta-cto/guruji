/**
 * Consistent hashing interactive simulator.
 * Ported from ionmx/consistent-hashing-simulator (hashring.js, canvas.js, main.js)
 * @see https://github.com/ionmx/consistent-hashing-simulator
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addData,
  addServer,
  getRealServers,
  getServers,
  removeServer,
  resetRing,
  setSimulationLog,
  type RingServer,
} from './hashring';
import { useHashRingCanvas } from './useHashRingCanvas';
import './consistent-hashing.css';

const SAMPLE_KEYS = [
  'user:1001', 'user:1002', 'user:1003', 'session:abc', 'session:def',
  'cache:home', 'cache:profile', 'order:42', 'order:99', 'product:7',
  'cart:alice', 'cart:bob', 'feed:page1', 'feed:page2', 'search:redis',
  'search:kafka', 'config:app', 'config:db', 'token:jwt1', 'token:jwt2',
];

interface ServerRow {
  hash: number;
  server: RingServer;
  isVirtual: boolean;
  isHeader: boolean;
  color?: string;
}

export function ConsistentHashingSimulator() {
  const { canvasRef, drawRing, drawServers, blinkServer } = useHashRingCanvas();
  const [isSimulating, setIsSimulating] = useState(false);
  const [serverQty, setServerQty] = useState(3);
  const [vnodes, setVnodes] = useState(2);
  const [logs, setLogs] = useState<string[]>(['Waiting for simulation...']);
  const [rows, setRows] = useState<ServerRow[]>([]);
  const [totalKeys, setTotalKeys] = useState(0);
  const keyQueueRef = useRef<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const keyIndexRef = useRef(0);

  const appendLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev.slice(-49), msg]);
  }, []);

  useEffect(() => {
    setSimulationLog(appendLog);
    drawRing();
  }, [appendLog, drawRing]);

  const buildRows = useCallback((servers: Map<number, RingServer>, vnodeCount: number) => {
    const result: ServerRow[] = [];
    let prev = '';
    let colorIdx = 0;

    servers.forEach((value, key) => {
      const isNewServer = value.server_name !== prev;
      if (isNewServer && vnodeCount > 0) {
        result.push({
          hash: key,
          server: value,
          isVirtual: false,
          isHeader: true,
          color: `hsl(${colorIdx * 47}, 65%, 45%)`,
        });
        colorIdx += 1;
        prev = value.server_name;
      } else if (isNewServer) {
        prev = value.server_name;
      }

      result.push({
        hash: key,
        server: value,
        isVirtual: !isNewServer && vnodeCount > 0,
        isHeader: false,
      });
    });

    setRows(result);
  }, []);

  const refreshTable = useCallback(() => {
    const servers = getServers();
    drawServers(servers);
    buildRows(servers, vnodes);
  }, [buildRows, drawServers, vnodes]);

  const updatePercentages = useCallback((total: number) => {
    if (total === 0) return;
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        server: { ...row.server },
      })),
    );
  }, []);

  const processQueue = useCallback(() => {
    if (keyQueueRef.current.length === 0) {
      keyIndexRef.current = 0;
      keyQueueRef.current = [...SAMPLE_KEYS];
    }

    const str = keyQueueRef.current.pop();
    if (!str) return;

    const res = addData(str);
    setTotalKeys((t) => {
      const next = t + 1;
      updatePercentages(next);
      return next;
    });
    appendLog('Adding to ' + res[1] + ': "' + str + '"');
    blinkServer(res[0]);
    refreshTable();
  }, [appendLog, blinkServer, refreshTable, updatePercentages]);

  const startProcess = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(processQueue, 80);
  }, [processQueue]);

  const stopProcess = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stopProcess(), [stopProcess]);

  const handleSimulate = () => {
    if (!isSimulating) {
      setLogs([]);
      appendLog('Start simulation');
      resetRing();
      for (let i = 0; i < serverQty; i++) {
        addServer(vnodes);
      }
      setTotalKeys(0);
      keyQueueRef.current = [...SAMPLE_KEYS];
      refreshTable();
      setIsSimulating(true);
      startProcess();
    } else {
      appendLog('Stop simulation');
      stopProcess();
      setIsSimulating(false);
      setRows([]);
      setTotalKeys(0);
      drawRing();
    }
  };

  const handleAddServer = () => {
    addServer(vnodes);
    refreshTable();
  };

  const handleRemoveServer = (serverName: string) => {
    if (removeServer(serverName)) {
      refreshTable();
    }
  };

  const realServers = getRealServers();
  const serverTotals = new Map<string, number>();
  realServers.forEach((rs, name) => serverTotals.set(name, rs.keys_size));

  return (
    <div className="ch-simulator">
      <div className="ch-controls">
        <label>
          Servers
          <input
            type="number"
            min={1}
            max={10}
            value={serverQty}
            disabled={isSimulating}
            onChange={(e) => setServerQty(Number(e.target.value))}
          />
        </label>
        <label>
          Virtual nodes
          <input
            type="number"
            min={0}
            max={10}
            value={vnodes}
            disabled={isSimulating}
            onChange={(e) => setVnodes(Number(e.target.value))}
          />
        </label>
        <button
          type="button"
          className={isSimulating ? 'ch-btn ch-btn-danger' : 'ch-btn ch-btn-primary'}
          onClick={handleSimulate}
        >
          {isSimulating ? 'Stop' : 'Simulate'}
        </button>
        <button
          type="button"
          className="ch-btn ch-btn-secondary"
          disabled={!isSimulating}
          onClick={handleAddServer}
        >
          Add server
        </button>
      </div>

      <div className="ch-main">
        <canvas ref={canvasRef} className="ch-canvas" width={400} height={400} />

        <div className="ch-table-wrap">
          {rows.length > 0 && (
            <table className="ch-table">
              <thead>
                <tr>
                  <th>Server</th>
                  <th>Keys</th>
                  <th>Load</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const loadPct = totalKeys > 0 ? Math.round((row.server.keys_size * 100) / totalKeys) : 0;
                  const serverTotal = serverTotals.get(row.server.server_name) ?? 0;
                  const serverPct = totalKeys > 0 ? Math.round((serverTotal * 100) / totalKeys) : 0;

                  if (row.isHeader) {
                    return (
                      <tr key={`h-${row.hash}`} className="ch-row-header" style={{ background: row.color }}>
                        <td>{row.server.server_name}</td>
                        <td>{serverTotal}</td>
                        <td>{serverPct}%</td>
                        <td>
                          <button
                            type="button"
                            className="ch-remove"
                            onClick={() => handleRemoveServer(row.server.server_name)}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={row.hash} className={row.isVirtual ? 'ch-row-virtual' : 'ch-row-main'}>
                      <td>
                        {row.server.server_name}
                        <span className="ch-hash">{row.hash}</span>
                      </td>
                      <td>{row.server.keys_size}</td>
                      <td>{loadPct}%</td>
                      <td>
                        {!row.isVirtual && vnodes === 0 && (
                          <button
                            type="button"
                            className="ch-remove"
                            onClick={() => handleRemoveServer(row.server.server_name)}
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                <tr className="ch-row-total">
                  <td>Total</td>
                  <td>{totalKeys}</td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="ch-log">
        {logs.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}
