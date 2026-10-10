/**
 * Safe APPLY for TypeScript locale catalogs (Phase 4B.1–4B.3).
 *
 * Modes:
 * - nestedRoot: export default { rootKey: { … } } (feed, legal, …)
 * - flat: export default { … } (common, subcategories) + index spread/shorthand
 * - authSpread: import enUS + …enUS + explicit overrides (incl. languages nest)
 *
 * Protections: locale path guard, en-US/sk blocked, no updates by default,
 * REVIEWED/APPROVED via validate layer, sibling roots preserved, idempotent.
 */

const fs = require("fs");
const path = require("path");
const { ROOT, namespaceOf } = require("./catalog");
const { loadReviewOverrides, overrideKey } = require("./status");
const {
  NAMESPACE_FILE_MAP,
  resolveKeyTarget,
  isSupportedApplyKey
} = require("./moduleTargets");

const NESTED_NAMESPACE_MODULES = new Set(Object.keys(NAMESPACE_FILE_MAP));
const PROTECTED_LOCALES = new Set(["en-US", "sk"]);

function isNestedNamespace(ns) {
  return NESTED_NAMESPACE_MODULES.has(ns);
}

function assertSafeLocaleDir(root, locale) {
  if (!locale || typeof locale !== "string" || !/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) {
    throw new Error(`Unsafe or invalid locale code: ${locale}`);
  }
  if (PROTECTED_LOCALES.has(locale)) {
    throw new Error(`Refusing to write protected locale catalogs: ${locale}`);
  }
  const i18nRoot = path.resolve(root, "src", "i18n");
  const localeDir = path.resolve(i18nRoot, locale);
  if (!localeDir.startsWith(i18nRoot + path.sep)) {
    throw new Error(`Path escape blocked for locale dir: ${localeDir}`);
  }
  return { i18nRoot, localeDir };
}

function setByRelativePath(rootObj, relParts, value) {
  if (!relParts.length) return;
  let cur = rootObj;
  for (let i = 0; i < relParts.length - 1; i++) {
    const p = relParts[i];
    if (cur[p] == null || typeof cur[p] !== "object" || Array.isArray(cur[p])) {
      cur[p] = {};
    }
    cur = cur[p];
  }
  cur[relParts[relParts.length - 1]] = value;
}

function getByRelativePath(rootObj, relParts) {
  let cur = rootObj;
  for (const p of relParts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}

function escapeIdent(key) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

function formatTsValue(value, indent, level) {
  const pad = " ".repeat(indent * level);
  const padIn = " ".repeat(indent * (level + 1));
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value == null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((v) => `${padIn}${formatTsValue(v, indent, level + 1)}`);
    return `[\n${items.join(",\n")}\n${pad}]`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return "{}";
    const lines = keys.map((k) => {
      const rendered = formatTsValue(value[k], indent, level + 1);
      return `${padIn}${escapeIdent(k)}: ${rendered}`;
    });
    return `{\n${lines.join(",\n")}\n${pad}}`;
  }
  throw new Error(`Cannot serialize value type ${typeof value}`);
}

function renderModuleObject(moduleObject) {
  return `export default ${formatTsValue(moduleObject, 2, 0)};\n`;
}

function renderNamespaceModule(namespace, nestedObject) {
  return renderModuleObject({ [namespace]: nestedObject });
}

/**
 * Auth module with shallow …enUS spread + explicit leaf overrides.
 * Nested languages keeps …enUS.languages then per-locale overrides (shallow-safe).
 */
function renderAuthSpreadModule(overrideTree) {
  const languages = overrideTree.languages;
  const rest = { ...overrideTree };
  delete rest.languages;

  function stripOuterBraces(formatted) {
    const t = String(formatted).trim();
    if (t === "{}") return "";
    if (!t.startsWith("{") || !t.endsWith("}")) {
      throw new Error("formatTsValue did not return an object literal");
    }
    return t.slice(1, -1).replace(/^\n/, "").replace(/\n\s*$/, "");
  }

  // level 0 → top-level keys indent 2 spaces (matches eslint indent in export default)
  const restInner = stripOuterBraces(formatTsValue(rest, 2, 0));

  let languagesBlock = "";
  if (languages && typeof languages === "object") {
    // level 1 → locale keys indent 4 spaces inside `languages: { … }`
    const langInner = stripOuterBraces(formatTsValue(languages, 2, 1));
    languagesBlock = `  languages: {\n    ...enUS.languages${
      langInner ? `,\n${langInner}` : ""
    }\n  }`;
  }

  const parts = [];
  if (restInner && restInner.trim()) parts.push(restInner);
  if (languagesBlock) parts.push(languagesBlock);

  return `import enUS from "../en-US/auth";

// German — en-US base via spread; explicit overrides below (MACHINE_DRAFT / existing).
export default {
  ...enUS${parts.length ? `,\n${parts.join(",\n")}` : ""}
};
`;
}

function loadExistingModuleObject(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const { loadTsModule } = require("./catalog");
  const mod = loadTsModule(filePath);
  if (!mod || typeof mod !== "object" || Array.isArray(mod)) {
    throw new Error(`Namespace module ${filePath} did not export an object`);
  }
  // Strip babel/esbuild default wrapper noise — already unwrapped by loadTsModule
  return JSON.parse(JSON.stringify(mod));
}

function loadExistingNamespaceObject(filePath, namespace) {
  const root = loadExistingModuleObject(filePath);
  if (root[namespace] && typeof root[namespace] === "object") {
    return JSON.parse(JSON.stringify(root[namespace]));
  }
  throw new Error(
    `Namespace module ${filePath} does not export { ${namespace}: {…} }; refuse unsafe merge`
  );
}

/**
 * Extract AST-explicit auth overrides only (never re-emit ...enUS inherited EN
 * as fake explicit leaves — that would poison ownership metrics).
 */
function extractAuthOverrideTree(localeDir) {
  const authPath = path.join(localeDir, "auth.ts");
  if (!fs.existsSync(authPath)) {
    return {};
  }
  const { loadTsModule, flatten } = require("./catalog");
  const { analyzeModuleFile, loadEnUsAuthFlat } = require("./sourceOwnership");
  const deAuth = loadTsModule(authPath);
  const deFlat = flatten(deAuth);
  const mod = analyzeModuleFile(authPath, loadEnUsAuthFlat());
  const tree = {};
  for (const k of mod.explicit || []) {
    if (!(k in deFlat)) continue;
    const v = deFlat[k];
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      setByRelativePath(tree, k.split("."), v);
    }
  }
  return tree;
}

function planIndexWiring(indexSource, fileBase, opts = {}) {
  const wantSpread = opts.spread !== false;
  const wantShorthand = Boolean(opts.shorthand);
  const importLine = `import ${fileBase} from "./${fileBase}";`;
  const spreadToken = `...${fileBase}`;
  let next = indexSource;
  const changes = [];

  if (!new RegExp(`from\\s+["']\\./${fileBase}["']`).test(next)) {
    const importRe = /^import\s+.+$/gm;
    let lastImport = null;
    let m;
    while ((m = importRe.exec(next)) !== null) lastImport = m;
    if (lastImport) {
      const insertAt = lastImport.index + lastImport[0].length;
      next = next.slice(0, insertAt) + "\n" + importLine + next.slice(insertAt);
    } else {
      next = importLine + "\n\n" + next;
    }
    changes.push(`add_import:${fileBase}`);
  }

  const exportMatch = next.match(/export\s+default\s*\{([\s\S]*?)\n\};?\s*$/);
  if (!exportMatch) {
    throw new Error("Cannot locate export default { … } block in locale index.ts");
  }
  let inner = exportMatch[1];

  if (wantSpread && !new RegExp(`\\.\\.\\.${fileBase}\\b`).test(next)) {
    const trimmed = inner.replace(/\s+$/, "");
    const needsComma = /[^\s,]/.test(trimmed) && !/,\s*$/.test(trimmed);
    inner = `${trimmed}${needsComma ? "," : ""}\n  ${spreadToken}\n`;
    changes.push(`add_spread:${fileBase}`);
  }

  // Shorthand `common` / `subcategories` for nested path keys (en-US/sk pattern)
  if (wantShorthand) {
    const shRe = new RegExp(`(?:^|,)\\s*${fileBase}\\s*(?=,|\\n)`);
    // Also match trailing shorthand before }
    const hasShorthand =
      new RegExp(`\\.\\.\\.${fileBase}\\b[\\s\\S]*,\\s*${fileBase}\\s*(,|\\n)`).test(
        `export default {${inner}}`
      ) ||
      new RegExp(`(?:^|\\n)\\s*${fileBase}\\s*(,|\\n)`).test(inner);
    // Simpler: look for bare identifier as property (not ...fileBase)
    const bare = new RegExp(`(^|[\\n,])\\s*${fileBase}\\s*(,|\\n|$)`);
    const spreadOnly = new RegExp(`\\.\\.\\.${fileBase}`);
    let foundBare = false;
    if (bare.test(inner)) {
      // Ensure it's not only the spread line
      const withoutSpread = inner.replace(new RegExp(`\\.\\.\\.${fileBase}`, "g"), "");
      foundBare = bare.test(withoutSpread);
    }
    if (!foundBare) {
      const trimmed = inner.replace(/\s+$/, "");
      const needsComma = /[^\s,]/.test(trimmed) && !/,\s*$/.test(trimmed);
      inner = `${trimmed}${needsComma ? "," : ""}\n  ${fileBase}\n`;
      changes.push(`add_shorthand:${fileBase}`);
    }
  }

  // Normalize trailing whitespace inside the export object
  inner = inner.replace(/\s+$/, "") + "\n";
  next = next.replace(exportMatch[0], `export default {${inner}};`);
  if (!next.endsWith("\n")) next += "\n";

  return { next, changes, changed: changes.length > 0 || next !== indexSource };
}

function groupPlannedByTarget(plannedChanges, opts = {}) {
  const allowUpdates = Boolean(opts.allowUpdates);
  const byFile = new Map();
  const rejected = [];

  for (const p of plannedChanges) {
    const target = resolveKeyTarget(p.keyPath);
    if (!target) {
      rejected.push({
        keyPath: p.keyPath,
        reason:
          "keyPath is not APPLY-supported (supported: nested map + common/subcategories flat + auth)"
      });
      continue;
    }
    if (p.action === "update" && !allowUpdates) {
      rejected.push({
        keyPath: p.keyPath,
        reason: "refuses to update existing translation (allowUpdates=false)"
      });
      continue;
    }
    if (!byFile.has(target.file)) {
      byFile.set(target.file, { targetMeta: target, items: [] });
    }
    byFile.get(target.file).items.push({ ...p, _target: target });
  }

  return { byFile, rejected };
}

function countLeaves(obj, n = 0) {
  if (obj == null || typeof obj !== "object" || Array.isArray(obj)) return n + 1;
  const keys = Object.keys(obj);
  if (keys.length === 0) return n;
  for (const k of keys) n = countLeaves(obj[k], n);
  return n;
}

function planFileChanges(validationResult, opts = {}) {
  const root = opts.root || ROOT;
  const locale = validationResult.targetLocale;
  const { localeDir } = assertSafeLocaleDir(root, locale);
  const { byFile, rejected } = groupPlannedByTarget(
    validationResult.plannedChanges || [],
    opts
  );

  if (rejected.length) {
    return {
      ok: false,
      mode: "APPLY_BLOCKED",
      errors: rejected.map((r) => `${r.keyPath}: ${r.reason}`),
      files: [],
      rejected
    };
  }

  const files = [];
  let addCount = 0;
  let updateCount = 0;
  let noopCount = 0;
  let preservedCount = 0;
  const indexWires = new Map(); // fileBase → {spread, shorthand}

  for (const [fileBase, bundle] of byFile) {
    const filePath = path.join(localeDir, `${fileBase}.ts`);
    const relPath = path.relative(root, filePath);
    const mode = bundle.items[0]._target.mode;
    const keyDiffs = [];

    let content;
    let previousContent = fs.existsSync(filePath)
      ? fs.readFileSync(filePath, "utf8")
      : null;

    if (mode === "authSpread") {
      let overrideTree = extractAuthOverrideTree(localeDir);
      preservedCount += countLeaves(overrideTree);

      for (const item of bundle.items) {
        const rel = item._target.writePath.split(".");
        const prev = getByRelativePath(overrideTree, rel);
        if (item.action === "noop" || (prev !== undefined && prev === item.next)) {
          noopCount++;
          continue;
        }
        if (prev !== undefined && prev !== item.next) updateCount++;
        else addCount++;
        setByRelativePath(overrideTree, rel, item.next);
        keyDiffs.push({
          keyPath: item.keyPath,
          action: prev === undefined ? "add" : "update",
          from: prev === undefined ? null : prev,
          to: item.next,
          status: item.status || "MACHINE_DRAFT"
        });
      }
      content = renderAuthSpreadModule(overrideTree);
      indexWires.set(fileBase, { spread: true, shorthand: false });
    } else if (mode === "flat") {
      let moduleObj = fs.existsSync(filePath)
        ? loadExistingModuleObject(filePath)
        : {};
      // Flat modules must not be wrapped — if someone wrote { common: {} } refuse
      if (moduleObj[fileBase] && Object.keys(moduleObj).length === 1) {
        return {
          ok: false,
          mode: "APPLY_BLOCKED",
          errors: [
            `${relPath}: looks nested under ${fileBase}; flat mode expects en-US/common.ts shape`
          ],
          files: [],
          rejected
        };
      }
      preservedCount += countLeaves(moduleObj);

      for (const item of bundle.items) {
        const rel = item._target.writePath.split(".");
        const prev = getByRelativePath(moduleObj, rel);
        if (item.action === "noop" || (prev !== undefined && prev === item.next)) {
          noopCount++;
          continue;
        }
        if (prev !== undefined && prev !== item.next) updateCount++;
        else addCount++;
        setByRelativePath(moduleObj, rel, item.next);
        keyDiffs.push({
          keyPath: item.keyPath,
          action: prev === undefined ? "add" : "update",
          from: prev === undefined ? null : prev,
          to: item.next,
          status: item.status || "MACHINE_DRAFT"
        });
      }
      content = renderModuleObject(moduleObj);
      const wire = bundle.items[0]._target.indexWire || {
        spread: true,
        shorthand: true
      };
      indexWires.set(fileBase, wire);
    } else {
      // nestedRoot — may share file across root keys
      let moduleObj = fs.existsSync(filePath)
        ? loadExistingModuleObject(filePath)
        : {};
      preservedCount += countLeaves(moduleObj);

      for (const item of bundle.items) {
        const t = item._target;
        if (!moduleObj[t.rootKey] || typeof moduleObj[t.rootKey] !== "object") {
          moduleObj[t.rootKey] = moduleObj[t.rootKey] || {};
        }
        const rel = t.writePath.split(".");
        const prev = getByRelativePath(moduleObj[t.rootKey], rel);
        if (item.action === "noop" || (prev !== undefined && prev === item.next)) {
          noopCount++;
          continue;
        }
        if (prev !== undefined && prev !== item.next) updateCount++;
        else addCount++;
        setByRelativePath(moduleObj[t.rootKey], rel, item.next);
        keyDiffs.push({
          keyPath: item.keyPath,
          action: prev === undefined ? "add" : "update",
          from: prev === undefined ? null : prev,
          to: item.next,
          status: item.status || "MACHINE_DRAFT"
        });
      }
      content = renderModuleObject(moduleObj);
      indexWires.set(fileBase, { spread: true, shorthand: false });
    }

    const contentChanged = previousContent !== content;
    files.push({
      path: filePath,
      relativePath: relPath,
      kind: mode === "authSpread" ? "auth_spread_module" : "namespace_module",
      namespace: fileBase,
      exists: Boolean(previousContent),
      contentChanged,
      content,
      keyDiffs,
      previousContent
    });
  }

  const indexPath = path.join(localeDir, "index.ts");
  if (!fs.existsSync(indexPath)) {
    return {
      ok: false,
      mode: "APPLY_BLOCKED",
      errors: [`Missing locale index: ${path.relative(root, indexPath)}`],
      files: [],
      rejected
    };
  }

  const indexSrc = fs.readFileSync(indexPath, "utf8");
  let indexNext = indexSrc;
  const indexChanges = [];
  for (const [fileBase, wire] of indexWires) {
    if (fileBase === "auth") continue; // auth already in de/index
    const wired = planIndexWiring(indexNext, fileBase, wire);
    indexNext = wired.next;
    indexChanges.push(...wired.changes);
  }
  files.push({
    path: indexPath,
    relativePath: path.relative(root, indexPath),
    kind: "locale_index",
    namespace: [...indexWires.keys()].join(","),
    exists: true,
    contentChanged: indexNext !== indexSrc,
    content: indexNext,
    indexChanges,
    previousContent: indexSrc,
    keyDiffs: []
  });

  const touched = files.filter((f) => f.contentChanged);
  return {
    ok: true,
    mode: "DRY_RUN",
    targetLocale: locale,
    localeDir,
    files,
    touchedFiles: touched.map((f) => f.relativePath),
    rejected,
    summary: {
      namespaces: [...byFile.keys()],
      add: addCount,
      update: updateCount,
      noop: noopCount,
      preservedExistingLeaves: preservedCount,
      filesTouched: touched.length,
      filesExamined: files.length,
      noChanges: touched.length === 0
    }
  };
}

function writeReviewOverrides(plannedChanges, locale, opts = {}) {
  if (opts.skipReviewOverrides) return null;
  const metaDir = path.join(opts.root || ROOT, "i18n-meta");
  const file = path.join(metaDir, "review-overrides.json");
  const data = loadReviewOverrides();
  if (!data.entries || typeof data.entries !== "object") data.entries = {};
  let written = 0;
  const now = new Date().toISOString();
  for (const p of plannedChanges) {
    if (p.action === "noop") continue;
    const status = p.status || "MACHINE_DRAFT";
    if (status === "REVIEWED" || status === "APPROVED") {
      throw new Error(`Refuse to write protected status ${status} via APPLY for ${p.keyPath}`);
    }
    const key = overrideKey(locale, p.keyPath);
    const existing = data.entries[key];
    const existingStatus =
      typeof existing === "string" ? existing : existing && existing.status;
    if (existingStatus === "REVIEWED" || existingStatus === "APPROVED") {
      throw new Error(`Refuse to downgrade/overwrite ${existingStatus} for ${key}`);
    }
    data.entries[key] = {
      status: status === "MISSING" ? "MACHINE_DRAFT" : status,
      evidence: opts.evidence || "phase_4b3_safe_import_apply",
      updatedAt: now
    };
    written++;
  }
  if (!opts.dryRun) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  }
  return { file, written, dryRun: Boolean(opts.dryRun) };
}

function applyImportPlan(validationResult, opts = {}) {
  if (!validationResult || validationResult.ok !== true) {
    return {
      ok: false,
      mode: "APPLY_BLOCKED",
      errors: ["Validation must pass before APPLY"],
      summary: null
    };
  }

  const dryRun = !(opts.apply === true && opts.dryRun === false);
  let plan;
  try {
    plan = planFileChanges(validationResult, opts);
  } catch (err) {
    return {
      ok: false,
      mode: "APPLY_BLOCKED",
      errors: [err && err.message ? err.message : String(err)],
      summary: null
    };
  }

  if (!plan.ok) return plan;

  if (dryRun) {
    return {
      ...plan,
      mode: "DRY_RUN",
      wrote: false,
      diffPreview: plan.files
        .filter((f) => f.contentChanged)
        .map((f) => ({
          file: f.relativePath,
          kind: f.kind,
          keys: (f.keyDiffs || []).map((k) => `${k.action} ${k.keyPath}`),
          indexChanges: f.indexChanges || []
        }))
    };
  }

  if (plan.summary.noChanges) {
    return {
      ...plan,
      mode: "NO_CHANGES",
      wrote: false,
      reviewMeta: { written: 0, skipped: true },
      diffPreview: []
    };
  }

  const { localeDir } = assertSafeLocaleDir(
    opts.root || ROOT,
    validationResult.targetLocale
  );
  for (const f of plan.files) {
    if (!f.contentChanged) continue;
    const resolved = path.resolve(f.path);
    if (!resolved.startsWith(localeDir + path.sep)) {
      throw new Error(`Refusing write outside locale dir: ${f.path}`);
    }
    const dir = path.dirname(f.path);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(f.path, f.content, "utf8");
  }

  let reviewMeta = null;
  try {
    reviewMeta = writeReviewOverrides(
      validationResult.plannedChanges,
      validationResult.targetLocale,
      { ...opts, dryRun: false }
    );
  } catch (err) {
    return {
      ok: false,
      mode: "APPLY_PARTIAL",
      errors: [
        `Catalog files may have been written but review-overrides failed: ${
          err && err.message ? err.message : err
        }`
      ],
      ...plan,
      wrote: true
    };
  }

  return {
    ...plan,
    mode: "APPLY",
    wrote: true,
    reviewMeta,
    diffPreview: plan.files
      .filter((f) => f.contentChanged)
      .map((f) => ({
        file: f.relativePath,
        kind: f.kind,
        keys: (f.keyDiffs || []).map((k) => `${k.action} ${k.keyPath}`),
        indexChanges: f.indexChanges || []
      }))
  };
}

module.exports = {
  NAMESPACE_FILE_MAP,
  NESTED_NAMESPACE_MODULES,
  PROTECTED_LOCALES,
  resolveNamespaceTarget: (ns) => NAMESPACE_FILE_MAP[ns] || null,
  resolveKeyTarget,
  isSupportedApplyKey,
  isNestedNamespace,
  assertSafeLocaleDir,
  renderNamespaceModule,
  renderModuleObject,
  renderAuthSpreadModule,
  planIndexWiring,
  planFileChanges,
  applyImportPlan,
  writeReviewOverrides,
  formatTsValue,
  loadExistingNamespaceObject,
  loadExistingModuleObject
};
