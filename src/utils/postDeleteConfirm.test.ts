import { describe, it, expect } from "vitest";
import {
  DELETE_CONFIRM_PHRASES,
  deleteMyPostI18nKey,
  getRequiredDeletePhrase,
  isExactDeletePhrase,
  normalizeDeleteCategorySlug
} from "./postDeleteConfirm";

describe("postDeleteConfirm", () => {
  it("normalizes category slugs", () => {
    expect(normalizeDeleteCategorySlug("dream")).toBe("dream");
    expect(normalizeDeleteCategorySlug("PROBLEM")).toBe("problem");
    expect(normalizeDeleteCategorySlug("Idea")).toBe("idea");
    expect(normalizeDeleteCategorySlug("unknown")).toBe("dream");
    expect(normalizeDeleteCategorySlug(null)).toBe("dream");
  });

  it("uses exact English confirmation phrases", () => {
    expect(getRequiredDeletePhrase("dream")).toBe("I want to delete this dream");
    expect(getRequiredDeletePhrase("problem")).toBe("I want to delete this problem");
    expect(getRequiredDeletePhrase("idea")).toBe("I want to delete this idea");
    expect(DELETE_CONFIRM_PHRASES.dream).toBe("I want to delete this dream");
  });

  it("enables only on exact case-sensitive match (trim allowed)", () => {
    expect(isExactDeletePhrase("I want to delete this dream", "dream")).toBe(true);
    expect(isExactDeletePhrase("  I want to delete this dream  ", "dream")).toBe(true);
    expect(isExactDeletePhrase("i want to delete this dream", "dream")).toBe(false);
    expect(isExactDeletePhrase("I want to delete this Dream", "dream")).toBe(false);
    expect(isExactDeletePhrase("I want to delete this problem", "dream")).toBe(false);
    expect(isExactDeletePhrase("", "dream")).toBe(false);
  });

  it("maps delete button i18n keys by slug", () => {
    expect(deleteMyPostI18nKey("dream")).toBe("posts.edit.deleteMyDream");
    expect(deleteMyPostI18nKey("problem")).toBe("posts.edit.deleteMyProblem");
    expect(deleteMyPostI18nKey("idea")).toBe("posts.edit.deleteMyIdea");
  });
});
