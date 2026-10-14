import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Clock3, MapPin } from 'lucide-react';
import { api } from '../../api';
import Button from '../../components/Button';
import { dateLabel } from '../../utils/presentation';

export default function JobDetailPage({ id, listedJob, onBack, onApply }) {
  const [job, setJob] = useState(listedJob || null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (listedJob) {
      setJob(listedJob);
      setError('');
      return () => { cancelled = true; };
    }

    setJob(null);
    setError('');
    api(`/jobs/${id}`).then((result) => {
      if (!cancelled) setJob(result.job);
    }).catch((requestError) => {
      if (!cancelled) setError(requestError.message);
    });
    return () => { cancelled = true; };
  }, [id, listedJob]);

  return <main className="dashboard-main job-detail-page">
    <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back to opportunities</button>
    {error ? <div className="route-message" role="alert">
      <h1>This opportunity isn’t available.</h1>
      <p>{error}</p>
      <Button onClick={onBack}>Browse opportunities <ArrowRight size={16} /></Button>
    </div> : !job ? <div className="loading-state"><span className="spinner" />Loading opportunity…</div> : <>
      <article className="job-detail-card">
        <div className="eyebrow">{job.category || 'OPPORTUNITY'} · {job.status === 'closed' ? 'CLOSED' : 'NOW HIRING'}</div>
        <h1>{job.title}<span className="brand-dot">.</span></h1>
        <p className="job-detail-company">{job.company || job.employer?.company}</p>
        <div className="detail-meta">
          <span><BriefcaseBusiness size={15} />{job.type || 'Internship'}</span>
          <span><MapPin size={15} />{job.location} · {job.workMode}</span>
          <span><Clock3 size={15} />{job.duration}</span>
          <strong>{job.pay}</strong>
        </div>
        <section className="detail-section"><h2>About this opportunity</h2><p>{job.description}</p></section>
        {job.requirements?.length > 0 && <section className="detail-section">
          <h2>What you’ll bring</h2>
          <ul>{job.requirements.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>}
        {job.skills?.length > 0 && <section className="detail-section">
          <h2>Skills you’ll build and use</h2>
          <div className="detail-skills">{job.skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div>
        </section>}
        {job.deadline && <p className="detail-deadline">{dateLabel(job.deadline)}</p>}
        <div className="job-detail-actions">
          <Button disabled={job.status === 'closed'} onClick={() => onApply(job)}>
            {job.status === 'closed' ? 'Applications closed' : 'Apply for this role'} <ArrowRight size={17} />
          </Button>
          <span>No application fee. Just your next step.</span>
        </div>
      </article>
    </>}
  </main>;
}
