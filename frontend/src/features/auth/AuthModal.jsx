import { useState } from 'react';
import { ArrowRight, BriefcaseBusiness, GraduationCap } from 'lucide-react';
import { api } from '../../api';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

export default function AuthModal({ mode, setMode, onClose, onSuccess }) {
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify({ ...data, role }) });
      onSuccess(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return <Modal
    title={mode === 'login' ? 'Welcome back.' : 'Your next chapter starts here.'}
    subtitle={mode === 'login' ? 'Sign in to pick up where you left off.' : 'Create your free account in less than a minute.'}
    onClose={onClose}
  >
    {mode === 'register' && <div className="role-switch">
      <button className={role === 'student' ? 'selected' : ''} onClick={() => setRole('student')} type="button"><GraduationCap size={17} /> Student</button>
      <button className={role === 'employer' ? 'selected' : ''} onClick={() => setRole('employer')} type="button"><BriefcaseBusiness size={17} /> Employer</button>
    </div>}
    <form className="form-stack" onSubmit={submit}>
      {mode === 'register' && <>
        <label>Full name<input name="name" autoComplete="name" placeholder="Jordan Lee" required minLength="2" maxLength="80" /></label>
        {role === 'student' ? <div className="input-row">
          <label>School<input name="school" placeholder="Your university" maxLength="120" /></label>
          <label>Graduation year<input name="graduationYear" type="number" placeholder="2027" min="2020" max="2100" /></label>
        </div> : <label>Company name<input name="company" placeholder="Acme Inc." required maxLength="120" /></label>}
      </>}
      <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@university.edu" required maxLength="254" /></label>
      <label>Password<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder={mode === 'login' ? 'Your password' : 'At least 10 characters'} required minLength={mode === 'login' ? '1' : '10'} maxLength="128" /></label>
      {error && <div className="form-error" role="alert">{error}</div>}
      <Button className="form-submit" disabled={busy}>{busy ? 'One moment…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17} /></Button>
    </form>
    <p className="modal-switch">
      {mode === 'login' ? 'New to Pathway?' : 'Already have an account?'}
      {' '}<button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
        {mode === 'login' ? 'Create account' : 'Sign in'}
      </button>
    </p>
  </Modal>;
}
