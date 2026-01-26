#!/usr/bin/env node

/**
 * iOS Release Sanity Check
 *
 * Checks iOS project configuration for release readiness:
 * - Version and build number are set
 * - Bundle identifier is consistent
 * - Info.plist permissions are present
 * - ATS settings (warnings for arbitrary loads)
 * - Capabilities/entitlements
 * - Assets (AppIcon, splash)
 *
 * Usage:
 *   npm run ios:release-sanity
 */

const fs = require("fs");
const path = require("path");

const IOS_DIR = path.join(__dirname, "..", "ios", "App");
const PROJECT_FILE = path.join(IOS_DIR, "App.xcodeproj", "project.pbxproj");
const INFO_PLIST = path.join(IOS_DIR, "App", "Info.plist");
const ASSETS_DIR = path.join(IOS_DIR, "App", "Assets.xcassets");

const errors = [];
const warnings = [];
const info = [];

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

function checkIOSProjectExists() {
  if (!fs.existsSync(IOS_DIR)) {
    log("iOS project not found at: " + IOS_DIR, "error");
    return false;
  }
  if (!fs.existsSync(PROJECT_FILE)) {
    log("Xcode project file not found: " + PROJECT_FILE, "error");
    return false;
  }
  return true;
}

function parseProjectPbxproj() {
  const content = fs.readFileSync(PROJECT_FILE, "utf8");
  const configs = {};

  // Extract build configurations
  const buildConfigRegex = /(\w+)\s*=\s*\{([^}]+)\};/g;
  let match;

  // Find MARKETING_VERSION and CURRENT_PROJECT_VERSION
  const marketingVersionMatch = content.match(/MARKETING_VERSION\s*=\s*([^;]+);/);
  const buildVersionMatch = content.match(/CURRENT_PROJECT_VERSION\s*=\s*([^;]+);/);
  const bundleIdMatch = content.match(/PRODUCT_BUNDLE_IDENTIFIER\s*=\s*([^;]+);/);

  configs.marketingVersion = marketingVersionMatch ? marketingVersionMatch[1].trim() : null;
  configs.buildVersion = buildVersionMatch ? buildVersionMatch[1].trim() : null;
  configs.bundleIdentifier = bundleIdMatch ? bundleIdMatch[1].trim() : null;

  // Check for multiple targets (look for multiple PRODUCT_BUNDLE_IDENTIFIER)
  const bundleIdMatches = content.match(/PRODUCT_BUNDLE_IDENTIFIER\s*=\s*([^;]+);/g);
  if (bundleIdMatches && bundleIdMatches.length > 1) {
    configs.multipleBundleIds = bundleIdMatches.map(m => m.match(/=\s*([^;]+);/)[1].trim());
  }

  // Check for ATS exceptions
  const atsExceptions = [];
  if (content.includes("NSAllowsArbitraryLoads")) {
    atsExceptions.push("NSAllowsArbitraryLoads");
  }
  if (content.includes("NSExceptionAllowsInsecureHTTPLoads")) {
    atsExceptions.push("NSExceptionAllowsInsecureHTTPLoads");
  }
  configs.atsExceptions = atsExceptions;

  return configs;
}

function checkVersionAndBuild() {
  log("Checking version and build number...", "info");

  const configs = parseProjectPbxproj();

  if (!configs.marketingVersion || configs.marketingVersion === "$(MARKETING_VERSION)") {
    errors.push("MARKETING_VERSION (CFBundleShortVersionString) is not set or uses variable");
    log("❌ MARKETING_VERSION not set", "error");
  } else {
    log(`✅ MARKETING_VERSION: ${configs.marketingVersion}`, "success");
    info.push(`MARKETING_VERSION: ${configs.marketingVersion}`);
  }

  if (!configs.buildVersion || configs.buildVersion === "$(CURRENT_PROJECT_VERSION)") {
    errors.push("CURRENT_PROJECT_VERSION (CFBundleVersion) is not set or uses variable");
    log("❌ CURRENT_PROJECT_VERSION not set", "error");
  } else {
    log(`✅ CURRENT_PROJECT_VERSION: ${configs.buildVersion}`, "success");
    info.push(`CURRENT_PROJECT_VERSION: ${configs.buildVersion}`);
  }

  return configs;
}

function checkBundleIdentifier() {
  log("Checking bundle identifier...", "info");

  const configs = parseProjectPbxproj();

  if (!configs.bundleIdentifier || configs.bundleIdentifier === "$(PRODUCT_BUNDLE_IDENTIFIER)") {
    errors.push("PRODUCT_BUNDLE_IDENTIFIER is not set or uses variable");
    log("❌ PRODUCT_BUNDLE_IDENTIFIER not set", "error");
    return null;
  }

  log(`✅ PRODUCT_BUNDLE_IDENTIFIER: ${configs.bundleIdentifier}`, "success");
  info.push(`PRODUCT_BUNDLE_IDENTIFIER: ${configs.bundleIdentifier}`);

  if (configs.multipleBundleIds && configs.multipleBundleIds.length > 1) {
    const uniqueIds = [...new Set(configs.multipleBundleIds)];
    if (uniqueIds.length > 1) {
      warnings.push(`Multiple bundle identifiers found: ${uniqueIds.join(", ")}`);
      log(`⚠️  Multiple bundle identifiers: ${uniqueIds.join(", ")}`, "warning");
    }
  }

  return configs.bundleIdentifier;
}

function parseInfoPlist() {
  if (!fs.existsSync(INFO_PLIST)) {
    errors.push("Info.plist not found: " + INFO_PLIST);
    return null;
  }

  const content = fs.readFileSync(INFO_PLIST, "utf8");
  const permissions = {};

  // Common permission keys
  const permissionKeys = [
    "NSCameraUsageDescription",
    "NSPhotoLibraryUsageDescription",
    "NSPhotoLibraryAddUsageDescription",
    "NSLocationWhenInUseUsageDescription",
    "NSLocationAlwaysUsageDescription",
    "NSUserNotificationsUsageDescription",
    "NSMicrophoneUsageDescription",
    "NSContactsUsageDescription",
    "NSCalendarsUsageDescription",
    "NSRemindersUsageDescription"
  ];

  for (const key of permissionKeys) {
    if (content.includes(`<key>${key}</key>`)) {
      const match = content.match(new RegExp(`<key>${key}</key>\\s*<string>([^<]+)</string>`));
      permissions[key] = match ? match[1] : "present";
    }
  }

  return permissions;
}

function checkInfoPlistPermissions() {
  log("Checking Info.plist permissions...", "info");

  const permissions = parseInfoPlist();
  if (!permissions) {
    return;
  }

  // Check for common permissions that might be needed
  const commonPermissions = [
    "NSCameraUsageDescription",
    "NSPhotoLibraryUsageDescription"
  ];

  for (const perm of commonPermissions) {
    if (!permissions[perm]) {
      warnings.push(`Info.plist missing permission: ${perm} (may be needed for image uploads)`);
      log(`⚠️  Missing permission: ${perm}`, "warning");
    } else {
      log(`✅ Permission present: ${perm}`, "success");
    }
  }

  // Report all found permissions
  const foundPermissions = Object.keys(permissions);
  if (foundPermissions.length > 0) {
    info.push(`Info.plist permissions: ${foundPermissions.join(", ")}`);
  }
}

function checkATS() {
  log("Checking ATS (App Transport Security) settings...", "info");

  const configs = parseProjectPbxproj();

  if (configs.atsExceptions && configs.atsExceptions.length > 0) {
    warnings.push(`ATS exceptions found: ${configs.atsExceptions.join(", ")}`);
    log(`⚠️  ATS exceptions: ${configs.atsExceptions.join(", ")}`, "warning");
    log("   Review if these are necessary for production", "warning");
  } else {
    log("✅ No ATS exceptions found", "success");
  }

  // Also check Info.plist for ATS
  if (fs.existsSync(INFO_PLIST)) {
    const content = fs.readFileSync(INFO_PLIST, "utf8");
    if (content.includes("NSAppTransportSecurity")) {
      warnings.push("NSAppTransportSecurity found in Info.plist - review ATS settings");
      log("⚠️  NSAppTransportSecurity found in Info.plist", "warning");
    }
  }
}

function checkCapabilities() {
  log("Checking capabilities and entitlements...", "info");

  // Check for entitlements file
  const entitlementsFiles = [
    path.join(IOS_DIR, "App", "App.entitlements"),
    path.join(IOS_DIR, "App.entitlements")
  ];

  let foundEntitlements = false;
  for (const file of entitlementsFiles) {
    if (fs.existsSync(file)) {
      foundEntitlements = true;
      const content = fs.readFileSync(file, "utf8");
      log(`✅ Entitlements file found: ${path.basename(file)}`, "success");

      // Check for common capabilities
      const capabilities = [];
      if (content.includes("aps-environment")) capabilities.push("Push Notifications");
      if (content.includes("com.apple.developer.associated-domains")) capabilities.push("Associated Domains");
      if (content.includes("com.apple.developer.background-modes")) capabilities.push("Background Modes");
      if (content.includes("com.apple.developer.in-app-purchase")) capabilities.push("In-App Purchase");

      if (capabilities.length > 0) {
        info.push(`Capabilities: ${capabilities.join(", ")}`);
        log(`   Found capabilities: ${capabilities.join(", ")}`, "info");
      }
      break;
    }
  }

  if (!foundEntitlements) {
    log("ℹ️  No entitlements file found (may be normal if no special capabilities)", "info");
  }
}

function checkAssets() {
  log("Checking assets (AppIcon, splash)...", "info");

  if (!fs.existsSync(ASSETS_DIR)) {
    errors.push("Assets.xcassets directory not found: " + ASSETS_DIR);
    log("❌ Assets.xcassets not found", "error");
    return;
  }

  // Check AppIcon
  const appIconDir = path.join(ASSETS_DIR, "AppIcon.appiconset");
  if (fs.existsSync(appIconDir)) {
    log("✅ AppIcon.appiconset found", "success");
    const contentsJson = path.join(appIconDir, "Contents.json");
    if (fs.existsSync(contentsJson)) {
      try {
        const contents = JSON.parse(fs.readFileSync(contentsJson, "utf8"));
        if (contents.images && contents.images.length > 0) {
          log(`   Found ${contents.images.length} icon size(s)`, "info");
          info.push(`AppIcon: ${contents.images.length} size(s) defined`);
        }
      } catch (err) {
        warnings.push("AppIcon Contents.json parse error: " + err.message);
        log("⚠️  AppIcon Contents.json parse error", "warning");
      }
    }
  } else {
    errors.push("AppIcon.appiconset not found");
    log("❌ AppIcon.appiconset not found", "error");
  }

  // Check Splash
  const splashDir = path.join(ASSETS_DIR, "Splash.imageset");
  if (fs.existsSync(splashDir)) {
    log("✅ Splash.imageset found", "success");
    const files = fs.readdirSync(splashDir);
    const imageFiles = files.filter(f => f.endsWith(".png"));
    if (imageFiles.length > 0) {
      log(`   Found ${imageFiles.length} splash image(s)`, "info");
      info.push(`Splash: ${imageFiles.length} image(s)`);
    }
  } else {
    warnings.push("Splash.imageset not found (may be normal if using storyboard)");
    log("⚠️  Splash.imageset not found", "warning");
  }
}

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("  iOS RELEASE SANITY CHECK");
  console.log("=".repeat(60) + "\n");

  if (!checkIOSProjectExists()) {
    log("\n❌ iOS project not found. Exiting.", "error");
    process.exit(1);
  }

  log("iOS project found: " + IOS_DIR, "success");
  console.log("");

  // Run checks
  checkVersionAndBuild();
  checkBundleIdentifier();
  checkInfoPlistPermissions();
  checkATS();
  checkCapabilities();
  checkAssets();

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("  SUMMARY");
  console.log("=".repeat(60) + "\n");

  if (info.length > 0) {
    log("Information:", "info");
    for (const item of info) {
      log(`  • ${item}`, "info");
    }
    console.log("");
  }

  if (warnings.length > 0) {
    log("Warnings:", "warning");
    for (const item of warnings) {
      log(`  • ${item}`, "warning");
    }
    console.log("");
  }

  if (errors.length > 0) {
    log("Errors:", "error");
    for (const item of errors) {
      log(`  • ${item}`, "error");
    }
    console.log("");
    log("❌ SANITY CHECK FAILED", "error");
    log("Fix the errors above before proceeding with iOS release", "error");
    process.exit(1);
  } else {
    log("✅ SANITY CHECK PASSED", "success");
    if (warnings.length > 0) {
      log("Review warnings above before release", "warning");
    }
    process.exit(0);
  }
}

main().catch((err) => {
  log(`\n❌ Fatal error: ${err.message}`, "error");
  process.exit(1);
});
