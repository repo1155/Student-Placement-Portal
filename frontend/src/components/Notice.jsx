import { X } from 'lucide-react';

export default function Notice({ children, onDismiss }) {
  if (!children) return null;
  return <div className="notice" role="status">
    <span>{children}</span>
    <button onClick={onDismiss} aria-label="Dismiss notification"><X size={16} /></button>
  </div>;
}
