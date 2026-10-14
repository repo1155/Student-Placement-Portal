import { Compass } from 'lucide-react';

export default function Brand({ onClick }) {
  return <button className="brand" onClick={onClick} aria-label="Pathway home">
    <span className="brand-mark"><Compass size={19} strokeWidth={2.4} /></span>
    <span>pathway<span className="brand-dot">.</span></span>
  </button>;
}
