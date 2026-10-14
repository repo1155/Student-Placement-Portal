export default function StatusPill({ status = 'submitted' }) {
  const names = { submitted: 'Submitted', reviewing: 'In review', interview: 'Interview', offer: 'Offer', rejected: 'Not selected' };
  return <span className={`status-pill status-${status}`}>{names[status] || status}</span>;
}
