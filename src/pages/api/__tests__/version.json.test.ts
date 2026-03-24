/**
 * @jest-environment node
 *
 * Tests for the /api/version.json route. Run under the Node.js jest config
 * (jest.config.node.js) because this is a server-side handler.
 *
 * _version.json is mocked per-test via jest.doMock so that each case can
 * control exactly what the module returns (or whether the require throws).
 */

import type { VersionInfo } from "../version.json";

describe("GET /api/version.json", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  /* eslint-disable @typescript-eslint/no-var-requires */
  function loadHandler() {
    return require("../version.json").default as (
      req: unknown,
      res: { status: (code: number) => { json: (body: unknown) => void } }
    ) => void;
  }
  /* eslint-enable @typescript-eslint/no-var-requires */

  function makeRes() {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    return { status, json };
  }

  // Parameterized: verify that each field makes it through to the JSON response.
  const cases: Array<[string, Partial<VersionInfo>, VersionInfo]> = [
    [
      "all three fields",
      { version: "1.2.3", commit: "abc123", branch: "main" },
      { version: "1.2.3", commit: "abc123", branch: "main" }
    ],
    [
      "version and commit only",
      { version: "2.0.0", commit: "deadbeef" },
      { version: "2.0.0", commit: "deadbeef", branch: null }
    ],
    [
      "branch only",
      { branch: "qa" },
      { version: null, commit: null, branch: "qa" }
    ],
    [
      "empty object (all fields absent)",
      {},
      { version: null, commit: null, branch: null }
    ]
  ];

  test.each(cases)("responds 200 with %s", (_label, mockJson, expected) => {
    jest.doMock("../../../_version.json", () => mockJson, { virtual: true });
    const handler = loadHandler();
    const { status, json } = makeRes();
    handler({}, { status });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(expected);
  });

  test("responds 200 with all-null fields when _version.json is absent", () => {
    jest.doMock(
      "../../../_version.json",
      () => {
        throw new Error("ENOENT: no such file or directory");
      },
      { virtual: true }
    );
    const handler = loadHandler();
    const { status, json } = makeRes();
    handler({}, { status });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      version: null,
      commit: null,
      branch: null
    });
  });
});
