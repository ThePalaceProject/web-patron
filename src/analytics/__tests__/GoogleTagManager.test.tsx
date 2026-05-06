import * as React from "react";
import { render } from "test-utils";
import { GTMScript, GTMNoscript } from "../GoogleTagManager";

const INVALID_IDS = [
  ["lowercase", "gtm-abc123"],
  ["missing prefix", "ABC123"],
  ["with spaces", "GTM-ABC 123"],
  ["with special chars", "GTM-<script>"]
] as const;

describe("GTMScript", () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  test.each([
    ["null", null],
    ["undefined", undefined],
    ["empty string", ""]
  ])("renders nothing and does not error when gtmId is %s", (_label, gtmId) => {
    const { container } = render(<GTMScript gtmId={gtmId} />);
    expect(container).toBeEmptyDOMElement();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test.each(INVALID_IDS)(
    "renders nothing and logs an error for invalid format: %s",
    (_label, gtmId) => {
      const { container } = render(<GTMScript gtmId={gtmId} />);
      expect(container).toBeEmptyDOMElement();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining("is not a valid GTM container ID")
      );
    }
  );

  it("renders a script tag and does not error with a valid GTM id", () => {
    const { container } = render(<GTMScript gtmId="GTM-ABC123" />);
    const script = container.querySelector("script");
    expect(script).not.toBeNull();
    expect(script?.innerHTML).toContain("GTM-ABC123");
    expect(errorSpy).not.toHaveBeenCalled();
  });
});

describe("GTMNoscript", () => {
  test.each([
    ["null", null],
    ["undefined", undefined],
    ["empty string", ""]
  ])("renders nothing when gtmId is %s", (_label, gtmId) => {
    const { container } = render(<GTMNoscript gtmId={gtmId} />);
    expect(container).toBeEmptyDOMElement();
  });

  test.each(INVALID_IDS)(
    "renders nothing for invalid format: %s",
    (_label, gtmId) => {
      const { container } = render(<GTMNoscript gtmId={gtmId} />);
      expect(container).toBeEmptyDOMElement();
    }
  );

  it("renders a noscript iframe with a valid GTM id", () => {
    const { container } = render(<GTMNoscript gtmId="GTM-ABC123" />);
    const noscript = container.querySelector("noscript");
    expect(noscript).not.toBeNull();
    expect(noscript?.innerHTML).toContain("GTM-ABC123");
  });
});
