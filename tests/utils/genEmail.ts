export function genEmail() {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `test-${unique}@example.com`;
}
