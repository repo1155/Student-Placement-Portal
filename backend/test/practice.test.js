const test = require('node:test');
const assert = require('node:assert/strict');
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
