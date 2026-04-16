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

const _validUrlOrNull = (raw: string | undefined): URL | null => {
  try {
    if (!raw) return null;
    const decoded = decodeURIComponent(raw);
    return new URL(decoded);
  } catch {
    return null;
  }
};

export const isHttpUrl = (raw: string): boolean => {
  const url = _validUrlOrNull(raw);
  return !!url && ["https:", "http:"].includes(url.protocol);
};
