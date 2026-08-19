import * as React from "react";
import { render, screen } from "test-utils";
import ErrorPage from "pages/_error";

// getInitialProps is server-side and covered by tests/pages/error.test.ts.

describe("_error page", () => {
  test("renders translated copy when there is no problem document", () => {
    render(<ErrorPage statusCode={500} />);

    expect(
      screen.getByText("500 Error: Something went wrong rendering the page.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("An unexpected error occurred.", { exact: false })
    ).toBeInTheDocument();
  });

  /*
   * A problem document's title and detail come from the server, so they must be
   * rendered verbatim rather than replaced by the generic translated copy.
   */
  test("renders a problem document verbatim", () => {
    render(
      <ErrorPage
        errorInfo={{
          title: "Unknown Server Error",
          detail: "The Circulation Manager returned a 500 error.",
          status: 500
        }}
      />
    );

    expect(
      screen.getByText("500 Error: Unknown Server Error")
    ).toBeInTheDocument();
    expect(
      screen.getByText("The Circulation Manager returned a 500 error.", {
        exact: false
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Something went wrong rendering the page.", {
        exact: false
      })
    ).not.toBeInTheDocument();
  });
});
