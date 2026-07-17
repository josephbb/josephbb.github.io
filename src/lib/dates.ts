/** Format a content date as a calendar day without timezone drift. */
export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
): string {
  return date.toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
}

export function dateAttr(date: Date): string {
  return date.toISOString().slice(0, 10);
}
