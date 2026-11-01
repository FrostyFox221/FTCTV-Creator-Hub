/**
 * Wraps external image URLs (e.g. Telegram) with the server-side proxy
 * to avoid geo-blocking and URL expiration issues.
 * Local URLs (starting with /) are returned as-is.
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  // Local URLs don't need proxying
  if (url.startsWith("/")) return url;
  // External URLs that need proxying
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname.endsWith("telegram.org") ||
      parsed.hostname.endsWith("api.telegram.org") ||
      parsed.hostname.endsWith("cdn-telegram.org") ||
      parsed.hostname.endsWith("telegram-cdn.org") ||
      parsed.hostname.endsWith("t.me")
    ) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
  } catch {
    // Invalid URL, return as-is
  }
  return url;
}

/**
 * Returns an ordered list of image URL candidates from a post's images array.
 * Prefers local /api/storage/ URLs first, then proxied external URLs.
 */
export function getImageCandidates(images: string[] | null | undefined): string[] {
  if (!images || images.length === 0) return [];
  const local: string[] = [];
  const external: string[] = [];
  for (const url of images) {
    if (!url) continue;
    if (url.startsWith("/")) {
      local.push(url);
    } else {
      external.push(getImageUrl(url));
    }
  }
  return [...local, ...external];
}
