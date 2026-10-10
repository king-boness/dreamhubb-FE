/**
 * Resolve import keyPath → target locale module write plan.
 * Shared by validate + apply (Phase 4B.3 flat/auth support).
 */

const path = require("path");
const { ROOT, flatten, loadTsModule } = require("./catalog");

/** Nested modules: filename may differ from root key (legacy 4B.2 map). */
const NAMESPACE_FILE_MAP = {
  feed: { file: "feed", rootKey: "feed", mode: "nestedRoot" },
  legal: { file: "legal", rootKey: "legal", mode: "nestedRoot" },
  posts: { file: "posts", rootKey: "posts", mode: "nestedRoot" },
  onboarding: { file: "onboarding", rootKey: "onboarding", mode: "nestedRoot" },
  onboardingInfo: {
    file: "onboarding",
    rootKey: "onboardingInfo",
    mode: "nestedRoot"
  },
  notificationsPage: {
    file: "notifications",
    rootKey: "notificationsPage",
    mode: "nestedRoot"
  },
  settingsPages: {
    file: "settings",
    rootKey: "settingsPages",
    mode: "nestedRoot"
  },
  profileUi: { file: "profile", rootKey: "profileUi", mode: "nestedRoot" },
  statsUi: { file: "profile", rootKey: "statsUi", mode: "nestedRoot" },
  earnUi: { file: "profile", rootKey: "earnUi", mode: "nestedRoot" },
  system: { file: "profile", rootKey: "system", mode: "nestedRoot" },
  badges: { file: "profile", rootKey: "badges", mode: "nestedRoot" }
};

let _cache = null;

function loadFlatSets() {
  if (_cache) return _cache;
  const common = flatten(
    loadTsModule(path.join(ROOT, "src", "i18n", "en-US", "common.ts"))
  );
  const subcategories = flatten(
    loadTsModule(path.join(ROOT, "src", "i18n", "en-US", "subcategories.ts"))
  );
  const auth = flatten(
    loadTsModule(path.join(ROOT, "src", "i18n", "en-US", "auth.ts"))
  );
  _cache = {
    commonKeys: new Set(Object.keys(common)),
    subcategoriesKeys: new Set(Object.keys(subcategories)),
    authKeys: new Set(Object.keys(auth))
  };
  return _cache;
}

/**
 * @returns {null | {
 *   file: string,
 *   mode: 'nestedRoot'|'flat'|'authSpread',
 *   writePath: string,  // relative path inside module object (no file wrapper)
 *   rootKey?: string,
 *   indexWire: { spread: boolean, shorthand: boolean },
 *   ownershipBucket: 'nested'|'flat-common'|'flat-subcategories'|'auth'
 * }}
 */
function resolveKeyTarget(keyPath) {
  if (!keyPath || typeof keyPath !== "string") return null;
  const sets = loadFlatSets();

  // Nested mapped namespaces (feed.*, legal.*, …)
  const first = keyPath.split(".")[0];
  if (NAMESPACE_FILE_MAP[first] && keyPath.startsWith(first + ".")) {
    const t = NAMESPACE_FILE_MAP[first];
    return {
      file: t.file,
      mode: "nestedRoot",
      rootKey: t.rootKey,
      writePath: keyPath.slice(first.length + 1),
      indexWire: { spread: true, shorthand: false },
      ownershipBucket: "nested"
    };
  }

  // Nested common.* / subcategories.* from index shorthand (same flat module)
  if (keyPath.startsWith("common.")) {
    const inner = keyPath.slice("common.".length);
    if (sets.commonKeys.has(inner)) {
      return {
        file: "common",
        mode: "flat",
        writePath: inner,
        indexWire: { spread: true, shorthand: true },
        ownershipBucket: "flat-common"
      };
    }
  }
  if (keyPath.startsWith("subcategories.")) {
    const inner = keyPath.slice("subcategories.".length);
    if (sets.subcategoriesKeys.has(inner)) {
      return {
        file: "subcategories",
        mode: "flat",
        writePath: inner,
        indexWire: { spread: true, shorthand: true },
        ownershipBucket: "flat-subcategories"
      };
    }
  }

  // Flat root keys from common.ts / subcategories.ts
  if (sets.commonKeys.has(keyPath)) {
    return {
      file: "common",
      mode: "flat",
      writePath: keyPath,
      indexWire: { spread: true, shorthand: true },
      ownershipBucket: "flat-common"
    };
  }
  if (sets.subcategoriesKeys.has(keyPath)) {
    return {
      file: "subcategories",
      mode: "flat",
      writePath: keyPath,
      indexWire: { spread: true, shorthand: true },
      ownershipBucket: "flat-subcategories"
    };
  }

  // Auth (incl. languages.*) — spread-based module with explicit overrides
  if (sets.authKeys.has(keyPath)) {
    return {
      file: "auth",
      mode: "authSpread",
      writePath: keyPath,
      indexWire: { spread: true, shorthand: false },
      ownershipBucket: "auth"
    };
  }

  return null;
}

function isSupportedApplyKey(keyPath) {
  return Boolean(resolveKeyTarget(keyPath));
}

function clearModuleTargetCache() {
  _cache = null;
}

module.exports = {
  NAMESPACE_FILE_MAP,
  resolveKeyTarget,
  isSupportedApplyKey,
  loadFlatSets,
  clearModuleTargetCache
};
