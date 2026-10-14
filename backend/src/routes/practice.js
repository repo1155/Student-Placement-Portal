const express = require('express');
const { z } = require('zod');
const PracticeAttempt = require('../models/PracticeAttempt');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncRoute, validate } = require('../utils/validation');
const { categories, generateQuestions, getCategory, publicQuestion } = require('../practice/questions');

const router = express.Router();
const quizModes = {
  quick: { name: 'Quick practice', questionCount: 5, durationSeconds: 8 * 60 },
  standard: { name: 'Standard set', questionCount: 10, durationSeconds: 15 * 60 },
  mock: { name: 'Mock assessment', questionCount: 15, durationSeconds: 25 * 60 }
};

function attemptSummary(attempt) {
  return {
    id: String(attempt._id || attempt.id),
    category: attempt.category,
    mode: attempt.mode || 'standard',
    topic: attempt.topic || null,
    status: attempt.status,
    totalQuestions: attempt.questions?.length || attempt.questionIds.length,
    correctCount: attempt.correctCount ?? null,
    score: attempt.score ?? null,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt ?? null,
    expiresAt: attempt.expiresAt,
    durationSeconds: attempt.completedAt
      ? Math.max(0, Math.round((attempt.completedAt - attempt.startedAt) / 1000))
      : attempt.durationSeconds || Math.max(0, Math.round((attempt.expiresAt - attempt.startedAt) / 1000))
  };
}

function attemptResult(attempt) {
  const answerById = new Map(attempt.answers.map((answer) => [answer.questionId, answer]));
  const questions = attempt.questions.map((question) => {
      const answer = answerById.get(question.id);
      return {
        ...publicQuestion(question),
        correctOption: question.correctOption,
        explanation: question.explanation,
        selectedOption: answer?.selectedOption ?? null,
        correct: answer?.correct ?? false
      };
    });

  return { ...attemptSummary(attempt), questions };
}

router.get('/categories', (req, res) => {
  const modes = Object.entries(quizModes).map(([id, mode]) => ({ id, ...mode }));
  res.json({
    categories: categories.map((category) => ({
      ...category,
      modes
    })),
    modes
  });
});

router.post('/attempts', authenticate, requireRole('student'), asyncRoute(async (req, res) => {
  const { category: categoryId, mode: modeId, topic } = validate(z.object({
    category: z.string().min(1).max(60),
    mode: z.enum(['quick', 'standard', 'mock']).default('standard'),
    topic: z.string().min(1).max(60).nullable().optional().default(null)
  }), req.body);
  const category = getCategory(categoryId);
  if (!category) return res.status(404).json({ message: 'Practice category not found.' });
  if (topic && !category.topics.includes(topic)) {
    return res.status(400).json({ message: 'The selected topic is not available in this practice track.' });
  }

  const previousAttempts = await PracticeAttempt.find({ student: req.user.id }, 'questions.questionKey').lean();
  const previousQuestionKeys = new Set(previousAttempts.flatMap((attempt) =>
    (attempt.questions || []).map((question) => question.questionKey)
  ));
  const mode = quizModes[modeId];
  const selectedQuestions = generateQuestions(category.id, mode.questionCount, previousQuestionKeys, topic);
  if (!selectedQuestions) return res.status(400).json({ message: 'No question generator is available for this topic.' });
  const startedAt = new Date();
  const attempt = await PracticeAttempt.create({
    student: req.user.id,
    category: category.id,
    mode: modeId,
    topic,
    durationSeconds: mode.durationSeconds,
    questions: selectedQuestions,
    questionIds: selectedQuestions.map((question) => question.id),
    startedAt,
    expiresAt: new Date(startedAt.getTime() + mode.durationSeconds * 1000)
  });

  return res.status(201).json({
    attempt: {
      ...attemptSummary(attempt),
      questions: selectedQuestions.map(publicQuestion)
    }
  });
}));

router.get('/attempts/mine', authenticate, requireRole('student'), asyncRoute(async (req, res) => {
  const attempts = await PracticeAttempt.find({ student: req.user.id })
    .sort({ updatedAt: -1 }).limit(50).lean();
  res.json({ attempts: attempts.map(attemptSummary) });
}));

router.patch('/attempts/:id/answers', authenticate, requireRole('student'), asyncRoute(async (req, res) => {
  const response = validate(z.object({
    questionId: z.string().min(1).max(60),
    selectedOption: z.number().int().min(0).max(3).nullable()
  }), req.body);

  const attempt = await PracticeAttempt.findOne({ _id: req.params.id, student: req.user.id });
  if (!attempt) return res.status(404).json({ message: 'Practice attempt not found.' });
  if (attempt.status === 'completed') return res.status(409).json({ message: 'This practice attempt is already complete.' });
  if (attempt.expiresAt <= new Date()) return res.status(410).json({ message: 'This practice attempt has expired.' });
  if (!attempt.questionIds.includes(response.questionId)) {
    return res.status(400).json({ message: 'The question does not belong to this practice attempt.' });
  }

  const existingResponse = attempt.responses.find((answer) => answer.questionId === response.questionId);
  if (existingResponse) existingResponse.selectedOption = response.selectedOption;
  else attempt.responses.push(response);
  await attempt.save();
  return res.json({ saved: true });
}));

router.get('/attempts/:id', authenticate, requireRole('student'), asyncRoute(async (req, res) => {
  const attempt = await PracticeAttempt.findOne({ _id: req.params.id, student: req.user.id });
  if (!attempt) return res.status(404).json({ message: 'Practice attempt not found.' });

  if (attempt.status === 'completed') {
    if (!attempt.questions?.length) {
      return res.status(410).json({ message: 'This older practice attempt is no longer available. Start a new quiz to get fresh questions.' });
    }
    return res.json({ attempt: attemptResult(attempt) });
  }

  if (!attempt.questions?.length) {
    return res.status(410).json({ message: 'This older practice attempt cannot be resumed. Start a new quiz to get fresh questions.' });
  }

  return res.json({
    attempt: {
      ...attemptSummary(attempt),
      responses: attempt.responses.map((answer) => ({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption
      })),
      questions: attempt.questions.map(publicQuestion)
    }
  });
}));

router.post('/attempts/:id/submit', authenticate, requireRole('student'), asyncRoute(async (req, res) => {
  const { answers } = validate(z.object({
    answers: z.array(z.object({
      questionId: z.string().min(1).max(60),
      selectedOption: z.number().int().min(0).max(3).nullable()
    })).max(15).default([])
  }).superRefine(({ answers: submitted }, context) => {
    if (new Set(submitted.map((answer) => answer.questionId)).size !== submitted.length) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Each question can only be answered once.' });
    }
  }), req.body);

  const attempt = await PracticeAttempt.findOne({ _id: req.params.id, student: req.user.id });
  if (!attempt) return res.status(404).json({ message: 'Practice attempt not found.' });
  if (attempt.status === 'completed') return res.json({ attempt: attemptResult(attempt) });
  if (!attempt.questions?.length) {
    return res.status(410).json({ message: 'This older practice attempt cannot be submitted. Start a new quiz to get fresh questions.' });
  }
  const timedOut = attempt.expiresAt <= new Date();

  const submittedById = new Map(attempt.responses.map((answer) => [answer.questionId, answer.selectedOption]));
  if (!timedOut) {
    for (const answer of answers) submittedById.set(answer.questionId, answer.selectedOption);
  }
  if (answers.some((answer) => !attempt.questionIds.includes(answer.questionId))) {
    return res.status(400).json({ message: 'Answers must belong to this practice attempt.' });
  }

  attempt.answers = attempt.questionIds.map((questionId) => {
    const question = attempt.questions.find((item) => item.id === questionId);
    if (!question) throw new Error(`Missing practice question snapshot: ${questionId}`);
    const selectedOption = submittedById.get(questionId) ?? null;
    return {
      questionId,
      selectedOption,
      correct: selectedOption === question.correctOption
    };
  });
  attempt.correctCount = attempt.answers.filter((answer) => answer.correct).length;
  attempt.score = Math.round(attempt.correctCount / attempt.questionIds.length * 100);
  attempt.completedAt = new Date();
  attempt.status = 'completed';
  await attempt.save();

  return res.json({ attempt: attemptResult(attempt) });
}));

module.exports = router;
