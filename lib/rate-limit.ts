const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30;

const ipHits = new Map<string, { count: number; firstRequest: number }>();

export function rateLimit(ip: string) {
  const now = Date.now();
  const hit = ipHits.get(ip);
  if (!hit) {
    ipHits.set(ip, { count: 1, firstRequest: now });
    return true;
  }
  if (now - hit.firstRequest > WINDOW_MS) {
    ipHits.set(ip, { count: 1, firstRequest: now });
    return true;
  }
  hit.count += 1;
  if (hit.count > MAX_REQUESTS) {
    return false;
  }
  return true;
}
