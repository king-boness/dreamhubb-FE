export const LEGACY_PREFERENCES_KEY = "preferences_store";

/**
 * Legacy `preferences_store` has no reliable owner by default.
 * Only adopt when the payload explicitly names this userId.
 */
export function canAdoptLegacyPreferences(legacy: unknown, userId: number): boolean {
  if (userId == null || !Number.isFinite(Number(userId))) {
    return false;
  }
  if (!legacy || typeof legacy !== "object") {
    return false;
  }
  const record = legacy as { userId?: unknown; user_id?: unknown };
  const owner = record.userId ?? record.user_id;
  if (owner == null || owner === "") {
    return false;
  }
  return Number(owner) === Number(userId);
}

/**
 * Load preferences for a user without assigning unowned legacy data.
 * Does not delete the legacy key.
 */
export function loadPreferencesRecordForUser(
  userId: number | null | undefined,
  storage: Pick<Storage, "getItem" | "setItem"> = localStorage
): Record<string, unknown> | null {
  const key = `preferences_store_${userId ?? "guest"}`;
  const raw = storage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  if (userId == null || !Number.isFinite(Number(userId))) {
    return null;
  }

  const legacyRaw = storage.getItem(LEGACY_PREFERENCES_KEY);
  if (!legacyRaw) {
    return null;
  }

  try {
    const legacy = JSON.parse(legacyRaw) as unknown;
    if (!canAdoptLegacyPreferences(legacy, Number(userId))) {
      return null;
    }
    // Owned legacy: copy forward, keep legacy key intact.
    storage.setItem(key, legacyRaw);
    return legacy as Record<string, unknown>;
  } catch {
    return null;
  }
}
