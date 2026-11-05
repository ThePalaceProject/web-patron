import * as React from "react";
import mockConfig from "test-utils/mockConfig";
import { render } from "../../test-utils";
import { DefaultFallback, InlineFallback } from "../ErrorBoundary";

mockConfig();

const fallbackProps = {
  error: new Error("Boom"),
  info: { componentStack: "" },
  clearError: () => undefined
};

describe("DefaultFallback", () => {
  it("displays Palace Web Catalog logo", () => {
    const utils = render(<DefaultFallback {...fallbackProps} />);
    expect(
      utils.getByRole("img", { name: "Palace Web Catalog" })
    ).toBeInTheDocument();
  });
});

describe("InlineFallback", () => {
  it("hides Palace Web Catalog logo", () => {
    const utils = render(<InlineFallback {...fallbackProps} />);
    expect(utils.getByText(/Something went wrong/)).toBeInTheDocument();
    expect(
      utils.queryByRole("img", { name: "Palace Web Catalog" })
    ).not.toBeInTheDocument();
  });
});
