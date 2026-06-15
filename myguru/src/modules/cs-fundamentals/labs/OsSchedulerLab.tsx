import CpuSchedulerViz from '../os-scheduler/CpuSchedulerViz';
import '../cs-fundamentals.css';

export default function OsSchedulerLab() {
  return (
    <div className="csf-lab">
      <header className="csf-lab__header">
        <p className="csf-lab__eyebrow">CS Fundamentals</p>
        <h2 className="csf-lab__title">CPU Scheduling</h2>
        <p className="csf-lab__desc">
          Compare FCFS, shortest-job-first, and round-robin scheduling with a live Gantt chart
          and step-by-step traces.
        </p>
      </header>
      <div className="csf-panel">
        <CpuSchedulerViz />
      </div>
      <p className="csf-lab__attribution">
        Scheduling models from{' '}
        <a href="https://github.com/AmirShakibafar/OS-Visualizer" target="_blank" rel="noreferrer">
          AmirShakibafar/OS-Visualizer
        </a>
        .
      </p>
    </div>
  );
}
