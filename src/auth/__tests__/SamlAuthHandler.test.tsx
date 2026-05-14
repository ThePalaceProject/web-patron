import * as React from "react";
import { act } from "@testing-library/react";
import { fixtures, render, setup, waitFor } from "test-utils";
import SamlAuthHandler, {
  samlRedirectFlag,
  samlCancelFlag
} from "../SamlAuthHandler";

// we import the unwrapped render here because we don't need the context providers

const samlRedirectKey = samlRedirectFlag(fixtures.clientSamlMethod.id);
const samlCancelKey = samlCancelFlag(fixtures.clientSamlMethod.id);

test("shows loader while redirecting", () => {
  const utils = render(<SamlAuthHandler method={fixtures.clientSamlMethod} />);
  expect(utils.getByText("Logging in with SAML IdP 0...")).toBeInTheDocument();
});

beforeEach(() => {
  // this will allow us to test that window.location changes
  const location = new URL("http://test-domain.com");
  delete (window as any).location;
  (window as any).location = location;
  sessionStorage.clear();
});

test("redirects to proper auth url", async () => {
  render(<SamlAuthHandler method={fixtures.clientSamlMethod} />, {
    user: { token: undefined }
  });
  await waitFor(() => {
    expect(window.location.href).toBe(
      "https://saml-auth.com/0&redirect_uri=http%3A%2F%2Ftest-domain.com%2Ftestlib"
    );
  });
});

test("does not redirect if there is a token", async () => {
  render(<SamlAuthHandler method={fixtures.clientSamlMethod} />, {
    user: {
      token: "some-token"
    }
  });
  expect(window.location.href).toBe("http://test-domain.com/");
});

test("displays error message when loginError query param is present", () => {
  const utils = render(<SamlAuthHandler method={fixtures.clientSamlMethod} />, {
    router: {
      query: {
        loginError:
          "Invalid Credentials: The patron account associated with this SAML authentication could not be found."
      }
    },
    user: { token: undefined }
  });

  expect(
    utils.getByText(
      "Invalid Credentials: The patron account associated with this SAML authentication could not be found."
    )
  ).toBeInTheDocument();
  expect(utils.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
});

test("does not redirect to SAML IdP when error is present", () => {
  render(<SamlAuthHandler method={fixtures.clientSamlMethod} />, {
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

test('clicking "Try Again" clears error and attempts SAML redirect', async () => {
  const mockReplace = jest.fn();
  const utils = setup(<SamlAuthHandler method={fixtures.clientSamlMethod} />, {
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

  await utils.user.click(utils.getByRole("button", { name: "Try Again" }));

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

test("shows cancel UI when user returns after pressing back from SAML IdP", async () => {
  sessionStorage.setItem(samlRedirectKey, "1");

  const utils = render(<SamlAuthHandler method={fixtures.clientSamlMethod} />, {
    user: { token: undefined }
  });

  await waitFor(() => {
    expect(utils.getByText("Login was cancelled.")).toBeInTheDocument();
  });
  expect(utils.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
});

test("does not redirect to SAML IdP when cancel is detected", async () => {
  sessionStorage.setItem(samlRedirectKey, "1");

  render(<SamlAuthHandler method={fixtures.clientSamlMethod} />, {
    user: { token: undefined }
  });

  // Give effects time to run; href should remain unchanged.
  await waitFor(() => {
    expect(window.location.href).toBe("http://test-domain.com/");
  });
});

test('clicking "Try Again" after cancel clears flags and redirects', async () => {
  sessionStorage.setItem(samlRedirectKey, "1");

  const utils = setup(<SamlAuthHandler method={fixtures.clientSamlMethod} />, {
    user: { token: undefined }
  });

  await waitFor(() => {
    expect(utils.getByText("Login was cancelled.")).toBeInTheDocument();
  });

  await utils.user.click(utils.getByRole("button", { name: "Try Again" }));

  await waitFor(() => {
    expect(window.location.href).toContain("saml-auth.com");
  });
});

test("proceeds with redirect when navigating back to sign in after cancel", async () => {
  // Simulates the user seeing cancel UI and then clicking "Sign In" in the header,
  // which causes the handler to remount with both flags already set.
  sessionStorage.setItem(samlRedirectKey, "1");
  sessionStorage.setItem(samlCancelKey, "1");

  render(<SamlAuthHandler method={fixtures.clientSamlMethod} />, {
    user: { token: undefined }
  });

  await waitFor(() => {
    expect(window.location.href).toContain("saml-auth.com");
  });
});

test("shows cancel UI when Safari restores page from bfcache after redirect", async () => {
  const utils = render(<SamlAuthHandler method={fixtures.clientSamlMethod} />, {
    user: { token: undefined }
  });

  // Wait for the effect to run and set the redirect flag.
  await waitFor(() => {
    expect(sessionStorage.getItem(samlRedirectKey)).toBe("1");
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
  const utils = setup(<SamlAuthHandler method={fixtures.clientSamlMethod} />, {
    user: { token: undefined }
  });

  await waitFor(() => {
    expect(utils.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  await utils.user.click(utils.getByRole("button", { name: "Cancel" }));

  await waitFor(() => {
    expect(utils.getByText("Login was cancelled.")).toBeInTheDocument();
  });
  expect(utils.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
});
