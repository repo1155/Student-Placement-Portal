import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { api } from '../../api';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

export default function CreateJobModal({ onClose, onCreated }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    data.requirements = data.requirements.split('\n').map((item) => item.trim()).filter(Boolean);
    data.skills = data.skills.split(',').map((item) => item.trim()).filter(Boolean);
    try {
      const result = await api('/jobs', { method: 'POST', body: JSON.stringify(data) });
      onCreated(result.job);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return <Modal title="Find your next great intern." subtitle="Write a clear, welcoming role description. Students are counting on the details." onClose={onClose} wide>
    <form className="form-stack" onSubmit={submit}>
      <div className="input-row"><label>Role title<input name="title" placeholder="e.g. Product Design Intern" required minLength="3" maxLength="120" /></label><label>Category<input name="category" placeholder="e.g. Design" required maxLength="60" /></label></div>
      <div className="input-row"><label>Location<input name="location" placeholder="City, State or Remote" required maxLength="120" /></label><label>Work style<select name="workMode"><option>Hybrid</option><option>Remote</option><option>On-site</option></select></label></div>
      <div className="input-row"><label>Opportunity type<select name="type"><option>Internship</option><option>Co-op</option><option>Graduate</option></select></label><label>Compensation<input name="pay" placeholder="$25–30 / hr" required maxLength="60" /></label></div>
      <div className="input-row"><label>Duration<input name="duration" placeholder="12 weeks" required maxLength="60" /></label><label>Application deadline<input name="deadline" type="date" /></label></div>
      <label>About the role<textarea name="description" rows="4" required minLength="30" maxLength="5000" placeholder="What will this person work on? What will they learn?" /></label>
      <label>What you'll bring <span className="optional-label">one per line</span><textarea name="requirements" rows="3" placeholder={'Currently pursuing a degree…\nCuriosity and willingness to learn'} /></label>
      <label>Skills <span className="optional-label">comma separated</span><input name="skills" placeholder="Figma, research, communication" /></label>
      {error && <div className="form-error" role="alert">{error}</div>}
      <Button className="form-submit" disabled={busy}>{busy ? 'Publishing…' : 'Publish opportunity'} <ArrowRight size={17} /></Button>
    </form>
  </Modal>;
}
