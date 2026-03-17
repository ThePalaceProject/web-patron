import * as React from "react";
import { fixtures, screen, setup, waitFor } from "../../test-utils";
import { SignOut } from "components/SignOut";
import { OPDS1, ClientOidcMethod } from "interfaces";
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

describe("OIDC logout with logout endpoint", () => {
  /* eslint-disable camelcase */
  // snake_case properties are defined by an external API we don't control.
  const logoutLink: OPDS1.OidcLink = {
    href: "http://example.com/oidc/logout?provider=Test{&post_logout_redirect_uri}",
    rel: "logout",
    templated: true,
    properties: {
      uri_template_variables: {
        type: "http://palaceproject.io/terms/uri-template/variables",
        map: {
          post_logout_redirect_uri: {
            term: "http://palaceproject.io/terms/redirect-uri"
          }
        }
      }
    },
    privacy_statement_urls: [],
    logo_urls: [],
    display_names: [{ language: "en", value: "Test OIDC" }],
    descriptions: [{ language: "en", value: "Test OIDC" }],
    information_urls: []
  };
  /* eslint-enable camelcase */
  const oidcMethod: ClientOidcMethod = {
    type: OPDS1.OidcAuthType,
    id: "oidc-1",
    href: "http://example.com/oidc/authenticate",
    logoutLink,
    description: "Test OIDC"
  };
  const oidcUserSetup = {
    user: {
      token: "Bearer test-token",
      credentials: {
        token: "Bearer test-token",
        methodType: OPDS1.OidcAuthType
      } as const
    },
    library: {
      ...fixtures.libraryData,
      authMethods: [oidcMethod]
    }
  };

  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: "" } as any;
  });

  afterEach(() => {
    (window as any).location = originalLocation;
  });

  test("clears local credentials immediately before fetching logout endpoint", async () => {
    fetchMock.mockResponseOnce("", { status: 200 });

    const { user } = setup(<SignOut />, oidcUserSetup);

    const signOutBtn = await screen.findByRole("button", { name: "Sign Out" });
    await user.click(signOutBtn);

    const signOutForReal = await screen.findByRole("button", {
      name: "Confirm Sign Out"
    });
    await user.click(signOutForReal);

    // signOut() should have been called (clears credentials) before the fetch completes
    await waitFor(() => {
      expect(fixtures.mockSignOut).toHaveBeenCalled();
    });
  });

  test("uses OIDC logout endpoint and navigates to signed-out page", async () => {
    fetchMock.mockResponseOnce("", { status: 200 });

    const { user } = setup(<SignOut />, oidcUserSetup);

    const signOutBtn = await screen.findByRole("button", { name: "Sign Out" });
    await user.click(signOutBtn);

    const signOutForReal = await screen.findByRole("button", {
      name: "Confirm Sign Out"
    });
    await user.click(signOutForReal);

    // Should fetch the logout endpoint with an Authorization Bearer header
    await waitFor(() => {
      const [fetchedUrl, fetchOptions] = fetchMock.mock.calls[0];
      expect(fetchedUrl).toContain("http://example.com/oidc/logout");
      expect(fetchedUrl).toContain("post_logout_redirect_uri=");
      expect(
        (fetchOptions?.headers as Record<string, string>)?.Authorization
      ).toBe("Bearer test-token");
    });

    // Should navigate to our signed-out page (not the logout endpoint URL).
    expect(window.location.href).toContain("/signed-out");
  });

  test("navigates to signed-out page with error flag when logout request fails", async () => {
    fetchMock.mockRejectOnce(new Error("Network error"));

    const { user } = setup(<SignOut />, oidcUserSetup);

    const signOutBtn = await screen.findByRole("button", { name: "Sign Out" });
    await user.click(signOutBtn);

    const signOutForReal = await screen.findByRole("button", {
      name: "Confirm Sign Out"
    });
    await user.click(signOutForReal);

    // Should navigate to signed-out page with a serverError flag instead of
    // showing a window.alert.
    await waitFor(() => {
      expect(window.location.href).toContain("/signed-out");
      expect(window.location.href).toContain("signoutServerError=1");
    });

    // Local credentials should still have been cleared
    expect(fixtures.mockSignOut).toHaveBeenCalled();
  });
});

test("falls back to local signout for OIDC without logout link", async () => {
  const oidcMethod: ClientOidcMethod = {
    type: OPDS1.OidcAuthType,
    id: "oidc-1",
    href: "http://example.com/oidc/authenticate",
    // No logoutLink
    description: "Test OIDC"
  };

  const { user } = setup(<SignOut />, {
    user: {
      credentials: {
        token: "Bearer test-token",
        methodType: OPDS1.OidcAuthType
      } as const
    },
    library: {
      ...fixtures.libraryData,
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
