#!/usr/bin/env node

/**
 * Release-mode smoke script
 * Builds production bundle → serves preview → runs E2E tests
 *
 * Usage: npm run test:e2e:release
 */

const { spawn } = require("child_process");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const PREVIEW_PORT = 9001; // Different from dev server (9000)
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;
const DIST_DIR = path.join(__dirname, "..", "dist", "spa");

let previewProcess = null;

function log(message) {
  console.log(`[release-smoke] ${message}`);
}

function error(message) {
  console.error(`[release-smoke] ❌ ${message}`);
}

function success(message) {
  console.log(`[release-smoke] ✅ ${message}`);
}

function cleanup() {
  if (previewProcess) {
    log("Stopping preview server...");
    previewProcess.kill();
    previewProcess = null;
  }
}

// Cleanup on exit
process.on("SIGINT", () => {
  cleanup();
  process.exit(1);
});

process.on("SIGTERM", () => {
  cleanup();
  process.exit(1);
});

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      ...options
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on("error", (err) => {
      reject(err);
    });
  });
}

async function waitForServer(url, timeout = 60000) {
  const startTime = Date.now();
  const http = require("http");

  return new Promise((resolve, reject) => {
    function check() {
      const req = http.get(url, (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          // 404 is OK - server is running, just route might not exist
          resolve();
        } else {
          if (Date.now() - startTime > timeout) {
            reject(new Error(`Server did not respond within ${timeout}ms`));
          } else {
            setTimeout(check, 1000);
          }
        }
      });

      req.on("error", () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Server did not start within ${timeout}ms`));
        } else {
          setTimeout(check, 1000);
        }
      });

      req.end();
    }

    check();
  });
}

async function main() {
  try {
    // Step 1: Build production bundle
    log("Step 1: Building production bundle...");
    await runCommand("npm", ["run", "build"]);
    success("Build completed");

    // Check if dist/spa exists
    if (!fs.existsSync(DIST_DIR)) {
      throw new Error(`Build output not found at ${DIST_DIR}`);
    }

    // Step 2: Start preview server
    log(`Step 2: Starting preview server on port ${PREVIEW_PORT}...`);

    // Try to use vite preview first, fallback to serve
    const previewCommand = "npx";
    const previewArgs = ["vite", "preview", "--port", String(PREVIEW_PORT), "--host"];

    previewProcess = spawn(previewCommand, previewArgs, {
      cwd: path.join(__dirname, ".."),
      stdio: "pipe",
      shell: true
    });

    previewProcess.stdout.on("data", (data) => {
      const output = data.toString();
      if (output.includes("Local:") || output.includes("Network:")) {
        log(`Preview server: ${output.trim()}`);
      }
    });

    previewProcess.stderr.on("data", (data) => {
      const output = data.toString();
      // Ignore vite warnings
      if (!output.includes("warning")) {
        process.stderr.write(data);
      }
    });

    // Wait for server to be ready
    log("Waiting for preview server to start...");
    await waitForServer(PREVIEW_URL, 60000);
    success(`Preview server running at ${PREVIEW_URL}`);

    // Step 3: Run E2E tests against preview
    log("Step 3: Running E2E tests against preview build...");
    const e2eEnv = {
      ...process.env,
      E2E_BASE_URL: PREVIEW_URL
    };

    await runCommand("npm", ["run", "test:e2e"], {
      env: e2eEnv
    });

    success("E2E tests passed against production build!");
  } catch (err) {
    error(err.message);
    process.exit(1);
  } finally {
    cleanup();
  }
}

main();
