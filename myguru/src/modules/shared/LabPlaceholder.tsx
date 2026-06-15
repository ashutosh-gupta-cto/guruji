import { FlaskConical } from 'lucide-react';

interface LabPlaceholderProps {
  moduleId: string;
  title: string;
}

/** Stub lab component — other agents will replace with real visualizers. */
export default function LabPlaceholder({ moduleId, title }: LabPlaceholderProps) {
  return (
    <div className="lab-placeholder">
      <div className="lab-placeholder__icon">
        <FlaskConical size={28} />
      </div>
      <p className="lab-placeholder__title">{title}</p>
      <p>Interactive lab module coming soon.</p>
      <code className="lab-placeholder__module-id">{moduleId}</code>
    </div>
  );
}
