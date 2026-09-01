import { PinnedLibrary } from "interfaces";
import type { ClientLibrary } from "pages/api/libraries";
import { getStoredItem, setStoredItem } from "utils/browserStorage";

export const PINNED_LIBRARIES_KEY = "CPW_PINNED_LIBRARIES";

function isPinnedLibrary(value: unknown): value is PinnedLibrary {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.slug === "string" &&
    typeof v.title === "string" &&
    (v.logoUrl === undefined || typeof v.logoUrl === "string") &&
    Number.isFinite(v.pinnedAt)
  );
}

/**
 * Reads the pinned library list from localStorage. Unavailable storage and
 * malformed JSON yield an empty list; entries missing required fields are
 * dropped.
 */
export function readPinnedLibraries(): PinnedLibrary[] {
  const raw = getStoredItem(PINNED_LIBRARIES_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isPinnedLibrary) : [];
  } catch {
    return [];
  }
}

/** Returns false when storage is unavailable or full. */
export function writePinnedLibraries(libraries: PinnedLibrary[]): boolean {
  return setStoredItem(PINNED_LIBRARIES_KEY, JSON.stringify(libraries));
}

/**
 * Returns `libraries` with `library` added. Re-pinning an already-pinned id
 * replaces its fields but keeps the original pinnedAt. Replacement is
 * deliberate: omitting an optional field (such as logoUrl) clears it.
 */
export function withPinned(
  libraries: PinnedLibrary[],
  library: Omit<PinnedLibrary, "pinnedAt">
): PinnedLibrary[] {
  const existing = libraries.find(lib => lib.id === library.id);
  if (existing) {
    return libraries.map(lib =>
      lib.id === library.id ? { ...library, pinnedAt: existing.pinnedAt } : lib
    );
  }
  return [...libraries, { ...library, pinnedAt: Date.now() }];
}

/**
 * Returns `libraries` without the entry whose id matches, or the original
 * array when the id is not pinned.
 */
export function withoutPinned(
  libraries: PinnedLibrary[],
  id: string
): PinnedLibrary[] {
  return libraries.some(lib => lib.id === id)
    ? libraries.filter(lib => lib.id !== id)
    : libraries;
}

/**
 * Returns `pinned` with slug and title refreshed from `available`, matched
 * by id. Entries absent from `available` are kept unchanged. Returns the
 * original array when nothing changed.
 */
export function syncPinned(
  pinned: PinnedLibrary[],
  available: ClientLibrary[]
): PinnedLibrary[] {
  const byId = new Map(available.map(lib => [lib.id, lib]));
  let changed = false;
  const next = pinned.map(entry => {
    const current = byId.get(entry.id);
    if (
      !current ||
      (current.slug === entry.slug && current.title === entry.title)
    ) {
      return entry;
    }
    changed = true;
    return { ...entry, slug: current.slug, title: current.title };
  });
  return changed ? next : pinned;
}
