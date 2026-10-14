import { ArrowUpRight, Bookmark, Check, Clock3, MapPin, Sparkles } from 'lucide-react';
import Button from './Button';
import { companyColors, dateLabel, initials } from '../utils/presentation';

export default function JobCard({ job, index, saved, applied, onSave, onView }) {
  const company = job.company || job.employer?.company || 'Great company';
  return <article className={`job-card ${index === 0 ? 'job-card-featured' : ''}`}>
    <div className="job-card-top">
      <div className={`company-logo ${companyColors[index % companyColors.length]}`}>{job.companyLogo || initials(company)}</div>
      <button
        className={`save-button ${saved ? 'is-saved' : ''}`}
        aria-label={saved ? `Unsave ${job.title}` : `Save ${job.title}`}
        onClick={() => onSave(job)}
      ><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /></button>
    </div>
    <div className="job-company">{company}</div>
    <h3>{job.title}</h3>
    <div className="job-meta">
      <span><MapPin size={14} />{job.location}</span>
      <span><Clock3 size={14} />{job.duration}</span>
    </div>
    <div className="job-tags">
      <span className="tag">{job.workMode}</span>
      <span className="tag">{job.type || 'Internship'}</span>
      {job.featured && <span className="tag tag-featured"><Sparkles size={12} /> Featured</span>}
    </div>
    <div className="job-card-bottom">
      <div><strong>{job.pay}</strong><small>compensation</small></div>
      <Button variant={applied ? 'applied' : 'outline'} onClick={() => onView(job)} disabled={applied}>
        {applied ? <><Check size={15} /> Applied</> : <>View role <ArrowUpRight size={15} /></>}
      </Button>
    </div>
    {job.deadline && <div className="deadline">{dateLabel(job.deadline)}</div>}
  </article>;
}
