/**
 * Regression tests for create/delete semantics (node:test).
 * Mirrors src/utils/postDeleteConfirm.ts, postCreateImageContract.ts, postCreateSubmitSemantics.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSync } from "esbuild";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
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

describe("delete confirmation phrases", () => {
  it("maps button keys by normalized slug", () => {
    assert.equal(deleteConfirm.deleteMyPostI18nKey("dream"), "posts.edit.deleteMyDream");
    assert.equal(deleteConfirm.deleteMyPostI18nKey("problem"), "posts.edit.deleteMyProblem");
    assert.equal(deleteConfirm.deleteMyPostI18nKey("idea"), "posts.edit.deleteMyIdea");
  });

  it("STEP1 wrong phrase → disabled; exact phrase → enabled", () => {
    assert.equal(deleteConfirm.isExactDeletePhrase("wrong", "dream"), false);
    assert.equal(
      deleteConfirm.isExactDeletePhrase("I want to delete this dream", "dream"),
      true
    );
    assert.equal(
      deleteConfirm.isExactDeletePhrase("i want to delete this dream", "dream"),
      false
    );
  });

  it("canonical English phrases are exact contract", () => {
    assert.equal(
      deleteConfirm.getRequiredDeletePhrase("dream"),
      "I want to delete this dream"
    );
    assert.equal(
      deleteConfirm.getRequiredDeletePhrase("problem"),
      "I want to delete this problem"
    );
    assert.equal(
      deleteConfirm.getRequiredDeletePhrase("idea"),
      "I want to delete this idea"
    );
  });
});

describe("create image XOR contract", () => {
  it("dream+traveling+3 photos path uses files without mixing URLs", () => {
    const files = [1, 2, 3].map(
      (i) => new File([`img${i}`], `p${i}.jpg`, { type: "image/jpeg" })
    );
    const payload = imageContract.resolveCreateImagePayload(files, [
      "https://res.cloudinary.com/x/orphan.jpg"
    ]);
    assert.equal(payload.mode, "files");
    assert.equal(payload.files.length, 3);
  });

  it("never sends blob/data as URL payload", () => {
    const payload = imageContract.resolveCreateImagePayload([], [
      "blob:http://localhost/1",
      "data:image/jpeg;base64,xx",
      "https://res.cloudinary.com/x/ok.jpg"
    ]);
    assert.deepEqual(payload, {
      mode: "urls",
      urls: ["https://res.cloudinary.com/x/ok.jpg"]
    });
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
  try {
    rmSync(outDir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
});
