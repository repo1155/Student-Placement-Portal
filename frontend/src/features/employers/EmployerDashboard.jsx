import { useState } from 'react';
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, MapPin, Plus } from 'lucide-react';
import { api } from '../../api';
import Button from '../../components/Button';
import { initials } from '../../utils/presentation';

export default function EmployerDashboard({ jobs, applicants, onCreate, onNotice, onListingStatus, onApplicationStatus }) {
  const [updatingListings, setUpdatingListings] = useState({});
  const applicantList = Object.values(applicants).flat();
  const openCount = jobs.filter((job) => job.status === 'open').length;
  const interviewCount = applicantList.filter((application) => application.status === 'interview').length;
  const offerCount = applicantList.filter((application) => application.status === 'offer').length;

  async function updateListing(job, status) {
    setUpdatingListings((previous) => ({ ...previous, [job._id]: true }));
    try {
      await api(`/jobs/${job._id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      onListingStatus(job._id, status);
    } catch (error) {
      onNotice(error.message);
    } finally {
      setUpdatingListings((previous) => ({ ...previous, [job._id]: false }));
    }
  }

  return <main className="dashboard-main">
    <div className="dashboard-heading">
      <div><div className="eyebrow">TALENT STARTS HERE</div><h1>Your listings<span className="brand-dot">.</span></h1><p>Help someone find their first yes.</p></div>
      <Button onClick={onCreate}><Plus size={17} /> Post a role</Button>
    </div>
    <section className="dashboard-stats" aria-label="Hiring overview">
      <article><span>All listings</span><strong>{jobs.length}</strong><small>Opportunities you’ve created</small></article>
      <article><span>Open roles</span><strong>{openCount}</strong><small>Currently accepting applications</small></article>
      <article><span>Applicants</span><strong>{applicantList.length}</strong><small>Candidates in your pipeline</small></article>
      <article><span>Interviews & offers</span><strong>{interviewCount + offerCount}</strong><small>{interviewCount} interviews · {offerCount} offers</small></article>
    </section>
    {jobs.length ? <div className="employer-listings">
      {jobs.map((job) => {
        const jobApplicants = applicants[job._id] || [];
        return <article className="employer-job" key={job._id}>
          <div className="employer-job-head">
            <div>
              <div className="job-company">{job.category} · {job.workMode}</div>
              <h3>{job.title}</h3>
              <div className="job-meta">
                <span><MapPin size={14} />{job.location}</span>
                <span><BriefcaseBusiness size={14} />{job.applicationCount} applicants</span>
              </div>
            </div>
            <select aria-label={`Listing status for ${job.title}`} value={job.status} disabled={updatingListings[job._id]} onChange={(event) => updateListing(job, event.target.value)}>
              <option value="open">Open</option><option value="closed">Closed</option>
            </select>
          </div>
          <div className="applicant-section">
            <div className="applicant-title">Applicants <span>{jobApplicants.length}</span></div>
            {jobApplicants.length ? jobApplicants.map((application) => <div className="applicant-row" key={application._id}>
              <div className="avatar">{initials(application.student?.name)}</div>
              <div className="applicant-info">
                <strong>{application.student?.name}</strong>
                <span>{[application.student?.major, application.student?.school].filter(Boolean).join(' · ') || application.student?.email}</span>
              </div>
              {application.resumeUrl && <a className="resume-link" href={application.resumeUrl} target="_blank" rel="noreferrer">Resume <ArrowUpRight size={13} /></a>}
              <select aria-label={`Application status for ${application.student?.name}`} value={application.status} onChange={(event) => onApplicationStatus(application._id, event.target.value, job._id)}>
                <option value="submitted">Submitted</option><option value="reviewing">In review</option><option value="interview">Interview</option><option value="offer">Offer</option><option value="rejected">Not selected</option>
              </select>
            </div>) : <p className="no-applicants">No applications yet. Share your role to get the word out.</p>}
          </div>
        </article>;
      })}
    </div> : <div className="empty-state">
      <div className="empty-icon"><Plus /></div>
      <h3>Make your first opportunity count.</h3>
      <p>Great candidates are looking for a team like yours.</p>
      <Button onClick={onCreate}>Post your first role <ArrowRight size={16} /></Button>
    </div>}
  </main>;
}
