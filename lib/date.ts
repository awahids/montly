const TIMEZONE = 'Asia/Jakarta';

export function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function endOfMonth(date: Date): Date {
  const start = startOfMonth(date);
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0, 23, 59, 59, 999));
}

export function formatLocal(date: Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, ...options }).format(date);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(date);
}

export { TIMEZONE };
