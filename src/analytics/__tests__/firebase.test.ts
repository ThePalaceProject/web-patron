/* eslint-disable camelcase */
import type { AppConfig } from "interfaces";
import { config, firebaseConfig } from "test-utils/fixtures/config";

// firebase/app
const mockGetApp = jest.fn();
const mockGetApps = jest.fn();
const mockInitializeApp = jest.fn();

// firebase/analytics
const mockInitializeAnalytics = jest.fn();
const mockIsSupported = jest.fn();
const mockSetUserProperties = jest.fn();
const mockSetDefaultEventParameters = jest.fn();
const mockLogEvent = jest.fn();

// analytics/track
const mockTrackError = jest.fn();

// Makes the import of firebase/analytics fail
// Read when init() runs, so we can test load() reporting errors
let mockAnalyticsImportError: Error | null = null;
let mockIsServer = false;
const mockBuild = {
  APP_VERSION: "1.2.3",
  BUILD_ID: "build-42",
  RELEASE_STAGE: "qa",
  GIT_BRANCH: "main",
  GIT_COMMIT_SHA: "abc123"
};

jest.mock("firebase/app", () => ({
  __esModule: true,
  initializeApp: mockInitializeApp,
  getApp: mockGetApp,
  getApps: mockGetApps
}));

jest.mock("firebase/analytics", () => {
  if (mockAnalyticsImportError) throw mockAnalyticsImportError;
  return {
    __esModule: true,
    initializeAnalytics: mockInitializeAnalytics,
    isSupported: mockIsSupported,
    setUserProperties: mockSetUserProperties,
    setDefaultEventParameters: mockSetDefaultEventParameters,
    logEvent: mockLogEvent
  };
});

jest.mock("analytics/track", () => ({
  __esModule: true,
  default: { error: mockTrackError }
}));

jest.mock("utils/env", () => ({
  __esModule: true,
  ...jest.requireActual("utils/env"),
  ...mockBuild,
  // A getter so firebase.ts reads the value when init() runs
  // rather than when the module loads.
  get IS_SERVER() {
    return mockIsServer;
  }
}));

// How the Firebase Analytics SDK names its apps
const FIREBASE_APP = { name: "[DEFAULT]" };
const ANALYTICS = { app: "analytics-instance" };

const ENABLED: AppConfig = {
  ...config,
  instanceName: "Test Instance",
  firebaseAnalytics: { enable: true, config: firebaseConfig }
};
const DISABLED: AppConfig = {
  ...config,
  firebaseAnalytics: { enable: false, config: null }
};

const LIBRARY = { id: "urn:uuid:abc-123", slug: "testlib" };
const OTHER_LIBRARY = { id: "urn:uuid:def-456", slug: "otherlib" };

// The parameters firebase.ts sends for each library above
const LIBRARY_PARAMS = { library_id: LIBRARY.id, library_slug: LIBRARY.slug };
const OTHER_LIBRARY_PARAMS = {
  library_id: OTHER_LIBRARY.id,
  library_slug: OTHER_LIBRARY.slug
};
const NO_LIBRARY_PARAMS = { library_id: null, library_slug: null };

/**
 * init() starts loading the SDK but returns nothing to await.
 * This lets us resolve promises so the test can check what init() did.
 *
 * Jest >= v27 mocks setImmediate globally, so this uses Node's
 * real setImmediate, which runs when all pending promises are done.
 * See {@link https://github.com/jestjs/jest/issues/2157} or
 * {@link https://gist.github.com/apieceofbart/e6dea8d884d29cf88cdb54ef14ddbcc4}
 */
function flushPromises() {
  return new Promise(resolve =>
    jest.requireActual("timers").setImmediate(resolve)
  );
}

function expectReported(stage: string, cause: Error) {
  expect(mockTrackError).toHaveBeenCalledTimes(1);
  expect(mockTrackError).toHaveBeenCalledWith(
    expect.objectContaining({ name: "Analytics Error", cause }),
    { severity: "warning", metadata: { "Firebase Analytics": { stage } } }
  );
}

let analytics: typeof import("analytics/firebase").default;

beforeEach(async () => {
  // reset these before each test, so they don't carry over
  mockAnalyticsImportError = null;
  mockIsServer = false;
  mockGetApps.mockReturnValue([]);
  mockGetApp.mockReturnValue(FIREBASE_APP);
  mockInitializeApp.mockReturnValue(FIREBASE_APP);
  mockIsSupported.mockResolvedValue(true);
  mockInitializeAnalytics.mockReturnValue(ANALYTICS);

  // jest caches modules by default.
  // firebase.ts keeps its state at module scope,
  // and that state would bleed over to other tests if we didn't
  // reset and re-import the module before each test
  jest.resetModules();
  analytics = (await import("analytics/firebase")).default;
});

describe("initialization", () => {
  it("passes the Firebase credentials from app config", async () => {
    analytics.init(ENABLED, null);
    await flushPromises();

    expect(mockInitializeApp).toHaveBeenCalledWith(firebaseConfig);
  });

  it("carries the library as both event params and a user property", async () => {
    analytics.init(ENABLED, LIBRARY);
    await flushPromises();

    expect(mockInitializeAnalytics).toHaveBeenCalledWith(FIREBASE_APP, {
      config: expect.objectContaining({
        ...LIBRARY_PARAMS,
        user_properties: LIBRARY_PARAMS
      })
    });
  });

  it("suppress the SDK's own page view", async () => {
    analytics.init(ENABLED, LIBRARY);
    await flushPromises();

    expect(mockInitializeAnalytics).toHaveBeenCalledWith(FIREBASE_APP, {
      config: expect.objectContaining({ send_page_view: false })
    });
  });

  it("sends the instance name and build details with the library", async () => {
    analytics.init(ENABLED, LIBRARY);
    await flushPromises();

    expect(mockInitializeAnalytics).toHaveBeenCalledWith(FIREBASE_APP, {
      config: {
        ...LIBRARY_PARAMS,
        user_properties: LIBRARY_PARAMS,
        send_page_view: false,
        instance_name: "Test Instance",
        app_version: mockBuild.APP_VERSION,
        build_id: mockBuild.BUILD_ID,
        release_stage: mockBuild.RELEASE_STAGE,
        git_branch: mockBuild.GIT_BRANCH,
        git_commit_sha: mockBuild.GIT_COMMIT_SHA
      }
    });
  });

  it("does not start loading on the server", async () => {
    mockIsServer = true;

    analytics.init(ENABLED, LIBRARY);
    await flushPromises();

    // Loading never started, so Firebase SDK didn't asked if it can run
    expect(mockIsSupported).not.toHaveBeenCalled();
    expect(mockInitializeAnalytics).not.toHaveBeenCalled();

    await analytics.logEvent("page_view");
    expect(mockLogEvent).not.toHaveBeenCalled();
  });

  it("does nothing when firebaseAnalytics.enable is false", async () => {
    analytics.init(DISABLED, null);
    await flushPromises();

    expect(mockInitializeApp).not.toHaveBeenCalled();
    expect(mockInitializeAnalytics).not.toHaveBeenCalled();

    await analytics.logEvent("page_view");
    expect(mockLogEvent).not.toHaveBeenCalled();
    expect(mockTrackError).not.toHaveBeenCalled();
  });

  it("does nothing when the browser is unsupported", async () => {
    mockIsSupported.mockResolvedValue(false);

    analytics.init(ENABLED, null);
    await flushPromises();

    expect(mockInitializeAnalytics).not.toHaveBeenCalled();

    await analytics.logEvent("page_view");
    expect(mockLogEvent).not.toHaveBeenCalled();
    // No errors thrown because firebase analytics doesn't share exactly
    // why the browser isn't supported
    expect(mockTrackError).not.toHaveBeenCalled();
  });

  it("initializes once across repeated calls", async () => {
    // `firebaseAnalytics` is assigned synchronously inside init()
    // so that any successive calls don't kick off other loads while
    // the first has not resolved.
    analytics.init(ENABLED, null);
    analytics.init(ENABLED, null);
    await flushPromises();
    analytics.init(ENABLED, null);
    await flushPromises();

    expect(mockInitializeAnalytics).toHaveBeenCalledTimes(1);
  });

  it("reuses an existing Firebase app rather than initializing a second one", async () => {
    const existingApp = { name: "existing-app" };
    mockGetApps.mockReturnValue([existingApp]);
    mockGetApp.mockReturnValue(existingApp);

    analytics.init(ENABLED, null);
    await flushPromises();

    expect(mockInitializeApp).not.toHaveBeenCalled();
    expect(mockInitializeAnalytics).toHaveBeenCalledTimes(1);
    expect(mockInitializeAnalytics).toHaveBeenCalledWith(
      existingApp,
      expect.anything()
    );
  });
});

describe("error reporting", () => {
  it("reports a failure to download the SDK as a warning and stays silent afterwards", async () => {
    const failure = new Error("Loading chunk 42 failed.");
    failure.name = "ChunkLoadError";
    mockAnalyticsImportError = failure;

    analytics.init(ENABLED, null);
    await flushPromises();

    expectReported("download", failure);
    await expect(analytics.logEvent("page_view")).resolves.toBeUndefined();
    expect(mockLogEvent).not.toHaveBeenCalled();
  });

  it("reports a failure to start the SDK as a warning and stays silent afterwards", async () => {
    // load() shouldn't reject anything
    // we want to report the error and keep the app running
    const failure = new Error("blocked by client");
    mockIsSupported.mockRejectedValue(failure);

    analytics.init(ENABLED, null);
    await flushPromises();

    expectReported("initialization", failure);
    await expect(analytics.logEvent("page_view")).resolves.toBeUndefined();
    expect(mockLogEvent).not.toHaveBeenCalled();
  });

  it("wraps a failure that is not an Error", async () => {
    mockIsSupported.mockRejectedValue("blocked by client");

    analytics.init(ENABLED, null);
    await flushPromises();

    expectReported("initialization", new Error("blocked by client"));
  });
});

describe("library parameters", () => {
  it("picks up a library supplied on a later init call", async () => {
    // Representative of a user beginning on the MultiLibraryHome screen
    // and then selecting a library
    // on first call, `firebaseAnalytics` is undefined so parameters are set by
    // config passed to Firebase Analytics SDK
    analytics.init(ENABLED, null);
    await flushPromises();
    expect(mockInitializeAnalytics).toHaveBeenCalledWith(FIREBASE_APP, {
      config: {
        ...NO_LIBRARY_PARAMS,
        user_properties: NO_LIBRARY_PARAMS,
        send_page_view: false,
        instance_name: "Test Instance",
        app_version: mockBuild.APP_VERSION,
        build_id: mockBuild.BUILD_ID,
        release_stage: mockBuild.RELEASE_STAGE,
        git_branch: mockBuild.GIT_BRANCH,
        git_commit_sha: mockBuild.GIT_COMMIT_SHA
      }
    });

    analytics.init(ENABLED, LIBRARY);
    await flushPromises();

    // On a second call, `firebaseAnalytics` has loaded.
    // load() compares the new library with the previous stored
    // and calls setUserProperties and setDefaultEventParameters with the new library
    expect(mockSetUserProperties).toHaveBeenCalledWith(
      ANALYTICS,
      LIBRARY_PARAMS
    );
    expect(mockSetDefaultEventParameters).toHaveBeenCalledWith(LIBRARY_PARAMS);
  });

  it("updates the parameters when the patron switches libraries", async () => {
    analytics.init(ENABLED, LIBRARY);
    await flushPromises();
    mockSetUserProperties.mockClear();
    mockSetDefaultEventParameters.mockClear();

    analytics.init(ENABLED, OTHER_LIBRARY);
    await flushPromises();

    expect(mockSetUserProperties).toHaveBeenCalledWith(
      ANALYTICS,
      OTHER_LIBRARY_PARAMS
    );
    expect(mockSetDefaultEventParameters).toHaveBeenCalledWith(
      OTHER_LIBRARY_PARAMS
    );
  });

  it("clears the parameters where there is no library", async () => {
    analytics.init(ENABLED, LIBRARY);
    await flushPromises();
    mockSetUserProperties.mockClear();
    mockSetDefaultEventParameters.mockClear();

    analytics.init(ENABLED, null);
    await flushPromises();

    expect(mockSetUserProperties).toHaveBeenCalledWith(
      ANALYTICS,
      NO_LIBRARY_PARAMS
    );
    expect(mockSetDefaultEventParameters).toHaveBeenCalledWith(
      NO_LIBRARY_PARAMS
    );
  });

  it("does not re-send an unchanged library", async () => {
    analytics.init(ENABLED, LIBRARY);
    await flushPromises();
    mockSetUserProperties.mockClear();
    mockSetDefaultEventParameters.mockClear();

    // Let's say a re-render provides a copy of the previous library
    // If library.id and library.slug are the same, then we consider that the same library
    analytics.init(ENABLED, { ...LIBRARY });
    await flushPromises();

    expect(mockSetUserProperties).not.toHaveBeenCalled();
    expect(mockSetDefaultEventParameters).not.toHaveBeenCalled();
  });

  it("sends no library update when the browser is unsupported", async () => {
    mockIsSupported.mockResolvedValue(false);

    analytics.init(ENABLED, null);
    await flushPromises();
    analytics.init(ENABLED, LIBRARY);
    await flushPromises();

    expect(mockSetUserProperties).not.toHaveBeenCalled();
    expect(mockSetDefaultEventParameters).not.toHaveBeenCalled();
  });

  it("starts the session with the latest library when it changes during loading", async () => {
    // User switches libraries before the SDK has finished loading
    analytics.init(ENABLED, LIBRARY);
    analytics.init(ENABLED, OTHER_LIBRARY);
    await flushPromises();

    expect(mockInitializeAnalytics).toHaveBeenCalledWith(FIREBASE_APP, {
      config: expect.objectContaining({
        ...OTHER_LIBRARY_PARAMS,
        user_properties: OTHER_LIBRARY_PARAMS
      })
    });
  });

  it("records the library even while disabled, so it is correct if analytics is enabled later", async () => {
    analytics.init(DISABLED, LIBRARY);
    await flushPromises();
    expect(mockInitializeAnalytics).not.toHaveBeenCalled();

    analytics.init(ENABLED, LIBRARY);
    await flushPromises();

    expect(mockInitializeAnalytics).toHaveBeenCalledWith(FIREBASE_APP, {
      config: expect.objectContaining({
        ...LIBRARY_PARAMS,
        user_properties: LIBRARY_PARAMS
      })
    });
  });
});

describe("logEvent", () => {
  it("forwards the event name and parameters to the SDK", async () => {
    analytics.init(ENABLED, LIBRARY);
    await flushPromises();

    await analytics.logEvent("borrow_started", { medium: "audiobook" });

    expect(mockLogEvent).toHaveBeenCalledTimes(1);
    expect(mockLogEvent).toHaveBeenCalledWith(ANALYTICS, "borrow_started", {
      ...LIBRARY_PARAMS,
      medium: "audiobook"
    });
  });

  it("attaches the current library to every event", async () => {
    analytics.init(ENABLED, null);
    await flushPromises();
    analytics.init(ENABLED, LIBRARY);
    await flushPromises();

    await analytics.logEvent("borrow_started");

    expect(mockLogEvent).toHaveBeenCalledWith(
      ANALYTICS,
      "borrow_started",
      LIBRARY_PARAMS
    );
  });

  it("keeps the library parameters from init(), even if eventParams tries to override them", async () => {
    analytics.init(ENABLED, LIBRARY);
    await flushPromises();

    // @ts-expect-error - bypasses the `EventType`params
    await analytics.logEvent("page_view", { library_slug: "override" });

    expect(mockLogEvent).toHaveBeenCalledWith(
      ANALYTICS,
      "page_view",
      expect.objectContaining({ library_slug: LIBRARY.slug })
    );
  });

  it("queues an event before loading finishes", async () => {
    analytics.init(ENABLED, LIBRARY);
    // `firebaseAnalytics` is still pending, which is the
    // logEvent awaits the same promise rather than dropping the event.
    const sent = analytics.logEvent("page_view");
    await flushPromises();
    await sent;

    expect(mockLogEvent).toHaveBeenCalledTimes(1);
  });

  it("queues an event with the library it had when it fired", async () => {
    analytics.init(ENABLED, LIBRARY);
    const sent = analytics.logEvent("page_view");
    // The patron switches libraries before the SDK has finished loading.
    analytics.init(ENABLED, OTHER_LIBRARY);
    await flushPromises();
    await sent;

    expect(mockLogEvent).toHaveBeenCalledWith(
      ANALYTICS,
      "page_view",
      LIBRARY_PARAMS
    );
  });

  it("is a no-op before initialization", async () => {
    await analytics.logEvent("page_view");

    expect(mockLogEvent).not.toHaveBeenCalled();
  });
});
