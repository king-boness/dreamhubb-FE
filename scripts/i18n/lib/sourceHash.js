const fs = require("fs");
const path = require("path");
const { META_DIR, hashValue, readJsonSafe } = require("./catalog");

const HASH_FILE = path.join(META_DIR, "source-hashes.json");

function loadSourceHashes() {
  return readJsonSafe(HASH_FILE, {
    version: 1,
    referenceLocale: "en-US",
    generatedAt: null,
    keys: {}
  });
}

/**
 * Build hash map from current en-US catalog.
 * Does not write to disk unless write=true.
 */
function buildSourceHashes(refFlat) {
  const keys = {};
  for (const [k, v] of Object.entries(refFlat)) {
    if (typeof v !== "string") continue;
    keys[k] = {
      hash: hashValue(v),
      length: v.length
    };
  }
  return {
    version: 1,
    referenceLocale: "en-US",
    generatedAt: new Date().toISOString(),
    keyCount: Object.keys(keys).length,
    keys
  };
}

function writeSourceHashes(snapshot) {
  if (!fs.existsSync(META_DIR)) {
    fs.mkdirSync(META_DIR, { recursive: true });
  }
  fs.writeFileSync(HASH_FILE, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
  return HASH_FILE;
}

/**
 * Compare current ref values to stored snapshot.
 * @returns {{ staleKeys: string[], newKeys: string[], removedKeys: string[], hasSnapshot: boolean }}
 */
function diffAgainstSnapshot(refFlat, snapshot) {
  const stored = snapshot?.keys || {};
  const hasSnapshot = Boolean(snapshot?.generatedAt) && Object.keys(stored).length > 0;
  const staleKeys = [];
  const newKeys = [];
  const removedKeys = [];

  if (!hasSnapshot) {
    return { staleKeys, newKeys, removedKeys, hasSnapshot: false };
  }

  for (const [k, v] of Object.entries(refFlat)) {
    if (typeof v !== "string") continue;
    const h = hashValue(v);
    if (!(k in stored)) {
      newKeys.push(k);
    } else if (stored[k].hash !== h) {
      staleKeys.push(k);
    }
  }
  for (const k of Object.keys(stored)) {
    if (!(k in refFlat)) removedKeys.push(k);
  }

  return { staleKeys, newKeys, removedKeys, hasSnapshot: true };
}

module.exports = {
  HASH_FILE,
  loadSourceHashes,
  buildSourceHashes,
  writeSourceHashes,
  diffAgainstSnapshot
};
