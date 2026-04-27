import FALLBACK_APP_CONFIG from "config/fallbackAppConfig";

describe("FALLBACK_APP_CONFIG", () => {
  test.each([
    ["instanceName", ""],
    ["companionApp", "simplye"],
    ["showMedium", true],
    ["gtmId", null],
    ["bugsnagApiKey", null],
    ["openebooks", null]
  ])("%s defaults to %p", (field, expected) => {
    expect(FALLBACK_APP_CONFIG[field as keyof typeof FALLBACK_APP_CONFIG]).toBe(
      expected
    );
  });

  test("mediaSupport defaults to empty object", () => {
    expect(FALLBACK_APP_CONFIG.mediaSupport).toEqual({});
  });
});
