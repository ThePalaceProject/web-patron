import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { parseBoolean } from "../envParse";
import { AppSetupError } from "errors";

const ENV_VAR = "TEST_PARSE_BOOLEAN_FLAG";
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe("parseBoolean", () => {
  it("returns the default when the variable is unset", () => {
    delete process.env[ENV_VAR];
    expect(parseBoolean(ENV_VAR, true)).toBe(true);
    expect(parseBoolean(ENV_VAR, false)).toBe(false);
  });

  it("returns the default when the variable is empty", () => {
    process.env[ENV_VAR] = "  ";
    expect(parseBoolean(ENV_VAR, true)).toBe(true);
  });

  it.each(["1", "on", "t", "true", "y", "yes", "TRUE", " True "])(
    "returns true for %s",
    value => {
      process.env[ENV_VAR] = value;
      expect(parseBoolean(ENV_VAR, false)).toBe(true);
    }
  );

  it.each(["0", "off", "f", "false", "n", "no", "FALSE", " False "])(
    "returns false for %s",
    value => {
      process.env[ENV_VAR] = value;
      expect(parseBoolean(ENV_VAR, true)).toBe(false);
    }
  );

  it("throws AppSetupError for an unrecognized value", () => {
    process.env[ENV_VAR] = "yes please";
    expect(() => parseBoolean(ENV_VAR, false)).toThrow(AppSetupError);
  });
});
