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

process.on("exit", () => {
  try { rmSync(outDir, { recursive: true, force: true }); } catch { /* ignore */ }
});
