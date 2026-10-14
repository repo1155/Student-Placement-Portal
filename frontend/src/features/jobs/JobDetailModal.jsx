import { ArrowRight, BriefcaseBusiness, Clock3, MapPin } from 'lucide-react';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { dateLabel } from '../../utils/presentation';

export default function JobDetailModal({ job, onClose, onApply }) {
  return <Modal title={job.title} subtitle={`${job.company || job.employer?.company} · ${job.location}`} onClose={onClose} wide>
    <div className="detail-meta">
      <span><BriefcaseBusiness size={15} />{job.type || 'Internship'}</span>
      <span><MapPin size={15} />{job.workMode}</span>
      <span><Clock3 size={15} />{job.duration}</span>
      <strong>{job.pay}</strong>
    </div>
    <div className="detail-section"><h3>About this opportunity</h3><p>{job.description}</p></div>
    {job.requirements?.length > 0 && <div className="detail-section">
      <h3>What you’ll bring</h3>
      <ul>{job.requirements.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>}
    {job.skills?.length > 0 && <div className="detail-section">
      <h3>Skills you’ll build and use</h3>
      <div className="detail-skills">{job.skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div>
    </div>}
    {job.deadline && <p className="detail-deadline">{dateLabel(job.deadline)}</p>}
    <Button className="form-submit" onClick={() => onApply(job)}>Apply for this role <ArrowRight size={17} /></Button>
  </Modal>;
}
