import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Brand from './Brand';
import Button from './Button';
import { initials } from '../utils/presentation';

export default function PortalHeader({ user, activePath, onNavigate, onLogin, onRegister, onSignOut }) {
  return <header className="topbar">
    <div className="topbar-inner">
      <Brand onClick={() => onNavigate('/')} />
      <nav className="main-nav" aria-label="Main navigation">
        <button className={activePath === '/' || activePath.startsWith('/jobs/') ? 'active' : ''} onClick={() => onNavigate('/')}>Find an opportunity</button>
        {user?.role === 'student' && <>
          <button className={activePath.startsWith('/practice') ? 'active' : ''} onClick={() => onNavigate('/practice')}>Practice</button>
          <button className={activePath === '/saved' ? 'active' : ''} onClick={() => onNavigate('/saved')}>Saved roles</button>
          <button className={activePath === '/applications' ? 'active' : ''} onClick={() => onNavigate('/applications')}>My applications</button>
        </>}
        {user?.role === 'employer' && <button className={activePath === '/employer/listings' ? 'active' : ''} onClick={() => onNavigate('/employer/listings')}>My listings</button>}
      </nav>
      <div className="topbar-actions">
        {user ? <div className="account-menu">
          <div className="avatar">{initials(user.name)}</div>
          <span className="account-name">{user.name.split(' ')[0]}</span>
          <button className="sign-out" onClick={onSignOut}>Sign out</button>
        </div> : <>
          <button className="text-button" onClick={onLogin}>Log in</button>
          <Button className="join-button" onClick={onRegister}>Get started <ArrowUpRight size={15} /></Button>
        </>}
      </div>
    </div>
  </header>;
}
