/* eslint-disable no-underscore-dangle */
import getConfig from "next/config";

/**
 * Simply exporting processed env vars
 */
const { publicRuntimeConfig } = getConfig();
console.log("publicRuntimeConfig", publicRuntimeConfig);
console.log("process env test", process.env.TEST_RUNTIME_VAR);
export const NEXT_PUBLIC_COMPANION_APP =
  publicRuntimeConfig.NEXT_PUBLIC_COMPANION_APP === "openebooks"
    ? "openebooks"
    : "simplye";

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
export const SHORTEN_URLS = !(publicRuntimeConfig.SHORTEN_URLS === "false");
export const REGISTRY_BASE = publicRuntimeConfig.REGISTRY_BASE;
export const CIRCULATION_MANAGER_BASE =
  publicRuntimeConfig.SIMPLIFIED_CATALOG_BASE;
export const CONFIG_FILE = publicRuntimeConfig.CONFIG_FILE;
export const REACT_AXE = publicRuntimeConfig.REACT_AXE;
=======
=======
>>>>>>> d7c61b8... I swear if its this
=======
>>>>>>> origin/beta
export const REGISTRY_BASE = process.env.REGISTRY_BASE;
export const CIRCULATION_MANAGER_BASE = process.env.SIMPLIFIED_CATALOG_BASE;
export const CONFIG_FILE = process.env.CONFIG_FILE;
export const REACT_AXE = process.env.REACT_AXE;
<<<<<<< HEAD
>>>>>>> a0d4d36... Remove url shortener (#135)
=======
>>>>>>> d7c61b8... I swear if its this
// if there is not circ manager base, we are using multi library routes
export const IS_MULTI_LIBRARY = !CIRCULATION_MANAGER_BASE;
export const CACHE_EXPIRATION_SECONDS = parseInt(
  process.env.CACHE_EXPIRATION_SECONDS ?? "10",
  10
);
export const NEXT_PUBLIC_AXIS_NOW_DECRYPT =
  publicRuntimeConfig.NEXT_PUBLIC_AXIS_NOW_DECRYPT === "true";
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
export const IS_SERVER = typeof window === "undefined";

// where the redux store is kept on window
export const __NEXT_REDUX_STORE__ = "__NEXT_REDUX_STORE__";
// where we store the library data
export const __LIBRARY_DATA__ = "__LIBRARY_DATA__";

export const BUGSNAG_API_KEY = process.env.NEXT_PUBLIC_BUGSNAG_API_KEY;
export const APP_VERSION = process.env.APP_VERSION;
