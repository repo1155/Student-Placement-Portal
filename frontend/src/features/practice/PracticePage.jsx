import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Award, BookOpenText, Brain, Calculator, CheckCircle2,
  Code2, Flame, LockKeyhole, Sparkles, Target
} from 'lucide-react';
import { api } from '../../api';
import Button from '../../components/Button';

const icons = { Calculator, Brain, BookOpenText, Code2 };

function formatDuration(seconds) {
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

export default function PracticePage({ onStart, onOpenResult, onResumeAttempt }) {
  const [categories, setCategories] = useState([]);
  const [modes, setModes] = useState([]);
  const [selectedMode, setSelectedMode] = useState('standard');
  const [selectedTopics, setSelectedTopics] = useState({});
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api('/practice/categories'), api('/practice/attempts/mine')])
      .then(([categoryResult, attemptResult]) => {
        if (!active) return;
        setCategories(categoryResult.categories);
        setModes(categoryResult.modes || categoryResult.categories[0]?.modes || []);
        setAttempts(attemptResult.attempts);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const completedAttempts = useMemo(() => attempts.filter((attempt) => attempt.status === 'completed'), [attempts]);
  const activeAttempts = useMemo(() => attempts.filter((attempt) => attempt.status === 'in_progress'), [attempts]);
  const averageScore = completedAttempts.length
    ? Math.round(completedAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / completedAttempts.length)
    : 0;
  const bestScore = completedAttempts.length
    ? Math.max(...completedAttempts.map((attempt) => attempt.score))
    : 0;

  return <main className="practice-main">
    <section className="practice-hero">
      <div className="practice-hero-copy">
        <div className="eyebrow"><span className="eyebrow-line" /> YOUR SKILLS, ONE QUESTION AT A TIME</div>
        <h1>Practice with purpose<span className="brand-dot">.</span></h1>
        <p>Short, focused challenges with clear explanations. Build the confidence to show what you know.</p>
        <div className="practice-hero-points">
          <span><CheckCircle2 size={15} /> Original practice questions</span>
          <span><CheckCircle2 size={15} /> Explanations after every quiz</span>
          <span><CheckCircle2 size={15} /> Your progress, saved</span>
        </div>
      </div>
      <div className="practice-hero-art" aria-hidden="true">
        <div className="practice-art-orbit orbit-one" /><div className="practice-art-orbit orbit-two" />
        <div className="practice-art-badge"><Target size={27} /><span>One step<br />sharper.</span></div>
        <div className="practice-art-spark spark-a">✳</div><div className="practice-art-spark spark-b">✦</div>
      </div>
    </section>

    <section className="practice-overview" aria-label="Practice progress">
      <article><span className="overview-icon"><Flame size={17} /></span><div><small>Quizzes completed</small><strong>{completedAttempts.length}</strong></div></article>
      <article><span className="overview-icon"><Target size={17} /></span><div><small>Average score</small><strong>{completedAttempts.length ? `${averageScore}%` : '—'}</strong></div></article>
      <article><span className="overview-icon"><Award size={17} /></span><div><small>Personal best</small><strong>{completedAttempts.length ? `${bestScore}%` : '—'}</strong></div></article>
    </section>

    <section className="practice-catalog">
      <div className="practice-section-heading">
        <div><div className="eyebrow">PICK YOUR NEXT CHALLENGE</div><h2>Choose a practice track</h2></div>
        <span>Choose a length and focus area</span>
      </div>
      {error && <div className="error-banner" role="alert"><span>{error}</span><button onClick={() => window.location.reload()}>Try again</button></div>}
      {loading ? <div className="loading-state"><span className="spinner" />Preparing your practice tracks…</div> : <>
      <div className="practice-mode-picker" role="radiogroup" aria-label="Choose quiz length">
        {modes.map((mode) => <button
          className={`practice-mode-option ${selectedMode === mode.id ? 'selected' : ''}`}
          key={mode.id}
          onClick={() => setSelectedMode(mode.id)}
          role="radio"
          aria-checked={selectedMode === mode.id}
        >
          <strong>{mode.name}</strong>
          <span>{mode.questionCount} questions · {formatDuration(mode.durationSeconds)}</span>
        </button>)}
      </div>
      <div className="practice-track-grid">
        {categories.map((category, index) => {
          const Icon = icons[category.icon] || BookOpenText;
          const categoryAttempts = completedAttempts.filter((attempt) => attempt.category === category.id);
          const personalBest = categoryAttempts.length ? Math.max(...categoryAttempts.map((attempt) => attempt.score)) : null;
          const mode = modes.find((item) => item.id === selectedMode);
          return <article className={`practice-track track-tone-${index}`} key={category.id}>
            <div className="track-card-top">
              <span className="track-icon"><Icon size={21} /></span>
              <span className="track-question-count">Personalized practice</span>
            </div>
            <div className="track-overline">PRACTICE TRACK {String(index + 1).padStart(2, '0')}</div>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <label className="practice-topic-select">
              Focus area
              <select
                value={selectedTopics[category.id] || ''}
                onChange={(event) => setSelectedTopics((current) => ({ ...current, [category.id]: event.target.value }))}
              >
                <option value="">All topics</option>
                {category.topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
              </select>
            </label>
            <div className="track-meta">
              <span>{mode?.questionCount || 10} questions / quiz</span>
              <span>{formatDuration(mode?.durationSeconds || 15 * 60)}</span>
            </div>
            <div className="track-footer">
              <span>{personalBest === null ? 'A fresh start' : `Personal best · ${personalBest}%`}</span>
              <Button onClick={() => onStart(category.id, selectedMode, selectedTopics[category.id] || null)}>Start practice <ArrowRight size={15} /></Button>
            </div>
          </article>;
        })}
      </div></>}
    </section>

    <section className="practice-lower-grid">
      <div className="practice-tip">
        <div className="tip-icon"><Sparkles size={18} /></div>
        <div><span className="eyebrow">A BETTER WAY TO LEARN</span><h3>Review the reasoning, not just the score.</h3><p>After each timed set, see why the right answer works and where you can improve. Every question is written for this portal.</p></div>
      </div>
      <div className="practice-recent">
        <div className="practice-recent-heading"><h3>Recent practice</h3><span>{completedAttempts.length} completed</span></div>
        {activeAttempts.map((attempt) => (
          <button className="recent-attempt resume-attempt" key={attempt.id} onClick={() => onResumeAttempt(attempt.id)}>
            <span><strong>{categories.find((category) => category.id === attempt.category)?.name || attempt.category}</strong><small>In progress · started {new Date(attempt.startedAt).toLocaleDateString()}</small></span>
            <b>Continue <ArrowRight size={13} /></b>
          </button>
        ))}
        {completedAttempts.length ? completedAttempts.slice(0, 4).map((attempt) => (
          <button className="recent-attempt" key={attempt.id} onClick={() => onOpenResult(attempt.id)}>
            <span><strong>{categories.find((category) => category.id === attempt.category)?.name || attempt.category}</strong><small>{new Date(attempt.completedAt).toLocaleDateString()}</small></span>
            <b>{attempt.score}%</b>
          </button>
        )) : activeAttempts.length === 0 && <div className="practice-first-run"><LockKeyhole size={16} /><span>Your quiz history will appear here after your first practice.</span></div>}
      </div>
    </section>
  </main>;
}
