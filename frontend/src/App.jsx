import PortalFooter from './components/PortalFooter';
import PortalHeader from './components/PortalHeader';
import Notice from './components/Notice';
import AuthModal from './features/auth/AuthModal';
import ApplyModal from './features/applications/ApplyModal';
import StudentDashboard from './features/applications/StudentDashboard';
import EmployerDashboard from './features/employers/EmployerDashboard';
import CreateJobModal from './features/jobs/CreateJobModal';
import DiscoverPage from './features/jobs/DiscoverPage';
import JobDetailModal from './features/jobs/JobDetailModal';
import usePlacementPortal from './hooks/usePlacementPortal';

export default function App() {
  const portal = usePlacementPortal();
  const showStudentDashboard = portal.activeTab === 'Applications' && portal.user?.role === 'student';
  const showEmployerDashboard = portal.activeTab === 'My listings' && portal.user?.role === 'employer';

  return <div className="app-shell">
    <PortalHeader
      user={portal.user}
      activeTab={portal.activeTab}
      onTabChange={portal.setActiveTab}
      onLogin={() => portal.setModal('login')}
      onRegister={() => portal.setModal('register')}
      onSignOut={portal.signOut}
    />
    <Notice onDismiss={() => portal.setNotice('')}>{portal.notice}</Notice>

    {showStudentDashboard ? <StudentDashboard
      applications={portal.applications}
      onDiscover={() => portal.setActiveTab('Discover')}
    /> : showEmployerDashboard ? <EmployerDashboard
      jobs={portal.employerJobs}
      applicants={portal.applicants}
      onCreate={() => portal.setModal('create-job')}
      onNotice={portal.setNotice}
      onListingStatus={portal.changeListingStatus}
      onApplicationStatus={portal.changeApplicationStatus}
    /> : <DiscoverPage
      user={portal.user}
      activeTab={portal.activeTab}
      setActiveTab={portal.setActiveTab}
      jobs={portal.jobs}
      visibleJobs={portal.visibleJobs}
      savedJobs={portal.savedJobs}
      savedIds={portal.savedIds}
      appliedIds={portal.appliedIds}
      onSaveJob={portal.saveJob}
      onViewJob={portal.setDetailJob}
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
    />}

    <PortalFooter
      onHome={() => { portal.setActiveTab('Discover'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      onRegister={() => portal.setModal('register')}
      onLogin={() => portal.setModal('login')}
    />

    {(portal.modal === 'login' || portal.modal === 'register') && <AuthModal
      mode={portal.modal}
      setMode={portal.setModal}
      onClose={() => portal.setModal('')}
      onSuccess={portal.onAuthSuccess}
    />}
    {portal.modal === 'create-job' && <CreateJobModal
      onClose={() => portal.setModal('')}
      onCreated={portal.onJobCreated}
    />}
    {portal.detailJob && <JobDetailModal
      job={portal.detailJob}
      onClose={() => portal.setDetailJob(null)}
      onApply={portal.beginApply}
    />}
    {portal.applyJob && <ApplyModal
      job={portal.applyJob}
      onClose={() => portal.setApplyJob(null)}
      onApplied={portal.onApplicationSubmitted}
    />}
  </div>;
}
