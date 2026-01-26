#!/usr/bin/env node

/**
 * Guardrails check script - prevents regressions in KROK 8 error/notify system
 *
 * Checks for:
 * 1. Direct Notify.create / $q.notify calls outside src/utils/notify.ts
 * 2. console.log/warn/error outside DEV guards
 */

const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "..", "src");
const ALLOWED_NOTIFY_FILE = path.join(SRC_DIR, "utils", "notify.ts");

let hasErrors = false;
const errors = [];

// Helper to check if file is allowed to use Notify.create
function isAllowedNotifyFile(filePath) {
  const normalized = path.normalize(filePath);
  const allowed = path.normalize(ALLOWED_NOTIFY_FILE);
  return normalized === allowed;
}

// Helper to check if console call is in DEV guard
function isInDevGuard(content, lineIndex) {
  const lines = content.split("\n");
  const currentLine = lines[lineIndex];

  // Check if line contains DEV guard pattern
  const beforeLine = lines.slice(Math.max(0, lineIndex - 5), lineIndex).join("\n");
  const hasDevGuard = /import\.meta\.env\.DEV|process\.env\.NODE_ENV\s*===?\s*["']development["']/.test(beforeLine);

  // Also check if it's console.debug (which is allowed)
  const isDebug = /console\.debug/.test(currentLine);

  return hasDevGuard || isDebug;
}

// Scan directory recursively
function scanDirectory(dir, fileExtension = ".{ts,vue,js}") {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, dist, etc.
        if (!entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== "dist") {
          walk(fullPath);
        }
      } else if (entry.isFile() && /\.(ts|vue|js)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

// Check for forbidden patterns
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const relativePath = path.relative(SRC_DIR, filePath);

  // Check 1: Notify.create / $q.notify outside allowed file
  const notifyPatterns = [
    /Notify\.create\s*\(/g,
    /\$q\.notify\s*\(/g,
    /this\.\$q\.notify\s*\(/g
  ];

  for (const pattern of notifyPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (!isAllowedNotifyFile(filePath)) {
        const lineNum = content.substring(0, match.index).split("\n").length;
        errors.push({
          file: relativePath,
          line: lineNum,
          message: `Direct ${match[0].trim()} call found. Use notifyError/notifySuccess/notifyInfo from src/utils/notify.ts instead.`
        });
        hasErrors = true;
      }
    }
  }

  // Check 2: console.log/warn/error outside DEV guard
  const consolePatterns = [
    /console\.log\s*\(/g,
    /console\.warn\s*\(/g,
    /console\.error\s*\(/g
  ];

  for (const pattern of consolePatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split("\n").length - 1;

      if (!isInDevGuard(content, lineNum)) {
        errors.push({
          file: relativePath,
          line: lineNum + 1,
          message: `${match[0].trim()} found without DEV guard. Use console.debug inside import.meta.env.DEV block instead.`
        });
        hasErrors = true;
      }
    }
  }

  // Check 3: Sensitive data logging (token, password, authorization)
  const sensitivePatterns = [
    {
      pattern: /console\.(log|warn|error|debug)\s*\([^)]*(?:token|password|authorization|Authorization|AUTHORIZATION)[^)]*\)/gi,
      message: "Potential sensitive data logging detected (token/password/authorization). Remove or mask sensitive data."
    },
    {
      pattern: /console\.(log|warn|error|debug)\s*\([^)]*localStorage\.(getItem|setItem)\s*\([^)]*["']token["'][^)]*\)/gi,
      message: "Potential token logging detected. Never log tokens or sensitive data."
    },
    {
      pattern: /console\.(log|warn|error|debug)\s*\([^)]*headers[^)]*Authorization[^)]*\)/gi,
      message: "Potential Authorization header logging detected. Never log authorization headers."
    }
  ];

  for (const { pattern, message } of sensitivePatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split("\n").length - 1;

      // Allow if it's in a DEV guard and uses console.debug
      if (!isInDevGuard(content, lineNum) || !/console\.debug/.test(match[0])) {
        errors.push({
          file: relativePath,
          line: lineNum + 1,
          message
        });
        hasErrors = true;
      }
    }
  }
}

// Main execution
console.log("🔍 Running guardrails check...\n");

const files = scanDirectory(SRC_DIR);

for (const file of files) {
  checkFile(file);
}

if (hasErrors) {
  console.error("❌ Guardrails check FAILED\n");
  console.error("Found violations:\n");

  for (const error of errors) {
    console.error(`  ${error.file}:${error.line}`);
    console.error(`    ${error.message}\n`);
  }

  console.error("\n💡 Fix these issues before committing.");
  process.exit(1);
} else {
  console.log("✅ Guardrails check passed - no violations found.");
  process.exit(0);
}
