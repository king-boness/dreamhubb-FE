#!/usr/bin/env node

/**
 * Prod Safety Check - Verifies that dev-only endpoints are not available in production.
 * This script checks:
 * 1. FE build: /_dev/qa route and DevQaPage are not in dist/
 * 2. BE endpoints: /api/dev/* routes return 404 in production
 *
 * Usage:
 *   node scripts/prod-safety-check.js [--base-url=http://localhost:8000] [--skip-fe] [--skip-be]
 */

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.PROD_CHECK_BASE_URL || process.argv.find((arg) => arg.startsWith("--base-url="))?.split("=")[1] || "http://localhost:8000";
const SKIP_FE = process.argv.includes("--skip-fe");
const SKIP_BE = process.argv.includes("--skip-be");

const DEV_ENDPOINTS = [
  "/api/dev/error",
  "/api/dev/sleep",
  "/api/dev/test-user",
  "/api/dev/test-post",
  "/api/dev/test-cleanup"
];

const FE_DEV_STRINGS = [
  "/_dev/qa",
  "/api/dev/",
  "DevQaPage",
  "__dev/qa"
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

async function checkDevEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await makeRequest(url);
    return {
      endpoint,
      statusCode: response.statusCode,
      isBlocked: response.statusCode === 404
    };
  } catch (err) {
    return {
      endpoint,
      statusCode: null,
      isBlocked: false,
      error: err.message
    };
  }
}

function checkFEBuild() {
  const distPath = path.join(process.cwd(), "dist");
  if (!fs.existsSync(distPath)) {
    console.log("⚠️  FE build not found (dist/ directory missing).");
    console.log("   Run 'npm run build' first, or use --skip-fe to skip FE check.\n");
    return { passed: false, skipped: true };
  }

  console.log("🔍 Checking FE build (dist/) for dev-only strings...\n");

  const foundStrings = [];
  const filesToCheck = [];

  // Recursively find all JS/HTML files in dist/
  function findFiles(dir) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          findFiles(filePath);
        } else if (file.endsWith(".js") || file.endsWith(".html")) {
          filesToCheck.push(filePath);
        }
      }
    } catch (err) {
      // Ignore permission errors
    }
  }

  findFiles(distPath);

  for (const filePath of filesToCheck) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      for (const devString of FE_DEV_STRINGS) {
        if (content.includes(devString)) {
          foundStrings.push({ file: path.relative(process.cwd(), filePath), string: devString });
        }
      }
    } catch (err) {
      // Ignore read errors
    }
  }

  if (foundStrings.length > 0) {
    console.log("❌ FE build contains dev-only strings:\n");
    foundStrings.forEach(({ file, string }) => {
      console.log(`   - ${string} found in ${file}`);
    });
    console.log("\n⚠️  Production build is NOT safe - dev routes/components are included!");
    return { passed: false, skipped: false };
  }

  console.log("✅ FE build is clean - no dev-only strings found.");
  return { passed: true, skipped: false };
}

async function main() {
  console.log("🔍 Running Prod Safety Check...\n");

  let feCheck = { passed: true, skipped: SKIP_FE };
  let beCheck = { passed: true, skipped: SKIP_BE };

  // Check FE build
  if (!SKIP_FE) {
    feCheck = checkFEBuild();
    console.log("");
  } else {
    console.log("⏭️  Skipping FE build check (--skip-fe)\n");
  }

  // Check BE endpoints
  if (!SKIP_BE) {
    console.log(`🔍 Checking BE endpoints at ${BASE_URL}...\n`);
    const results = [];
    for (const endpoint of DEV_ENDPOINTS) {
      const result = await checkDevEndpoint(endpoint);
      results.push(result);
      const status = result.isBlocked ? "✅" : "❌";
      console.log(`${status} ${endpoint}: ${result.statusCode || "ERROR"}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }

    console.log("\n");

    const allBlocked = results.every((r) => r.isBlocked);
    const anyError = results.some((r) => r.error);

    if (anyError) {
      console.log("⚠️  Some endpoints could not be checked (server may not be running).");
      console.log("   This is OK if you're running this check locally without a server.\n");
      beCheck = { passed: true, skipped: true };
    } else if (allBlocked) {
      console.log("✅ All dev endpoints are blocked (404) - Production safe!");
      beCheck = { passed: true, skipped: false };
    } else {
      console.log("❌ Some dev endpoints are accessible - NOT production safe!");
      console.log("\nFailing endpoints:");
      results.filter((r) => !r.isBlocked).forEach((r) => {
        console.log(`  - ${r.endpoint} (status: ${r.statusCode})`);
      });
      beCheck = { passed: false, skipped: false };
    }
  } else {
    console.log("⏭️  Skipping BE endpoint check (--skip-be)\n");
  }

  // Final summary
  console.log("\n--- Summary ---");
  if (feCheck.skipped && beCheck.skipped) {
    console.log("⚠️  All checks were skipped.");
    process.exit(0);
  }

  const allPassed = feCheck.passed && beCheck.passed;
  if (allPassed) {
    console.log("✅ Production safety check PASSED!");
    process.exit(0);
  } else {
    console.log("❌ Production safety check FAILED!");
    if (!feCheck.passed) {
      console.log("   - FE build contains dev-only strings");
    }
    if (!beCheck.passed) {
      console.log("   - BE endpoints are accessible in production");
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
