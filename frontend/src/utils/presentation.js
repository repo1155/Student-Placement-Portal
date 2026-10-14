export const companyColors = ['mint', 'lavender', 'peach', 'blue', 'yellow', 'rose'];

export function initials(value = '') {
  return value.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
}

export function dateLabel(date) {
  const days = Math.max(0, Math.ceil((new Date(date) - Date.now()) / 86400000));
  return days === 0 ? 'Closes today' : `Closes in ${days} days`;
}
