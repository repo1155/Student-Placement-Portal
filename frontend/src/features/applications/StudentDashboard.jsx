import { ArrowRight, BriefcaseBusiness, MapPin } from 'lucide-react';
import Button from '../../components/Button';
import StatusPill from '../../components/StatusPill';
import { companyColors, initials } from '../../utils/presentation';

export default function StudentDashboard({ applications, onDiscover }) {
  const activeCount = applications.filter((application) => ['submitted', 'reviewing', 'interview'].includes(application.status)).length;
  const interviewCount = applications.filter((application) => application.status === 'interview').length;
  const offerCount = applications.filter((application) => application.status === 'offer').length;

  return <main className="dashboard-main">
    <div className="dashboard-heading">
      <div><div className="eyebrow">YOUR CAREER JOURNEY</div><h1>My applications<span className="brand-dot">.</span></h1><p>Every next step begins with the one you took.</p></div>
      <span className="dashboard-count">{applications.length} applications</span>
    </div>
    <section className="dashboard-stats" aria-label="Application overview">
      <article><span>Total applications</span><strong>{applications.length}</strong><small>Every opportunity you pursued</small></article>
      <article><span>In progress</span><strong>{activeCount}</strong><small>Submitted, reviewing, or interview</small></article>
      <article><span>Interviews</span><strong>{interviewCount}</strong><small>Conversations about what’s next</small></article>
      <article><span>Offers</span><strong>{offerCount}</strong><small>New chapters taking shape</small></article>
    </section>
    {applications.length ? <div className="application-list">
      {applications.map((application, index) => <article className="application-row" key={application._id}>
        <div className={`company-logo ${companyColors[index % companyColors.length]}`}>
          {application.job?.companyLogo || initials(application.job?.company)}
        </div>
        <div className="application-info">
          <div className="job-company">{application.job?.company}</div>
          <h3>{application.job?.title}</h3>
          <div className="job-meta">
            <span><MapPin size={14} />{application.job?.location}</span>
            <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <StatusPill status={application.status} />
      </article>)}
    </div> : <div className="empty-state">
      <div className="empty-icon"><BriefcaseBusiness /></div>
      <h3>Your story starts with one application.</h3>
      <p>Find a role that feels right and take that first step.</p>
      <Button onClick={onDiscover}>Explore opportunities <ArrowRight size={16} /></Button>
    </div>}
  </main>;
}
