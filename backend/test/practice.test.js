const test = require('node:test');
const assert = require('node:assert/strict');
const PracticeAttempt = require('../src/models/PracticeAttempt');
const { categories, generateQuestions, publicQuestion } = require('../src/practice/questions');

test('every practice category generates valid, unexposed questions', () => {
  assert.equal(categories.length, 4);

  for (const category of categories) {
    const questions = generateQuestions(category.id, 5);
    assert.equal(questions.length, 5);
    assert.equal(new Set(questions.map((question) => question.id)).size, 5);
    assert.equal(new Set(questions.map((question) => question.questionKey)).size, 5);
    for (const question of questions) {
      assert.equal(question.options.length, 4, question.id);
      assert.ok(question.correctOption >= 0 && question.correctOption < question.options.length, question.id);
      assert.ok(question.explanation.length > 0, question.id);
      assert.ok(question.prompt.length > 20, question.id);
      assert.equal(Object.hasOwn(publicQuestion(question), 'correctOption'), false, question.id);
      assert.equal(Object.hasOwn(publicQuestion(question), 'explanation'), false, question.id);
    }
  }
});

test('a student receives no repeated questions across attempts', () => {
  for (const category of categories) {
    const previousQuestions = generateQuestions(category.id, 20);
    const previousKeys = new Set(previousQuestions.map((question) => question.questionKey));
    const nextQuestions = generateQuestions(category.id, 20, previousKeys);
    assert.equal(nextQuestions.some((question) => previousKeys.has(question.questionKey)), false, category.id);
    assert.equal(new Set(nextQuestions.map((question) => question.questionKey)).size, nextQuestions.length, category.id);
  }
});

test('every topic can generate a unique mock-assessment set', () => {
  for (const category of categories) {
    for (const topic of category.topics) {
      const questions = generateQuestions(category.id, 15, new Set(), topic);
      assert.equal(questions.length, 15, `${category.id} / ${topic}`);
      assert.ok(questions.every((question) => question.topic === topic), `${category.id} / ${topic}`);
      assert.equal(new Set(questions.map((question) => question.questionKey)).size, 15, `${category.id} / ${topic}`);
    }
  }
});

test('topic filters reject unknown topics without generating a mixed set', () => {
  assert.equal(generateQuestions('quantitative-aptitude', 5, new Set(), 'Unknown topic'), null);
});

test('public question serialization preserves fields from Mongoose question snapshots', () => {
  const attempt = new PracticeAttempt({
    student: '507f1f77bcf86cd799439011',
    category: 'quantitative-aptitude',
    questionIds: ['question-1'],
    questions: [{
      id: 'question-1',
      questionKey: 'fingerprint',
      topic: 'Percentages',
      difficulty: 'easy',
      prompt: 'What is 10% of 50?',
      options: ['5', '10', '15', '20'],
      correctOption: 0,
      explanation: 'Multiply 50 by 0.1.',
    }],
    startedAt: new Date(),
    expiresAt: new Date(Date.now() + 60_000)
  });

  const serialized = publicQuestion(attempt.questions[0]);
  assert.deepEqual(serialized.options, ['5', '10', '15', '20']);
  assert.equal(serialized.prompt, 'What is 10% of 50?');
  assert.equal(Object.hasOwn(serialized, 'correctOption'), false);
  assert.equal(Object.hasOwn(serialized, 'explanation'), false);
  assert.equal(Object.hasOwn(serialized, 'questionKey'), false);
});
