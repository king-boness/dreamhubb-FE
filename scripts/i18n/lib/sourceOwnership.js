/**
 * AST-based ownership analysis for locale TypeScript catalogs.
 *
 * Distinguishes:
 * - EXPLICIT: PropertyAssignment leaves written in the locale module
 * - INHERITED: keys introduced only via ...enUS / ...enUS.* spreads from en-US source
 *
 * Uses TypeScript compiler API (not fragile regex). Unresolvable spreads → UNKNOWN.
 */

const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const { ROOT, flatten, loadTsModule } = require("./catalog");

const EN_US_AUTH_RE = /[/\\]en-US[/\\]auth(?:\.ts)?$/;

function propName(nameNode) {
  if (!nameNode) return null;
  if (ts.isIdentifier(nameNode) || ts.isPrivateIdentifier(nameNode)) return nameNode.text;
  if (ts.isStringLiteral(nameNode) || ts.isNumericLiteral(nameNode)) return nameNode.text;
  if (ts.isComputedPropertyName(nameNode) && ts.isStringLiteral(nameNode.expression)) {
    return nameNode.expression.text;
  }
  return null;
}

function joinPath(prefix, name) {
  return prefix ? `${prefix}.${name}` : name;
}

function leafPathsFromTree(obj, prefix = "", out = []) {
  if (obj == null || typeof obj !== "object" || Array.isArray(obj)) {
    if (prefix) out.push(prefix);
    return out;
  }
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    if (prefix) out.push(prefix);
    return out;
  }
  for (const k of keys) {
    leafPathsFromTree(obj[k], joinPath(prefix, k), out);
  }
  return out;
}

function loadEnUsAuthFlat() {
  const authPath = path.join(ROOT, "src", "i18n", "en-US", "auth.ts");
  const mod = loadTsModule(authPath);
  return flatten(mod);
}

/**
 * Resolve import: localName → { type: 'enUsAuth' | 'local' | 'other', moduleName? }
 */
function buildImportMap(sourceFile) {
  const map = new Map();
  for (const stmt of sourceFile.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause) continue;
    const spec = stmt.moduleSpecifier;
    if (!ts.isStringLiteral(spec)) continue;
    const from = spec.text;
    const resolvedHint = from.includes("en-US/auth")
      ? "enUsAuth"
      : from.startsWith("./")
        ? "local"
        : "other";

    const clause = stmt.importClause;
    if (clause.name) {
      map.set(clause.name.text, {
        type: resolvedHint,
        from,
        moduleName: from.replace(/^\.\//, "").replace(/\.ts$/, "")
      });
    }
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const el of clause.namedBindings.elements) {
        map.set(el.name.text, {
          type: resolvedHint,
          from,
          moduleName: from.replace(/^\.\//, "").replace(/\.ts$/, "")
        });
      }
    }
  }
  return map;
}

function findDefaultExportObject(sourceFile) {
  for (const stmt of sourceFile.statements) {
    if (ts.isExportAssignment(stmt) && !stmt.isExportEquals) {
      if (ts.isObjectLiteralExpression(stmt.expression)) return stmt.expression;
      if (
        ts.isAsExpression(stmt.expression) &&
        ts.isObjectLiteralExpression(stmt.expression.expression)
      ) {
        return stmt.expression.expression;
      }
    }
    if (ts.isExportAssignment(stmt)) continue;
  }
  // export default { ... } as ExportAssignment is covered; also:
  // `export default {` via ExportAssignment — done.
  // Some files use `export default {` only — handled.
  return null;
}

/**
 * Walk object literal in source order; later explicit props override inherited.
 */
function walkObjectLiteral(
  objLit,
  prefix,
  importMap,
  enUsAuthFlat,
  state
) {
  for (const prop of objLit.properties) {
    if (ts.isSpreadAssignment(prop)) {
      resolveSpread(prop.expression, prefix, importMap, enUsAuthFlat, state);
      continue;
    }
    if (ts.isShorthandPropertyAssignment(prop)) {
      const name = propName(prop.name);
      if (!name) {
        state.unknownReasons.add(`unresolvable_property_name@${prefix || "(root)"}`);
        continue;
      }
      const binding = importMap.get(name);
      if (binding && binding.type === "local") {
        // `common` in index nests the local module under key `common`
        state.localSpreads.push({
          moduleName: binding.moduleName,
          prefix: joinPath(prefix, name)
        });
      } else {
        state.explicit.add(joinPath(prefix, name));
        state.inherited.delete(joinPath(prefix, name));
      }
      continue;
    }
    if (ts.isPropertyAssignment(prop)) {
      const name = propName(prop.name);
      if (!name) {
        state.unknownReasons.add(`unresolvable_property_name@${prefix || "(root)"}`);
        continue;
      }
      const pathKey = joinPath(prefix, name);
      if (ts.isObjectLiteralExpression(prop.initializer)) {
        walkObjectLiteral(
          prop.initializer,
          pathKey,
          importMap,
          enUsAuthFlat,
          state
        );
      } else {
        state.explicit.add(pathKey);
        state.inherited.delete(pathKey);
      }
    } else if (ts.isMethodDeclaration(prop) || ts.isGetAccessorDeclaration(prop)) {
      const name = propName(prop.name);
      if (name) {
        const pathKey = joinPath(prefix, name);
        state.explicit.add(pathKey);
        state.inherited.delete(pathKey);
      }
    } else {
      state.unknownReasons.add(`unsupported_property_kind@${prefix || "(root)"}`);
    }
  }
}

function resolveSpread(expr, prefix, importMap, enUsAuthFlat, state) {
  // Identifier: ...enUS or ...auth
  if (ts.isIdentifier(expr)) {
    const binding = importMap.get(expr.text);
    if (!binding) {
      state.unknownReasons.add(`spread_unknown_identifier:${expr.text}`);
      return;
    }
    if (binding.type === "enUsAuth") {
      for (const k of Object.keys(enUsAuthFlat)) {
        const full = prefix ? joinPath(prefix, k) : k;
        if (!state.explicit.has(full)) state.inherited.add(full);
      }
      return;
    }
    if (binding.type === "local") {
      // Local module spread is composed at index level — record for merge
      state.localSpreads.push({ moduleName: binding.moduleName, prefix });
      return;
    }
    state.unknownReasons.add(`spread_other_import:${binding.from}`);
    return;
  }

  // PropertyAccess: ...enUS.languages (inside languages: { ... })
  if (ts.isPropertyAccessExpression(expr) && ts.isIdentifier(expr.expression)) {
    const binding = importMap.get(expr.expression.text);
    const prop = expr.name.text;
    if (binding && binding.type === "enUsAuth") {
      const nestedKeys = Object.keys(enUsAuthFlat).filter(
        (k) => k === prop || k.startsWith(`${prop}.`)
      );
      if (!nestedKeys.length) {
        state.unknownReasons.add(`spread_enUs_empty_path:${prop}`);
        return;
      }
      for (const k of nestedKeys) {
        // Flat key is languages.ar.name; current prefix is already "languages".
        // Use suffix after prop so we do not double-prefix.
        const relative = k === prop ? "" : k.slice(prop.length + 1);
        const full = relative ? joinPath(prefix, relative) : prefix || prop;
        if (!full) continue;
        if (!state.explicit.has(full)) state.inherited.add(full);
      }
      return;
    }
    state.unknownReasons.add("spread_property_access_unresolved");
    return;
  }

  state.unknownReasons.add("spread_expression_unresolved");
}

function analyzeModuleFile(filePath, enUsAuthFlat) {
  const text = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const importMap = buildImportMap(sourceFile);
  const obj = findDefaultExportObject(sourceFile);
  const state = {
    explicit: new Set(),
    inherited: new Set(),
    localSpreads: [],
    unknownReasons: new Set()
  };

  if (!obj) {
    return {
      file: filePath,
      ok: false,
      confidence: "UNKNOWN",
      explicit: [],
      inherited: [],
      localSpreads: [],
      unknownReasons: ["no_default_export_object"]
    };
  }

  walkObjectLiteral(obj, "", importMap, enUsAuthFlat, state);

  const confidence = state.unknownReasons.size ? "UNKNOWN" : "EXACT";
  return {
    file: filePath,
    ok: true,
    confidence,
    explicit: [...state.explicit].sort(),
    inherited: [...state.inherited].sort(),
    localSpreads: state.localSpreads,
    unknownReasons: [...state.unknownReasons]
  };
}

/**
 * Analyze a locale pack directory (src/i18n/{locale}).
 */
function analyzeLocaleOwnership(locale) {
  const localeDir = path.join(ROOT, "src", "i18n", locale);
  if (!fs.existsSync(localeDir)) {
    return {
      locale,
      confidence: "UNKNOWN",
      explicitKeys: [],
      inheritedKeys: [],
      unknownReasons: ["locale_dir_missing"]
    };
  }

  let enUsAuthFlat;
  try {
    enUsAuthFlat = loadEnUsAuthFlat();
  } catch (err) {
    return {
      locale,
      confidence: "UNKNOWN",
      explicitKeys: [],
      inheritedKeys: [],
      unknownReasons: [`en_us_auth_load_failed:${err.message}`]
    };
  }

  const files = fs
    .readdirSync(localeDir)
    .filter((f) => f.endsWith(".ts"))
    .sort();

  const byModule = new Map();
  const unknownReasons = new Set();
  let anyUnknown = false;

  for (const f of files) {
    if (f === "index.ts") continue;
    const modName = f.replace(/\.ts$/, "");
    const result = analyzeModuleFile(path.join(localeDir, f), enUsAuthFlat);
    byModule.set(modName, result);
    if (result.confidence !== "EXACT") anyUnknown = true;
    for (const r of result.unknownReasons || []) unknownReasons.add(`${modName}:${r}`);
  }

  // Compose via index.ts local spreads
  const indexPath = path.join(localeDir, "index.ts");
  const explicit = new Set();
  const inherited = new Set();

  if (fs.existsSync(indexPath)) {
    const indexResult = analyzeModuleFile(indexPath, enUsAuthFlat);
    if (indexResult.confidence !== "EXACT") anyUnknown = true;
    for (const r of indexResult.unknownReasons || []) unknownReasons.add(`index:${r}`);

    if (indexResult.localSpreads.length) {
      for (const spread of indexResult.localSpreads) {
        const mod = byModule.get(spread.moduleName);
        if (!mod) {
          unknownReasons.add(`index_spread_missing_module:${spread.moduleName}`);
          anyUnknown = true;
          continue;
        }
        for (const k of mod.explicit) {
          const full = spread.prefix ? joinPath(spread.prefix, k) : k;
          explicit.add(full);
          inherited.delete(full);
        }
        for (const k of mod.inherited) {
          const full = spread.prefix ? joinPath(spread.prefix, k) : k;
          if (!explicit.has(full)) inherited.add(full);
        }
      }
      // Also any explicit keys written directly on index (rare)
      for (const k of indexResult.explicit) {
        explicit.add(k);
        inherited.delete(k);
      }
    } else if (indexResult.explicit.length || indexResult.inherited.length) {
      // index defines object inline (unusual for our packs)
      for (const k of indexResult.explicit) {
        explicit.add(k);
        inherited.delete(k);
      }
      for (const k of indexResult.inherited) {
        if (!explicit.has(k)) inherited.add(k);
      }
    } else {
      // Fallback: union all modules if index parse found no spreads
      for (const mod of byModule.values()) {
        for (const k of mod.explicit) {
          explicit.add(k);
          inherited.delete(k);
        }
        for (const k of mod.inherited) {
          if (!explicit.has(k)) inherited.add(k);
        }
      }
      if (byModule.size) {
        unknownReasons.add("index_no_local_spreads_fallback_union");
        anyUnknown = true;
      }
    }
  } else {
    for (const mod of byModule.values()) {
      for (const k of mod.explicit) {
        explicit.add(k);
        inherited.delete(k);
      }
      for (const k of mod.inherited) {
        if (!explicit.has(k)) inherited.add(k);
      }
    }
  }

  // Remove inherited that are also explicit (safety)
  for (const k of explicit) inherited.delete(k);

  return {
    locale,
    confidence: anyUnknown ? "UNKNOWN" : "EXACT",
    explicitKeys: [...explicit].sort(),
    inheritedKeys: [...inherited].sort(),
    explicitCount: explicit.size,
    inheritedCount: inherited.size,
    unknownReasons: [...unknownReasons],
    modules: Object.fromEntries(
      [...byModule.entries()].map(([name, m]) => [
        name,
        {
          confidence: m.confidence,
          explicitCount: m.explicit.length,
          inheritedCount: m.inherited.length
        }
      ])
    )
  };
}

module.exports = {
  analyzeLocaleOwnership,
  analyzeModuleFile,
  loadEnUsAuthFlat,
  leafPathsFromTree,
  EN_US_AUTH_RE
};
