/**
 * @jest-environment node
 *
 * Provides the static library list from the app's config file, read once
 * at runtime on first access. The result is cached for the lifetime of the
 * server process; the static libraries do not change after startup.
 *
 * This module is server-only. It reads CONFIG_FILE directly rather than using
 * the baked APP_CONFIG so that the library entries (auth doc URLs, titles) are
 * resolved at runtime, not embedded in the build artifact.
 */

import { readFileSync } from "fs";
import YAML from "yaml";
import type { LibrariesConfig } from "interfaces";
import { AppSetupError } from "errors";
import { isHttpUrl } from "utils/parse";
import { DEFAULT_REGISTRY_FETCH_TIMEOUT } from "constants/registry";

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Normalizes and validates a single static library entry.
 * Accepts either a string (auth doc URL, slug used as title) or an object
 * with `authDocUrl` and optional `title`.
 */
function parseLibraryEntry(
  slug: string,
  value: unknown
): { title: string; authDocUrl: string } {
  if (value == null) {
    throw new AppSetupError(
      `CONFIG_FILE.libraries['${slug}'] cannot be null or undefined`
    );
  }

  if (typeof value === "string") {
    if (value.trim() === "") {
      throw new AppSetupError(
        `CONFIG_FILE.libraries['${slug}'] cannot be an empty string`
      );
    }
    return { title: slug, authDocUrl: value };
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    const entry = value as Record<string, unknown>;

    if (!("authDocUrl" in entry) || typeof entry.authDocUrl !== "string") {
      throw new AppSetupError(
        `CONFIG_FILE.libraries['${slug}'] must have an 'authDocUrl' property with a valid URL string`
      );
    }
    if (entry.authDocUrl.trim() === "") {
      throw new AppSetupError(
        `CONFIG_FILE.libraries['${slug}'].authDocUrl cannot be an empty string`
      );
    }

    let title = slug;
    if ("title" in entry) {
      if (typeof entry.title !== "string") {
        throw new AppSetupError(
          `CONFIG_FILE.libraries['${slug}'].title must be a string`
        );
      }
      if (entry.title.trim() === "") {
        throw new AppSetupError(
          `CONFIG_FILE.libraries['${slug}'].title cannot be an empty string`
        );
      }
      title = entry.title;
    }

    return { title, authDocUrl: entry.authDocUrl };
  }

  throw new AppSetupError(
    `CONFIG_FILE.libraries['${slug}'] must be either a string (auth doc URL) or an object with 'authDocUrl' property`
  );
}

/**
 * Validates and normalizes the raw `libraries` object from the config YAML.
 */
function parseStaticLibraries(raw: Record<string, unknown>): LibrariesConfig {
  return Object.keys(raw).reduce<LibrariesConfig>((acc, slug) => {
    acc[slug] = parseLibraryEntry(slug, raw[slug]);
    return acc;
  }, {});
}

// ---------------------------------------------------------------------------
// Runtime cache and loader
// ---------------------------------------------------------------------------

let cached: LibrariesConfig | null = null;

/**
 * Returns the static libraries defined in the config file. Reads and parses
 * CONFIG_FILE on the first call, then returns the cached result on subsequent
 * calls. Returns an empty object when CONFIG_FILE is not set or contains no
 * static `libraries` section.
 */
export async function getStaticLibraries(): Promise<LibrariesConfig> {
  if (cached !== null) return cached;

  const configFile = process.env.CONFIG_FILE;
  if (!configFile) {
    cached = {};
    return cached;
  }

  let text: string;
  if (isHttpUrl(configFile)) {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      DEFAULT_REGISTRY_FETCH_TIMEOUT * 1000
    );
    let res: Response;
    try {
      res = await fetch(configFile, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
    if (!res.ok) {
      throw new Error(`Could not fetch config file at: ${configFile}`);
    }
    text = await res.text();
  } else {
    text = readFileSync(configFile, "utf8");
  }

  const raw = YAML.parse(text) as Record<string, unknown>;

  /*
   * Only the object format defines static libraries. A string value is the
   * deprecated registry URL format (handled as a runtime registry entry
   * elsewhere), and a missing or falsy value means no static libraries.
   */
  if (
    !raw?.libraries ||
    typeof raw.libraries !== "object" ||
    Array.isArray(raw.libraries)
  ) {
    cached = {};
    return cached;
  }

  cached = parseStaticLibraries(raw.libraries as Record<string, unknown>);
  return cached;
}

/** Clears the in-memory cache. Intended for use in tests only. */
export function resetStaticLibrariesCache(): void {
  cached = null;
}
