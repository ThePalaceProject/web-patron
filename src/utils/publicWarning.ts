import {
  getStoredItem,
  removeStoredItem,
  setStoredItem
} from "utils/browserStorage";

export const HIDE_PUBLIC_WARNING_KEY = "CPW_HIDE_PUBLIC_WARNING";

/** Fired on window when this tab changes the preference. */
const CHANGE_EVENT = "cpw-public-warning-change";

/** Returns true when the user opted out of the public computer warning. */
export function isPublicWarningHidden(): boolean {
  return getStoredItem(HIDE_PUBLIC_WARNING_KEY) === "true";
}

/** Records the user's opt-out of the public computer warning. */
export function hidePublicWarning(): void {
  setStoredItem(HIDE_PUBLIC_WARNING_KEY, "true");
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Clears the opt-out, so the warning shows again on the next pin. */
export function showPublicWarning(): void {
  removeStoredItem(HIDE_PUBLIC_WARNING_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Calls `onChange` when the preference changes in this tab or another one.
 * Returns the unsubscribe function.
 */
export function subscribeToPublicWarning(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === HIDE_PUBLIC_WARNING_KEY || event.key === null) {
      onChange();
    }
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
