const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const { config } = require('../src/config');
const { generateQuestions, publicQuestion } = require('../src/practice/questions');

test('health check responds without a database connection', async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('API root sends visitors to the configured frontend', async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/`, { redirect: 'manual' });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), config.clientOrigin.split(',')[0].trim());
});

test('unknown API routes return a clear 404 response', async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/does-not-exist`);
  assert.equal(response.status, 404);
  assert.match((await response.json()).message, /Route not found/);
});

test('registration rejects invalid account data before touching persistence', async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'not-an-email', password: 'short', role: 'admin' })
  });
  assert.equal(response.status, 400);
});

test('protected job publishing requires a signed-in session', async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert.equal(response.status, 401);
  assert.match((await response.json()).message, /sign in/i);
});

test('practice categories are available without revealing answer keys', async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/practice/categories`);
  assert.equal(response.status, 200);
  const { categories, modes } = await response.json();
  assert.deepEqual(categories.map((category) => category.id), [
    'quantitative-aptitude',
    'logical-reasoning',
    'verbal-ability',
    'programming-fundamentals'
  ]);
  assert.deepEqual(modes.map(({ id }) => id), ['quick', 'standard', 'mock']);
  assert.ok(categories.every((category) => category.topics.length > 0));
  const question = publicQuestion(generateQuestions('quantitative-aptitude', 1)[0]);
  assert.equal(Object.hasOwn(question, 'correctOption'), false);
  assert.equal(Object.hasOwn(question, 'explanation'), false);
});

test('starting and viewing practice attempts requires a student session', async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once('listening', resolve));

  const baseUrl = `http://127.0.0.1:${server.address().port}/api/practice/attempts`;
  const startResponse = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: 'quantitative-aptitude' })
  });
  assert.equal(startResponse.status, 401);

  const historyResponse = await fetch(`${baseUrl}/mine`);
  assert.equal(historyResponse.status, 401);

  const saveResponse = await fetch(`${baseUrl}/507f1f77bcf86cd799439011/answers`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId: 'qa-001', selectedOption: 2 })
  });
  assert.equal(saveResponse.status, 401);
});
