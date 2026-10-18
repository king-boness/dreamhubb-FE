/**
 * Cold-start gate: single-flight session probe + waiters for splash / post-auth home.
 * Order: TOKEN → AUTH INIT (one /user) → USER ID → PREFERENCES → REDIRECT
 */

let settled = false;
let settledPromise: Promise<void> | null = null;
let resolveSettled: (() => void) | null = null;
let coldStartInflight: Promise<void> | null = null;

function ensureSettledPromise(): Promise<void> {
  if (settled) {
    return Promise.resolve();
  }
  if (!settledPromise) {
    settledPromise = new Promise<void>((resolve) => {
      resolveSettled = resolve;
    });
  }
  return settledPromise;
}

/** Call when cold-start auth result is final (success, cleared session, or no token). Idempotent. */
export function markAuthSessionSettled(): void {
  if (settled) {
    return;
  }
  settled = true;
  if (resolveSettled) {
    resolveSettled();
  }
  resolveSettled = null;
  settledPromise = Promise.resolve();
}

/**
 * Wait until auth session bootstrap has settled, or until timeout.
 * Never rejects; timeout returns so callers can fall back safely.
 */
export function waitForAuthSessionSettled(timeoutMs = 8000): Promise<void> {
  if (settled) {
    return Promise.resolve();
  }
  return Promise.race([
    ensureSettledPromise(),
    new Promise<void>((resolve) => {
      setTimeout(resolve, Math.max(0, timeoutMs));
    })
  ]);
}

/**
 * Single-flight cold-start probe shared by boot/auth and App.initializeApp.
 * Only the first caller runs `probe`; others await the same promise.
 * Settled is marked only when that probe finishes — not when a racing sibling starts.
 */
export function runColdStartAuthProbe(probe: () => Promise<void>): Promise<void> {
  if (settled) {
    return Promise.resolve();
  }
  if (!coldStartInflight) {
    coldStartInflight = (async () => {
      try {
        await probe();
      } finally {
        markAuthSessionSettled();
        coldStartInflight = null;
      }
    })();
  }
  return coldStartInflight;
}

/** Test-only reset. */
export function resetAuthSessionReadyForTests(): void {
  settled = false;
  settledPromise = null;
  resolveSettled = null;
  coldStartInflight = null;
}

export function isAuthSessionSettled(): boolean {
  return settled;
}

/**
 * Poll until auth user id is available (or timeout / token cleared).
 * Does not call the API — relies on existing boot/init fetchUser.
 */
export async function waitForAuthUserId(
  getUserId: () => number | null | undefined,
  getToken: () => string | null | undefined,
  timeoutMs = 5000,
  pollMs = 50
): Promise<number | null> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const token = getToken();
    if (!token) {
      return null;
    }
    const id = getUserId();
    if (id != null && Number.isFinite(Number(id))) {
      return Number(id);
    }
    await new Promise<void>((resolve) => setTimeout(resolve, pollMs));
  }
  const id = getUserId();
  return id != null && Number.isFinite(Number(id)) ? Number(id) : null;
}
