/**
 * Load balancer & cache particle simulation shell.
 * Ported from pronzzz/sysarch-interactive (src/App.tsx)
 * @see https://github.com/pronzzz/sysarch-interactive
 */

import { LoadBalancerToolbar } from './LoadBalancerToolbar';
import { LoadBalancerCanvas } from './LoadBalancerCanvas';
import './load-balancer.css';

export function LoadBalancerSimulator() {
  return (
    <div className="lb-simulator">
      <LoadBalancerToolbar />
      <LoadBalancerCanvas />
    </div>
  );
}
