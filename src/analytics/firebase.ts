/* eslint-disable camelcase */
import {
  APP_VERSION,
  BUILD_ID,
  GIT_BRANCH,
  GIT_COMMIT_SHA,
  IS_SERVER,
  RELEASE_STAGE
} from "utils/env";
import type { Analytics } from "firebase/analytics";
import track from "analytics/track";
import { AnalyticsError } from "errors";
import type { AppConfig, FirebaseConfig, LibraryData } from "interfaces";

type Api = typeof import("firebase/analytics");
type FirebaseAnalytics = { analytics: Analytics; api: Api };

type LibraryParams = {
  library_id: string | null;
  library_slug: string | null;
};

type Stage = "download" | "initialization";

const NO_LIBRARY: LibraryParams = { library_id: null, library_slug: null };
let libraryParams: LibraryParams = NO_LIBRARY;

let firebaseAnalytics: Promise<FirebaseAnalytics | null> | undefined;

/**
 * Reports a failure to download or start the SDK to Bugsnag as a warning.
 * load() runs once per page load, so this reports at most once.
 */
function reportError(stage: Stage, error: unknown): void {
  const cause = error instanceof Error ? error : new Error(String(error));
  track.error(
    new AnalyticsError(`Firebase Analytics failed during ${stage}.`, cause),
    {
      severity: "warning",
      metadata: { "Firebase Analytics": { stage } }
    }
  );
}

/**
 * Downloads Firebase SDKs and starts a session.
 *
 * A failure to either import the SDKs or initialize a session should not
 * block the app from functioning. Errors are reported to Bugsnag.
 */
async function load(
  options: FirebaseConfig,
  instanceName: string
): Promise<FirebaseAnalytics | null> {
  let stage: Stage = "download";
  try {
    const [{ getApp, getApps, initializeApp }, api] = await Promise.all([
      import("firebase/app"),
      import("firebase/analytics")
    ]);
    stage = "initialization";

    /**
     * Checks for certain conditions in the browser environment
     * See {@link https://firebase.google.com/docs/reference/js/analytics#issupported}
     */
    if (!(await api.isSupported())) return null;

    const app = getApps().length ? getApp() : initializeApp(options);
    const analytics = api.initializeAnalytics(app, {
      config: {
        // Adding the library directly onto the config object so that events will send the library directly
        ...libraryParams,
        // Adding the library to user_properties, so certain user-scoped events will carry it too
        user_properties: libraryParams,
        send_page_view: false, // false allows us to customize custom parameters sent on page_view events
        instance_name: instanceName,
        app_version: APP_VERSION,
        build_id: BUILD_ID,
        release_stage: RELEASE_STAGE,
        git_branch: GIT_BRANCH,
        git_commit_sha: GIT_COMMIT_SHA
      }
    });
    return { analytics, api };
  } catch (e) {
    reportError(stage, e);
    return null;
  }
}

function sameLibrary(a: LibraryParams, b: LibraryParams): boolean {
  return a.library_id === b.library_id && a.library_slug === b.library_slug;
}

/**
 * Starts loading Firebase Analytics SDK and adds the current library
 * as a default event parameter on every outgoing event
 *
 * init() kicks off loading and returns without waiting for the SDK to finish,
 * because it is called at the root of the app and might be called again right away,
 * e.g. from a re-render, a second page navigation, etc.
 *
 * The SDK is stored in a module-level variable (`firebaseAnalytics`) as a Promise.
 * This allows callers like `logEvent` and `init` itself to wait until the SDK has been loaded.
 */
function init(
  config: Pick<AppConfig, "firebaseAnalytics" | "instanceName">,
  library: Pick<LibraryData, "id" | "slug"> | null
): void {
  // Update currently tracked library even if Firebase Analytics is disabled at this moment
  const next = library
    ? { library_id: library.id, library_slug: library.slug }
    : NO_LIBRARY;
  const changed = !sameLibrary(next, libraryParams);
  libraryParams = next;

  if (!firebaseAnalytics) {
    if (IS_SERVER || !config.firebaseAnalytics.enable) return;

    firebaseAnalytics = load(
      config.firebaseAnalytics.config,
      config.instanceName
    );

    return;
  }

  if (!changed) return;

  // Update library_id and library_slug parameters when a user switches libraries
  void firebaseAnalytics.then(fa => {
    if (!fa) return;
    fa.api.setUserProperties(fa.analytics, libraryParams);
    fa.api.setDefaultEventParameters(libraryParams);
  });
}

// library_id/library_slug are owned exclusively by init()'s libraryParams,
// so logEvent() callers cannot pass them as event params.
type EventParams = Record<string, unknown> & {
  library_id?: never;
  library_slug?: never;
};

/**
 * Logs events with custom event parameters after
 * Firebase Analytics has successfully initialized
 */
async function logEvent(
  name: string,
  eventParams?: EventParams
): Promise<void> {
  const params = { ...eventParams, ...libraryParams };
  const fa = await firebaseAnalytics;
  if (!fa) return;
  fa.api.logEvent(fa.analytics, name, params);
}

export default { init, logEvent };
