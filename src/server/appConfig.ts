/**
 * @jest-environment node
 *
 * Provides the parsed app configuration from the config file, read once
 * at runtime on first access. The result is cached for the lifetime of the
 * server process.
 *
 * This module is server-only. It reads CONFIG_FILE directly so that
 * configuration is resolved at runtime, not embedded in the build artifact.
 */

import { readFileSync } from "fs";
import path from "path";
import YAML from "yaml";
import { type } from "arktype";
import type {
  AppConfig,
  LibrariesConfig,
  MediaSupportConfig,
  RegistryConfig
} from "interfaces";
import { AppSetupError } from "errors";
import { isHttpUrl } from "utils/parse";
import { DEFAULT_REGISTRY_FETCH_TIMEOUT } from "constants/registry";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const RegistryEntrySchema = type({
  url: "string",
  "refreshMinInterval?": "number",
  "refreshMaxInterval?": "number"
});

const RawConfigSchema = type({
  // Intentionally permissive: any non-string value silently defaults.
  "instance_name?": "unknown",
  "companion_app?": "string",
  "show_medium?": "boolean",
  "bugsnag_api_key?": "string",
  "gtmId?": "string",
  "registries?": RegistryEntrySchema.array(),
  "libraries?": "string | Record<string, unknown>",
  "media_support?": "Record<string, string>",
  // eslint-disable-next-line camelcase
  "openebooks?": { default_library: "string" }
});

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

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

function parseLibrariesConfig(raw: Record<string, unknown>): LibrariesConfig {
  return Object.keys(raw).reduce<LibrariesConfig>((acc, slug) => {
    acc[slug] = parseLibraryEntry(slug, raw[slug]);
    return acc;
  }, {});
}

function parseYaml(input: Record<string, unknown>): AppConfig {
  const result = RawConfigSchema(input);
  if (result instanceof type.errors) {
    throw new AppSetupError(`Invalid config file:\n${result.summary}`);
  }

  const companionApp =
    result.companion_app === "openebooks" ? "openebooks" : "simplye";

  const showMedium = result.show_medium !== false;

  const openebooks = result.openebooks
    ? { defaultLibrary: result.openebooks.default_library }
    : null;

  const DEFAULT_MIN_INTERVAL = 60;
  const DEFAULT_MAX_INTERVAL = 300;

  let registries: RegistryConfig[] = (result.registries ?? []).map(r => ({
    url: r.url,
    refreshMinInterval: r.refreshMinInterval ?? DEFAULT_MIN_INTERVAL,
    refreshMaxInterval: r.refreshMaxInterval ?? DEFAULT_MAX_INTERVAL
  }));

  // Deprecated: string `libraries` treated as a registry URL.
  if (typeof result.libraries === "string") {
    console.warn(
      "WARNING: Using a string for 'libraries' in config is deprecated. " +
        "Please migrate to the 'registries' array format. " +
        "See the 'Libraries and Registries Configuration Settings' section in README.md."
    );
    registries = [
      ...registries,
      {
        url: result.libraries,
        refreshMinInterval: DEFAULT_MIN_INTERVAL,
        refreshMaxInterval: DEFAULT_MAX_INTERVAL
      }
    ];
  }

  // Object-format libraries: static slug → authDocUrl entries baked into the config.
  const staticLibraries =
    result.libraries &&
    typeof result.libraries === "object" &&
    !Array.isArray(result.libraries)
      ? parseLibrariesConfig(result.libraries as Record<string, unknown>)
      : undefined;

  return {
    instanceName:
      typeof result.instance_name === "string"
        ? result.instance_name
        : "Patron Web Catalog",
    registries,
    staticLibraries,
    mediaSupport: (result.media_support as MediaSupportConfig) ?? {},
    bugsnagApiKey: result.bugsnag_api_key ?? null,
    gtmId: result.gtmId ?? null,
    companionApp,
    showMedium,
    openebooks
  };
}

// ---------------------------------------------------------------------------
// Runtime cache and loader
// ---------------------------------------------------------------------------

let cached: AppConfig | null = null;

/**
 * Returns the parsed app configuration. Reads and parses CONFIG_FILE on the
 * first call, then returns the cached result on subsequent calls.
 */
export async function getAppConfig(): Promise<AppConfig> {
  if (cached !== null) return cached;

  const configFile = process.env.CONFIG_FILE;
  if (!configFile) {
    throw new AppSetupError(
      "CONFIG_FILE environment variable is not set. " +
        "Set it to the path or URL of your config YAML file."
    );
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
    } catch (e) {
      throw new AppSetupError(
        `Could not reach config file at: ${configFile}: ${(e as Error).message}`
      );
    } finally {
      clearTimeout(timeoutId);
    }
    if (!res.ok) {
      throw new AppSetupError(
        `Could not fetch config file at: ${configFile} (HTTP ${res.status})`
      );
    }
    text = await res.text();
  } else {
    const resolved = path.isAbsolute(configFile)
      ? configFile
      : path.join(process.cwd(), configFile);
    text = readFileSync(resolved, "utf8");
  }

  const raw = YAML.parse(text) as Record<string, unknown>;
  cached = parseYaml(raw);
  return cached;
}

/** Clears the in-memory cache. Intended for use in tests only. */
export function resetAppConfigCache(): void {
  cached = null;
}
