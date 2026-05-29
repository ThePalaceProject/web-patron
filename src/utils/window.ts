import { parseUrl } from "utils/parse";

export interface PendingTab {
  navigate(url: string): void;
  close(): void;
}

function assertHttpsUrl(url: string): void {
  if (!parseUrl(url)) {
    throw new Error(`Refusing to open non-https URL: ${url}`);
  }
}

/**
 * Opens a blank tab synchronous so the browser treats it as user-initiated, bypassing popup blockers.
 * Sets opener=null to prevent tabnabbing and injects a no-referrer meta tag.
 * Falls back to same-tab navigation when popups are blocked.
 */
export function openPendingTab(): PendingTab {
  const newTab = window.open("about:blank", "_blank");
  if (newTab) {
    newTab.opener = null; // breaks reference to window from which tab originated

    const meta = newTab.document.createElement("meta");
    meta.name = "referrer";
    meta.content = "no-referrer";
    newTab.document.head.appendChild(meta);

    newTab.document.title = "Loading…";
    const p = newTab.document.createElement("p");
    p.textContent = "Loading…";
    p.style.cssText =
      "font-family:sans-serif;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)";
    newTab.document.body.appendChild(p);
  }

  return {
    navigate(url: string) {
      assertHttpsUrl(url);
      if (newTab) {
        newTab.location.href = url;
      } else {
        window.location.href = url;
      }
    },
    close() {
      newTab?.close();
    }
  };
}
