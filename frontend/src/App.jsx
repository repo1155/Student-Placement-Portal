import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Compass } from 'lucide-react';
import PortalFooter from './components/PortalFooter';
import PortalHeader from './components/PortalHeader';
import Notice from './components/Notice';
import AuthModal from './features/auth/AuthModal';
import ApplyModal from './features/applications/ApplyModal';
import SavedPage from './features/applications/SavedPage';
import StudentDashboard from './features/applications/StudentDashboard';
import EmployerDashboard from './features/employers/EmployerDashboard';
import CreateJobModal from './features/jobs/CreateJobModal';
import DiscoverPage from './features/jobs/DiscoverPage';
import JobDetailPage from './features/jobs/JobDetailPage';
import PracticePage from './features/practice/PracticePage';
import PracticeQuizPage from './features/practice/PracticeQuizPage';
import PracticeResultsPage from './features/practice/PracticeResultsPage';
import usePlacementPortal from './hooks/usePlacementPortal';
import { resolveRoute } from './routes';

function AccessMessage({ onLogin, onRegister, onHome, signedIn, roleRequired }) {
  return <main className="route-message">
    <div className="route-message-icon"><Compass size={22} /></div>
    <div className="eyebrow">A LITTLE DETOUR</div>
    <h1>{signedIn ? 'This space is for another account type.' : 'Sign in to continue your journey.'}</h1>
    <p>{signedIn
      ? `This page is for ${roleRequired} accounts. You can switch accounts by signing out first.`
      : 'Your saved roles, applications, and hiring workspace are ready when you are.'}</p>
    <div className="route-message-actions">
      {!signedIn && <button className="button button-primary" onClick={onLogin}>Sign in <ArrowRight size={16} /></button>}
      {!signedIn && <button className="button button-outline" onClick={onRegister}>Create account</button>}
      <button className="button button-outline" onClick={onHome}>Explore opportunities</button>
    </div>
  </main>;
}

function NotFoundPage({ onHome }) {
  return <main className="route-message">
    <div className="route-message-icon"><Compass size={22} /></div>
    <div className="eyebrow">404 · WRONG TURN</div>
    <h1>That page isn’t on the map.</h1>
    <p>The address may have changed. Let’s get you back to the opportunities.</p>
    <button className="button button-primary" onClick={onHome}>Back to Pathway <ArrowRight size={16} /></button>
  </main>;
}

export default function App() {
  const portal = usePlacementPortal();
  const [pathname, setPathname] = useState(window.location.pathname);
  const navigate = useCallback((path, { replace = false } = {}) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
    setPathname(window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const syncPath = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  const route = resolveRoute(pathname);
  const activePath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const requiredRole = route.name === 'saved' || route.name === 'applications'
    || route.name.startsWith('practice')
    ? 'student'
    : route.name === 'listings' ? 'employer' : null;
  const hasAccess = !requiredRole || portal.user?.role === requiredRole;

  function onAuthSuccess(user) {
    portal.onAuthSuccess(user);
    const currentRouteMatches = user.role === 'employer'
      ? route.name === 'listings'
      : route.name === 'saved' || route.name === 'applications' || route.name === 'job' || route.name.startsWith('practice');
    navigate(currentRouteMatches ? pathname : user.role === 'employer' ? '/employer/listings' : '/');
  }

  async function onSignOut() {
    if (await portal.signOut()) navigate('/');
  }

  let page;
  if (route.name === 'not-found') {
    page = <NotFoundPage onHome={() => navigate('/')} />;
  } else if (requiredRole && !portal.authReady) {
    page = <main className="loading-route"><span className="spinner" />Loading your workspace…</main>;
  } else if (requiredRole && !hasAccess) {
    page = <AccessMessage
      signedIn={Boolean(portal.user)}
      roleRequired={requiredRole}
      onLogin={() => portal.setModal('login')}
      onRegister={() => portal.setModal('register')}
      onHome={() => navigate('/')}
    />;
  } else if (route.name === 'saved') {
    page = <SavedPage
      jobs={portal.savedJobs}
      savedIds={portal.savedIds}
      appliedIds={portal.appliedIds}
      onSaveJob={portal.saveJob}
      onViewJob={(job) => navigate(`/jobs/${job._id}`)}
      onDiscover={() => navigate('/')}
    />;
  } else if (route.name === 'applications') {
    page = <StudentDashboard applications={portal.applications} onDiscover={() => navigate('/')} />;
  } else if (route.name === 'practice') {
    page = <PracticePage
      onStart={(category, mode, topic) => navigate(
        `/practice/quiz/${category}/${mode}${topic ? `/${encodeURIComponent(topic)}` : ''}`
      )}
      onOpenResult={(id) => navigate(`/practice/results/${id}`)}
      onResumeAttempt={(id) => navigate(`/practice/attempt/${id}`)}
    />;
  } else if (route.name === 'practice-quiz') {
    page = <PracticeQuizPage
      category={route.category}
      mode={route.mode}
      topic={route.topic}
      id={route.id}
      onNavigate={navigate}
      onNotice={portal.setNotice}
    />;
  } else if (route.name === 'practice-results') {
    page = <PracticeResultsPage id={route.id} onNavigate={navigate} />;
  } else if (route.name === 'listings') {
    page = <EmployerDashboard
      jobs={portal.employerJobs}
      applicants={portal.applicants}
      onCreate={() => portal.setModal('create-job')}
      onNotice={portal.setNotice}
      onListingStatus={portal.changeListingStatus}
      onApplicationStatus={portal.changeApplicationStatus}
    />;
  } else if (route.name === 'job') {
    page = <JobDetailPage
      id={route.id}
      listedJob={portal.jobs.find((job) => job._id === route.id)}
      onBack={() => navigate('/')}
      onApply={portal.beginApply}
    />;
  } else {
    page = <DiscoverPage
      user={portal.user}
      jobs={portal.jobs}
      savedIds={portal.savedIds}
      appliedIds={portal.appliedIds}
      onSaveJob={portal.saveJob}
      onViewJob={(job) => navigate(`/jobs/${job._id}`)}
      searchInput={portal.searchInput}
      setSearchInput={portal.setSearchInput}
      setSearch={portal.setSearch}
      category={portal.category}
      setCategory={portal.setCategory}
      workMode={portal.workMode}
      setWorkMode={portal.setWorkMode}
      sortOrder={portal.sortOrder}
      setSortOrder={portal.setSortOrder}
      error={portal.error}
      onRetry={() => portal.loadJobs()}
      loading={portal.loading}
      loadingMore={portal.loadingMore}
      hasMore={portal.hasMore}
      page={portal.page}
      onLoadMore={portal.loadJobs}
      onCreateJob={() => portal.setModal('create-job')}
      onRegister={() => portal.setModal('register')}
      onSaved={() => navigate('/saved')}
    />;
  }

  return <div className="app-shell">
    <PortalHeader
      user={portal.user}
      activePath={activePath}
      onNavigate={navigate}
      onLogin={() => portal.setModal('login')}
      onRegister={() => portal.setModal('register')}
      onSignOut={onSignOut}
    />
    <Notice onDismiss={() => portal.setNotice('')}>{portal.notice}</Notice>
    {page}
    <PortalFooter
      user={portal.user}
      onHome={() => navigate('/')}
      onRegister={() => portal.setModal('register')}
      onLogin={() => portal.setModal('login')}
      onNavigate={navigate}
    />

    {(portal.modal === 'login' || portal.modal === 'register') && <AuthModal
      mode={portal.modal}
      setMode={portal.setModal}
      onClose={() => portal.setModal('')}
      onSuccess={onAuthSuccess}
    />}
    {portal.modal === 'create-job' && <CreateJobModal
      onClose={() => portal.setModal('')}
      onCreated={(job) => {
        portal.onJobCreated(job);
        navigate('/employer/listings');
      }}
    />}
    {portal.applyJob && <ApplyModal
      job={portal.applyJob}
      onClose={() => portal.setApplyJob(null)}
      onApplied={portal.onApplicationSubmitted}
    />}
  </div>;
}
