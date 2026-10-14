import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock3, Flag, LoaderCircle } from 'lucide-react';
import { api } from '../../api';
import Button from '../../components/Button';

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function PracticeQuizPage({ category, mode = 'standard', topic = null, id, onNavigate, onNotice }) {
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [remaining, setRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingSaves, setPendingSaves] = useState(0);
  const [error, setError] = useState('');
  const didSubmit = useRef(false);
  const timeoutNoticeShown = useRef(false);
  const attemptRef = useRef(null);
  const startRequest = useRef(null);
  const saveQueue = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;
    const loadAttempt = async () => {
      try {
        if (!id && !startRequest.current) {
          startRequest.current = api('/practice/attempts', {
            method: 'POST',
            body: JSON.stringify({ category, mode, topic })
          });
        }
        const result = id ? await api(`/practice/attempts/${id}`) : await startRequest.current;
        if (!active) return;
        if (result.attempt.status === 'completed') {
          onNavigate(`/practice/results/${result.attempt.id}`, { replace: true });
          return;
        }
        if (!Array.isArray(result.attempt.questions) || result.attempt.questions.length === 0
          || result.attempt.questions.some((question) => (
            !Array.isArray(question.options)
            || question.options.length !== 4
            || question.options.some((option) => typeof option !== 'string')
          ))) {
          setError('This practice attempt has incomplete question data. Return to practice and start a fresh set.');
          return;
        }
        setAttempt(result.attempt);
        attemptRef.current = result.attempt;
        setAnswers(Object.fromEntries((result.attempt.responses || []).map(({ questionId, selectedOption }) => [questionId, selectedOption])));
        if (id) onNavigate(`/practice/attempt/${id}`, { replace: true });
        else onNavigate(`/practice/attempt/${result.attempt.id}`, { replace: true });
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadAttempt();
    return () => { active = false; };
  }, [category, id, mode, onNavigate, topic]);

  const submitAttempt = useCallback(async (timedOut = false) => {
    const currentAttempt = attemptRef.current;
    if (!currentAttempt || didSubmit.current || pendingSaves > 0) return;
    didSubmit.current = true;
    setSubmitting(true);
    setError('');
    try {
      const result = await api(`/practice/attempts/${currentAttempt.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, selectedOption]) => ({ questionId, selectedOption }))
        })
      });
      onNavigate(`/practice/results/${result.attempt.id}`, { replace: true });
    } catch (requestError) {
      didSubmit.current = false;
      setSubmitting(false);
      setError(requestError.message);
      if (timedOut && !timeoutNoticeShown.current) {
        timeoutNoticeShown.current = true;
        onNotice('Time is up. Your answers are ready to submit when the connection returns.');
      }
    }
  }, [answers, onNavigate, onNotice, pendingSaves]);

  function selectAnswer(questionId, selectedOption) {
    setAnswers((previous) => ({ ...previous, [questionId]: selectedOption }));
    setError('');
    setPendingSaves((count) => count + 1);
    saveQueue.current = saveQueue.current.catch(() => {}).then(() => api(`/practice/attempts/${attempt.id}/answers`, {
      method: 'PATCH',
      body: JSON.stringify({ questionId, selectedOption })
    })).catch((requestError) => {
      setError(`Your answer could not be saved. Choose it again to retry. ${requestError.message}`);
    }).finally(() => {
      setPendingSaves((count) => Math.max(0, count - 1));
    });
  }

  useEffect(() => {
    if (!attempt?.expiresAt) return undefined;
    const updateRemaining = () => {
      const secondsLeft = Math.max(0, Math.ceil((new Date(attempt.expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(secondsLeft);
      if (secondsLeft === 0) submitAttempt(true);
    };
    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [attempt, submitAttempt]);

  if (loading) return <main className="loading-route"><span className="spinner" />Setting up your practice…</main>;
  if (error && !attempt) return <main className="route-message"><div className="eyebrow">PRACTICE UNAVAILABLE</div><h1>We couldn’t open this quiz.</h1><p>{error}</p><Button onClick={() => onNavigate('/practice')}>Back to practice tracks</Button></main>;
  if (!attempt) return null;

  const question = attempt.questions[activeIndex];
  const answeredCount = Object.keys(answers).length;
  const clockIsLow = remaining !== null && remaining <= 60;

  return <main className="practice-quiz-main">
    <div className="quiz-topline">
      <button className="back-link" onClick={() => onNavigate('/practice')}><ArrowLeft size={16} /> Leave quiz</button>
      <div className={`quiz-timer ${clockIsLow ? 'timer-low' : ''}`} aria-live="polite"><Clock3 size={17} /><span>{formatTime(remaining ?? 0)}</span><small>remaining</small></div>
    </div>
    <div className="quiz-heading">
      <div className="eyebrow">{attempt.category.replaceAll('-', ' ').toUpperCase()} · {(attempt.mode || 'standard').toUpperCase()} PRACTICE{attempt.topic ? ` · ${attempt.topic.toUpperCase()}` : ''}</div>
      <h1>Focus on one question<span className="brand-dot">.</span></h1>
      <p>Move between questions freely. Explanations appear when you submit.</p>
    </div>
    <div className="quiz-progress"><span style={{ width: `${(answeredCount / attempt.questions.length) * 100}%` }} /></div>
    <div className="quiz-layout">
      <section className="quiz-question-card">
        <div className="quiz-question-meta"><span>QUESTION {String(activeIndex + 1).padStart(2, '0')} / {String(attempt.questions.length).padStart(2, '0')}</span><span>{question.difficulty} · {question.topic}</span></div>
        <h2>{question.prompt}</h2>
        <div className="quiz-options">
          {question.options.map((option, index) => <button
            className={`quiz-option ${answers[question.id] === index ? 'selected' : ''}`}
            key={option}
            onClick={() => selectAnswer(question.id, index)}
            disabled={submitting}
            aria-pressed={answers[question.id] === index}
          >
            <span className="option-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>
            {answers[question.id] === index && <Check size={17} />}
          </button>)}
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="quiz-question-actions">
          <Button variant="outline" disabled={activeIndex === 0} onClick={() => setActiveIndex((index) => index - 1)}><ArrowLeft size={15} /> Previous</Button>
          {activeIndex < attempt.questions.length - 1
            ? <Button onClick={() => setActiveIndex((index) => index + 1)}>Next question <ArrowRight size={15} /></Button>
            : <Button disabled={submitting || pendingSaves > 0} onClick={() => submitAttempt()}>{submitting ? <LoaderCircle className="spin" size={16} /> : <Flag size={15} />} {pendingSaves ? 'Saving answers…' : 'Submit quiz'}</Button>}
        </div>
      </section>
      <aside className="quiz-sidebar">
        <div className="quiz-sidebar-title"><strong>Question map</strong><span>{answeredCount} answered</span></div>
        <div className="quiz-question-map">{attempt.questions.map((item, index) => <button
          key={item.id}
          className={`${activeIndex === index ? 'current' : ''} ${answers[item.id] !== undefined ? 'answered' : ''}`}
          onClick={() => setActiveIndex(index)}
          aria-label={`Go to question ${index + 1}${answers[item.id] !== undefined ? ', answered' : ', unanswered'}`}
        >{String(index + 1).padStart(2, '0')}</button>)}</div>
        <div className="quiz-tip"><Flag size={15} /><span>It’s okay to skip a question. Unanswered questions count as incorrect.</span></div>
        <Button className="quiz-submit-all" disabled={submitting || pendingSaves > 0} variant="outline" onClick={() => submitAttempt()}>{submitting ? 'Submitting…' : pendingSaves ? 'Saving answers…' : 'Finish and see results'} <ArrowRight size={15} /></Button>
      </aside>
    </div>
  </main>;
}
