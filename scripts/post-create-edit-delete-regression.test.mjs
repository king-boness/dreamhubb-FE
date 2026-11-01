/**
 * Regression tests for create/delete semantics (node:test).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcRoot = join(__dirname, "../src/utils");
const outDir = mkdtempSync(join(tmpdir(), "dh-post-flow-"));

function loadUtil(name) {
  const outfile = join(outDir, `${name}.cjs`);
  buildSync({
    entryPoints: [join(srcRoot, `${name}.ts`)],
    bundle: true,
    format: "cjs",
    platform: "node",
    outfile
  });
  const require = createRequire(import.meta.url);
  return require(outfile);
}

const deleteConfirm = loadUtil("postDeleteConfirm");
const imageContract = loadUtil("postCreateImageContract");
const submitSemantics = loadUtil("postCreateSubmitSemantics");
const errorMapping = loadUtil("postCreateErrorMapping");
const httpError = loadUtil("httpError");
const carouselIndex = loadUtil("carouselIndex");

function files(n) {
  return Array.from({ length: n }, (_, i) =>
    new File([`img${i}`], `p${i}.jpg`, { type: "image/jpeg" })
  );
}

describe("delete confirmation phrases", () => {
  it("maps button keys by normalized slug", () => {
    assert.equal(deleteConfirm.deleteMyPostI18nKey("dream"), "posts.edit.deleteMyDream");
    assert.equal(deleteConfirm.deleteMyPostI18nKey("problem"), "posts.edit.deleteMyProblem");
    assert.equal(deleteConfirm.deleteMyPostI18nKey("idea"), "posts.edit.deleteMyIdea");
  });

  it("DREAM/PROBLEM/IDEA exact English phrases", () => {
    assert.equal(deleteConfirm.getRequiredDeletePhrase("dream"), "I want to delete this dream");
    assert.equal(deleteConfirm.getRequiredDeletePhrase("problem"), "I want to delete this problem");
    assert.equal(deleteConfirm.getRequiredDeletePhrase("idea"), "I want to delete this idea");
  });

  it("STEP1 wrong case / missing word → disabled; trim → pass; exact → enabled", () => {
    assert.equal(deleteConfirm.isExactDeletePhrase("i want to delete this dream", "dream"), false);
    assert.equal(deleteConfirm.isExactDeletePhrase("I want to delete this", "dream"), false);
    assert.equal(deleteConfirm.isExactDeletePhrase("  I want to delete this dream  ", "dream"), true);
    assert.equal(deleteConfirm.isExactDeletePhrase("I want to delete this dream", "dream"), true);
    assert.equal(deleteConfirm.isExactDeletePhrase("I want to delete this problem", "problem"), true);
    assert.equal(deleteConfirm.isExactDeletePhrase("I want to delete this idea", "idea"), true);
  });
});

describe("create image XOR contract", () => {
  it("1 photo", () => {
    const payload = imageContract.resolveCreateImagePayload(files(1), ["https://x/orphan.jpg"]);
    assert.equal(payload.mode, "files");
    assert.equal(payload.files.length, 1);
  });

  it("3 photos", () => {
    const payload = imageContract.resolveCreateImagePayload(files(3), []);
    assert.equal(payload.mode, "files");
    assert.equal(payload.files.length, 3);
  });

  it("5 photos", () => {
    const payload = imageContract.resolveCreateImagePayload(files(5), []);
    assert.equal(payload.mode, "files");
    assert.equal(payload.files.length, 5);
  });

  it("3 photos then +1 keeps File[] only (no URL mix)", () => {
    const initial = files(3);
    const plus = files(1);
    const all = [...initial, ...plus];
    const payload = imageContract.resolveCreateImagePayload(all, [
      "https://res.cloudinary.com/x/should-not-mix.jpg"
    ]);
    assert.equal(payload.mode, "files");
    assert.equal(payload.files.length, 4);
  });

  it("middle remove keeps index alignment", () => {
    const f = files(3);
    const previews = ["blob:a", "blob:b", "blob:c"];
    // remove middle
    f.splice(1, 1);
    previews.splice(1, 1);
    const aligned = imageContract.alignImageFilesAndPreviews(f, previews);
    assert.equal(aligned.files.length, 2);
    assert.equal(aligned.previews.length, 2);
    assert.equal(aligned.previews[0], "blob:a");
    assert.equal(aligned.previews[1], "blob:c");
  });

  it("never sends blob/data as URL payload; no File+URL mix", () => {
    const payload = imageContract.resolveCreateImagePayload([], [
      "blob:http://localhost/1",
      "data:image/jpeg;base64,xx",
      "https://res.cloudinary.com/x/ok.jpg"
    ]);
    assert.deepEqual(payload, {
      mode: "urls",
      urls: ["https://res.cloudinary.com/x/ok.jpg"]
    });
    const mixedAttempt = imageContract.resolveCreateImagePayload(files(2), [
      "https://res.cloudinary.com/x/a.jpg"
    ]);
    assert.equal(mixedAttempt.mode, "files");
  });

  it("middle delete in File[] mode keeps remote store empty (no blob/data in payload state)", () => {
    const f = files(3);
    const previews = ["blob:a", "blob:b", "blob:c"];
    f.splice(1, 1);
    previews.splice(1, 1);
    const aligned = imageContract.alignImageFilesAndPreviews(f, previews);
    const store = imageContract.storeImagesAfterLocalDelete(
      aligned.files,
      aligned.previews
    );
    assert.deepEqual(store, []);
    assert.equal(aligned.files.length, 2);
    assert.deepEqual(aligned.previews, ["blob:a", "blob:c"]);
    const payload = imageContract.resolveCreateImagePayload(aligned.files, store);
    assert.equal(payload.mode, "files");
    assert.equal(payload.files.length, 2);
  });

  it("URL-only delete never keeps blob/data in remote store", () => {
    const store = imageContract.storeImagesAfterLocalDelete(
      [],
      ["https://res.cloudinary.com/x/1.jpg", "blob:local"]
    );
    assert.deepEqual(store, ["https://res.cloudinary.com/x/1.jpg"]);
  });
});

describe("carousel index normalize (hero/thumb sync)", () => {
  it("wraps negative and overflow indices", () => {
    assert.equal(carouselIndex.normalizeCarouselIndex(-1, 3), 2);
    assert.equal(carouselIndex.normalizeCarouselIndex(3, 3), 0);
    assert.equal(carouselIndex.normalizeCarouselIndex(1, 3), 1);
  });

  it("safe on empty length / non-finite", () => {
    assert.equal(carouselIndex.normalizeCarouselIndex(2, 0), 0);
    assert.equal(carouselIndex.normalizeCarouselIndex(NaN, 4), 0);
  });
});

describe("create submit semantics (dual toast bug)", () => {
  it("CREATE null → no success, one error, form retained, no nav", () => {
    const o = submitSemantics.outcomeForCreateResult(null);
    assert.equal(o.showSuccess, false);
    assert.equal(o.showError, true);
    assert.equal(o.clearForm, false);
    assert.equal(o.navigate, false);
  });

  it("CREATE success → one success", () => {
    const o = submitSemantics.outcomeForCreateResult({ post_id: 99 });
    assert.equal(o.showSuccess, true);
    assert.equal(o.showError, false);
    assert.equal(o.navigate, true);
  });

  it("CREATE success + refresh failure ≠ create failed", () => {
    const o = submitSemantics.outcomeWhenRefreshFailsAfterCreate();
    assert.equal(o.showSuccess, true);
    assert.equal(o.showError, false);
    assert.equal(o.treatRefreshFailureAsCreateFailure, false);
  });
});

describe("pick-time image validation", () => {
  it("UNSUPPORTED FILE AT PICK → rejected, concrete error", () => {
    const heic = new File([new Uint8Array([0, 1, 2])], "x.heic", { type: "image/heic" });
    const r = imageContract.filterValidImageFilesAtPick([heic], 0);
    assert.equal(r.accepted.length, 0);
    assert.equal(r.rejected.length, 1);
    assert.equal(r.error?.ok, false);
    assert.equal(r.error?.messageKey, "posts.errors.unsupportedImageFormat");
  });

  it("TOO LARGE FILE → concrete 1× error", () => {
    const big = new File([new Uint8Array(11 * 1024 * 1024)], "big.jpg", {
      type: "image/jpeg"
    });
    const r = imageContract.filterValidImageFilesAtPick([big], 0);
    assert.equal(r.accepted.length, 0);
    assert.equal(r.error?.messageKey, "posts.errors.imageTooLarge");
  });

  it("valid jpeg accepted", () => {
    const ok = new File([new Uint8Array([1, 2, 3])], "ok.jpg", { type: "image/jpeg" });
    const r = imageContract.filterValidImageFilesAtPick([ok], 0);
    assert.equal(r.accepted.length, 1);
    assert.equal(r.error, null);
  });
});

describe("422 error mapping (no generic loss for images.1)", () => {
  it("BACKEND 422 images.1 → image-specific message key", () => {
    const safe = errorMapping.mapPostCreateValidationToSafeMessage({
      "images.1": ["The images.1 field must be an image."]
    });
    assert.equal(safe?.messageKey, "posts.errors.unsupportedImageFormat");
  });

  it("BACKEND token validation → tokens error", () => {
    const safe = errorMapping.mapPostCreateValidationToSafeMessage({
      tokens: ["The tokens must be at least 3."]
    });
    assert.equal(safe?.messageKey, "posts.errors.invalidTokens");
  });

  it("UNKNOWN 422 → null → generic fallback via mapAxiosErrorToDhError", () => {
    const safe = errorMapping.mapPostCreateValidationToSafeMessage({
      weird_field: ["Something obscure"]
    });
    assert.equal(safe, null);

    const mapped = httpError.mapAxiosErrorToDhError({
      isAxiosError: true,
      response: {
        status: 422,
        data: { message: "Validation failed.", errors: { weird_field: ["Something obscure"] } }
      },
      message: "Request failed"
    });
    assert.equal(mapped.messageKey, "common.errors.validation");
    assert.equal(mapped.fallbackMessage, "Please check your input and try again.");
  });

  it("mapAxiosError images.1 uses concrete key (not only generic)", () => {
    const mapped = httpError.mapAxiosErrorToDhError({
      isAxiosError: true,
      response: {
        status: 422,
        data: {
          message: "Validation failed.",
          errors: { "images.1": ["The images.1 field must be an image."] }
        }
      },
      message: "Request failed"
    });
    assert.equal(mapped.messageKey, "posts.errors.unsupportedImageFormat");
    assert.match(mapped.fallbackMessage, /JPG|PNG|WebP/i);
  });
});

process.on("exit", () => {
  try { rmSync(outDir, { recursive: true, force: true }); } catch { /* ignore */ }
});
