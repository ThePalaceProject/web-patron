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
      {
        url: unparsed.libraries,
        refreshMinInterval: 60,
        refreshMaxInterval: 300
      }
    ];
  }

  // Static libraries are resolved at runtime by src/server/staticLibraries.ts.

  // otherwise assume the file is properly structured.
  return {
    instanceName: unparsed.instance_name || "Patron Web Catalog",
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
