import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test
} from "@jest/globals";
import * as React from "react";
import { renderHook } from "@testing-library/react";
import AppConfigContext, { useAppConfig } from "../AppConfigContext";
import { fixtures } from "test-utils";
import type { AppConfig } from "interfaces";

const withProvider =
  (config: AppConfig) =>
  ({ children }: { children: React.ReactNode }) => (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  );

describe("useAppConfig", () => {
  test("returns the config supplied by the nearest Provider", () => {
    const { result } = renderHook(() => useAppConfig(), {
      wrapper: withProvider(fixtures.config)
    });
    expect(result.current).toBe(fixtures.config);
  });

  describe("when used outside a Provider", () => {
    beforeEach(() => {
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("throws with an explanatory message", () => {
      expect(() => renderHook(() => useAppConfig())).toThrow(
        "useAppConfig must be used within an AppConfigContext.Provider"
      );
    });
  });

  test.each<[string, Partial<AppConfig>]>([
    ["instanceName", { instanceName: "Custom Library" }],
    ["bugsnagApiKey", { bugsnagApiKey: "abc123" }],
    ["companionApp", { companionApp: "openebooks" }],
    ["showMedium", { showMedium: false }]
  ])("passes the %s field through unchanged", (_field, override) => {
    const config = { ...fixtures.config, ...override };
    const { result } = renderHook(() => useAppConfig(), {
      wrapper: withProvider(config)
    });
    expect(result.current).toMatchObject(override);
  });
});
