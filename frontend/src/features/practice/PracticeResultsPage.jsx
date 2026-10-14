import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from 'lucide-react';
import { api } from '../../api';
import Button from '../../components/Button';

export default function PracticeResultsPage({ id, onNavigate }) {
  const [attempt, setAttempt] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api(`/practice/attempts/${id}`).then((result) => {
      if (active) setAttempt(result.attempt);
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    });
    return () => { active = false; };
  }, [id]);

  if (error) return <main className="route-message" role="alert"><div className="eyebrow">RESULTS UNAVAILABLE</div><h1>We couldn’t load these results.</h1><p>{error}</p><Button onClick={() => onNavigate('/practice')}>Back to practice tracks</Button></main>;
  if (!attempt) return <main className="loading-route"><span className="spinner" />Loading your results…</main>;

  const correctCount = attempt.correctCount || 0;
  const incorrectCount = attempt.totalQuestions - correctCount;
  const minutes = Math.floor(attempt.durationSeconds / 60);
  const seconds = attempt.durationSeconds % 60;

  return <main className="practice-results-main">
    <button className="back-link" onClick={() => onNavigate('/practice')}><ArrowLeft size={16} /> All practice tracks</button>
    <section className="results-summary">
      <div className="results-confetti" aria-hidden="true">✳</div>
      <div className="eyebrow">PRACTICE COMPLETE · {attempt.category.replaceAll('-', ' ').toUpperCase()} · {(attempt.mode || 'standard').toUpperCase()}{attempt.topic ? ` · ${attempt.topic.toUpperCase()}` : ''}</div>
      <h1>{attempt.score >= 80 ? 'You’re building momentum.' : 'Every attempt moves you forward.'}</h1>
      <p>Review each explanation and see what you’re ready to practice next.</p>
      <div className="results-score-ring" style={{ '--score': `${attempt.score}%` }}><strong>{attempt.score}%</strong><span>score</span></div>
      <div className="results-stats">
        <span><Check size={15} /> {correctCount} correct</span>
        <span><X size={15} /> {incorrectCount} to revisit</span>
        <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} time used</span>
      </div>
      <div className="results-actions">
        <Button onClick={() => onNavigate(
          `/practice/quiz/${attempt.category}/${attempt.mode || 'standard'}${attempt.topic ? `/${encodeURIComponent(attempt.topic)}` : ''}`
        )}><RotateCcw size={16} /> Try another set</Button>
        <Button variant="outline" onClick={() => onNavigate('/practice')}>Choose another track <ArrowRight size={15} /></Button>
      </div>
    </section>
    <section className="results-review">
      <div className="practice-section-heading">
        <div><div className="eyebrow">LEARNING HAPPENS HERE</div><h2>Answer review</h2></div>
        <span>{attempt.questions.length} questions</span>
      </div>
      <div className="results-question-list">{attempt.questions.map((question, index) => (
        <article className={`result-question ${question.correct ? 'result-correct' : 'result-incorrect'}`} key={question.id}>
          <div className="result-question-title">
            <span className={`result-state-icon ${question.correct ? '' : 'incorrect'}`}>{question.correct ? <Check size={15} /> : <X size={15} />}</span>
            <div><span>QUESTION {String(index + 1).padStart(2, '0')} · {question.topic}</span><h3>{question.prompt}</h3></div>
          </div>
          <div className="result-answer-lines">
            <p><strong>Your answer</strong><span>{question.selectedOption === null ? 'Not answered' : question.options[question.selectedOption]}</span></p>
            {!question.correct && <p><strong>Correct answer</strong><span>{question.options[question.correctOption]}</span></p>}
          </div>
          <div className="result-explanation"><strong>Why</strong><p>{question.explanation}</p></div>
        </article>
      ))}</div>
    </section>
  </main>;
}
