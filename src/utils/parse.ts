export const parseUrl = (raw: string | undefined): URL | null => {
  try {
    if (!raw) return null;
    const decoded = decodeURIComponent(raw);
    const url = new URL(decoded);
    if (url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
};
