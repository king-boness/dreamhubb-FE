#!/usr/bin/env node

/**
 * Preflight check script - runs all quality gates before release
 *
 * Runs: lint → build → guardrails → e2e → e2e:release
 *
 * Usage:
 *   npm run preflight        - Interactive output
 *   npm run preflight:ci     - CI-friendly output
 */

const { spawn, execSync } = require("child_process");
const path = require("path");

const IS_CI = process.env.CI === "true" || process.env.CI === "1";
const CI_MODE = process.argv.includes("--ci") || IS_CI;

// Server readiness check helper
async function checkServerReadiness(url, name, timeout = 5000) {
  return new Promise((resolve) => {
    const http = require("http");
    const https = require("https");
    const { URL } = require("url");

    const urlObj = new URL(url);
    const client = urlObj.protocol === "https:" ? https : http;
    const req = client.get(url, { timeout }, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

const steps = [
  {
    name: "Lint",
    command: "npm",
    args: ["run", "lint"],
    description: "Running ESLint..."
  },
  {
    name: "Guardrails",
    command: "npm",
    args: ["run", "guardrails"],
    description: "Checking guardrails (Notify.create, console.*, sensitive data)..."
  },
  {
    name: "Unit Tests",
    command: "npm",
    args: ["run", "test"],
    description: "Running unit tests (error mapper)...",
    optional: true
  },
  {
    name: "Build",
    command: "npm",
    args: ["run", "build"],
    description: "Building production bundle..."
  },
  {
    name: "Prod Safety Check",
    command: "npm",
    args: ["run", "prod-safety-check", "--skip-be"], // Skip BE check (requires running server)
    description: "Verifying dev routes/components are not in production build...",
    optional: true
  },
  {
    name: "Server Readiness",
    command: "node",
    args: ["-e", "process.exit(0)"], // Placeholder, actual check is async
    description: "Checking server readiness...",
    async: true,
    optional: true,
    asyncCheck: async () => {
      const BE_URL = process.env.E2E_API_BASE?.replace("/api", "") || "http://localhost:8000";
      const FE_URL = process.env.E2E_BASE_URL || "http://localhost:9000";

      const beReady = await checkServerReadiness(`${BE_URL}/api/health`, "Backend");
      const feReady = await checkServerReadiness(`${FE_URL}/`, "Frontend");

      if (!beReady || !feReady) {
        log("\n⚠ Server readiness check failed:", "warning");
        if (!beReady) {
          const beUrlObj = new URL(BE_URL);
          const bePort = beUrlObj.port || "8000";
          log(`  ❌ Backend not ready at ${BE_URL}/api/health`, "warning");
          log(`     Host: ${beUrlObj.hostname || "localhost"}, Port: ${bePort}`, "warning");
          log("     To start backend: cd dreamhubb-BE && php artisan serve", "warning");
          log("     Or check if port is already in use: netstat -ano | findstr :8000 (Windows) or lsof -i :8000 (Mac/Linux)", "warning");
        }
        if (!feReady) {
          const feUrlObj = new URL(FE_URL);
          const fePort = feUrlObj.port || "9000";
          log(`  ❌ Frontend not ready at ${FE_URL}/`, "warning");
          log(`     Host: ${feUrlObj.hostname || "localhost"}, Port: ${fePort}`, "warning");
          log("     To start frontend: cd dreamhubb-FE && npm run dev", "warning");
          log("     Or check if port is already in use: netstat -ano | findstr :9000 (Windows) or lsof -i :9000 (Mac/Linux)", "warning");
        }
        log("\n  💡 Tip: Use 'npm run e2e:local' to automatically start servers and run E2E tests", "warning");
        log("  Skipping E2E tests...\n", "warning");
        return false;
      }
      log(`✅ Backend ready: ${BE_URL}/api/health`, "success");
      log(`✅ Frontend ready: ${FE_URL}/`, "success");
      return true;
    }
  },
  {
    name: "E2E (dev)",
    command: "npm",
    args: ["run", "test:e2e"],
    description: "Running E2E tests against dev server...",
    skipInCI: false, // Keep it, but might be flaky
    env: {
      E2E_BASE_URL: process.env.E2E_BASE_URL || "http://localhost:9000",
      E2E_API_BASE: process.env.E2E_API_BASE || "http://localhost:8000/api",
      E2E_EMAIL: process.env.E2E_EMAIL,
      E2E_PASSWORD: process.env.E2E_PASSWORD,
      E2E_POST_ID: process.env.E2E_POST_ID || "1"
    }
  },
  {
    name: "E2E (release)",
    command: "npm",
    args: ["run", "test:e2e:release"],
    description: "Running E2E tests against production build...",
    skipInCI: false, // Keep it, but might be flaky
    env: {
      E2E_BASE_URL: process.env.E2E_BASE_URL || "http://localhost:9001",
      E2E_API_BASE: process.env.E2E_API_BASE || "http://localhost:8000/api",
      E2E_EMAIL: process.env.E2E_EMAIL,
      E2E_PASSWORD: process.env.E2E_PASSWORD,
      E2E_POST_ID: process.env.E2E_POST_ID || "1"
    }
  }
];

const results = [];

function log(message, type = "info") {
  if (CI_MODE) {
    // CI-friendly output (no colors, minimal)
    console.log(message);
  } else {
    // Interactive output with colors
    const colors = {
      info: "\x1b[36m", // cyan
      success: "\x1b[32m", // green
      error: "\x1b[31m", // red
      warning: "\x1b[33m", // yellow
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
}

function logStep(message) {
  if (CI_MODE) {
    console.log(`\n## ${message}\n`);
  } else {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`  ${message}`);
    console.log(`${"=".repeat(60)}\n`);
  }
}

function runCommand(step) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    logStep(`START: ${step.name}`);
    log(step.description);

    const proc = spawn(step.command, step.args, {
      cwd: path.join(__dirname, ".."),
      stdio: CI_MODE ? "inherit" : "inherit",
      shell: true,
      env: {
        ...process.env,
        ...(step.env || {})
      }
    });

    let stdout = "";
    let stderr = "";

    if (!CI_MODE) {
      proc.stdout.on("data", (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      proc.stderr.on("data", (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });
    }

    proc.on("close", (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      if (code === 0) {
        log(`OK: ${step.name} (${duration}s)`, "success");
        results.push({ step: step.name, status: "OK", duration });
        resolve();
      } else {
        log(`FAIL: ${step.name} (exit code: ${code}, ${duration}s)`, "error");
        results.push({ step: step.name, status: "FAIL", code, duration });
        reject(new Error(`${step.name} failed with exit code ${code}`));
      }
    });

    proc.on("error", (err) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      log(`FAIL: ${step.name} (error: ${err.message}, ${duration}s)`, "error");
      results.push({ step: step.name, status: "FAIL", error: err.message, duration });
      reject(err);
    });
  });
}

async function main() {
  const startTime = Date.now();

  if (CI_MODE) {
    log("Running preflight checks in CI mode...");
  } else {
    log("🚀 Starting preflight checks...", "info");
    log("This will run: lint → build → guardrails → e2e → e2e:release\n");
  }

  let failedStep = null;

  for (const step of steps) {
    // Handle async checks (like server readiness)
    if (step.async && step.asyncCheck) {
      try {
        const result = await step.asyncCheck();
        if (result) {
          log(`OK: ${step.name}`, "success");
          results.push({ step: step.name, status: "OK", duration: "0.0" });
        } else {
          log(`SKIP: ${step.name} (servers not ready)`, "warning");
          results.push({ step: step.name, status: "SKIP", reason: "Servers not ready" });
          // Skip E2E tests if servers are not ready
          for (let i = 0; i < steps.length; i++) {
            if (steps[i].name.includes("E2E")) {
              steps[i].skip = true;
            }
          }
        }
      } catch (err) {
        log(`FAIL: ${step.name} (${err.message})`, "error");
        results.push({ step: step.name, status: "FAIL", error: err.message });
        failedStep = step.name;
        break;
      }
      continue;
    }

    // Skip E2E tests if credentials are missing (unless in CI)
    if ((step.name.includes("E2E") && !step.env.E2E_EMAIL && !CI_MODE) || step.skip) {
      log(`SKIP: ${step.name} (${step.skip ? "servers not ready" : "E2E_EMAIL/E2E_PASSWORD not set"})`, "warning");
      results.push({ step: step.name, status: "SKIP", reason: step.skip ? "Servers not ready" : "Missing credentials" });
      continue;
    }

    try {
      await runCommand(step);
    } catch (err) {
      // Skip optional steps if they fail (like prod-safety-check when server is not running)
      if (step.optional) {
        log(`SKIP: ${step.name} (optional step failed: ${err.message})`, "warning");
        results.push({ step: step.name, status: "SKIP", reason: err.message });
        continue;
      }

      failedStep = step.name;
      if (!CI_MODE) {
        log(`\n❌ Preflight check FAILED at step: ${step.name}`, "error");
        log(`Error: ${err.message}`, "error");
      }
      break; // Stop on first failure
    }
  }

  // Summary
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);

  if (CI_MODE) {
    console.log("\n## Preflight Summary\n");
    for (const result of results) {
      console.log(`- ${result.step}: ${result.status} (${result.duration}s)`);
    }
    console.log(`\nTotal time: ${totalDuration}s`);
  } else {
    console.log(`\n${"=".repeat(60)}`);
    console.log("  PREFLIGHT SUMMARY");
    console.log(`${"=".repeat(60)}\n`);

    for (const result of results) {
      const icon = result.status === "OK" ? "✅" : result.status === "SKIP" ? "⏭" : "❌";
      const statusColor = result.status === "OK" ? "success" : result.status === "SKIP" ? "warning" : "error";
      log(`${icon} ${result.step}: ${result.status} (${result.duration}s)`, statusColor);
    }

    console.log(`\nTotal time: ${totalDuration}s\n`);
  }

  const okCount = results.filter(r => r.status === "OK").length;
  const failCount = results.filter(r => r.status === "FAIL").length;
  const skipCount = results.filter(r => r.status === "SKIP").length;

  // Final PASS/FAIL summary
  if (CI_MODE) {
    console.log("\n## Final Status\n");
    if (failedStep) {
      console.log(`❌ PREFLIGHT FAILED: ${failedStep}`);
      console.log(`Passed: ${okCount}/${results.length} steps`);
      if (skipCount > 0) {
        console.log(`Skipped: ${skipCount} step(s)`);
      }
    } else {
      console.log(`✅ PREFLIGHT PASSED: All ${okCount} steps completed successfully!`);
      if (skipCount > 0) {
        console.log(`Skipped: ${skipCount} step(s) (optional)`);
      }
    }
  } else {
    if (failedStep) {
      log(`\n❌ PREFLIGHT FAILED: ${failedStep}`, "error");
      log(`Passed: ${okCount}/${results.length} steps`, "info");
      if (skipCount > 0) {
        log(`Skipped: ${skipCount} step(s)`, "warning");
      }
    } else {
      log(`\n✅ PREFLIGHT PASSED: All ${okCount} steps completed successfully!`, "success");
      if (skipCount > 0) {
        log(`Skipped: ${skipCount} step(s) (optional)`, "warning");
      }
    }
  }

  process.exit(failedStep ? 1 : 0);
}

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  log("\n\n⚠ Preflight interrupted by user", "warning");
  process.exit(130);
});

process.on("SIGTERM", () => {
  log("\n\n⚠ Preflight terminated", "warning");
  process.exit(143);
});

main().catch((err) => {
  log(`\n❌ Fatal error: ${err.message}`, "error");
  process.exit(1);
});
