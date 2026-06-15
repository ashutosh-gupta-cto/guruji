import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './styles/global.css';
import './modules/ai-ml/ai-ml.css';
import './modules/system-design/components/system-design-lab.css';
import './modules/system-design/load-balancer/load-balancer.css';
import './modules/system-design/consistent-hashing/consistent-hashing.css';
import './modules/system-design/kafka/kafka.css';
import './modules/system-design/raft/raft.css';
import './modules/system-design/database/database.css';
import './modules/system-design/cap/cap.css';
import './modules/system-design/paxos/paxos.css';
import './modules/system-design/stability/stability.css';
import './modules/system-design/interview/interview.css';
import './modules/cs-fundamentals/cs-fundamentals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
