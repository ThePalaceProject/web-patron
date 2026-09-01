import { IS_SERVER } from "utils/env";

/*
 * Safe wrappers around window.localStorage. On the server they no-op; in the
 * browser storage access can throw (private browsing, blocked site data,
 * QuotaExceededError), so failures are swallowed and reported through the
 * return value.
 */

/** Returns the stored value, or null when absent or storage is unavailable. */
export function getStoredItem(key: string): string | null {
  if (IS_SERVER) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Returns false when storage is unavailable or full. */
export function setStoredItem(key: string, value: string): boolean {
  if (IS_SERVER) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** Returns false when storage is unavailable. */
export function removeStoredItem(key: string): boolean {
  if (IS_SERVER) return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
