#!/usr/bin/env node

/**
 * E2E Local - Automatically starts BE + FE dev servers, waits for readiness, runs E2E tests, then cleans up
 *
 * Usage:
 *   npm run e2e:local
 *
 * Environment variables:
 *   E2E_EMAIL - Test account email (required)
 *   E2E_PASSWORD - Test account password (required)
 *   E2E_POST_ID - Post ID for tests (optional, default: "1")
 *   E2E_BASE_URL - Frontend URL (default: http://localhost:9000)
 *   E2E_API_BASE - Backend API URL (default: http://localhost:8000/api)
 */

const { spawn } = require("child_process");
const path = require("path");
const { execSync } = require("child_process");

const FE_PORT = process.env.E2E_BASE_URL?.replace("http://localhost:", "").replace("/", "") || "9000";
const BE_PORT = process.env.E2E_API_BASE?.replace("http://localhost:", "").replace("/api", "") || "8000";

const FE_URL = process.env.E2E_BASE_URL || `http://localhost:${FE_PORT}`;
const BE_URL = `http://localhost:${BE_PORT}`;
const BE_HEALTH_URL = `${BE_URL}/api/health`;

let feProcess = null;
let beProcess = null;

function log(message) {
  console.log(`[e2e:local] ${message}`);
}

function waitForReady(url, name, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = 1000;

    const check = async () => {
      try {
        const http = require("http");
        const https = require("https");
        const { URL } = require("url");

        const urlObj = new URL(url);
        const client = urlObj.protocol === "https:" ? https : http;

        const req = client.get(urlObj, { timeout: 5000 }, (res) => {
          if (res.statusCode === 200) {
            log(`✅ ${name} ready: ${url}`);
            resolve();
            return;
          }
          scheduleNext();
        });

        req.on("error", () => scheduleNext());
        req.on("timeout", () => {
          req.destroy();
          scheduleNext();
        });
      } catch (err) {
        scheduleNext();
      }
    };

    const scheduleNext = () => {
      if (Date.now() - startTime > timeout) {
        const urlObj = new URL(url);
        const port = urlObj.port || (urlObj.protocol === "https:" ? "443" : "80");
        const host = urlObj.hostname || "localhost";
        reject(new Error(
          `${name} not ready after ${timeout}ms\n` +
          `  URL: ${url}\n` +
          `  Host: ${host}, Port: ${port}\n` +
          `  Fix: Check if ${name.toLowerCase()} server is running on ${host}:${port}`
        ));
        return;
      }
      setTimeout(check, interval);
    };

    check();
  });
}

function startBackend() {
  log("Starting backend server...");
  const bePath = path.join(__dirname, "..", "..", "dreamhubb-BE");

  // Check if backend directory exists
  try {
    require("fs").accessSync(bePath);
  } catch {
    log("⚠️  Backend directory not found. Assuming BE is running separately.");
    return null;
  }

  const isWindows = process.platform === "win32";
  const beProcess = spawn(
    isWindows ? "php" : "php",
    ["artisan", "serve", "--host=127.0.0.1", `--port=${BE_PORT}`],
    {
      cwd: bePath,
      stdio: "inherit",
      shell: isWindows
    }
  );

  beProcess.on("error", (err) => {
    log(`⚠️  Failed to start backend: ${err.message}`);
    log("   Assuming BE is running separately.");
  });

  return beProcess;
}

function startFrontend() {
  log("Starting frontend dev server...");
  const feProcess = spawn("npm", ["run", "dev"], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      QUASAR_PORT: FE_PORT
    }
  });

  return feProcess;
}

function runE2ETests() {
  log("Running E2E tests...");
  return new Promise((resolve, reject) => {
    const testProcess = spawn("npm", ["run", "test:e2e"], {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        E2E_BASE_URL: FE_URL,
        E2E_API_BASE: `${BE_URL}/api`
      }
    });

    testProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`E2E tests failed with exit code ${code}`));
      }
    });

    testProcess.on("error", (err) => {
      reject(err);
    });
  });
}

async function cleanup() {
  log("Cleaning up...");

  if (feProcess) {
    log("Stopping frontend server...");
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /F /T /PID ${feProcess.pid}`, { stdio: "ignore" });
      } else {
        process.kill(-feProcess.pid, "SIGTERM");
      }
    } catch (err) {
      // Ignore errors
    }
  }

  if (beProcess) {
    log("Stopping backend server...");
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /F /T /PID ${beProcess.pid}`, { stdio: "ignore" });
      } else {
        process.kill(-beProcess.pid, "SIGTERM");
      }
    } catch (err) {
      // Ignore errors
    }
  }
}

async function main() {
  const startTime = Date.now();

  // Check required env vars
  if (!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD) {
    log("⚠️  E2E_EMAIL or E2E_PASSWORD not set. Tests may be skipped.");
    log("   Set them via: export E2E_EMAIL=... E2E_PASSWORD=... (Mac/Linux)");
    log("   Or: $env:E2E_EMAIL=... $env:E2E_PASSWORD=... (Windows PowerShell)");
  }

  try {
    // Start servers
    beProcess = startBackend();
    feProcess = startFrontend();

    // Wait for readiness
    log("Waiting for servers to be ready...");
    await Promise.all([
      waitForReady(BE_HEALTH_URL, "Backend", 60000),
      waitForReady(FE_URL, "Frontend", 60000)
    ]);

    // Run E2E tests
    await runE2ETests();

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`✅ E2E tests completed successfully (${duration}s)`);
    process.exit(0);
  } catch (err) {
    log(`❌ Error: ${err.message}`);
    process.exit(1);
  } finally {
    await cleanup();
  }
}

// Handle Ctrl+C gracefully
process.on("SIGINT", async () => {
  log("\n⚠️  Interrupted by user");
  await cleanup();
  process.exit(130);
});

process.on("SIGTERM", async () => {
  log("\n⚠️  Terminated");
  await cleanup();
  process.exit(143);
});

main().catch(async (err) => {
  log(`❌ Fatal error: ${err.message}`);
  await cleanup();
  process.exit(1);
});
