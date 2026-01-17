export function safeRandomUUID(): string {
  // Modern browsers
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Fallback (not cryptographically strong, but fine for idempotency keys)
  const rnd = () => Math.floor(Math.random() * 1e9).toString(16);
  return `idemp_${Date.now().toString(16)}_${rnd()}_${rnd()}`;
}

export function getOrCreateIdempotencyKey(storageKey: string): string {
  const existing = localStorage.getItem(storageKey);
  if (existing && existing.trim()) return existing;
  const key = safeRandomUUID();
  localStorage.setItem(storageKey, key);
  return key;
}

export function clearIdempotencyKey(storageKey: string) {
  localStorage.removeItem(storageKey);
}