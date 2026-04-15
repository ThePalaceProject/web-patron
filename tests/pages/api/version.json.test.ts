/**
 * @jest-environment node
 *
 * Tests for the /api/version.json route. Run under the Node.js jest config
 * (jest.config.node.js) because this is a server-side handler.
 */

import type { VersionInfo } from "pages/api/version.json";
import handler from "pages/api/version.json";

describe("GET /api/version.json", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  function makeRes() {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    return { status, json };
  }

  // Parameterized: verify that each env var makes it through to the JSON response.
  const cases: Array<[string, Partial<Record<string, string>>, VersionInfo]> = [
    [
      "all three fields",
      { APP_VERSION: "1.2.3", GIT_COMMIT_SHA: "abc123", GIT_BRANCH: "main" },
      { version: "1.2.3", commit: "abc123", branch: "main" }
    ],
    [
      "version and commit only",
      { APP_VERSION: "2.0.0", GIT_COMMIT_SHA: "deadbeef" },
      { version: "2.0.0", commit: "deadbeef", branch: null }
    ],
    [
      "branch only",
      { GIT_BRANCH: "qa" },
      { version: null, commit: null, branch: "qa" }
    ],
    [
      "no version env vars set",
      {},
      { version: null, commit: null, branch: null }
    ]
  ];

  test.each(cases)("responds 200 with %s", (_label, env, expected) => {
    delete process.env.APP_VERSION;
    delete process.env.GIT_COMMIT_SHA;
    delete process.env.GIT_BRANCH;
    Object.assign(process.env, env);

    const { status, json } = makeRes();
    handler({} as never, { status } as never);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(expected);
  });
});
