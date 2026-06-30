/**
 * Spy on console[method], silently dropping messages that match any of the
 * given patterns. Everything else passes through to the real implementation so
 * unexpected output remains visible during the test run.
 *
 * Returns the spy so callers can assert on `.toHaveBeenCalledWith` when
 * verifying that an expected message was actually produced.
 *
 * Restore with `spy.mockRestore()` or `jest.restoreAllMocks()` in afterEach.
 */
export function expectAndSuppressConsole(
  method: "warn" | "error",
  ...patterns: Array<string | RegExp>
): jest.SpyInstance {
  const original = console[method].bind(console);
  return jest.spyOn(console, method).mockImplementation((...args) => {
    const text = args.map(a => String(a)).join(" ");
    if (
      patterns.some(p =>
        p instanceof RegExp ? p.test(text) : text.includes(p)
      )
    )
      return;
    original(...args);
  });
}
