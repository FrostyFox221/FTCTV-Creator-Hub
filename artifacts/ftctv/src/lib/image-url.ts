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
      parsed.hostname.endsWith("api.telegram.org")
    ) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
  } catch {
    // Invalid URL, return as-is
  }
  return url;
}
