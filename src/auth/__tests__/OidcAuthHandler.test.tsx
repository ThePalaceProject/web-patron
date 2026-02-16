import * as React from "react";
import { fixtures, render, waitFor } from "test-utils";
import OidcAuthHandler from "../OidcAuthHandler";

// we import the unwrapped render here because we don't need the context providers

test("shows loader while redirecting", () => {
  const utils = render(<OidcAuthHandler method={fixtures.clientOidcMethod} />);
  expect(
    utils.getByText("Logging in with OIDC Provider 0...")
  ).toBeInTheDocument();
});

beforeEach(() => {
  // this will allow us to test that window.location changes
  const location = new URL("http://test-domain.com");
  delete (window as any).location;
  (window as any).location = location;
});

test("redirects to proper auth url", async () => {
  render(<OidcAuthHandler method={fixtures.clientOidcMethod} />, {
    user: { token: undefined }
  });
  await waitFor(() => {
    expect(window.location.href).toBe(
      "https://oidc-auth.com/0&redirect_uri=http%3A%2F%2Ftest-domain.com%2Ftestlib"
    );
  });
});

test("does not redirect if there is a token", async () => {
  render(<OidcAuthHandler method={fixtures.clientOidcMethod} />, {
    user: {
      token: "some-token"
    }
  });
  expect(window.location.href).toBe("http://test-domain.com/");
});

test("displays error message when loginError query param is present", () => {
  const utils = render(<OidcAuthHandler method={fixtures.clientOidcMethod} />, {
    router: {
      query: {
        loginError:
          "Invalid Credentials: The patron account associated with this OIDC authentication could not be found."
      }
    },
    user: { token: undefined }
  });

  expect(
    utils.getByText(
      "Invalid Credentials: The patron account associated with this OIDC authentication could not be found."
    )
  ).toBeInTheDocument();
  expect(utils.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
});

test("does not redirect to OIDC provider when error is present", () => {
  render(<OidcAuthHandler method={fixtures.clientOidcMethod} />, {
    router: {
      query: {
        loginError: "Authentication failed"
      }
    },
    user: { token: undefined }
  });

  // Should not redirect when error is present
  expect(window.location.href).toBe("http://test-domain.com/");
});

test('clicking "Try Again" clears error and attempts OIDC redirect', async () => {
  const mockReplace = jest.fn();
  const utils = render(<OidcAuthHandler method={fixtures.clientOidcMethod} />, {
    router: {
      query: {
        loginError: "Authentication failed",
        library: "testlib"
      },
      pathname: "/[library]/login/[methodId]",
      replace: mockReplace
    },
    user: { token: undefined }
  });

  const tryAgainButton = utils.getByRole("button", { name: "Try Again" });
  tryAgainButton.click();

  await waitFor(() => {
    expect(mockReplace).toHaveBeenCalledWith(
      {
        pathname: "/[library]/login/[methodId]",
        query: { library: "testlib" }
      },
      undefined,
      { shallow: true }
    );
  });
});
