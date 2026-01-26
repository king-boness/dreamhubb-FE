#!/usr/bin/env node

/**
 * Release Gate - KROK 9 specific checks for iOS App Store release
 *
 * Checks:
 * - Version/build info is set
 * - Privacy Policy URL exists in docs (placeholder)
 * - Dev routes/components are not in production build (via prod-safety-check)
 * - Production API URL is set (if VITE_API_BASE is provided)
 *
 * Usage:
 *   npm run release:gate        - Run release gate checks
 *   npm run release:gate --skip-be  - Skip backend checks
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const SKIP_BE = process.argv.includes("--skip-be");

function log(message, type = "info") {
  const colors = {
    info: "\x1b[36m",
    success: "\x1b[32m",
    error: "\x1b[31m",
    warning: "\x1b[33m",
    reset: "\x1b[0m"
  };
  const icon = {
    info: "ℹ",
    success: "✅",
    error: "❌",
    warning: "⚠"
  };
  console.log(`${colors[type]}${icon[type]} ${message}${colors.reset}`);
}

function checkVersion() {
  log("Checking version info...", "info");

  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
    const version = packageJson.version;

    if (!version || version === "0.0.0") {
      log("❌ Version not set in package.json (current: " + version + ")", "error");
      log("   Update package.json: \"version\": \"1.0.0\"", "warning");
      return false;
    }

    log(`✅ Version in package.json: ${version}`, "success");
    log("   ⚠️  Remember to sync with iOS Marketing Version in Xcode", "warning");
    return true;
  } catch (err) {
    log(`❌ Failed to read package.json: ${err.message}`, "error");
    return false;
  }
}

function checkPrivacyPolicy() {
  log("Checking Privacy Policy documentation...", "info");

  const privacyPolicyPath = path.join(__dirname, "..", "docs", "PRIVACY_POLICY_TEMPLATE.md");
  const privacyMatrixPath = path.join(__dirname, "..", "docs", "KROK9_PRIVACY_MATRIX.md");

  if (!fs.existsSync(privacyPolicyPath)) {
    log("❌ Privacy Policy template not found: docs/PRIVACY_POLICY_TEMPLATE.md", "error");
    return false;
  }

  if (!fs.existsSync(privacyMatrixPath)) {
    log("❌ Privacy Matrix not found: docs/KROK9_PRIVACY_MATRIX.md", "error");
    return false;
  }

  log("✅ Privacy Policy template exists", "success");
  log("   ⚠️  Remember to: 1) Fill in placeholders, 2) Host on public URL, 3) Add to App Store Connect", "warning");
  return true;
}

function checkProductionAPIURL() {
  log("Checking production API URL...", "info");

  const envPath = path.join(__dirname, "..", ".env");
  const envProductionPath = path.join(__dirname, "..", ".env.production");

  let apiBase = null;

  // Check .env.production first
  if (fs.existsSync(envProductionPath)) {
    const envContent = fs.readFileSync(envProductionPath, "utf8");
    const match = envContent.match(/VITE_API_BASE=(.+)/);
    if (match) {
      apiBase = match[1].trim();
    }
  }

  // Check .env if .env.production doesn't exist
  if (!apiBase && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/VITE_API_BASE=(.+)/);
    if (match) {
      apiBase = match[1].trim();
    }
  }

  // Check environment variable
  if (!apiBase) {
    apiBase = process.env.VITE_API_BASE;
  }

  if (!apiBase) {
    log("⚠️  Production API URL not found (VITE_API_BASE)", "warning");
    log("   Set VITE_API_BASE in .env.production before iOS build", "warning");
    return true; // Warning, not error
  }

  if (apiBase.includes("localhost") || apiBase.includes("127.0.0.1")) {
    log("⚠️  API URL appears to be localhost: " + apiBase, "warning");
    log("   For production build, use production API URL (e.g., https://api.dreamhubb.com/api)", "warning");
    return true; // Warning, not error
  }

  log(`✅ Production API URL found: ${apiBase}`, "success");
  return true;
}

function checkProdSafety() {
  log("Checking production safety (dev routes/components)...", "info");

  try {
    execSync("npm run prod-safety-check --skip-be", {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit"
    });
    log("✅ Production safety check passed", "success");
    return true;
  } catch (err) {
    log("❌ Production safety check failed", "error");
    return false;
  }
}

function checkIOSSanity() {
  log("Checking iOS release sanity...", "info");

  const iosDir = path.join(__dirname, "..", "ios", "App");
  if (!fs.existsSync(iosDir)) {
    log("⚠️  iOS project not found, skipping iOS sanity check", "warning");
    return true; // Not an error if iOS project doesn't exist
  }

  try {
    execSync("npm run ios:release-sanity", {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit"
    });
    log("✅ iOS release sanity check passed", "success");
    return true;
  } catch (err) {
    log("❌ iOS release sanity check failed", "error");
    log("   Run 'npm run ios:release-sanity' for detailed errors", "error");
    return false;
  }
}

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("  RELEASE GATE - KROK 9 iOS App Store Checks");
  console.log("=".repeat(60) + "\n");

  const checks = [
    { name: "Version Info", check: checkVersion },
    { name: "Privacy Policy", check: checkPrivacyPolicy },
    { name: "Production API URL", check: checkProductionAPIURL },
    { name: "Production Safety", check: checkProdSafety },
    { name: "iOS Release Sanity", check: checkIOSSanity }
  ];

  const results = [];

  for (const { name, check } of checks) {
    try {
      const result = await check();
      results.push({ name, status: result ? "PASS" : "FAIL" });
    } catch (err) {
      log(`❌ ${name} check failed: ${err.message}`, "error");
      results.push({ name, status: "FAIL", error: err.message });
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("  RELEASE GATE SUMMARY");
  console.log("=".repeat(60) + "\n");

  const passCount = results.filter(r => r.status === "PASS").length;
  const failCount = results.filter(r => r.status === "FAIL").length;

  for (const result of results) {
    const icon = result.status === "PASS" ? "✅" : "❌";
    const color = result.status === "PASS" ? "success" : "error";
    log(`${icon} ${result.name}: ${result.status}`, color);
  }

  console.log(`\nPassed: ${passCount}/${results.length} checks`);

  if (failCount > 0) {
    log("\n❌ RELEASE GATE FAILED", "error");
    log("Fix the issues above before proceeding with iOS release", "error");
    process.exit(1);
  } else {
    log("\n✅ RELEASE GATE PASSED", "success");
    log("You can proceed with iOS build and App Store submission", "success");
    process.exit(0);
  }
}

main().catch((err) => {
  log(`\n❌ Fatal error: ${err.message}`, "error");
  process.exit(1);
});
