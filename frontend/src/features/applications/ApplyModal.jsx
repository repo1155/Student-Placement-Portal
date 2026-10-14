import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { api } from '../../api';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

export default function ApplyModal({ job, onClose, onApplied }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api(`/applications/jobs/${job._id}/applications`, { method: 'POST', body: JSON.stringify(data) });
      onApplied(job);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return <Modal title="Make your move." subtitle={`${job.title} at ${job.company || job.employer?.company}`} onClose={onClose}>
    <form className="form-stack" onSubmit={submit}>
      <label>Resume link <span className="optional-label">optional</span><input name="resumeUrl" type="url" placeholder="https://drive.google.com/…" /></label>
      <label>Note to the team <span className="optional-label">optional</span><textarea name="coverLetter" rows="5" maxLength="3000" placeholder="What makes you excited about this opportunity?" /></label>
      <p className="privacy-note">Your profile and application details will be shared with the hiring team.</p>
      {error && <div className="form-error" role="alert">{error}</div>}
      <Button className="form-submit" disabled={busy}>{busy ? 'Sending…' : 'Submit application'} <ArrowRight size={17} /></Button>
    </form>
  </Modal>;
}
