import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Brand from './Brand';
import Button from './Button';
import { initials } from '../utils/presentation';

export default function PortalHeader({ user, activeTab, onTabChange, onLogin, onRegister, onSignOut }) {
  return <header className="topbar">
    <div className="topbar-inner">
      <Brand onClick={() => { onTabChange('Discover'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
      <nav className="main-nav" aria-label="Main navigation">
        <button className={activeTab === 'Discover' ? 'active' : ''} onClick={() => onTabChange('Discover')}>Find an opportunity</button>
        {user?.role === 'student' && <button className={activeTab === 'Applications' ? 'active' : ''} onClick={() => onTabChange('Applications')}>My applications</button>}
        {user?.role === 'employer' && <button className={activeTab === 'My listings' ? 'active' : ''} onClick={() => onTabChange('My listings')}>My listings</button>}
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
