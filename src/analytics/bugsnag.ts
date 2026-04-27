import * as React from "react";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import {
  BUILD_ID,
  IS_SERVER,
  CONFIG_FILE,
  GIT_BRANCH,
  GIT_COMMIT_SHA,
  NODE_ENV,
  RELEASE_STAGE
} from "utils/env";
import type { AppConfig } from "interfaces";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _bugsnagErrorBoundary: React.ComponentType<any> | undefined;

/**
 * Initializes Bugsnag with the runtime app config. Idempotent — no-op if
 * already started. Called once from _app.tsx before the first render.
 */
export function initBugsnag(config: AppConfig): void {
  if (Bugsnag.isStarted()) return;
  if (!config.bugsnagApiKey) return;

  Bugsnag.start({
    apiKey: config.bugsnagApiKey,
    appVersion: BUILD_ID,
    plugins: [new BugsnagPluginReact()],
    appType: IS_SERVER ? "node" : "browser",
    releaseStage: RELEASE_STAGE,
    metadata: {
      App: {
        "Node Env": NODE_ENV,
        "Git Branch": GIT_BRANCH,
        "Git Commit SHA": GIT_COMMIT_SHA,
        "Instance Name": config.instanceName
      },
      "App Config": {
        "Config File": config,
        "Config File Source": CONFIG_FILE
      }
    }
  });

  _bugsnagErrorBoundary =
    Bugsnag.getPlugin("react")?.createErrorBoundary(React);
}

/** Returns the Bugsnag React error boundary, or undefined if not yet initialized. */
export function getBugsnagErrorBoundary() {
  return _bugsnagErrorBoundary;
}

export default Bugsnag;
