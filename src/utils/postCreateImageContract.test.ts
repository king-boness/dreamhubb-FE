import { describe, it, expect } from "vitest";
import {
  alignImageFilesAndPreviews,
  isRemoteImageUrl,
  resolveCreateImagePayload,
  storeImagesAfterLocalDelete
} from "./postCreateImageContract";

describe("postCreateImageContract", () => {
  it("detects remote URLs only", () => {
    expect(isRemoteImageUrl("https://res.cloudinary.com/x/image.jpg")).toBe(true);
    expect(isRemoteImageUrl("http://example.com/a.png")).toBe(true);
    expect(isRemoteImageUrl("blob:http://localhost/1")).toBe(false);
    expect(isRemoteImageUrl("data:image/jpeg;base64,abc")).toBe(false);
  });

  it("prefers File[] and never mixes with store URLs", () => {
    const files = [new File(["a"], "a.jpg", { type: "image/jpeg" })];
    const payload = resolveCreateImagePayload(files, [
      "https://res.cloudinary.com/x/1.jpg",
      "blob:http://localhost/2"
    ]);
    expect(payload.mode).toBe("files");
    if (payload.mode === "files") {
      expect(payload.files).toHaveLength(1);
    }
  });

  it("sends only https URLs when no files", () => {
    const payload = resolveCreateImagePayload([], [
      "https://res.cloudinary.com/x/1.jpg",
      "blob:http://localhost/2",
      "data:image/jpeg;base64,abc",
      "https://res.cloudinary.com/x/3.jpg"
    ]);
    expect(payload).toEqual({
      mode: "urls",
      urls: [
        "https://res.cloudinary.com/x/1.jpg",
        "https://res.cloudinary.com/x/3.jpg"
      ]
    });
  });

  it("returns none when empty", () => {
    expect(resolveCreateImagePayload([], [])).toEqual({ mode: "none" });
    expect(resolveCreateImagePayload(undefined, undefined)).toEqual({ mode: "none" });
  });

  it("aligns file/preview indexes", () => {
    const f1 = new File(["1"], "1.jpg", { type: "image/jpeg" });
    const f2 = new File(["2"], "2.jpg", { type: "image/jpeg" });
    expect(alignImageFilesAndPreviews([f1, f2], ["a", "b", "c"])).toEqual({
      files: [f1, f2],
      previews: ["a", "b"]
    });
  });

  it("after middle delete in File[] mode, remote store stays empty", () => {
    const f1 = new File(["1"], "1.jpg", { type: "image/jpeg" });
    const f2 = new File(["2"], "2.jpg", { type: "image/jpeg" });
    expect(storeImagesAfterLocalDelete([f1, f2], ["blob:a", "blob:c"])).toEqual([]);
  });
});
