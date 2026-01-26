#!/usr/bin/env node

/**
 * Wait for server readiness check
 *
 * Checks if a URL responds with HTTP 200
 *
 * Usage:
 *   node scripts/waitForReady.js <url> [timeout] [interval]
 *
 * Example:
 *   node scripts/waitForReady.js http://localhost:9000/ 30000 1000
 */

const http = require("http");
const https = require("https");
const { URL } = require("url");

const url = process.argv[2];
const timeout = parseInt(process.argv[3] || "30000", 10); // Default 30s
const interval = parseInt(process.argv[4] || "1000", 10); // Default 1s

if (!url) {
  console.error("Usage: node scripts/waitForReady.js <url> [timeout] [interval]");
  process.exit(1);
}

function checkUrl(targetUrl) {
  return new Promise((resolve) => {
    const urlObj = new URL(targetUrl);
    const client = urlObj.protocol === "https:" ? https : http;

    const req = client.get(urlObj, { timeout: 5000 }, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForReady() {
  const startTime = Date.now();
  const maxTime = startTime + timeout;

  while (Date.now() < maxTime) {
    const isReady = await checkUrl(url);
    if (isReady) {
      console.log(`✅ Server ready: ${url}`);
      process.exit(0);
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  const urlObj = new URL(url);
  const port = urlObj.port || (urlObj.protocol === "https:" ? "443" : "80");
  const host = urlObj.hostname || "localhost";

  console.error(`❌ Server not ready after ${timeout}ms`);
  console.error(`   URL: ${url}`);
  console.error(`   Host: ${host}`);
  console.error(`   Port: ${port}`);
  console.error(`   Fix: Check if server is running on ${host}:${port}`);
  process.exit(1);
}

waitForReady().catch((err) => {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
});
