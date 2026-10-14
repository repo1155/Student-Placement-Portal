const routes = {
  '/': { name: 'discover' },
  '/saved': { name: 'saved' },
  '/applications': { name: 'applications' },
  '/practice': { name: 'practice' },
  '/employer/listings': { name: 'listings' }
};

export function resolveRoute(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (routes[path]) return routes[path];

  const jobMatch = path.match(/^\/jobs\/([a-f\d]{24})$/i);
  if (jobMatch) return { name: 'job', id: jobMatch[1] };

  const practiceCategoryMatch = path.match(/^\/practice\/quiz\/([a-z\d-]+)(?:\/(quick|standard|mock)(?:\/([a-z\d%-]+))?)?$/i);
  if (practiceCategoryMatch) {
    let topic = null;
    try {
      topic = practiceCategoryMatch[3] ? decodeURIComponent(practiceCategoryMatch[3]) : null;
    } catch {
      return { name: 'not-found' };
    }
    return {
      name: 'practice-quiz',
      category: practiceCategoryMatch[1],
      mode: practiceCategoryMatch[2] || 'standard',
      topic
    };
  }

  const practiceAttemptMatch = path.match(/^\/practice\/attempt\/([a-f\d]{24})$/i);
  if (practiceAttemptMatch) return { name: 'practice-quiz', id: practiceAttemptMatch[1] };

  const practiceResultMatch = path.match(/^\/practice\/results\/([a-f\d]{24})$/i);
  if (practiceResultMatch) return { name: 'practice-results', id: practiceResultMatch[1] };

  return { name: 'not-found' };
}
