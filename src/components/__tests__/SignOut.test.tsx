import * as React from "react";
import { fixtures, screen, setup, waitFor } from "../../test-utils";
import { SignOut } from "components/SignOut";
import { OPDS1 } from "interfaces";
import { mockPush } from "../../test-utils/mockNextRouter";
import fetchMock from "jest-fetch-mock";

test("Shows button", () => {
  setup(<SignOut />);
  expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
});

test("Modal is initially hidden", async () => {
  setup(<SignOut />);
  const modal = await screen.findByLabelText("Sign Out");
  expect(modal).toHaveStyle("display: none");
  expect(modal).not.toBeVisible();
});

test("Shows modal on click", async () => {
  const { user } = setup(<SignOut />);
  const signOut = await screen.findByRole("button", { name: "Sign Out" });
  await user.click(signOut);

  const modal = await screen.findByLabelText("Sign Out");

  expect(modal).toHaveStyle({
    display: "block",
    position: "fixed",
    height: "fit-content",
    maxWidth: "400px",
    inset: "0.75rem",
    margin: "auto"
  });
  expect(modal).toBeVisible();

  expect(screen.getByText("Are you sure you want to sign out?")).toBeVisible();
});

test("hides dialog on cancel", async () => {
  const { user } = setup(<SignOut />);
  const signOut = await screen.findByRole("button", { name: "Sign Out" });
  // show
  await user.click(signOut);
  expect(screen.getByLabelText("Sign Out")).toBeVisible();

  const cancel = await screen.findByRole("button", { name: "Cancel" });

  await user.click(cancel);
  await waitFor(() =>
    expect(screen.getByLabelText("Sign Out")).not.toBeVisible()
  );
});

test("signs out on click signout", async () => {
  const { user } = setup(<SignOut />);
  const signOut = await screen.findByRole("button", { name: "Sign Out" });

  await user.click(signOut);
  const signOutForReal = await screen.findByRole("button", {
    name: "Confirm Sign Out"
  });

  expect(fixtures.mockSignOut).toHaveBeenCalledTimes(0);
  await user.click(signOutForReal);
  expect(fixtures.mockSignOut).toHaveBeenCalledTimes(1);
});

test("uses OIDC logout endpoint when available", async () => {
  // Mock window.location.href
  const originalLocation = window.location;
  delete (window as any).location;
  window.location = { ...originalLocation, href: "" } as any;

  const logoutHref = "http://example.com/oidc/logout?provider=Test";
  fetchMock.mockResponseOnce("", { url: logoutHref, status: 200 });

  const oidcMethod = {
    type: OPDS1.OidcAuthType,
    id: "oidc-1",
    href: "http://example.com/oidc/authenticate",
    logoutHref,
    description: "Test OIDC"
  };

  const { user } = setup(<SignOut />, {
    user: {
      token: "Bearer test-token",
      credentials: {
        token: "Bearer test-token",
        methodType: OPDS1.OidcAuthType
      }
    },
    library: {
      ...fixtures.library,
      authMethods: [oidcMethod]
    }
  });

  const signOut = await screen.findByRole("button", { name: "Sign Out" });
  await user.click(signOut);

  const signOutForReal = await screen.findByRole("button", {
    name: "Confirm Sign Out"
  });
  await user.click(signOutForReal);

  // Should fetch the logout endpoint with an Authorization Bearer header
  await waitFor(() => {
    const [fetchedUrl, fetchOptions] = fetchMock.mock.calls[0];
    expect(fetchedUrl).toContain("http://example.com/oidc/logout");
    expect(fetchedUrl).toContain("post_logout_redirect_uri=");
    expect((fetchOptions?.headers as Record<string, string>)?.Authorization).toBe(
      "Bearer test-token"
    );
  });

  // Should navigate to the URL returned by the server
  expect(window.location.href).toBe(logoutHref);

  // Restore window.location
  window.location = originalLocation;
});

test("falls back to local signout for OIDC without logout link", async () => {
  const oidcMethod = {
    type: OPDS1.OidcAuthType,
    id: "oidc-1",
    href: "http://example.com/oidc/authenticate",
    // No logoutHref
    description: "Test OIDC"
  };

  const { user } = setup(<SignOut />, {
    user: {
      credentials: {
        token: "Bearer test-token",
        methodType: OPDS1.OidcAuthType
      }
    },
    library: {
      ...fixtures.library,
      authMethods: [oidcMethod]
    }
  });

  const signOut = await screen.findByRole("button", { name: "Sign Out" });
  await user.click(signOut);

  const signOutForReal = await screen.findByRole("button", {
    name: "Confirm Sign Out"
  });
  await user.click(signOutForReal);

  // Should use the redirect-based signout flow (navigate with performSignOut=true)
  // The router mock will have been called
  await waitFor(() => {
    expect(mockPush).toHaveBeenCalled();
  });
});
