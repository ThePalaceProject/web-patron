import * as React from "react";
import { act } from "@testing-library/react";
import { fixtures, render, waitFor } from "test-utils";
import OidcAuthHandler from "../OidcAuthHandler";

// we import the unwrapped render here because we don't need the context providers

const oidcRedirectKey = `cpw-oidc-redirect-${fixtures.clientOidcMethod.id}`;
const oidcCancelKey = `cpw-oidc-cancelled-${fixtures.clientOidcMethod.id}`;

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
  sessionStorage.clear();
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

test("shows cancel UI when user returns after pressing back from OIDC provider", async () => {
  sessionStorage.setItem(oidcRedirectKey, "1");

  const utils = render(<OidcAuthHandler method={fixtures.clientOidcMethod} />, {
    user: { token: undefined }
  });

  await waitFor(() => {
    expect(utils.getByText("Login was cancelled.")).toBeInTheDocument();
  });
  expect(utils.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
});

test("does not redirect to OIDC provider when cancel is detected", async () => {
  sessionStorage.setItem(oidcRedirectKey, "1");

  render(<OidcAuthHandler method={fixtures.clientOidcMethod} />, {
    user: { token: undefined }
  });

  // Give effects time to run; href should remain unchanged.
  await waitFor(() => {
    expect(window.location.href).toBe("http://test-domain.com/");
  });
});

test('clicking "Try Again" after cancel clears flags and redirects', async () => {
  sessionStorage.setItem(oidcRedirectKey, "1");

  const utils = render(<OidcAuthHandler method={fixtures.clientOidcMethod} />, {
    user: { token: undefined }
  });

  await waitFor(() => {
    expect(utils.getByText("Login was cancelled.")).toBeInTheDocument();
  });

  utils.getByRole("button", { name: "Try Again" }).click();

  await waitFor(() => {
    expect(window.location.href).toContain("oidc-auth.com");
  });
});

test("proceeds with redirect when navigating back to sign in after cancel", async () => {
  // Simulates the user seeing cancel UI and then clicking "Sign In" in the header,
  // which causes the handler to remount with both flags already set.
  sessionStorage.setItem(oidcRedirectKey, "1");
  sessionStorage.setItem(oidcCancelKey, "1");

  render(<OidcAuthHandler method={fixtures.clientOidcMethod} />, {
    user: { token: undefined }
  });

  await waitFor(() => {
    expect(window.location.href).toContain("oidc-auth.com");
  });
});

test("shows cancel UI when Safari restores page from bfcache after redirect", async () => {
  const utils = render(<OidcAuthHandler method={fixtures.clientOidcMethod} />, {
    user: { token: undefined }
  });

  // Wait for the effect to run and set the redirect flag.
  await waitFor(() => {
    expect(sessionStorage.getItem(oidcRedirectKey)).toBe("1");
  });

  // Simulate Safari restoring this page from bfcache.
  act(() => {
    const event = new Event("pageshow");
    Object.defineProperty(event, "persisted", { value: true });
    window.dispatchEvent(event);
  });

  await waitFor(() => {
    expect(utils.getByText("Login was cancelled.")).toBeInTheDocument();
  });
  expect(utils.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
});

test('clicking "Cancel" while redirecting shows cancel UI', async () => {
  const utils = render(<OidcAuthHandler method={fixtures.clientOidcMethod} />, {
    user: { token: undefined }
  });

  await waitFor(() => {
    expect(utils.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  utils.getByRole("button", { name: "Cancel" }).click();

  await waitFor(() => {
    expect(utils.getByText("Login was cancelled.")).toBeInTheDocument();
  });
  expect(utils.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
});
