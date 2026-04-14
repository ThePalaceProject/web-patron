const path = require("path");
const fs = require("fs");
const YAML = require("yaml");
const fetch = require("node-fetch");

/**
 * This file will print the config file to stdout and then exit, so
 * it can be synchronously executed in next.config.js when starting the
 * application.
 */

/**
 * Simple error class for configuration errors
 * This is defined here since fetch-config.js runs at build time
 * and cannot import from TypeScript files
 */
class AppSetupError extends Error {
  constructor(message) {
    super(message);
    this.name = "AppSetupError";
  }
}

/**
 * Reads a config file either from local path or
 * http request, parses it, and returns it as an object
 */
async function getAppConfig(configFileSetting) {
  if (configFileSetting.startsWith("http")) {
    return await fetchConfigFile(configFileSetting);
  }
  // Handle absolute paths correctly
  const configFilePath = path.isAbsolute(configFileSetting)
    ? configFileSetting
    : path.join(process.cwd(), configFileSetting);
  if (!fs.existsSync(configFilePath)) {
    throw new Error("Config file not found at: " + configFilePath);
  }
  const text = fs.readFileSync(configFilePath, "utf8");
  return await parseConfig(text);
}

/**
 * Fetches a config file from the network, parses it into
 * an object and returns it
 */
async function fetchConfigFile(configFileUrl) {
  try {
    const response = await fetch(configFileUrl);
    const text = await response.text();
    return await parseConfig(text);
  } catch (e) {
    console.error(e);
    throw new Error("Could not fetch config file at: " + configFileUrl);
  }
}


/**
 * Creates a LibrariesConfig from the object in the config file.
 * Supports two formats:
 * 1. String format: slug maps to auth doc URL (slug becomes title)
 * 2. Object format: slug maps to { authDocUrl, title? }
 */
function makeLibrariesConfig(libraries) {
  return Object.keys(libraries).reduce((record, slug) => {
    const value = libraries[slug];

    // Validate value is not null/undefined
    if (value == null) {
      throw new AppSetupError(
        `CONFIG_FILE.libraries['${slug}'] cannot be null or undefined`
      );
    }

    // Handle string format (backward compatible)
    if (typeof value === "string") {
      if (value.trim() === "") {
        throw new AppSetupError(
          `CONFIG_FILE.libraries['${slug}'] cannot be an empty string`
        );
      }
      return { ...record, [slug]: { title: slug, authDocUrl: value } };
    }

    // Handle object format
    if (typeof value === "object") {
      // Validate authDocUrl exists and is a string
      if (!("authDocUrl" in value) || typeof value.authDocUrl !== "string") {
        throw new AppSetupError(
          `CONFIG_FILE.libraries['${slug}'] must have an 'authDocUrl' property with a valid URL string`
        );
      }
      // Validate authDocUrl is not empty
      if (value.authDocUrl.trim() === "") {
        throw new AppSetupError(
          `CONFIG_FILE.libraries['${slug}'].authDocUrl cannot be an empty string`
        );
      }

      // Validate title if present
      let title = slug; // default to slug
      if ("title" in value) {
        if (typeof value.title !== "string") {
          throw new AppSetupError(
            `CONFIG_FILE.libraries['${slug}'].title must be a string`
          );
        }
        if (value.title.trim() === "") {
          throw new AppSetupError(
            `CONFIG_FILE.libraries['${slug}'].title cannot be an empty string`
          );
        }
        title = value.title;
      }

      return {
        ...record,
        [slug]: { title, authDocUrl: value.authDocUrl }
      };
    }

    // Invalid type
    throw new AppSetupError(
      `CONFIG_FILE.libraries['${slug}'] must be either a string (auth doc URL) or an object with 'authDocUrl' property`
    );
  }, {});
}

/**
 * Validates and parses the registries array from the config file
 * Returns an array of registry configurations with defaults applied
 */
function parseRegistriesConfig(registries) {
  if (!Array.isArray(registries)) {
    throw new AppSetupError(
      "CONFIG_FILE.registries must be an array of registry configurations"
    );
  }

  return registries.map((registry, index) => {
    if (!registry || typeof registry !== "object") {
      throw new AppSetupError(
        `CONFIG_FILE.registries[${index}] must be an object with a url property`
      );
    }

    if (!registry.url || typeof registry.url !== "string") {
      throw new AppSetupError(
        `CONFIG_FILE.registries[${index}] must have a valid url string`
      );
    }

    // Default values for refresh intervals (in seconds)
    const DEFAULT_MIN_INTERVAL = 60; // 1 minute
    const DEFAULT_MAX_INTERVAL = 300; // 5 minutes

    return {
      url: registry.url,
      refreshMinInterval: registry.refreshMinInterval || DEFAULT_MIN_INTERVAL,
      refreshMaxInterval: registry.refreshMaxInterval || DEFAULT_MAX_INTERVAL
    };
  });
}

/**
 * Parses a YAML string into JSON and then into the format expected by
 * the app.
 */
async function parseConfig(raw) {
  const unparsed = YAML.parse(raw);
  // specifically set defaults for a couple values.
  const companionApp =
    unparsed.companion_app === "openebooks" ? "openebooks" : "simplye";

  const showMedium = unparsed.show_medium !== false;

  // openebooks settings
  const openebooks = unparsed.openebooks;
  const defaultLibrary = openebooks ? openebooks.default_library : undefined;

  // Parse registries array configuration.
  let registries = unparsed.registries
    ? parseRegistriesConfig(unparsed.registries)
    : [];

  // Handle deprecated string format: treat the URL as a runtime registry entry.
  // Libraries are no longer fetched at build time; they are fetched at runtime
  // via the same path as the registries array.
  if (typeof unparsed.libraries === "string") {
    console.warn(
      "WARNING: Using a string for 'libraries' in config is deprecated. " +
        "Please migrate to the 'registries' array format. " +
        "See community-config.yml for migration instructions. " +
        "The URL is treated as a runtime registry; libraries are fetched at runtime, not build time."
    );
    registries = [
      ...registries,
      { url: unparsed.libraries, refreshMinInterval: 60, refreshMaxInterval: 300 }
    ];
  }

  // Apply static libraries (these take precedence over registry libraries at runtime).
  let libraries = {};
  if (unparsed.libraries && typeof unparsed.libraries === "object") {
    libraries = makeLibrariesConfig(unparsed.libraries);
  }

  // otherwise assume the file is properly structured.
  return {
    instanceName: unparsed.instance_name || "Patron Web Catalog",
    libraries,
    registries,
    mediaSupport: unparsed.media_support || {},
    bugsnagApiKey: unparsed.bugsnag_api_key || null,
    gtmId: unparsed.gtmId || null,
    companionApp,
    showMedium,
    openebooks: openebooks ? { defaultLibrary } : null
  };
}

// Only execute if not being required for testing
if (require.main === module) {
  const configFileSetting = process.env.CONFIG_FILE;
  if (typeof configFileSetting !== "string")
    throw new AppSetupError("process.env.CONFIG_FILE must be set.");

  // get the config and print it to stdout so next.config.js can use it
  getAppConfig(configFileSetting).then(val => {
    console.log(JSON.stringify(val));
  });
}

module.exports = getAppConfig;

// Export parseConfig for testing purposes
module.exports.__parseConfigForTest = parseConfig;
