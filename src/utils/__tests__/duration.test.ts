import { describe, expect, test } from "@jest/globals";
import { formatDuration } from "../duration";
import { Language } from "utils/i18n";

const en = Language.EN;

describe("formatDuration", () => {
  test("rounds sub-minute seconds up", () => {
    expect(formatDuration(59, en)).toBe("1 minute");
  });

  test("returns minutes-only format for durations under an hour", () => {
    expect(formatDuration(1500, en)).toBe("25 minutes");
  });

  test("returns hours-only format at exactly 60 minutes", () => {
    expect(formatDuration(3600, en)).toBe("1 hour");
  });

  test("returns hours+minutes format for durations just over 60 minutes", () => {
    expect(formatDuration(3660, en)).toBe("1 hour, 1 minute");
  });

  test("returns hours+minutes format for multi-hour durations with remainder", () => {
    expect(formatDuration(7325, en)).toBe("2 hours, 3 minutes");
  });

  test("omits a zero-minute remainder for exact hours", () => {
    expect(formatDuration(7200, en)).toBe("2 hours");
  });

  test("formats in each supported locale", () => {
    expect(formatDuration(21660, Language.EN)).toBe("6 hours, 1 minute");
    // French separates the leading count from its unit with a non-breaking
    // space (U+00A0), so this is not the plain space it looks like
    expect(formatDuration(21660, Language.FR)).toBe("6 heures et 1 minute");
    expect(formatDuration(21660, Language.IT)).toBe("6 ore e 1 minuto");
    // German uses a comma rather than a conjunction to join the units
    expect(formatDuration(21660, Language.DE)).toBe("6 Stunden, 1 Minute");
    expect(formatDuration(21660, Language.ES)).toBe("6 horas y 1 minuto");
  });

  test("returns undefined for a missing or unusable duration", () => {
    expect(formatDuration(NaN, en)).toBeUndefined();
    expect(formatDuration(0, en)).toBeUndefined();
    expect(formatDuration(-60, en)).toBeUndefined();
    expect(formatDuration(Infinity, en)).toBeUndefined();
  });
});
