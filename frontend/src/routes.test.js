import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRoute } from './routes.js';

test('resolves the main portal pages', () => {
  assert.deepEqual(resolveRoute('/'), { name: 'discover' });
  assert.deepEqual(resolveRoute('/saved'), { name: 'saved' });
  assert.deepEqual(resolveRoute('/applications'), { name: 'applications' });
  assert.deepEqual(resolveRoute('/practice'), { name: 'practice' });
  assert.deepEqual(resolveRoute('/employer/listings'), { name: 'listings' });
});

test('resolves practice quiz, attempt, and result URLs', () => {
  assert.deepEqual(resolveRoute('/practice/quiz/quantitative-aptitude'), {
    name: 'practice-quiz',
    category: 'quantitative-aptitude',
    mode: 'standard',
    topic: null
  });
  assert.deepEqual(resolveRoute('/practice/quiz/quantitative-aptitude/mock/Speed%20and%20distance'), {
    name: 'practice-quiz',
    category: 'quantitative-aptitude',
    mode: 'mock',
    topic: 'Speed and distance'
  });
  assert.deepEqual(resolveRoute('/practice/attempt/507f1f77bcf86cd799439011'), {
    name: 'practice-quiz',
    id: '507f1f77bcf86cd799439011'
  });
  assert.deepEqual(resolveRoute('/practice/results/507f1f77bcf86cd799439011'), {
    name: 'practice-results',
    id: '507f1f77bcf86cd799439011'
  });
});

test('resolves job detail URLs and trailing slashes', () => {
  assert.deepEqual(resolveRoute('/jobs/507f1f77bcf86cd799439011'), {
    name: 'job',
    id: '507f1f77bcf86cd799439011'
  });
  assert.deepEqual(resolveRoute('/applications/'), { name: 'applications' });
});

test('sends malformed and unknown paths to the not-found page', () => {
  assert.deepEqual(resolveRoute('/jobs/not-an-id'), { name: 'not-found' });
  assert.deepEqual(resolveRoute('/missing'), { name: 'not-found' });
});
