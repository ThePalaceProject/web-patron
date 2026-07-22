import { AppSetupError } from "errors";

// The "boolean" values Pydantic accepts in Palace Manager, so flags parsed
// here behave similarly to their counterparts there.
const TRUE_ENV_VALUES = new Set(["1", "on", "t", "true", "y", "yes"]);
const FALSE_ENV_VALUES = new Set(["0", "off", "f", "false", "n", "no"]);

/**
 * Parses an environment variable as a boolean. An unset or empty variable
 * returns defaultValue; any other value (trimmed and lowercased) must match
 * one of the recognized spellings above or an AppSetupError is thrown.
 */
export function parseBoolean(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return defaultValue;
  const value = raw.trim().toLowerCase();
  if (TRUE_ENV_VALUES.has(value)) return true;
  if (FALSE_ENV_VALUES.has(value)) return false;
  throw new AppSetupError(
    `Environment variable ${name} has unrecognized boolean value "${raw}". ` +
      `Valid values: ${[...TRUE_ENV_VALUES, ...FALSE_ENV_VALUES].join(", ")}.`
  );
}
