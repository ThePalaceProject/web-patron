import ApplicationError from "errors";
import * as React from "react";
import { act } from "@testing-library/react";
import { fixtures, screen, setup, waitFor } from "test-utils";
import CleverAuthHandler, {
  cleverRedirectFlag,
  cleverCancelFlag
} from "../CleverAuthHandler";

const cleverRedirectKey = cleverRedirectFlag(fixtures.cleverAuthMethod.id);
const cleverCancelKey = cleverCancelFlag(fixtures.cleverAuthMethod.id);

test("shows loader while redirecting", () => {
  setup(<CleverAuthHandler method={fixtures.cleverAuthMethod} />);
  expect(screen.getByText("Logging in with Clever...")).toBeInTheDocument();
});

beforeEach(() => {
  // this will allow us to test that window.location changes
  const location = new URL("http://test-domain.com");
  delete (window as any).location;
  (window as any).location = location;
  sessionStorage.clear();
});

test("redirects to proper auth url", async () => {
  setup(<CleverAuthHandler method={fixtures.cleverAuthMethod} />, {
    user: { token: undefined }
  });
  await waitFor(() => {
    expect(window.location.href).toBe(
      "https://example.com/oauth_authenticate?provider=Clever&redirect_uri=http%253A%252F%252Ftest-domain.com%252Ftestlib"
    );
  });
});

test("does not redirect if there is a token present", () => {
  setup(<CleverAuthHandler method={fixtures.cleverAuthMethod} />, {
    user: { token: "something" }
  });
  expect(window.location.href).toBe("http://test-domain.com/");
});

test("throws error if there is no authenticate link in library data", async () => {
  try {
    // do nothing
  } catch {
    // catching this error resolves console.error thrown from absence of ErrorBoundary
    expect(() =>
      setup(
        <CleverAuthHandler
          method={{ ...fixtures.cleverAuthMethod, links: [] }}
        />
      )
    ).toThrowError(ApplicationError);
  }
});

test("shows cancel UI when user returns after pressing back from Clever", async () => {
  sessionStorage.setItem(cleverRedirectKey, "1");

  const utils = setup(
    <CleverAuthHandler method={fixtures.cleverAuthMethod} />,
    {
      user: { token: undefined }
    }
  );

  await waitFor(() => {
    expect(utils.getByText("Login was cancelled.")).toBeInTheDocument();
  });
  expect(utils.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
});

test("does not redirect to Clever when cancel is detected", async () => {
  sessionStorage.setItem(cleverRedirectKey, "1");

  setup(<CleverAuthHandler method={fixtures.cleverAuthMethod} />, {
    user: { token: undefined }
  });

  // Give effects time to run; href should remain unchanged.
  await waitFor(() => {
    expect(window.location.href).toBe("http://test-domain.com/");
  });
});

test('clicking "Try Again" after Clever cancel clears flags and redirects', async () => {
  sessionStorage.setItem(cleverRedirectKey, "1");

  const utils = setup(
    <CleverAuthHandler method={fixtures.cleverAuthMethod} />,
    {
      user: { token: undefined }
    }
  );

  await waitFor(() => {
    expect(utils.getByText("Login was cancelled.")).toBeInTheDocument();
  });

  await utils.user.click(utils.getByRole("button", { name: "Try Again" }));

  await waitFor(() => {
    expect(window.location.href).toContain("oauth_authenticate");
  });
});

test("proceeds with redirect when navigating back to sign in after cancel", async () => {
  // Simulates the user seeing cancel UI and then clicking "Sign In" in the header,
  // which causes the handler to remount with both flags already set.
  sessionStorage.setItem(cleverRedirectKey, "1");
  sessionStorage.setItem(cleverCancelKey, "1");

  setup(<CleverAuthHandler method={fixtures.cleverAuthMethod} />, {
    user: { token: undefined }
  });

  await waitFor(() => {
    expect(window.location.href).toContain("oauth_authenticate");
  });
});

test("shows cancel UI when Safari restores page from bfcache after redirect", async () => {
  const utils = setup(
    <CleverAuthHandler method={fixtures.cleverAuthMethod} />,
    { user: { token: undefined } }
  );

  // Wait for the effect to run and set the redirect flag.
  await waitFor(() => {
    expect(sessionStorage.getItem(cleverRedirectKey)).toBe("1");
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

test("displays error message when loginError query param is present", () => {
  const utils = setup(
    <CleverAuthHandler method={fixtures.cleverAuthMethod} />,
    {
      router: {
        query: {
          loginError:
            "Invalid Credentials: The patron account associated with this Clever authentication could not be found."
        }
      },
      user: { token: undefined }
    }
  );

  expect(
    utils.getByText(
      "Invalid Credentials: The patron account associated with this Clever authentication could not be found."
    )
  ).toBeInTheDocument();
  expect(utils.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
});

test("does not redirect to Clever when error is present", () => {
  setup(<CleverAuthHandler method={fixtures.cleverAuthMethod} />, {
    router: { query: { loginError: "Authentication failed" } },
    user: { token: undefined }
  });

  expect(window.location.href).toBe("http://test-domain.com/");
});

test('clicking "Try Again" clears error and attempts Clever redirect', async () => {
  const mockReplace = jest.fn();
  const utils = setup(
    <CleverAuthHandler method={fixtures.cleverAuthMethod} />,
    {
      router: {
        query: { loginError: "Authentication failed", library: "testlib" },
        pathname: "/[library]/login/[methodId]",
        replace: mockReplace
      },
      user: { token: undefined }
    }
  );

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

test('clicking "Cancel" while redirecting shows cancel UI', async () => {
  const utils = setup(
    <CleverAuthHandler method={fixtures.cleverAuthMethod} />,
    { user: { token: undefined } }
  );

  await waitFor(() => {
    expect(utils.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  await utils.user.click(utils.getByRole("button", { name: "Cancel" }));

  await waitFor(() => {
    expect(utils.getByText("Login was cancelled.")).toBeInTheDocument();
  });
  expect(utils.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
});
