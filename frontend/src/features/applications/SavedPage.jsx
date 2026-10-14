import { ArrowRight, Bookmark, Compass } from 'lucide-react';
import Button from '../../components/Button';
import JobCard from '../../components/JobCard';

export default function SavedPage({ jobs, savedIds, appliedIds, onSaveJob, onViewJob, onDiscover }) {
  return <main className="dashboard-main">
    <div className="dashboard-heading">
      <div>
        <div className="eyebrow">YOUR SHORTLIST</div>
        <h1>Saved opportunities<span className="brand-dot">.</span></h1>
        <p>Good possibilities, all in one place.</p>
      </div>
      <span className="dashboard-count">{jobs.length} saved {jobs.length === 1 ? 'role' : 'roles'}</span>
    </div>
    {jobs.length ? <div className="jobs-grid saved-jobs-grid">
      {jobs.map((job, index) => <JobCard
        key={job._id}
        job={job}
        index={index}
        saved={savedIds.has(job._id)}
        applied={appliedIds.has(job._id)}
        onSave={onSaveJob}
        onView={onViewJob}
      />)}
    </div> : <div className="empty-state">
      <div className="empty-icon"><Bookmark /></div>
      <h3>Keep the roles you love close.</h3>
      <p>Save an opportunity to compare it here when you’re ready to take the next step.</p>
      <Button onClick={onDiscover}>Explore opportunities <ArrowRight size={16} /></Button>
    </div>}
    {jobs.length > 0 && <div className="saved-next-step">
      <div><Compass size={20} /><span>Still exploring? There are more good-fit roles to find.</span></div>
      <Button variant="outline" onClick={onDiscover}>Discover more <ArrowRight size={15} /></Button>
    </div>}
  </main>;
}
