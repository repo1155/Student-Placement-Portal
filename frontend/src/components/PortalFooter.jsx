import Brand from './Brand';

const readinessUrl = 'https://www.naceweb.org/career-readiness/competencies/career-readiness-defined';

export default function PortalFooter({ onHome, onRegister, onLogin }) {
  return <footer className="footer">
    <div className="footer-main">
      <Brand onClick={onHome} />
      <span>A more human start to your career.</span>
      <div className="footer-links">
        <a href={readinessUrl} target="_blank" rel="noreferrer">Career readiness</a>
        <button onClick={onRegister}>For employers</button>
        <button onClick={onLogin}>Sign in</button>
      </div>
    </div>
    <div className="footer-bottom">
      <span>© {new Date().getFullYear()} Pathway. Built for what’s next.</span>
      <span>Real work. Real growth. Your first step.</span>
    </div>
  </footer>;
}
