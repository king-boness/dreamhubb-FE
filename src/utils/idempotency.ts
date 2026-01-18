export function safeRandomUUID(): string {
  // Modern browsers
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Fallback (not cryptographically strong, but fine for idempotency keys)
  const rnd = () => Math.floor(Math.random() * 1e9).toString(16);
  return `idemp_${Date.now().toString(16)}_${rnd()}_${rnd()}`;
}

type StoredIdempotencyValue =
  | string
  | {
      key: string;
      createdAt: number;
    };

const readStoredValue = (storageKey: string): StoredIdempotencyValue | null => {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;

  // Backward compatibility: previously stored as plain string
  if (raw.trim() && !raw.trim().startsWith("{")) return raw;

  try {
    const parsed = JSON.parse(raw) as Partial<{ key: unknown; createdAt: unknown }>;
    if (typeof parsed?.key === "string" && typeof parsed?.createdAt === "number") {
      return { key: parsed.key, createdAt: parsed.createdAt };
    }
  } catch {
    // ignore
  }
  return null;
};

const writeStoredValue = (storageKey: string, value: { key: string; createdAt: number }) => {
  localStorage.setItem(storageKey, JSON.stringify(value));
};

const devLog = (event: string, meta: Record<string, unknown>) => {
  if (process.env.NODE_ENV !== "development") return;
  // eslint-disable-next-line no-console
  console.debug(`[idempotency] ${event}`, meta);
};

export function getOrCreateIdempotencyKey(
  storageKey: string,
  opts?: { ttlMs?: number }
): string {
  const ttlMs = opts?.ttlMs ?? 2 * 60 * 60 * 1000; // default: 2h

  const existing = readStoredValue(storageKey);
  if (existing) {
    if (typeof existing === "string") {
      devLog("used_legacy_string_key", { storageKey, key: existing });
      return existing;
    }
    const age = Date.now() - existing.createdAt;
    if (ttlMs > 0 && age > ttlMs) {
      const newKey = safeRandomUUID();
      writeStoredValue(storageKey, { key: newKey, createdAt: Date.now() });
      devLog("rotated_expired_key", { storageKey, oldKey: existing.key, newKey, ageMs: age, ttlMs });
      return newKey;
    }
    devLog("used_existing_key", { storageKey, key: existing.key, ageMs: age, ttlMs });
    return existing.key;
  }

  const key = safeRandomUUID();
  writeStoredValue(storageKey, { key, createdAt: Date.now() });
  devLog("created_new_key", { storageKey, key, ttlMs });
  return key;
}

export function clearIdempotencyKey(storageKey: string) {
  localStorage.removeItem(storageKey);
  devLog("cleared_key", { storageKey });
}
