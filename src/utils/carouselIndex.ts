/** Normalize a carousel/thumbnail index into `[0, length)`. */
export function normalizeCarouselIndex(index: number, length: number): number {
  if (!Number.isFinite(index) || !Number.isFinite(length) || length <= 0) {
    return 0;
  }
  const len = Math.trunc(length);
  const i = Math.trunc(index);
  return ((i % len) + len) % len;
}
