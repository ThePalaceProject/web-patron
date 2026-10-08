import * as React from "react";
import { createPortal } from "react-dom";
import { VISUALLY_HIDDEN_STYLE } from "constants/a11y";

/**
 * Has screen readers read `message` politely, e.g. after pinning a library or returning a loan.
 * The text is written after ANNOUNCE_DELAY_MS and cleared after
 * ANNOUNCEMENT_TTL_MS.
 */
export type Announce = (message: string) => void;

/**
 * Delay before an announcement is written, in milliseconds, so a closing
 * modal dialog has released the region and a focus move has settled.
 */
export const ANNOUNCE_DELAY_MS = 150;

/** How long an announcement stays in the region, in milliseconds. */
export const ANNOUNCEMENT_TTL_MS = 5000;

const AnnouncerContext = React.createContext<Announce | undefined>(undefined);

/**
 * Owns one polite live region for the whole app, so a message can still be
 * read after the element that triggered it has left the page.
 */
export const AnnouncerProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  // The id gives each message a fresh node, so a repeated message is read
  // again.
  const [announcement, setAnnouncement] = React.useState({ id: 0, text: "" });
  // The announcement region is portaled to the body, which exists only in
  // the browser.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const announceTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const clearTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(
    () => () => {
      clearTimeout(announceTimer.current);
      clearTimeout(clearTimer.current);
    },
    []
  );
  const announce = React.useCallback((text: string) => {
    clearTimeout(announceTimer.current);
    clearTimeout(clearTimer.current);
    announceTimer.current = setTimeout(() => {
      setAnnouncement(prev => ({ id: prev.id + 1, text }));
      // Clearing keeps a stale message out of the page for browse mode.
      clearTimer.current = setTimeout(
        () => setAnnouncement(prev => ({ ...prev, text: "" })),
        ANNOUNCEMENT_TTL_MS
      );
    }, ANNOUNCE_DELAY_MS);
  }, []);

  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      {mounted &&
        createPortal(
          <div role="status" aria-live="polite" style={VISUALLY_HIDDEN_STYLE}>
            <span key={announcement.id}>{announcement.text}</span>
          </div>,
          document.body
        )}
    </AnnouncerContext.Provider>
  );
};

export function useAnnounce(): Announce {
  const context = React.useContext(AnnouncerContext);
  if (typeof context === "undefined") {
    throw new Error("useAnnounce must be used within an AnnouncerProvider");
  }
  return context;
}
