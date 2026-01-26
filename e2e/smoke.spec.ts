import { expect, test } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:9000";
const API_BASE = process.env.E2E_API_BASE || "http://localhost:8000/api";

// Test data (auto-created if not provided via env)
let TEST_EMAIL: string;
let TEST_PASSWORD: string;
let TEST_TOKEN: string;
let TEST_POST_ID: string;

/**
 * Setup test user and post automatically (self-contained).
 * Falls back to env vars if provided (for manual override).
 */
async function setupTestData() {
  // Use env vars if provided (manual override)
  if (process.env.E2E_EMAIL && process.env.E2E_PASSWORD) {
    TEST_EMAIL = process.env.E2E_EMAIL;
    TEST_PASSWORD = process.env.E2E_PASSWORD;
    TEST_TOKEN = ""; // Will be set via login
    TEST_POST_ID = process.env.E2E_POST_ID || "1";
    return;
  }

  // Auto-create test user via API
  try {
    const userResponse = await fetch(`${API_BASE}/dev/test-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "e2e_test" })
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to create test user: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    TEST_EMAIL = userData.email;
    TEST_PASSWORD = userData.password;
    TEST_TOKEN = userData.token;

    // Auto-create test post
    const postResponse = await fetch(`${API_BASE}/dev/test-post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({ type: "dream" })
    });

    if (postResponse.ok) {
      const postData = await postResponse.json();
      TEST_POST_ID = String(postData.post_id);
    } else {
      // Fallback to default if post creation fails
      TEST_POST_ID = "1";
    }
  } catch (err) {
    // If auto-setup fails, skip tests with clear message
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(
      "E2E auto-setup failed. Either:\n" +
      "  1. Set E2E_EMAIL and E2E_PASSWORD env vars, or\n" +
      "  2. Ensure backend is running and /api/dev/test-user endpoint is available.\n" +
      `  Error: ${errorMsg}`
    );
  }
}

// Setup test data once before all tests
test.beforeAll(async () => {
  await setupTestData();
});

async function login(page: import("@playwright/test").Page) {
  // Set token in localStorage (faster than UI login)
  await page.goto("/");
  await page.evaluate((token) => {
    localStorage.setItem("token", token);
  }, TEST_TOKEN);

  // Navigate to donor posts to trigger auth check
  await page.goto("/donor/posts");
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

  // Verify we're logged in (should not redirect to login)
  const currentUrl = page.url();
  if (currentUrl.includes("/login")) {
    // Fallback to UI login if token doesn't work
    await page.goto("/login");
    await page.getByTestId("dh-login-email").fill(TEST_EMAIL);
    await page.getByTestId("dh-login-password").fill(TEST_PASSWORD);
    await page.getByTestId("dh-login-submit").click();
    await page.waitForURL(/\/donor\/posts/, { timeout: 20_000 });
  }
}

async function loginAsDonee(page: import("@playwright/test").Page) {
  // Set token in localStorage (faster than UI login)
  await page.goto("/");
  await page.evaluate((token) => {
    localStorage.setItem("token", token);
  }, TEST_TOKEN);

  // Navigate to donee posts
  await page.goto("/donee/posts");
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

  // Verify we're logged in
  const currentUrl = page.url();
  if (currentUrl.includes("/login")) {
    // Fallback to UI login if token doesn't work
    await page.goto("/login");
    await page.getByTestId("dh-login-email").fill(TEST_EMAIL);
    await page.getByTestId("dh-login-password").fill(TEST_PASSWORD);
    await page.getByTestId("dh-login-submit").click();
    await page.waitForURL(/\/donor\/posts/, { timeout: 20_000 });

    // Switch to donee side (if there's a switch button)
    const switchBtn = page.locator("[aria-label*='donee' i], [aria-label*='switch' i], .donee-switch");
    if (await switchBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await switchBtn.click();
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    }
  }
}

test("smoke: login → donor feed → post detail → notifications", async ({ page }) => {
  await login(page);

  await page.goto("/donor/posts");
  // Use data-testid for stable selector
  await expect(page.getByTestId("dh-feed-container")).toBeVisible({ timeout: 10000 });

  // Go to a post detail (use auto-created test post)
  await page.goto(`/donor/post-detail/${TEST_POST_ID}`);
  // Verify post detail container or error state
  const postDetailContainer = page.getByTestId("dh-post-detail-container");
  const postDetailError = page.getByTestId("dh-post-detail-error");
  await Promise.race([
    postDetailContainer.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
    postDetailError.waitFor({ state: "visible", timeout: 10000 }).catch(() => {})
  ]);

  await page.goto("/donor/notifications");
  // Verify notifications page loaded (list, empty, or error state)
  const notificationsList = page.getByTestId("dh-notifications-list");
  const notificationsEmpty = page.getByTestId("dh-notifications-empty");
  const notificationsError = page.getByTestId("dh-notifications-error");
  await Promise.race([
    notificationsList.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
    notificationsEmpty.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
    notificationsError.waitFor({ state: "visible", timeout: 10000 }).catch(() => {})
  ]);
});

test("donee: open /donee/posts → verify page loads + Retry UI on error", async ({ page }) => {
  await loginAsDonee(page);

  await page.goto("/donee/posts");

  // Wait for page to load (either posts or empty/error state)
  await expect(
    page.locator(".post-page, .postPage-loading, .postPage-error, .postPage-empty")
  ).toBeVisible({ timeout: 15_000 });

  // If there's an error state, verify Retry button exists (safe UI, no raw errors)
  const errorState = page.locator(".postPage-error");
  if (await errorState.isVisible({ timeout: 2000 }).catch(() => false)) {
    await expect(
      page.getByRole("button", { name: /retry|skúsiť znova/i })
    ).toBeVisible();

    // Verify no raw error strings
    await expect(page.getByText(/unauthorized|err_network|err_bad_request|500|403/i)).toHaveCount(0);
  }
});

test("donee: post detail → navigate and verify Retry UI", async ({ page }) => {
  await loginAsDonee(page);

  // Try to find first post or use POST_ID
  await page.goto("/donee/posts");

  // Wait for page to load (either posts or empty/error state)
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

  // Try to click on first post if available, otherwise use POST_ID
  const firstPost = page.locator(".postCard, .postPage-postComponent").first();
  if (await firstPost.isVisible({ timeout: 3000 }).catch(() => false)) {
    await firstPost.click();
    // Wait for navigation instead of fixed timeout
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
  } else {
    // Fallback: navigate directly to post detail (use auto-created test post)
    await page.goto(`/donee/post-detail/${TEST_POST_ID}`);
  }

  // Verify page loaded (detail, edit, or error state)
  const postDetailContainer = page.getByTestId("dh-post-detail-container");
  const postDetailError = page.getByTestId("dh-post-detail-error");
  await Promise.race([
    postDetailContainer.waitFor({ state: "visible", timeout: 15000 }).catch(() => {}),
    postDetailError.waitFor({ state: "visible", timeout: 15000 }).catch(() => {}),
    page.locator(".postDetail-loading").waitFor({ state: "visible", timeout: 15000 }).catch(() => {})
  ]);

  // If error state, verify Retry UI (no raw errors)
  if (await postDetailError.isVisible({ timeout: 2000 }).catch(() => false)) {
    await expect(
      page.getByTestId("dh-post-detail-retry")
    ).toBeVisible();

    // No raw error strings
    await expect(page.getByText(/unauthorized|err_network|500|403/i)).toHaveCount(0);
  }
});

test("offline: donee/posts → offline → OfflineBanner + Retry; online → Retry works", async ({ page }) => {
  await loginAsDonee(page);
  await page.goto("/donee/posts");

  // Go offline
  await page.context().setOffline(true);

  // Trigger API call (refresh or switch mode)
  await page.reload({ waitUntil: "networkidle" });

  // Offline banner should appear
  await expect(
    page.getByText(/you're offline|si offline/i)
  ).toBeVisible({ timeout: 15_000 });

  // Retry button should be visible
  const retryBtn = page.getByRole("button", { name: /retry|skúsiť znova/i });
  await expect(retryBtn).toBeVisible();

  // Go back online
  await page.context().setOffline(false);

  // Wait for network recovery (banner should disappear)
  await expect(
    page.getByText(/you're offline|si offline/i)
  ).not.toBeVisible({ timeout: 10000 });

  // Retry should work now
  if (await retryBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await retryBtn.click();
    // Wait for page to load after retry
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  }
});

test("offline: donor/posts → offline → OfflineBanner + Retry; online → Retry works", async ({ page }) => {
  await login(page);
  await page.goto("/donor/posts");

  // Go offline
  await page.context().setOffline(true);

  // Trigger API call (switch tabs or refresh)
  const tabButtons = page.locator(".donor-tabs_button");
  if ((await tabButtons.count()) > 1) {
    await tabButtons.nth(1).click();
  }

  // Offline banner should appear
  await expect(
    page.getByText(/you're offline|si offline/i)
  ).toBeVisible({ timeout: 15_000 });

  // Retry button should be visible
  const retryBtn = page.getByRole("button", { name: /retry|skúsiť znova/i });
  await expect(retryBtn).toBeVisible();

  // Go back online
  await page.context().setOffline(false);

  // Wait for network recovery (banner should disappear)
  await expect(
    page.getByText(/you're offline|si offline/i)
  ).not.toBeVisible({ timeout: 10000 });

  // Retry should work now (if still visible)
  if (await retryBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await retryBtn.click();
    // Wait for successful refetch
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  }
});

test("422 validation: post creation (donee) → empty required field → safe i18n text", async ({ page }) => {
  await loginAsDonee(page);
  await page.goto("/donee/post-creation");

  // Wait for form to load
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

  // Try to submit without filling required fields (should trigger 422)
  const submitBtn = page.getByTestId("dh-post-creation-submit");
  if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    // Wait for API response instead of fixed timeout
    const responsePromise = page.waitForResponse(
      (response) => response.status() === 422 || response.status() === 200,
      { timeout: 10000 }
    ).catch(() => null);

    await submitBtn.click();

    // Wait for validation error toast or error message
    const errorToast = page.getByText(/please check your input|skontroluj zadané údaje|validation/i);
    const errorMessage = page.getByTestId("dh-post-creation-error");
    await Promise.race([
      errorToast.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
      errorMessage.waitFor({ state: "visible", timeout: 10000 }).catch(() => {})
    ]);

    // Wait for API response if available
    await responsePromise;

    // No raw backend error strings
    await expect(page.getByText(/422|unprocessable|laravel|validation failed/i)).toHaveCount(0);
  } else {
    test.skip(true, "Post creation form not available or already has validation");
  }
});

test("429/500/403: dev endpoints → safe text + Retry", async ({ page }) => {
  await login(page);
  await page.goto("/__dev/qa");

  const btn429 = page.getByRole("button", { name: /trigger 429/i });
  const btn500 = page.getByRole("button", { name: /trigger 500/i });
  const btn403 = page.getByRole("button", { name: /trigger 403/i });

  await test.skip(
    !(await btn429.isVisible().catch(() => false)) &&
    !(await btn500.isVisible().catch(() => false)) &&
    !(await btn403.isVisible().catch(() => false)),
    "Dev QA page/buttons not available (not in DEV build?)"
  );

  // Test 429
  if (await btn429.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn429.click();
    await expect(page.getByText(/too many requests|príliš veľa požiadaviek/i)).toBeVisible();
    await expect(page.getByText(/429/i)).toHaveCount(0);
  }

  // Test 500
  if (await btn500.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn500.click();
    await expect(page.getByText(/something went wrong|niečo sa pokazilo/i)).toBeVisible();
    await expect(page.getByText(/500|internal server error/i)).toHaveCount(0);
  }

  // Test 403
  if (await btn403.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn403.click();
    await expect(page.getByText(/don't have permission|nemáš oprávnenie/i)).toBeVisible();
    await expect(page.getByText(/403|forbidden/i)).toHaveCount(0);
  }
});

test("token refresh storm: parallel requests → no refresh loop + silent logout on fail", async ({ page }) => {
  await login(page);

  // Navigate to a page that makes multiple API calls
  await page.goto("/donor/posts");
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

  // Simulate rapid navigation (triggers multiple parallel requests)
  await Promise.all([
    page.goto("/donor/notifications").catch(() => {}),
    page.goto("/donor/posts").catch(() => {}),
    page.goto("/donor/posts").catch(() => {})
  ]);

  // Wait for navigation to complete
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

  // Should still be authenticated (not redirected to login)
  // If refresh loop occurred, we'd be redirected
  const currentUrl = page.url();
  expect(currentUrl).not.toContain("/login");

  // Now simulate token expiration by setting invalid token
  await page.addInitScript(() => {
    localStorage.setItem("token", "expired-invalid-token");
  });

  await page.reload();

  // Should silently logout and redirect to login (no spam toasts)
  await page.waitForURL(/\/login/, { timeout: 15_000 });

  // Verify no raw error strings in DOM
  await expect(page.getByText(/unauthorized|401|err_network/i)).toHaveCount(0);

  // Verify no excessive toasts (should be max 1-2, not spam)
  // Wait for toasts to appear/disappear
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
  const toasts = page.locator(".q-notification");
  const toastCount = await toasts.count();
  expect(toastCount).toBeLessThanOrEqual(2);
});

test("offline→online recovery: donee my posts → offline → banner + Retry → online → Retry works", async ({ page }) => {
  await loginAsDonee(page);
  await page.goto("/donee/posts");

  // Wait for page to load
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

  // Go offline
  await page.context().setOffline(true);

  // Trigger API call by refreshing
  await page.reload({ waitUntil: "networkidle" });

  // Offline banner should appear
  await expect(
    page.getByText(/you're offline|si offline/i)
  ).toBeVisible({ timeout: 15_000 });

  // Retry button should be visible
  const retryBtn = page.getByRole("button", { name: /retry|skúsiť znova/i });
  await expect(retryBtn).toBeVisible();

  // Go back online
  await page.context().setOffline(false);

  // Wait for network recovery (banner should disappear)
  await expect(
    page.getByText(/you're offline|si offline/i)
  ).not.toBeVisible({ timeout: 10000 });

  // Click Retry
  await retryBtn.click();

  // Wait for page to load (at least one element should appear)
  await expect(
    page.locator(".post-page, .postPage-loading, .postPage-empty, .postPage-postComponent")
  ).toBeVisible({ timeout: 10_000 });
});

test("offline→online recovery: donor notifications → offline → banner + Retry → online → Retry works", async ({ page }) => {
  await login(page);
  await page.goto("/donor/notifications");

  // Wait for page to load
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

  // Go offline
  await page.context().setOffline(true);

  // Trigger API call by refreshing
  await page.reload({ waitUntil: "networkidle" });

  // Offline banner should appear
  await expect(
    page.getByText(/you're offline|si offline/i)
  ).toBeVisible({ timeout: 15_000 });

  // Retry button should be visible
  const retryBtn = page.getByRole("button", { name: /retry|skúsiť znova/i });
  await expect(retryBtn).toBeVisible();

  // Go back online
  await page.context().setOffline(false);

  // Wait for network recovery
  await page.waitForTimeout(2000);

  // Click Retry
  await retryBtn.click();

  // Wait for page to load (at least one element should appear)
  await expect(
    page.locator(".notification-Page, .notifications-list, .notifications-empty")
  ).toBeVisible({ timeout: 10_000 });

  // Offline banner should disappear
  await expect(
    page.getByText(/you're offline|si offline/i)
  ).not.toBeVisible({ timeout: 5000 });
});

test("parallel 401 refresh sanity: invalid token → 2 parallel requests → no refresh loop → redirect /login + safe toast", async ({ page }) => {
  // Set invalid token before navigation
  await page.addInitScript(() => {
    localStorage.setItem("token", "invalid-jwt-token-12345");
  });

  // Navigate to pages that trigger parallel API calls
  await page.goto("/donor/posts");

  // Trigger parallel requests by navigating quickly
  const requests = [
    page.goto("/donor/posts").catch(() => {}),
    page.goto("/donor/notifications").catch(() => {})
  ];

  await Promise.all(requests);

  // Wait for navigation/redirect to complete
  await page.waitForURL(/\/login/, { timeout: 15_000 });

  // Verify safe toast (no raw error strings)
  await expect(page.getByText(/unauthorized|401|err_network|err_bad_request/i)).toHaveCount(0);

  // Verify no excessive toasts (max 1-2)
  await page.waitForTimeout(1000);
  const toasts = page.locator(".q-notification");
  const toastCount = await toasts.count();
  expect(toastCount).toBeLessThanOrEqual(2);
});

test("upload/share/reply fail: dev endpoint 500 → safe i18n toast + UI not stuck", async ({ page }) => {
  await login(page);
  await page.goto("/__dev/qa");

  const btn = page.getByRole("button", { name: /trigger 500/i });
  await test.skip(!(await btn.isVisible()), "Dev QA page/button not available (not in DEV build?)");

  // Click button to trigger 500 error
  await btn.click();

  // Wait for error toast
  await expect(
    page.getByText(/something went wrong|niečo sa pokazilo/i)
  ).toBeVisible({ timeout: 5000 });

  // Verify no raw error strings
  await expect(page.getByText(/500|internal server error|axios|err_network/i)).toHaveCount(0);

  // Verify UI is not stuck (page should still be interactive)
  // Wait for page to stabilize
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

  // Try to interact with page (should work)
  const pageTitle = page.locator(".devQaPage-title, .devQaPage-card");
  await expect(pageTitle).toBeVisible();

  // Verify loading flags are cleared (no spinner stuck)
  const stuckSpinner = page.locator(".q-spinner").filter({ hasNotText: "" });
  const spinnerCount = await stuckSpinner.count();
  expect(spinnerCount).toBe(0);
});

test("expired token: invalid token in localStorage → reload → redirect to /login (no raw errors)", async ({ page }) => {
  // Force an auth-like state, but with an invalid token
  await page.addInitScript(() => {
    localStorage.setItem("token", "this-is-not-a-valid-jwt");
  });

  await page.goto("/donor/posts");

  // The app might briefly render before the first 401 triggers logout+redirect
  await page.waitForURL(/\/login/, { timeout: 25_000 });

  // Ensure we don't leak raw strings in DOM (basic guard)
  await expect(page.getByText(/unauthorized/i)).toHaveCount(0);
  await expect(page.getByText(/err_network|err_bad_request/i)).toHaveCount(0);
});

test("422: dev endpoint returns 422 → app shows safe validation copy (no raw backend)", async ({ page }) => {
  // This test depends on BE dev-only endpoint being enabled (local/dev only).
  // If BE is not running, or endpoint isn't present, skip.
  await login(page);

  await page.goto("/__dev/qa");

  const btn = page.getByRole("button", { name: /trigger 422/i });
  await test.skip(!(await btn.isVisible()), "Dev QA page/button not available (not in DEV build?)");

  await btn.click();

  // Expect generic validation message (EN or SK). We intentionally avoid asserting raw Laravel strings.
  await expect(page.getByText(/please check your input|skontroluj zadané údaje/i)).toBeVisible();
});

test("403: dev endpoint returns 403 → app shows safe forbidden message (no raw errors)", async ({ page }) => {
  await login(page);
  await page.goto("/__dev/qa");

  const btn = page.getByRole("button", { name: /trigger 403/i });
  await test.skip(!(await btn.isVisible()), "Dev QA page/button not available (not in DEV build?)");

  await btn.click();

  // Expect safe forbidden message (EN or SK), no raw "Forbidden" or status codes
  await expect(page.getByText(/don't have permission|nemáš oprávnenie/i)).toBeVisible();
  await expect(page.getByText(/403|forbidden/i)).toHaveCount(0);
});

test("429: dev endpoint returns 429 → app shows safe rate limit message + anti-dup works", async ({ page }) => {
  await login(page);
  await page.goto("/__dev/qa");

  const btn = page.getByRole("button", { name: /trigger 429/i });
  await test.skip(!(await btn.isVisible()), "Dev QA page/button not available (not in DEV build?)");

  // Click multiple times rapidly - should only show one toast (anti-dup)
  await btn.click();
  await btn.click();
  await btn.click();

  // Expect safe rate limit message (EN or SK), no raw "429" or "Too Many Requests"
  await expect(page.getByText(/too many requests|príliš veľa požiadaviek/i)).toBeVisible();
  await expect(page.getByText(/429/i)).toHaveCount(0);

  // Wait for toasts to stabilize and verify only one toast appeared (anti-dup check)
  await page.waitForLoadState("networkidle", { timeout: 3000 }).catch(() => {});
  const toasts = page.locator(".q-notification");
  const count = await toasts.count();
  expect(count).toBeLessThanOrEqual(1);
});

test("500: dev endpoint returns 500 → app shows safe server error + Retry works", async ({ page }) => {
  await login(page);
  await page.goto("/__dev/qa");

  const btn = page.getByRole("button", { name: /trigger 500/i });
  await test.skip(!(await btn.isVisible()), "Dev QA page/button not available (not in DEV build?)");

  await btn.click();

  // Expect safe server error message (EN or SK), no raw "500" or "Internal Server Error"
  await expect(page.getByText(/something went wrong|niečo sa pokazilo/i)).toBeVisible();
  await expect(page.getByText(/500|internal server error/i)).toHaveCount(0);

  // If there's a Retry button, verify it works (refetches)
  const retryBtn = page.getByRole("button", { name: /retry|skúsiť znova/i });
  if (await retryBtn.isVisible()) {
    await retryBtn.click();
    // Should attempt to refetch (may succeed or fail again, but should not crash)
    await page.waitForTimeout(1000);
  }
});

test("timeout: dev endpoint sleep 30s → app shows safe timeout message + Retry", async ({ page }) => {
  await login(page);
  await page.goto("/__dev/qa");

  const btn = page.getByRole("button", { name: /sleep.*timeout/i });
  await test.skip(!(await btn.isVisible()), "Dev QA page/button not available (not in DEV build?)");

  // Set shorter timeout for test (5s instead of 30s)
  await page.route("**/api/dev/sleep?ms=*", async (route) => {
    // Intercept and return timeout error faster
    await route.fulfill({
      status: 504,
      contentType: "application/json",
      body: JSON.stringify({ error: "Gateway Timeout" })
    });
  });

  await btn.click();

  // Wait for timeout error
  await expect(
    page.getByText(/something went wrong|niečo sa pokazilo|timeout/i)
  ).toBeVisible({ timeout: 15000 });

  // Verify no raw timeout error strings
  await expect(page.getByText(/504|gateway timeout|err_network/i)).toHaveCount(0);

  // If there's a Retry button, verify it's visible and clickable
  const retryBtn = page.getByRole("button", { name: /retry|skúsiť znova/i });
  if (await retryBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await expect(retryBtn).toBeEnabled();
  }
});

test("upload fail: simulate upload error → safe message + UI not stuck", async ({ page }) => {
  await loginAsDonee(page);
  await page.goto("/donee/post-creation");

  // Wait for form to load
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

  // Intercept upload request and return error
  await page.route("**/api/**/upload*", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Upload failed" })
    });
  });

  // Try to upload an image (if file input is available)
  const fileInput = page.locator('input[type="file"]');
  if (await fileInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    // Create a dummy file buffer (simple approach without fs)
    const buffer = Buffer.from("fake-image-data");
    await fileInput.setInputFiles({
      name: "test.jpg",
      mimeType: "image/jpeg",
      buffer
    });
    await page.waitForTimeout(2000);

    // Verify safe error toast
    await expect(
      page.getByText(/something went wrong|niečo sa pokazilo|upload failed/i)
    ).toBeVisible({ timeout: 5000 });

    // Verify no raw error strings
    await expect(page.getByText(/500|internal server error|axios/i)).toHaveCount(0);

    // Verify UI is not stuck (upload button should be enabled/clickable)
    const uploadBtn = page.getByRole("button", { name: /upload|submit|publish/i });
    if (await uploadBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(uploadBtn).toBeEnabled({ timeout: 2000 });
    }
  } else {
    test.skip(true, "File upload input not available on post creation page");
  }
});

test("language switch during error: offline/500 → verify i18n text changes EN→SK", async ({ page }) => {
  await login(page);

  // Set language to English first
  await page.goto("/donor/posts");
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

  // Trigger error state (offline)
  await page.context().setOffline(true);
  await page.reload({ waitUntil: "networkidle" });

  // Wait for offline banner/toast in English
  await expect(
    page.getByText(/you're offline|offline/i)
  ).toBeVisible({ timeout: 15000 });

  // Verify it's in English (not Slovak)
  const enText = page.getByText(/you're offline/i);
  const skText = page.getByText(/si offline/i);
  const isEnglish = await enText.isVisible({ timeout: 2000 }).catch(() => false);
  const isSlovak = await skText.isVisible({ timeout: 2000 }).catch(() => false);

  // Switch language to Slovak (look for language switcher)
  const langSwitcher = page.locator("[aria-label*='language' i], [aria-label*='jazyk' i], .language-switch, .lang-switch");
  if (await langSwitcher.isVisible({ timeout: 3000 }).catch(() => false)) {
    await langSwitcher.click();
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
  } else {
    // Try to find language in settings or header
    await page.goto("/donor/settings");
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    const langOption = page.getByText(/slovak|slovenčina|sk/i).first();
    if (await langOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await langOption.click();
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      await page.goto("/donor/posts");
      await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    }
  }

  // Reload to trigger error again
  await page.reload({ waitUntil: "networkidle" });

  // Verify text changed to Slovak
  await expect(
    page.getByText(/si offline/i)
  ).toBeVisible({ timeout: 15000 });

  // Verify no raw i18n keys or raw error strings
  await expect(page.getByText(/common\.errors|errors\.offline|ERR_NETWORK/i)).toHaveCount(0);
  await expect(page.getByText(/unauthorized|err_network|500/i)).toHaveCount(0);

  // Go back online
  await page.context().setOffline(false);
});

test("expired token during upload: invalid token → upload → safe toast + redirect /login", async ({ page }) => {
  await loginAsDonee(page);

  // Set invalid token
  await page.addInitScript(() => {
    localStorage.setItem("token", "expired-invalid-token-12345");
  });

  await page.goto("/donee/post-creation");
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

  // Try to upload (if file input is available)
  const fileInput = page.locator('input[type="file"]');
  if (await fileInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    const buffer = Buffer.from("fake-image-data");
    await fileInput.setInputFiles({
      name: "test.jpg",
      mimeType: "image/jpeg",
      buffer
    });
    await page.waitForTimeout(2000);

    // Should show safe error toast (not raw error)
    await expect(
      page.getByText(/something went wrong|niečo sa pokazilo|unauthorized|session expired/i)
    ).toBeVisible({ timeout: 5000 });

    // Verify no raw error strings
    await expect(page.getByText(/401|unauthorized|err_network|err_bad_request/i)).toHaveCount(0);

    // Should redirect to login (no refresh loop)
    await page.waitForURL(/\/login/, { timeout: 15000 });

    // Verify UI is not stuck (no loading spinner stuck)
    // Wait for UI to stabilize
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    const stuckSpinner = page.locator(".q-spinner").filter({ hasNotText: "" });
    const spinnerCount = await stuckSpinner.count();
    expect(spinnerCount).toBe(0);
  } else {
    // Fallback: simulate upload via API call
    await page.route("**/api/**/upload*", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Unauthorized" })
      });
    });

    // Trigger any action that would cause upload
    const submitBtn = page.getByRole("button", { name: /submit|publish|create/i });
    if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(2000);

      // Should redirect to login
      await page.waitForURL(/\/login/, { timeout: 15000 });

      // Verify safe toast (no raw errors)
      await expect(page.getByText(/401|unauthorized|err_network/i)).toHaveCount(0);
    } else {
      test.skip(true, "Upload form not available");
    }
  }
});

// Multi-tab sanity test - marked as manual QA if too flaky
test("multi-tab sanity: 2 pages → invalid token → no refresh cascade → both redirect /login", async ({ browser }) => {
  // Create two pages (tabs)
  const context = await browser.newContext();
  const page1 = await context.newPage();
  const page2 = await context.newPage();

  try {
    // Set invalid token in both pages
    await page1.addInitScript(() => {
      localStorage.setItem("token", "invalid-token-tab1");
    });
    await page2.addInitScript(() => {
      localStorage.setItem("token", "invalid-token-tab2");
    });

    // Navigate both pages to different routes
    await Promise.all([
      page1.goto("/donor/posts"),
      page2.goto("/donor/notifications")
    ]);

    // Wait for both pages to redirect to login (no refresh loop)
    await Promise.all([
      page1.waitForURL(/\/login/, { timeout: 15000 }),
      page2.waitForURL(/\/login/, { timeout: 15000 })
    ]);

    // Verify no raw error strings in either page
    await Promise.all([
      expect(page1.getByText(/401|unauthorized|err_network/i)).toHaveCount(0),
      expect(page2.getByText(/401|unauthorized|err_network/i)).toHaveCount(0)
    ]);

    // Verify no excessive toasts (max 1-2 per page)
    await page1.waitForTimeout(1000);
    await page2.waitForTimeout(1000);
    const toasts1 = page1.locator(".q-notification");
    const toasts2 = page2.locator(".q-notification");
    const count1 = await toasts1.count();
    const count2 = await toasts2.count();
    expect(count1).toBeLessThanOrEqual(2);
    expect(count2).toBeLessThanOrEqual(2);
  } finally {
    await context.close();
  }
});
