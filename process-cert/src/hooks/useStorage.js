export function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

export function persist(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
