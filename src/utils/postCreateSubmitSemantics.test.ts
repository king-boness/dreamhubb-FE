import { describe, it, expect } from "vitest";
import {
  outcomeForCreateResult,
  outcomeWhenRefreshFailsAfterCreate
} from "./postCreateSubmitSemantics";

describe("postCreateSubmitSemantics", () => {
  it("CREATE API FAILURE / null → one error, no success, keep form, no nav", () => {
    for (const result of [null, undefined, {}, { post_id: 0 }]) {
      const o = outcomeForCreateResult(result as { post_id?: number } | null);
      expect(o.showSuccess).toBe(false);
      expect(o.showError).toBe(true);
      expect(o.clearForm).toBe(false);
      expect(o.navigate).toBe(false);
      expect(o.refreshFeeds).toBe(false);
    }
  });

  it("CREATE SUCCESS → one success, clear form, navigate, best-effort refresh", () => {
    const o = outcomeForCreateResult({ post_id: 42 });
    expect(o.kind).toBe("create_success");
    expect(o.showSuccess).toBe(true);
    expect(o.showError).toBe(false);
    expect(o.clearForm).toBe(true);
    expect(o.navigate).toBe(true);
    expect(o.refreshFeeds).toBe("best_effort");
  });

  it("CREATE SUCCESS + feed refresh failure must not claim create failed", () => {
    const o = outcomeWhenRefreshFailsAfterCreate();
    expect(o.showSuccess).toBe(true);
    expect(o.showError).toBe(false);
    expect(o.treatRefreshFailureAsCreateFailure).toBe(false);
  });
});
