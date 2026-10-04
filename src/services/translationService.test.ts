import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("boot/axios", () => ({
  api: {
    post: vi.fn()
  }
}));

import { api } from "boot/axios";
import {
  clearTranslationSessionCache,
  translateEntity
} from "./translationService";

describe("translationService", () => {
  beforeEach(() => {
    clearTranslationSessionCache();
    vi.mocked(api.post).mockReset();
  });

  it("returns translation on success and caches session response", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        status: "success",
        data: {
          source_language: "sk",
          target_language: "en",
          same_language: false,
          cached: false,
          fields: { title: "Hello", description: "World" }
        }
      }
    });

    const first = await translateEntity({
      entityType: "post",
      entityId: 1,
      targetLanguage: "en",
      contentFingerprint: "a|b"
    });

    expect(first.fields.title).toBe("Hello");
    expect(api.post).toHaveBeenCalledTimes(1);

    const second = await translateEntity({
      entityType: "post",
      entityId: 1,
      targetLanguage: "en",
      contentFingerprint: "a|b"
    });

    expect(second.fields.title).toBe("Hello");
    expect(api.post).toHaveBeenCalledTimes(1);
  });

  it("propagates same_language without treating it as translated content", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        status: "success",
        data: {
          source_language: "en",
          target_language: "en",
          same_language: true,
          cached: false,
          fields: { title: "Same", description: "Text" }
        }
      }
    });

    const result = await translateEntity({
      entityType: "post",
      entityId: 9,
      targetLanguage: "en",
      contentFingerprint: "same"
    });

    expect(result.same_language).toBe(true);
    expect(result.fields.title).toBe("Same");
  });

  it("throws on failed translation response", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { status: "error", message: "Translation unavailable." }
    });

    await expect(
      translateEntity({
        entityType: "post",
        entityId: 2,
        targetLanguage: "en",
        contentFingerprint: "x"
      })
    ).rejects.toThrow("Translation failed");
  });

  it("uses distinct session keys per content fingerprint", async () => {
    vi.mocked(api.post)
      .mockResolvedValueOnce({
        data: {
          status: "success",
          data: {
            source_language: "sk",
            target_language: "en",
            same_language: false,
            cached: false,
            fields: { title: "One", description: "A" }
          }
        }
      })
      .mockResolvedValueOnce({
        data: {
          status: "success",
          data: {
            source_language: "sk",
            target_language: "en",
            same_language: false,
            cached: false,
            fields: { title: "Two", description: "B" }
          }
        }
      });

    const a = await translateEntity({
      entityType: "post",
      entityId: 1,
      targetLanguage: "en",
      contentFingerprint: "v1"
    });
    const b = await translateEntity({
      entityType: "post",
      entityId: 1,
      targetLanguage: "en",
      contentFingerprint: "v2"
    });

    expect(a.fields.title).toBe("One");
    expect(b.fields.title).toBe("Two");
    expect(api.post).toHaveBeenCalledTimes(2);
  });
});
