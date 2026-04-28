import { expect, test } from "@jest/globals";
import { formatDuration } from "../duration";

test("returns 0 minutes for 0 seconds", () => {
  expect(formatDuration(0)).toBe("0 minutes");
});

test("floors sub-minute durations to 0 minutes", () => {
  expect(formatDuration(59)).toBe("1 minute");
});

test("returns minutes-only format for durations <= 60 minutes", () => {
  expect(formatDuration(1500)).toBe("25 minutes");
});

test("returns minutes-only format at exactly 60 minutes", () => {
  expect(formatDuration(3600)).toBe("60 minutes");
});

test("returns hours+minutes format for durations just over 60 minutes", () => {
  expect(formatDuration(3660)).toBe("1 hour, 1 minute");
});

test("returns hours+minutes format for multi-hour durations with remainder", () => {
  expect(formatDuration(7325)).toBe("2 hours, 3 minutes");
});

test("returns hours+minutes format for exact hours with zero minutes", () => {
  expect(formatDuration(7200)).toBe("2 hours, 0 minutes");
});
