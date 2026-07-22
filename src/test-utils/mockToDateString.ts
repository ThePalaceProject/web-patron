import { jest } from "@jest/globals";
/**
 * Mocks Date.prototype.toDateString so tests are timezone-independent.
 * Called in the global beforeEach so it is re-applied after each test's
 * restoreMocks cleanup.
 */
export const MOCK_DATE_STRING = "mock-date-string";

export function mockToDateString(): void {
  jest
    .spyOn(Date.prototype, "toDateString")
    .mockImplementation(() => MOCK_DATE_STRING);
}
