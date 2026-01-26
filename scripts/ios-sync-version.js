#!/usr/bin/env node

/**
 * iOS Version Sync
 *
 * Syncs version from package.json to iOS project:
 * - Sets MARKETING_VERSION (CFBundleShortVersionString) from package.json version
 * - Increments or sets CURRENT_PROJECT_VERSION (CFBundleVersion) from ENV or increments
 *
 * Usage:
 *   npm run ios:sync-version                    - Sync version, auto-increment build
 *   IOS_BUILD_NUMBER=5 npm run ios:sync-version - Sync version, set build to 5
 */

const fs = require("fs");
const path = require("path");

const IOS_DIR = path.join(__dirname, "..", "ios", "App");
const PROJECT_FILE = path.join(IOS_DIR, "App.xcodeproj", "project.pbxproj");
const PACKAGE_JSON = path.join(__dirname, "..", "package.json");

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

function getPackageVersion() {
  if (!fs.existsSync(PACKAGE_JSON)) {
    log("package.json not found: " + PACKAGE_JSON, "error");
    return null;
  }

  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, "utf8"));
  const version = pkg.version;

  if (!version) {
    log("Version not found in package.json", "error");
    return null;
  }

  return version;
}

function getCurrentBuildNumber() {
  if (!fs.existsSync(PROJECT_FILE)) {
    log("Xcode project file not found: " + PROJECT_FILE, "error");
    return null;
  }

  const content = fs.readFileSync(PROJECT_FILE, "utf8");
  const match = content.match(/CURRENT_PROJECT_VERSION\s*=\s*([^;]+);/);
  if (!match) {
    return null;
  }

  const currentBuild = match[1].trim();
  // If it's a variable, return null (can't parse)
  if (currentBuild.startsWith("$(")) {
    return null;
  }

  const buildNum = parseInt(currentBuild, 10);
  return isNaN(buildNum) ? null : buildNum;
}

function updateProjectVersion(version, buildNumber) {
  if (!fs.existsSync(PROJECT_FILE)) {
    log("Xcode project file not found: " + PROJECT_FILE, "error");
    return false;
  }

  let content = fs.readFileSync(PROJECT_FILE, "utf8");

  // Update MARKETING_VERSION
  const marketingVersionRegex = /MARKETING_VERSION\s*=\s*[^;]+;/g;
  if (marketingVersionRegex.test(content)) {
    content = content.replace(marketingVersionRegex, `MARKETING_VERSION = ${version};`);
    log(`Updated MARKETING_VERSION to ${version}`, "success");
  } else {
    log("MARKETING_VERSION not found in project file", "error");
    return false;
  }

  // Update CURRENT_PROJECT_VERSION
  const buildVersionRegex = /CURRENT_PROJECT_VERSION\s*=\s*[^;]+;/g;
  if (buildVersionRegex.test(content)) {
    content = content.replace(buildVersionRegex, `CURRENT_PROJECT_VERSION = ${buildNumber};`);
    log(`Updated CURRENT_PROJECT_VERSION to ${buildNumber}`, "success");
  } else {
    log("CURRENT_PROJECT_VERSION not found in project file", "error");
    return false;
  }

  // Write back
  fs.writeFileSync(PROJECT_FILE, content, "utf8");
  return true;
}

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("  iOS VERSION SYNC");
  console.log("=".repeat(60) + "\n");

  // Get version from package.json
  const version = getPackageVersion();
  if (!version) {
    process.exit(1);
  }

  log(`Package.json version: ${version}`, "info");

  // Get build number
  let buildNumber;
  if (process.env.IOS_BUILD_NUMBER) {
    buildNumber = parseInt(process.env.IOS_BUILD_NUMBER, 10);
    if (isNaN(buildNumber)) {
      log(`Invalid IOS_BUILD_NUMBER: ${process.env.IOS_BUILD_NUMBER}`, "error");
      process.exit(1);
    }
    log(`Using build number from ENV: ${buildNumber}`, "info");
  } else {
    const currentBuild = getCurrentBuildNumber();
    if (currentBuild !== null) {
      buildNumber = currentBuild + 1;
      log(`Auto-incrementing build number: ${currentBuild} → ${buildNumber}`, "info");
    } else {
      log("Could not determine current build number, setting to 1", "warning");
      buildNumber = 1;
    }
  }

  // Update project file
  if (updateProjectVersion(version, buildNumber)) {
    log("\n✅ Version sync completed", "success");
    log(`   Version: ${version}`, "info");
    log(`   Build: ${buildNumber}`, "info");
    log("\n⚠️  Remember to verify in Xcode:", "warning");
    log("   1. Open ios/App/App.xcodeproj in Xcode", "warning");
    log("   2. Select 'App' target → General tab", "warning");
    log("   3. Verify Version and Build match above", "warning");
    process.exit(0);
  } else {
    log("\n❌ Version sync failed", "error");
    process.exit(1);
  }
}

main().catch((err) => {
  log(`\n❌ Fatal error: ${err.message}`, "error");
  process.exit(1);
});
