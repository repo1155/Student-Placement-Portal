import Brand from './Brand';

const readinessUrl = 'https://www.naceweb.org/career-readiness/competencies/career-readiness-defined';

export default function PortalFooter({ user, onHome, onRegister, onLogin, onNavigate }) {
  return <footer className="footer">
    <div className="footer-main">
      <Brand onClick={onHome} />
      <span>A more human start to your career.</span>
      <div className="footer-links">
        <a href={readinessUrl} target="_blank" rel="noreferrer">Career readiness</a>
        {user?.role === 'student' && <>
          <button onClick={() => onNavigate('/practice')}>Practice</button>
          <button onClick={() => onNavigate('/saved')}>Saved roles</button>
          <button onClick={() => onNavigate('/applications')}>My applications</button>
        </>}
        {user?.role === 'employer' && <button onClick={() => onNavigate('/employer/listings')}>My listings</button>}
        {!user && <>
          <button onClick={() => onNavigate('/employer/listings')}>For employers</button>
          <button onClick={onRegister}>Get started</button>
          <button onClick={onLogin}>Sign in</button>
        </>}
      </div>
    </div>
    <div className="footer-bottom">
      <span>© {new Date().getFullYear()} Pathway. Built for what’s next.</span>
      <span>Real work. Real growth. Your first step.</span>
    </div>
  </footer>;
}
