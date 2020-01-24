import { singleLibraryRoutes, multiLibraryRoutes } from "../routes";
import LibraryDataCache from "./LibraryDataCache";
const fs = require("fs");

async function loadCache() {
  let registryBase = process.env.REGISTRY_BASE;

  const circManagerBase = process.env.SIMPLIFIED_CATALOG_BASE;
  const routes = circManagerBase ? singleLibraryRoutes : multiLibraryRoutes;

  const config = {};
  const configFile = process.env.CONFIG_FILE;

  if (configFile) {
    let configText;
    if (configFile.startsWith("http")) {
      try {
        const configResponse = await fetch(configFile);
        configText = await configResponse.text();
      } catch (configUrlError) {
        throw "Could not read config file at " + configFile;
      }
    } else {
      configText = fs.readFileSync(configFile, "utf8");
    }
    for (const entry of configText.split("\n")) {
      if (entry && entry.charAt(0) !== "#") {
        const [path, circManagerUrl] = entry.split("|");
        config[path] = circManagerUrl;
      }
    }
  }

  if (
    (registryBase && circManagerBase) ||
    (registryBase && configFile) ||
    (circManagerBase && configFile)
  ) {
    console.warn(
      "Only one of REGISTRY_BASE, SIMPLIFIED_CATALOG_BASE, and CONFIG_FILE should be used."
    );
  }

  if (!registryBase && !circManagerBase && !configFile) {
    registryBase = "http://localhost:7000";
  }

  const shortenUrls = !(process.env.SHORTEN_URLS === "false");

  const distDir = process.env.SIMPLIFIED_PATRON_DIST || "dist";
  const cacheExpirationSeconds = process.env.CACHE_EXPIRATION_SECONDS;

  let parsedCacheExpirationSecons: number | undefined = undefined;
  if (typeof cacheExpirationSeconds === "string") {
    parsedCacheExpirationSecons = parseInt(cacheExpirationSeconds, 10);
  }

  const cache = new LibraryDataCache(
    registryBase,
    parsedCacheExpirationSecons,
    config
  );
  console.log(circManagerBase, process.env.CIRCULATION_MANAGER_BASE);
  return {
    shortenUrls,
    distDir,
    cache,
    routes,
    circManagerBase
  };
}

export default loadCache;
